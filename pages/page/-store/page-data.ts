import { defineStore } from 'pinia';
import { AUTHORITY, type Authority } from '~/types';

export const usePageDataStore = defineStore('EditorPageData', () => {
    const id = ref<string>();
    const title = ref<string>();
    const imageSrc = ref<string>();
    const iconKey = ref<string>();
    const imagePosition = ref<number>(0);
    const authority = ref<Authority>(AUTHORITY.VIEWERS);

    return {
        id,
        title,
        imageSrc,
        iconKey,
        authority,
        imagePosition,
    };
});