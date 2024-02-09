import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import type { MenuItem, MenuItemType, PagePreviewResponse } from '~/types';

const SIDE_MENU_SIZE_KEY = 'TESTY_APPLICATION_SIDEBAR_PERVIOUS_SIZE';

export const useSideMenuStore = defineStore('GlobalSideMenu', () => {
    // Dependencies
    const path = useApiPath();
    const privateApi = usePrivateApi();

    // States
    const isFetching = ref(true);
    const isOpen = ref(true);
    const size = useStorage<string>(SIDE_MENU_SIZE_KEY, null);
    const menuItems = ref<MenuItem[]>([]);

    async function fetchPreviewsOf(type: MenuItemType, id?: string): Promise<Array<MenuItem>> {
        const response: PagePreviewResponse = id === undefined
            ? await privateApi.get(path.pagePreview)
            : type === 'PAGE'
                ? await privateApi.get(path.pageCollectionPreview({ pageId: id }))
                : await privateApi.get(path.collectionPagePreview({ collectionId: id }));

        const childrenBlockType: MenuItemType = id === undefined
            ? 'PAGE'
            : type === 'PAGE'
                ? 'COLLECTION'
                : 'PAGE';

        return response!.data.map(pagePreview => ({
            id: pagePreview.id,
            title: pagePreview.title,
            type: childrenBlockType,
            isChildrenFetched: false,
            iconKey: pagePreview.iconKey,
            isOpen: false,
            children: [],
        }));
    }

    function addPreview(
        menu: { id: string; name: string; iconKey?: string },
        parentId?: string,
    ) {
        const newMenu: MenuItem = {
            id: menu.id,
            title: menu.name,
            isChildrenFetched: false,
            iconKey: menu.iconKey,
            isOpen: false,
            type: 'PAGE',
            children: [],
        };
        if (!parentId) {
            menuItems.value.push(newMenu);
            return;
        }
        const parentPreview = findMenuBydId(parentId, menuItems.value);
        if (!parentPreview || !parentPreview.isChildrenFetched)
            return;
        newMenu.type = parentPreview.type === 'PAGE' ? 'COLLECTION' : 'PAGE';
        parentPreview.children.push(newMenu);
    }

    function findMenuBydId(id: string, menus: MenuItem[]): MenuItem | undefined {
        for (const menu of menus) {
            if (menu.id === id)
                return menu;
            if (menu.children) {
                const foundMenu = findMenuBydId(id, menu.children);
                if (foundMenu)
                    return foundMenu;
            }
        }
        return undefined;
    }

    function updatePreview(menu: { id: string; name: string; iconKey?: string }) {
        const preview = findMenuBydId(menu.id, menuItems.value);
        if (!preview)
            return;
        if (preview.title !== menu.name)
            preview.title = menu.name;
        if (preview.iconKey !== menu.iconKey)
            preview.iconKey = menu.iconKey;
    }

    function deletePreview(param: { parentId?: string; previewId: string }) {
        if (!param.parentId) {
            menuItems.value = menuItems.value.filter(menu => menu.id !== param.previewId);
        }
        else {
            const preview = findMenuBydId(param.parentId, menuItems.value);
            if (!preview)
                return;
            preview.children = preview.children.filter(menu => menu.id !== param.previewId);
        }
    }
    return {
        isFetching,
        isOpen,
        size,
        menuItems,
        fetchPreviewsOf,
        addPreview,
        updatePreview,
        deletePreview,
    };
});
