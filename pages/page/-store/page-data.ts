import { defineStore } from 'pinia';
import { AUTHORITY, type Authority, type PageDataResponse } from '~/types';

export const usePageDataStore = defineStore('EditorPageData', () => {
    // Dependency
    const { path, privateApi } = useApi();

    const id = ref<string>();
    const title = ref<string>();
    const imageId = ref<string>();
    const iconKey = ref<string>();
    const imagePosition = ref<number>(0);
    const authority = ref<Authority>(AUTHORITY.VIEWERS);

    watch([iconKey, imagePosition, imageId], async () => {
        if (id.value) {
            await privateApi.put(path.pagePageId({ pageId: id.value }), {
                iconKey: iconKey.value,
                imageId: imageId.value,
                imagePosition: imagePosition.value,
            });
        }
    });

    return {
        id,
        title,
        imageId,
        iconKey,
        authority,
        imagePosition,
    };
});
