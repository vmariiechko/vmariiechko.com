---
layout: layouts/base.njk
title: Home
pagination:
  data: collections.posts
  size: 5
  reverse: true
---

## Welcome to the Site!

## Recent Posts

{% include "partials/posts-list.njk" %}
