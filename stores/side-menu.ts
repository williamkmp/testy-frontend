import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

const SIDE_MENU_SIZE_KEY = 'TESTY_APPLICATION_SIDEBAR_PERVIOUS_SIZE';

export const useSideMenuStore = defineStore('GlobalSideMenu', () => {
    const isOpen = ref(true);
    const size = useStorage<string>(SIDE_MENU_SIZE_KEY, null);

    return {
        isOpen,
        size,
    };
});
