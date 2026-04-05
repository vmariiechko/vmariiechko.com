# vmariiechko.com

Source code for my personal website at [vmariiechko.com](https://vmariiechko.com).

Built with [Eleventy](https://www.11ty.dev/), [Tailwind CSS](https://tailwindcss.com/), and deployed on [Netlify](https://www.netlify.com/).

## About

This is where I write about Databricks patterns, data engineering architecture, and the configuration details that documentation tends to skip. The site has two content formats: long-form posts and shorter pieces called Short Bytes.

The repo is public so other developers can reference the implementation, the same way I learned from others who shared theirs. You're welcome to look at how things are built and borrow small pieces (see [License](#license)).

## Local Development

Requires Node.js 20.18.1+.

```bash
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Production build
```

## Project Structure

```
src/
├── assets/          # CSS, JavaScript, fonts, images
├── content/
│   ├── posts/       # Blog posts (Markdown + co-located images)
│   ├── short-bytes/ # Shorter pieces
│   └── drafts/      # Unpublished drafts
├── _includes/       # Layouts, partials, components
├── _data/           # Site config, theme definitions
├── pages/           # Static pages (About, Writing, etc.)
└── static/          # Files copied as-is (favicons, etc.)
```

## Credits

A thank you to the people whose work I learned from while building this site.

[Sebastian Witowski](https://switowski.com/) ([repo](https://github.com/switowski/portfolio)) shared the source code of his blog publicly, and I referenced it throughout development. His decision to open the repo made a real difference for me, and it's a big part of why this one is public too.

These blogs shaped how I think about structure, design, and writing for a technical audience:

- [Simon Späti](https://www.ssp.sh/)
- [Josh Comeau](https://www.joshwcomeau.com/)
- [Adham Dannaway](https://www.adhamdannaway.com/)

And to [Roman](https://github.com/romaniso) for early feedback that shaped how this site reads.

## Issues

This isn't a project that accepts pull requests. But if you notice something broken on the site, feel free to [open an issue](https://github.com/vmariiechko/vmariiechko.com/issues). I'll happily take a look.

## License

The code in this repository is available under the [Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/) license. You can look at the implementation and reuse small pieces with attribution, for non-commercial purposes.

The content of the website (posts, articles, images) is © Vadim Mariiechko. All rights reserved.
