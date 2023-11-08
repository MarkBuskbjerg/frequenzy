/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./views/**.njk', './views/macros/**.njk'],
	theme: {
		extend: {},
	},
	plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
