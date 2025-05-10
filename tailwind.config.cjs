/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/**/*.{html,css,js}', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': 'var(--primary)',
        'secondary': 'var(--secondary)',
        'tertiary': 'var(--tertiary)',
        'color': 'var(--color)',
        'accent-primary': 'var(--accent-primary)',
        'accent-primary-state': 'var(--accent-primary-state)',
      },
    },
  },
}
