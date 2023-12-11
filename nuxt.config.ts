// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    ssr: false,
    devtools: { enabled: false },
    vue: { defineModel: true },
    experimental: { typedPages: true },

    modules: [
        '@vueuse/nuxt',
        ['@pinia/nuxt', { autoImports: ['defineStore', 'defineStore'] }],
        '@nuxt/ui',
    ],

    imports: {
        dirs: [
            'stores',
        ],
    },

    // application configuration
    colorMode: { preference: 'system', fallback: 'light', classSuffix: '' },
    spaLoadingTemplate: true,
    css: [
        '@/assets/app.css',
        'vue-advanced-cropper/dist/style.css',
        'vue-advanced-cropper/dist/theme.compact.css',
    ],
    app: {
        head: {
            title: 'T E S T Y',
            viewport: 'width=device-width,initial-scale=1',
            link: [
                { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
                { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                {
                    rel: 'preconnect',
                    href: 'https://fonts.gstatic.com',
                    crossorigin: '',
                },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap',
                },
            ],
            meta: [
                {
                    name: 'viewport',
                    content: 'width=device-width, initial-scale=1',
                },
                { name: 'description', content: 'learn-it applicaion' },
                {
                    name: 'apple-mobile-web-app-status-bar-style',
                    content: 'black-translucent',
                },
            ],
        },
    },

    runtimeConfig: {
        public: {
            API_BASE_URL: 'http://localhost:5000/',
        },
    },
});
