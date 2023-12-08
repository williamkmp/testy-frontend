import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import type { PagePreview } from '~/types';

const SIDE_MENU_SIZE_KEY = 'TESTY_APPLICATION_SIDEBAR_PERVIOUS_SIZE';

export const useSideMenuStore = defineStore('GlobalSideMenu', () => {
    const isFetching = ref(true);
    const isOpen = ref(true);
    const size = useStorage<string>(SIDE_MENU_SIZE_KEY, null);

    const pages = ref<PagePreview[]>([]);

    async function fetchPages() {
        isFetching.value = true;
        // TODO: implement fetch initial pages logic.
        isFetching.value = false;
    }

    return {
        isFetching,
        isOpen,
        size,
        pages,
        fetchPages,
    };
});
