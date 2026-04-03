/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        accent: '#00ff87',
        'bg-base': '#0a0e14',
        'bg-surface': '#111827',
        'bg-card': '#161d2b',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      }
    }
  },
  plugins: []
}
