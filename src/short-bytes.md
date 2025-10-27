---
layout: layouts/base.njk
title: "Short Bytes"
permalink: /short-bytes/{% if pagination.pageNumber > 0 %}page/{{ pagination.pageNumber + 1 }}/{% endif %}
pagination:
  data: collections.shortBytes
  size: 10
  reverse: true
---

<h1>Short Bytes</h1>
<p class="text-muted">Quick notes, tips, and code snippets.</p>

<div class="mt-8">
  {% include "partials/short-bytes-list.njk" %}
</div>

<div class="mt-8">
  {% include "partials/pagination.njk" %}
</div>
