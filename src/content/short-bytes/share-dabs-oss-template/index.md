---
title: "Your Next DABs Project, Configured in Minutes"
date: 2026-03-11
lastUpdated: 2026-04-09
description: "A reusable Declarative Automation Bundles (previously Databricks Asset Bundles, still DABs) template that generates multi-environment projects with medallion architecture, schema-per-user isolation, CI/CD pipelines, and parameterized configs. One command, your choices, a working bundle."
tags: ["Databricks", "DABs", "CI/CD", "DataOps", "Open Source"]
---

You're starting a new project on Databricks and you need the full setup: environment targets for dev, staging, and production. Schema-per-user isolation so developers don't step on each other. CI/CD pipelines. Medallion architecture schemas managed as bundle resources. Parameterized variables so the same resource definitions work across all environments.

You know the pattern. You've done it before (or you've read about it). But wiring it all together from scratch? That's a full day of writing YAML, cross-referencing docs, and second-guessing whether the structure is right.

I built a template that handles this.

## One command, your setup

```bash
databricks bundle init https://github.com/vmariiechko/databricks-bundle-template
```

The Databricks CLI walks you through a set of prompts about your environment. You pick what fits your team, and it generates a complete project.

Here's what the interaction looks like (trimmed for readability):

```
Project name:                    my_data_project
Environment setup [full]:        full
Include dev environment [no]:    no
Compute type [classic]:          classic
Cloud provider [azure]:          aws
Workspace setup:                 single_workspace
Unity Catalog suffix:            analytics
Include permissions [yes]:       no
Include CI/CD [yes]:             yes
CI/CD platform [azure_devops]:   github_actions
```

A few answers, and your project is ready.

:::callout-warning
**Windows users:** use PowerShell or Command Prompt for the interactive prompts. Git Bash might not support the interactive mode.
:::

## What you get

Not a skeleton. A working bundle with medallion architecture (bronze, silver, gold schemas), sample ETL pipelines, and everything parameterized per environment:

```
my_data_project/
├── databricks.yml              # Targets, presets, overrides
├── variables.yml               # Catalogs, compute, service principals
├── resources/
│   ├── *_ingestion.job.yml     # Sample multi-task ETL job
│   ├── *_pipeline.pipeline.yml # Sample Lakeflow SDP pipeline
│   ├── *_pipeline_trigger.job.yml
│   └── schemas.yml             # Unity Catalog schemas (bronze/silver/gold)
├── src/
│   ├── jobs/                   # Job scripts
│   └── pipelines/              # Pipeline notebooks
├── .github/workflows/          # CI/CD (GitHub Actions / Azure DevOps / GitLab)
├── docs/                       # Setup guides (CI/CD, permissions, groups)
├── QUICKSTART.md
└── README.md
```

Here's what's included:

- **Multi-environment targets:** `user` for personal dev, `stage` and `prod` managed by CI/CD (optional `dev` for shared integration testing)
- **Medallion architecture schemas** (bronze, silver, gold) managed as bundle resources with per-environment catalog naming
- **Schema-per-user isolation:** each developer gets their own namespace in the shared dev catalog (e.g., `vadym_bronze`, `vadym_silver`), no metastore clutter
- **CI/CD pipelines** for GitHub Actions, Azure DevOps, or GitLab
- **Configurable compute:** classic clusters, serverless, or both
- **Optional RBAC** with environment-aware group permissions
- **Sample ETL jobs and Lakeflow SDP pipelines** to start from
- **Direct deployment engine:** no Terraform backend required (CLI v0.296.0+)

The generated project comes with its own README, QUICKSTART, and setup docs for CI/CD and permissions. You can validate and deploy the `user` target within minutes, no service principal setup needed.

## Try it

The [example project](https://github.com/vmariiechko/databricks-bundle-template-example) shows what the template produces if you want to explore before committing. Or go straight to generating your own:

```bash
databricks bundle init https://github.com/vmariiechko/databricks-bundle-template
cd my_data_project
databricks bundle validate -t user
databricks bundle deploy -t user
```

:::callout-info
The `user` target expects a Unity Catalog with a `dev_<your_suffix>` catalog (e.g., `dev_analytics`). See the generated `QUICKSTART.md` for prerequisites.
:::

Once you're comfortable with the template, you can skip the interactive prompts entirely by passing a config file:

```bash
databricks bundle init https://github.com/vmariiechko/databricks-bundle-template \
  --config-file config.json
```

This is particularly useful when your team agrees on a standard setup: define the config once, and anyone can generate a new project in seconds.

For the patterns behind this setup (why schema-per-user, how deployment modes work, branch-to-target mapping), I wrote a detailed walkthrough: [Declarative Automation Bundles That Scale with Your Team](/blog/how-to-setup-dabs-for-a-team/).

The template is on [GitHub](https://github.com/vmariiechko/databricks-bundle-template), open source, MIT licensed. If it saves you even half the setup time it saved me, that's a win. And if something doesn't fit your setup or you have ideas, open an issue or submit a PR.
