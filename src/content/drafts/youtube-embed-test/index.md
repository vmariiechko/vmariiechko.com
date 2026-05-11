---
title: "YouTube Embed Shortcode Test"
date: 2026-04-26
description: "Internal draft for verifying the youtube shortcode renders correctly across themes and breakpoints."
tags: ["Test", "Shortcode"]
---

This draft exists only to verify the `{% raw %}{% youtube %}{% endraw %}` shortcode. Not for publication.

## Basic embed (no caption)

{% youtube "aqz-KE-bpKQ" %}

## Embed with caption

{% youtube "aqz-KE-bpKQ", "Big Buck Bunny — used as a stable, Creative Commons placeholder during development." %}

## Embed with custom iframe title

{% youtube "aqz-KE-bpKQ", "", "Big Buck Bunny trailer (a11y title override)" %}

## Two embeds in succession

Native lazy-load should defer both until each enters the viewport.

{% youtube "aqz-KE-bpKQ", "First embed." %}

{% youtube "aqz-KE-bpKQ", "Second embed." %}
