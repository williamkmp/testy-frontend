export default defineAppConfig({
    ui: {
        primary: 'blue',
        gray: 'zinc',

        formGroup: {
            wrapper: 'w-full',
            label: { base: 'mb-1 ml-0.5' },
            error: 'mt-1',
        },

        avatar: {
            wrapper: 'border border-gray-300 dark:border-gray-600',
        },

        divider: {
            container: { base: 'font-normal text-gray-400 dark:text-gray-600' },
            border: { base: 'border-gray-300  dark:border-gray-700' },
        },

        modal: {
            overlay: {
                background: 'bg-gray-800/75',
            },
        },
    },
});
