import { defineStore } from 'pinia';
import type { Authority } from '~/types';

export const usePageDataStore = defineStore('EditorPageData', () => {
    // Dependency
    const path = useApiPath();
    const privateApi = usePrivateApi();

    // States
    const id = ref<string>();
    const title = ref<string>();
    const imageId = ref<string>();
    const iconKey = ref<string>();
    const imagePosition = ref<number>(0);
    const authority = ref<Authority>();
    const collectionId = ref<string>();
    const isRootPage = computed(() => collectionId.value === undefined);

    function reset() {
        id.value = undefined;
        title.value = undefined;
        imageId.value = undefined;
        iconKey.value = undefined;
        imagePosition.value = 0;
        authority.value = undefined;
        collectionId.value = undefined;
    }

    async function updatePageData(param: {
        title?: string | null;
        iconKey?: string | null;
        imageId?: string | null;
        imagePosition?: number | null;
    }) {
        function doOverride<T>(p: {
            originalValue: Ref<T | undefined>;
            newValue: T | undefined | null;
        }) {
            // eslint-disable-next-line eqeqeq
            p.originalValue.value = p.newValue != undefined
                ? p.newValue
                : p.newValue === undefined
                    ? p.originalValue.value
                    : undefined;
            return p.originalValue.value;
        }

        if (id.value) {
            await privateApi.put(path.pagePageId({ pageId: id.value }), {
                title: doOverride({
                    originalValue: title,
                    newValue: param.title,
                }),
                iconKey: doOverride({
                    originalValue: iconKey,
                    newValue: param.iconKey,
                }),
                imageId: doOverride({
                    originalValue: imageId,
                    newValue: param.imageId,
                }),
                imagePosition: doOverride({
                    originalValue: imagePosition,
                    newValue: param.imagePosition,
                }),
            });
        }
    }

    return {
        id,
        title,
        imageId,
        iconKey,
        authority,
        imagePosition,
        collectionId,
        isRootPage,
        updatePageData,
        reset,
    };
});
