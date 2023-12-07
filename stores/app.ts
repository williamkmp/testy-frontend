import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

const SIDE_MENU_SIZE_KEY = 'TESTY_APPLICATION_SIDEBAR_PERVIOUS_SIZE';
export const useAppStore = defineStore('GlobalApp', () => {
    // Application State
    const isMenuOpen = ref(true);
    const sideMenuSize = useStorage<string>(SIDE_MENU_SIZE_KEY, null);

    // Feature: Header title
    const headerTitle = ref<string>();

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

    // Feature: Element Id
    const id = ref(0);
    function getId() {
        id.value = id.value + 1;
        return id.value;
    }

    return {
        isMenuOpen,
        isDark,
        getId,
        headerTitle,
        sideMenuSize,
    };
});
