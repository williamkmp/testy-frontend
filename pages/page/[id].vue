<script setup lang="ts">
import EditorBody from './-component/editor-body.vue';
import EditorBackgroundImage from './-component/editor-bacground-image.vue';
import EditorHeader from './-component/editor-header.vue';
import PageSkeletonLoader from './-component/page-skeleton-loader.vue';
import { usePageDataStore } from './-store/page-data';
import { useEditorBodyStore } from './-store/editor-body';
import { createEditor, editorHTMLToJSON } from './-utils/editor-utils';
import type { PageBlockResponse, PageDataResponse, PageHeaderDto } from '~/types';

// Dependency
const stomp = useStompClient();
const app = useAppStore();
const path = useApiPath();
const privateApi = usePrivateApi();
const routeParam = useRoute().params as { id: string };
const pageData = usePageDataStore();
const editorBody = useEditorBodyStore();

const { pending } = await useAsyncData(`document`, async () => {
    editorBody.reset();
    const pageResponse: PageDataResponse = await privateApi(path.pagePageId({ pageId: routeParam.id }));
    const blockResponse: PageBlockResponse = await privateApi(path.pageBlocks({ pageId: routeParam.id }));

    // Setting page data
    pageData.title = pageResponse.data.title;
    pageData.imageId = pageResponse.data.imageId;
    pageData.iconKey = pageResponse.data.iconKey;
    pageData.authority = pageResponse.data.authority;
    pageData.imagePosition = pageResponse.data.imagePosition;
    pageData.id = pageResponse.data.id;

    // Mapping block data
    const blockDataList = blockResponse.data;
    editorBody.blockList = blockDataList.map(blockData => ({
        id: blockData.id,
        type: blockData.type,
        editor: blockData.content !== undefined
            ? createEditor(editorHTMLToJSON(blockData.content))
            : undefined,
        fileId: blockData.fileId,
        iconKey: blockData.iconKey,
        width: blockData.width,
    }));

    await stomp.subscribe(`/topic/page/${pageData.id}/header`, (payload: PageHeaderDto, header: any) => {
        if (app.sessionId === header.sessionId)
            return;
        if (pageData.title !== payload.title)
            pageData.title = payload.title;
        if (pageData.iconKey !== payload.iconKey)
            pageData.iconKey = payload.iconKey;
        if (pageData.imageId !== payload.imageId)
            pageData.imageId = payload.imageId;
        if (pageData.imagePosition !== payload.imagePosition)
            pageData.imagePosition = payload.imagePosition;
    });
});

onBeforeRouteLeave(() => {
    stomp.unsubscribe(`/topic/page/${pageData.id}/header`);
});

onBeforeRouteUpdate(() => {
    stomp.unsubscribe(`/topic/page/${pageData.id}/header`);
});

watchImmediate([() => pageData.iconKey, () => pageData.title], () => {
    app.headerTitle = pageData.title;
    app.emojiKey = pageData.iconKey;
});
</script>

<template>
    <div :key="`page-${routeParam.id}`" class="flex h-full min-h-full w-full flex-col items-center">
        <!-- Page Loading View -->
        <template v-if="pending">
            <PageSkeletonLoader />
        </template>

        <!-- Page Loaded View -->
        <template v-else>
            <EditorBackgroundImage />

            <!-- Editor -->
            <UContainer class="w-full max-w-4xl">
                <EditorHeader />
                <EditorBody />
            </UContainer>
        </template>
    </div>
</template>
