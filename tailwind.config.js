/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{njk,md,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--ff-sans)'],
        serif: ['var(--ff-serif)'],
        mono: ['var(--ff-mono)'],
      },
      colors: {
        bg: 'var(--bg)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        link: 'var(--link)',
        'link-visited': 'var(--link-visited)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};