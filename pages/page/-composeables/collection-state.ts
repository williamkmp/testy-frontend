import type { StompSubscription } from '@stomp/stompjs';
import type { MenuMessagePayloadDto, PageDataResponse, PagePreviewDto, PagePreviewResponse } from '~/types';

export function useColelction(collectionId: string) {
    const path = useApiPath();
    const privateApi = usePrivateApi();
    const stomp = useStompClient();
    const app = useAppStore();

    const isLoading = ref(true);
    const pages = ref<PagePreviewDto[]>([]);
    const collectionPreviewSubsribtion = ref<StompSubscription>();

    onBeforeMount(async () => {
        isLoading.value = true;
        const response: PagePreviewResponse = await privateApi.get(path.collectionPagePreview({ collectionId }));
        pages.value = response.data;
        isLoading.value = false;
        collectionPreviewSubsribtion.value = await stomp.subscribe(`/topic/collection/${collectionId}/preview`, (payload: MenuMessagePayloadDto, header) => {
            if (header.sessionId !== app.sessionId) {
                if (payload.action === 'ADD') {
                    pages.value.unshift({
                        id: payload.id,
                        title: payload.name,
                        iconKey: payload.iconKey,
                    });
                }
                else if (payload.action === 'UPDATE') {
                    const index = pages.value.findIndex(page => page.id === payload.id);
                    if (index >= 0) {
                        pages.value[index].title = payload.name;
                        pages.value[index].iconKey = payload.iconKey;
                    }
                }
                else if (payload.action === 'DELETE') {
                    const index = pages.value.findIndex(page => page.id === payload.id);
                    if (index >= 0)
                        pages.value.splice(index, 1);
                }
            }
        });
    });

    onUnmounted(() => {
        collectionPreviewSubsribtion.value?.unsubscribe();
    });

    async function addPage() {
        const response: PageDataResponse = await privateApi.post(path.page, {
            title: '',
            iconKey: 'emoji-1215',
            imagePosition: 50,
            collectionId,
        });
        pages.value.unshift({
            id: response.data.id,
            title: response.data.title,
            iconKey: response.data.iconKey,
        });
    }

    return {
        isLoading,
        pages,
        addPage,
    };
}
