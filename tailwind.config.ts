import type { Config } from 'tailwindcss';

export default <Partial<Config>> {
    content: [
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './app.vue',
        './error.vue',
    ],

    theme: {
        fontFamily: {
            sans: ['"Inter"', 'sans-serif'],
        },
    },
    // eslint-disable-next-line ts/no-require-imports
    plugins: [require('@tailwindcss/forms')],
    darkMode: 'class',
};
