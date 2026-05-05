---
title: "Recover a Lakeflow SDP Pipeline From a Recreated Source Table"
date: 2026-05-05
description: "When an upstream Delta table is dropped and recreated, your Lakeflow SDP pipeline breaks with DIFFERENT_DELTA_TABLE_READ_BY_STREAMING_SOURCE. Here's how to reset checkpoint selection and recover without a full refresh."
tags: ["Databricks", "Lakeflow SDP", "Spark Structured Streaming", "Troubleshooting"]
---

Your Lakeflow Spark Declarative Pipeline (SDP) breaks. The error log shows:

```
[DIFFERENT_DELTA_TABLE_READ_BY_STREAMING_SOURCE] The streaming query was reading
from an unexpected Delta table (id = '...'). It used to read from another
Delta table (id = '...') according to checkpoint.
```

This happens when a Delta table you stream from gets dropped and recreated. Maybe the upstream team had a cluster issue and rebuilt the table from scratch. Maybe someone ran `CREATE OR REPLACE`. Either way, your checkpoint still points at the old table ID, and Spark refuses to read from a different one.

I ran into this on a Lakeflow SDP pipeline recently. Walking out of it cleanly took some digging, particularly because the obvious workaround (delete the checkpoint directory) doesn't apply here. Sharing the script below, plus what tripped me up.

## Why this happens

Spark Structured Streaming checkpoints bind to the specific Delta table ID. When you drop and recreate (or `CREATE OR REPLACE`) a table, the new one gets a fresh ID, and the checkpoint mismatch breaks the stream.

In open-source Spark you'd just delete the checkpoint directory. In Lakeflow SDP, checkpoint paths are managed for you by Databricks: manual deletion isn't an option. Instead, the Pipelines API exposes a parameter for this exact case: `reset_checkpoint_selection`. It clears the checkpoint for specific flows in a single update, while leaving target data (Bronze, Silver, Gold) intact.

::: callout-warning
A full refresh would clear your target tables. If those took hours to build, or your Silver layer is SCD Type 2 and you don't want to lose history, don't reach for that first.
:::

## The script

The trimmed essentials below. The full version (with `--dry-run`, argparse, and a workspace notebook variant) lives in my [databricks-bundle-template](https://github.com/vmariiechko/databricks-bundle-template) asset library and you can grab it with one CLI call:

```bash
databricks bundle init https://github.com/vmariiechko/databricks-bundle-template \
  --template-dir assets/sdp-checkpoint-recovery
```

The core function:

```python
import re
from databricks.sdk import WorkspaceClient

# Flow names must be three-part Unity Catalog FQNs
FQN_PATTERN = re.compile(r"^[^.\s]+\.[^.\s]+\.[^.\s]+$")


def reset_checkpoint(pipeline_id: str, flows: list[str], validate_only: bool = True):
    bad = [f for f in flows if not FQN_PATTERN.match(f)]
    if bad:
        raise ValueError(f"Flow names must be catalog.schema.table FQNs. Got: {bad}")

    w = WorkspaceClient()  # uses CLI profile or env-based auth
    try:
        # Native SDK call (databricks-sdk >= 0.100.0)
        resp = w.pipelines.start_update(
            pipeline_id=pipeline_id,
            reset_checkpoint_selection=flows,
            validate_only=validate_only,
        )
        return resp.update_id
    except TypeError as e:
        # Fallback: older SDK versions don't expose the parameter yet,
        # particularly the SDK bundled with the Databricks serverless runtime.
        if "reset_checkpoint_selection" not in str(e):
            raise
        resp = w.api_client.do(
            method="POST",
            path=f"/api/2.0/pipelines/{pipeline_id}/updates",
            body={
                "reset_checkpoint_selection": flows,
                "validate_only": validate_only,
            },
        )
        return resp.get("update_id")
```

A few things worth calling out:

- The native SDK call is preferred. The fallback path exists for environments where you can't pip-upgrade the SDK, particularly the Databricks serverless runtime (it bundles its own SDK and the runtime owns the version).
- `validate_only=True` is your dry run. It exercises auth and payload without mutating the pipeline.

## Run it

After `databricks bundle init` lands the asset, install the pinned SDK and dry-run first to validate auth and payload without touching the pipeline:

```bash
pip install -r requirements.txt

python sdp_reset_checkpoint_local.py \
  --pipeline-id <your-pipeline-id> \
  --flows <catalog>.<schema>.<table> \
  --profile <your-databricks-cli-profile> \
  --dry-run
```

The dry-run issues a `validate_only` update; the API returns an `update_id` and the pipeline stays untouched. Once that succeeds, drop `--dry-run` to apply the reset. Pass multiple flows space-separated.

## Gotchas I hit

**Flow names must be FQNs.** Pass just the table name (`my_table`) and you get:

```
IllegalArgumentException: Reset checkpoint selection should not contain flow
<name>, which does not exist in the graph.
```

The pipeline graph registers flows by their fully-qualified Unity Catalog name (`catalog.schema.table`). One nuance: if you defined a flow with an explicit `flow_name` (for example, in `create_auto_cdc_flow`), use that exact name instead. The default is the FQN.

**Reset triggers a pipeline update.** The Pipelines API has no "reset only" endpoint. `reset_checkpoint_selection` is a parameter on `start_update`, so calling it always kicks off an update. After the script returns the `update_id`, the pipeline transitions from IDLE to RUNNING. If you want it stopped, cancel from the UI right after.

**Older SDKs don't expose the parameter.** `reset_checkpoint_selection` landed in `databricks-sdk` v0.100.0. Anything older and the native call raises `TypeError`. The fallback path bypasses this by hitting the underlying REST endpoint via `WorkspaceClient.api_client.do`, which is also useful any time the SDK lags behind a documented API feature.

**Bronze may briefly hold duplicates.** Resetting the checkpoint re-reads from the start of the new source table (or wherever your read options point). If your Silver layer uses SCD logic (`dp.create_auto_cdc_flow` or similar), it'll dedupe naturally. If not, plan for it.

::: callout-info
**Worth adding for next time:** set `pipelines.reset.allowed = false` on your Bronze streaming tables. It blocks a full refresh from wiping that table, which is your insurance for the next time something like this happens. It doesn't help with the checkpoint mismatch (the script above does), but it stops a panicked "let me just refresh everything" from costing you raw history.
:::

## When to reach for this

This is a specific fix for a specific situation: you can't restart your stream because the source table identity changed, and you don't want to reset your downstream data. If you're starting fresh anyway, a full refresh is simpler.

Alternatives worth knowing:

- **Full refresh of selected tables.** Wipes those targets, reprocesses from scratch. Fine for dev. Requires `pipelines.reset.allowed = true` on protected tables.
- **Recreate the pipeline.** Dev/test only. Destroys state, redeploys. Simpler if there's no data to preserve.

The full script and the workspace notebook variant are in [databricks-bundle-template](https://github.com/vmariiechko/databricks-bundle-template/tree/main/assets/sdp-checkpoint-recovery) under `assets/sdp-checkpoint-recovery`. One `databricks bundle init` and they're in your project.

## References

- [Databricks: Recover a pipeline from streaming checkpoint failure](https://docs.databricks.com/aws/en/ldp/recover-streaming)
- [Databricks REST API: Start a pipeline update](https://docs.databricks.com/api/workspace/pipelines/startupdate)
- [Databricks SDK for Python: Pipelines API](https://databricks-sdk-py.readthedocs.io/en/latest/workspace/pipelines/pipelines.html)
