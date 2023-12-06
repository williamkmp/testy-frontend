import { defineStore } from 'pinia';
import type { PagePreview } from '~/types';

export const usePagesTreeStore = defineStore('GlobalPagesTree', () => {
    const app = useAppStore();
    const pages = ref<PagePreview[]>([
        {
            id: `page-${app.getId()}`,
            title: 'Root 1',
            children: [],
            isOpen: false,
            isChildrenFetched: false,
        },
        {
            id: `page-${app.getId()}`,
            title: 'Root 2',
            children: [],
            isOpen: false,
            isChildrenFetched: false,
        },
        {
            id: `page-${app.getId()}`,
            title: 'Root 3',
            children: [],
            isOpen: false,
            isChildrenFetched: false,
        },
    ]);
    return {
        pages,
    };
});
