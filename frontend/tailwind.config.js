module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}", // Scans all HTML and JS/TS files in the src folder
    "./public/index.html",            // Add paths to other HTML files if applicable
  ],
  theme: {
    extend: {
      colors : {
        'primary' : '#5f6FFF'
      },
      gridTemplateColumns : {
        'auto' : 'repeat(auto-fill,minmax(200px,1fr))'
      }
    },
  },
  plugins: [],
};