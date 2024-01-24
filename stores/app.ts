import { defineStore } from 'pinia';

export const useAppStore = defineStore('GlobalApp', () => {
    // Feature: Header title
    const headerTitle = ref<string>();
    const emojiKey = ref<string>();

    // Feature: Dark Mode
    const colorMode = useColorMode();
    const isDark = computed({
        get() {
            return colorMode.value === 'dark';
        },
        set(value: boolean) {
            colorMode.preference = value ? 'dark' : 'light';
        },
    });

    return {
        isDark,
        headerTitle,
        emojiKey,
    };
});
