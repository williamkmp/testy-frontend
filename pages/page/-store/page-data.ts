import { defineStore } from 'pinia';
import type { Authority } from '~/types';

export const usePageDataStore = defineStore('EditorPageData', () => {
    // Dependency
    const path = useApiPath();
    const privateApi = usePrivateApi();
    const notif = useNotification();

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
            try {
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
            catch (e: any) {
                if (e.message && e.status) {
                    if (e.status >= 400 && e.status <= 499)
                        notif.warn({ message: e.message });
                    else if (e.status >= 500 && e.status <= 599)
                        notif.error({ message: e.message });
                    else if (e.status >= 200 && e.status <= 299)
                        notif.ok({ message: e.message });
                }
                await navigateTo('/');
            }
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
