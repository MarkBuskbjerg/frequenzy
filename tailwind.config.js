/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.njk", "./views/**.njk"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
