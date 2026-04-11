/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'calc-bg': '#f0f0f0',
        'calc-body': '#ffffff',
        'calc-display': '#1a1a1a',
        'calc-display-bg': '#2d2d2d',
        'calc-button': '#f8f8f8',
        'calc-button-hover': '#e8e8e8',
        'calc-button-active': '#d8d8d8',
        'calc-button-border': '#cccccc',
        'calc-number': '#333333',
        'calc-operator': '#ff9500',
        'calc-operator-hover': '#ffaa33',
        'calc-operator-active': '#ffbf66',
        'calc-function': '#007aff',
        'calc-function-hover': '#3385ff',
        'calc-function-active': '#6699ff',
        'calc-equals': '#34c759',
        'calc-equals-hover': '#4dd673',
        'calc-equals-active': '#66e68c',
        'calc-shift': '#5856d6',
        'calc-shift-hover': '#7968f0',
        'calc-shift-active': '#9a7aff',
        'calc-alpha': '#af52de',
        'calc-alpha-hover': '#bf5fe0',
        'calc-alpha-active': '#cf6ce2',
      }
    },
  },
  plugins: [],
}
