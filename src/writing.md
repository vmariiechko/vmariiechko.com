---
layout: layouts/base.njk
title: "Writing"
permalink: /writing/{% if pagination.pageNumber > 0 %}page/{{ pagination.pageNumber + 1 }}/{% endif %}
pagination:
  data: collections.posts
  size: 10
  reverse: true
---

<h1>Writing</h1>
<p class="text-muted">Long-form articles, tutorials, and deep dives.</p>

<div class="mt-8">
  {% include "partials/posts-list.njk" %}
</div>

<div class="mt-8">
  {% include "partials/pagination.njk" %}
</div>
