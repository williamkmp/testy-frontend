<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';
import EditorBody from './-component/editor-body.vue';
import EditorBackgroundImage from './-component/editor-bacground-image.vue';
import EditorHeader from './-component/editor-header.vue';
import PageSkeletonLoader from './-component/page-skeleton-loader.vue';
import { usePageDataStore } from './-store/page-data';
import { useEditorBodyStore } from './-store/editor-body';
import { createEditor, editorHTMLToJSON } from './-utils/editor-utils';
import type { BlockMessageDto, PageBlockResponse, PageDataResponse, PageHeaderDto } from '~/types';

// Dependency
const stomp = useStompClient();
const app = useAppStore();
const path = useApiPath();
const privateApi = usePrivateApi();
const routeParam = useRoute().params as { id: string };
const pageData = usePageDataStore();
const editorBody = useEditorBodyStore();

const pageLoading = ref(true);
await useAsyncData('editor', async () => {
    pageLoading.value = true;
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
    editorBody.blockList = blockResponse.data.map(blockData => ({
        id: blockData.id,
        type: blockData.type,
        editor: blockData.content !== undefined
            ? createEditor(editorHTMLToJSON(blockData.content))
            : undefined,
        fileId: blockData.fileId,
        iconKey: blockData.iconKey || 'emoji-1215',
        width: blockData.width || 100,
        numbering: 0,
    }));
    pageLoading.value = false;

    stomp.subscribe(`/topic/page/${routeParam.id}/header`, (payload: PageHeaderDto, header: any) => {
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

    stomp.subscribe(`/topic/page/${routeParam.id}/block.transaction`, (payload: BlockMessageDto, header) => {
        if (header.sessionId !== app.sessionId) {
            const block = editorBody.blockList.find(block => block.id === payload.id)!;
            const editor = block?.editor as Editor;
            const currentContent = editor.getHTML();

            block.type = payload.type;
            block.width = payload.width;
            block.iconKey = payload.iconKey;
            block.fileId = payload.fileId;
            if (payload.content !== currentContent)
                editor.commands.setContent(editorHTMLToJSON(payload.content!));
        }
    });
});

onBeforeRouteLeave(async () => {
    await stomp.unsubscribe(`/topic/page/${pageData.id}/header`);
    await stomp.unsubscribe(`/topic/page/${pageData.id}/block.transaction`);
    editorBody.reset();
});

onBeforeRouteUpdate(async () => {
    await stomp.unsubscribe(`/topic/page/${pageData.id}/header`);
    await stomp.unsubscribe(`/topic/page/${pageData.id}/block.transaction`);
    editorBody.reset();
});

watchImmediate([() => pageData.iconKey, () => pageData.title], () => {
    app.headerTitle = pageData.title;
    app.emojiKey = pageData.iconKey;
});
</script>

<template>
    <div :key="`page-${routeParam.id}`" class="flex size-full min-h-full flex-col items-center">
        <!-- Page Loading View -->
        <template v-if="pageLoading">
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
