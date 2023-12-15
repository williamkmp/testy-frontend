import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import type { MenuItem, PagePreviewResponse } from '~/types';

const SIDE_MENU_SIZE_KEY = 'TESTY_APPLICATION_SIDEBAR_PERVIOUS_SIZE';

export const useSideMenuStore = defineStore('GlobalSideMenu', () => {
    // Dependencies
    const { path, privateApi } = useApi();

    // States
    const isFetching = ref(true);
    const isOpen = ref(true);
    const size = useStorage<string>(SIDE_MENU_SIZE_KEY, null);
    const menuItems = ref<MenuItem[]>([]);

    async function fetchPages(id?: string): Promise<Array<MenuItem>> {
        const response: PagePreviewResponse = id !== undefined
            ? await privateApi.get(path.pageChildren({ pageId: id }))
            : await privateApi.get(path.page);

        return response!.data.map(pagePreview => ({
            id: pagePreview.id,
            title: pagePreview.title,
            isChildrenFetched: false,
            iconKey: pagePreview.iconKey,
            isOpen: false,
            children: [],
        }));
    }

    function addPage(page: {
        id: string
        title: string
        iconKey: string
    }) {
        menuItems.value.push({
            id: page.id,
            title: page.title,
            isChildrenFetched: false,
            iconKey: page.iconKey,
            isOpen: false,
            children: [],
        });
    }

    return {
        isFetching,
        isOpen,
        size,
        menuItems,
        fetchPages,
        addPage,
    };
});
