/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/popup/**/*.{vue,js,ts,jsx,tsx}",
    "./src/popup/popup.html"
  ],
  theme: {
    extend: {
      colors: {
        success: '#50cd89',
        danger: '#f1416c',
        'accent-blue': '#009ef7',
        'accent-danger': '#f1416c',
        'accent-teal': '#50cd89'
      }
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
