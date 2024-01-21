import { defineStore } from 'pinia';
import { AUTHORITY, type Authority } from '~/types';

export const usePageDataStore = defineStore('EditorPageData', () => {
    // Dependency
    const { path, privateApi } = useApi();

    // States
    const id = ref<string>();
    const title = ref<string>();
    const imageId = ref<string>();
    const iconKey = ref<string>();
    const imagePosition = ref<number>(0);
    const authority = ref<Authority>(AUTHORITY.VIEWERS);

    watchDebounced(
        [iconKey, imagePosition, imageId, title],
        async () => {
            if (id.value) {
                await privateApi.put(path.pagePageId({ pageId: id.value }), {
                    title: title.value,
                    iconKey: iconKey.value,
                    imageId: imageId.value,
                    imagePosition: imagePosition.value,
                });
            }
        },
        {
            debounce: 500,
        },
    );

    return {
        id,
        title,
        imageId,
        iconKey,
        authority,
        imagePosition,
    };
});
