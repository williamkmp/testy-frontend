import { useStorage } from '@vueuse/core';
import { HttpStatusCode } from 'axios';
import { defineStore } from 'pinia';
import type { MenuItem, PagePreviewDto, PagePreviewResponse } from '~/types';

const SIDE_MENU_SIZE_KEY = 'TESTY_APPLICATION_SIDEBAR_PERVIOUS_SIZE';

export const useSideMenuStore = defineStore('GlobalSideMenu', () => {
    // Dependencies
    const _sleep = useSleep();
    const _app = useAppStore();

    // States
    const isFetching = ref(true);
    const isOpen = ref(true);
    const size = useStorage<string>(SIDE_MENU_SIZE_KEY, null);
    const menuItems = ref<MenuItem[]>([]);

    async function fetchPages(id?: string): Promise<Array<MenuItem>> {
        // TODO: implement fetch initial pages logic.

        let response: PagePreviewResponse;

        if (id) {
            response = await _sleep.for<PagePreviewResponse>(0, {
                status: HttpStatusCode.Ok,
                data: [
                    {
                        id: `page-${_app.getId()}`,
                        title: 'Child Page 1',
                    },
                    {
                        id: `page-${_app.getId()}`,
                        title: 'Child Page 2',
                    },
                ],
            }) as PagePreviewResponse;
        }
        else {
            response = await _sleep.for<PagePreviewResponse>(0, {
                status: HttpStatusCode.Ok,
                data: [
                    {
                        id: `page-${_app.getId()}`,
                        title: 'Page 1',
                    },
                    {
                        id: `page-${_app.getId()}`,
                        title: 'Page 2',
                    },
                ],
            }) as PagePreviewResponse;
        }

        return response!.data.map(pagePreview => ({
            id: pagePreview.id,
            title: pagePreview.title,
            isChildrenFetched: false,
            isOpen: false,
            children: [],
        }));
    }

    return {
        isFetching,
        isOpen,
        size,
        menuItems,
        fetchPages,
    };
});
