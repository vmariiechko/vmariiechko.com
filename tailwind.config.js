/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/**/*.njk', './src/**/*.md', './src/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--ff-sans)'],
        head: ['var(--ff-head)'],
        mono: ['var(--ff-mono)'],
      },
      colors: {
        bg: 'var(--bg)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        link: 'var(--link)',
        'code-bg': 'var(--code-bg)',
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            'h1,h2': { fontWeight: '700', letterSpacing: '-0.015em' },
            'h3,h4': { fontWeight: '650', letterSpacing: '-0.010em' },
            'h5,h6': { fontWeight: '600', letterSpacing: '-0.010em' },
            '--tw-prose-body': 'var(--text)',
            '--tw-prose-headings': 'var(--text)',
            '--tw-prose-lead': 'var(--text)',
            '--tw-prose-links': 'var(--link)',
            '--tw-prose-bold': 'var(--text)',
            '--tw-prose-counters': 'var(--muted)',
            '--tw-prose-bullets': 'var(--muted)',
            '--tw-prose-hr': 'var(--border)',
            '--tw-prose-quotes': 'var(--text)',
            '--tw-prose-quote-borders': 'var(--border)',
            '--tw-prose-captions': 'var(--muted)',
            '--tw-prose-code': 'var(--code-inline-text)',
            '--tw-prose-pre-code': 'var(--code-inline-text)',
            '--tw-prose-pre-bg': 'var(--code-inline-bg)',
            '--tw-prose-th-borders': 'var(--border)',
            '--tw-prose-td-borders': 'var(--border)',
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};