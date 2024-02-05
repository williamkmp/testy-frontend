<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';
import { HttpStatusCode } from 'axios';
import EditorBackgroundImage from './-component/editor-bacground-image.vue';
import EditorBody from './-component/editor-body.vue';
import EditorHeader from './-component/editor-header.vue';
import PageSkeletonLoader from './-component/page-skeleton-loader.vue';
import PageChatArea from './-component/page-chat-area.vue';
import { useEditorBodyStore } from './-store/editor-body';
import { usePageDataStore } from './-store/page-data';
import { createEditor, editorHTMLToJSON } from './-utils/editor-utils';
import { useChatModalStore } from './-store/chat-modal';
import type { BlockMessageDto, PageBlockResponse, PageDataResponse, PageHeaderDto, PageMessagingErrorDto } from '~/types';

// Dependency
const stomp = useStompClient();
const app = useAppStore();
const path = useApiPath();
const privateApi = usePrivateApi();
const routeParam = useRoute().params as { id: string };
const pageData = usePageDataStore();
const editorBody = useEditorBodyStore();
const notif = useNotification();
const chatModal = useChatModalStore();

const pageLoading = ref(true);
onMounted(async () => {
    pageLoading.value = true;
    editorBody.reset();

    try {
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

        stomp.subscribe(`/topic/page/${routeParam.id}/block.move`, (payload: BlockMessageDto, header) => {
            if (header.sessionId === app.sessionId)
                return;
            const targetIndex = editorBody.blockList.findIndex(block => block.id === payload.id);
            if (targetIndex < 0)
                return;
            const afterIndex = payload.nextId !== undefined
                ? editorBody.blockList.findIndex(block => block.id === payload.nextId)
                : 0;
            const targetBlock = editorBody.blockList.splice(targetIndex, 1)[0];
            editorBody.blockList.splice(afterIndex, 0, targetBlock);
        });

        stomp.subscribe(`/topic/page/${routeParam.id}/block.add`, (payload: BlockMessageDto, header) => {
            if (header.sessionId === app.sessionId)
                return;
            const previousIndex = payload.prevId !== undefined
                ? editorBody.blockList.findIndex(block => block.id === payload.prevId)
                : 0;
            if (previousIndex < 0)
                return;
            const newBlockContent = editorHTMLToJSON(payload.content);
            const newBlock = editorBody.insertBlockAt(previousIndex, newBlockContent);
            newBlock.id = payload.id;
        });

        stomp.subscribe(`/topic/page/${routeParam.id}/block.delete`, (payload: BlockMessageDto, header) => {
            if (header.sessionId === app.sessionId)
                return;
            const deletedBlockIndex = editorBody.blockList.findIndex(block => block.id === payload.id);
            if (deletedBlockIndex < 0 || deletedBlockIndex >= editorBody.blockList.length)
                return;
            editorBody.blockList.splice(deletedBlockIndex, 1);
        });

        stomp.subscribe(`/topic/page/${routeParam.id}/user/${app.user!.id}/error`, async (payload: PageMessagingErrorDto) => {
            if (payload.status === HttpStatusCode.NotFound) {
                notif.warn({
                    title: 'Page Deleted',
                    message: 'Page is deleted contact page owner for information',
                });
                await navigateTo('/');
            }
            else if (payload.status === HttpStatusCode.Unauthorized) {
                notif.warn({
                    title: 'Unauthorized Access',
                    message: 'You aren\'t registered as a member, please contact page owner',
                });
                await navigateTo('/');
            }
            else if (payload.status === HttpStatusCode.BadRequest) {
                location.reload();
            }
        });
    }
    catch (error) {
        console.error('Page load error', error);
        await navigateTo('/');
    }
});

onBeforeRouteLeave(async () => {
    await stomp.unsubscribe(`/topic/page/${routeParam.id}/header`);
    await stomp.unsubscribe(`/topic/page/${routeParam.id}/chat`);
    await stomp.unsubscribe(`/topic/page/${routeParam.id}/block.transaction`);
    await stomp.unsubscribe(`/topic/page/${routeParam.id}/block.move`);
    await stomp.unsubscribe(`/topic/page/${routeParam.id}/block.add`);
    await stomp.unsubscribe(`/topic/page/${routeParam.id}/block.delete`);
    await stomp.unsubscribe(`/topic/page/${routeParam.id}/user/${app.user!.id}/error`);
    editorBody.reset();
    pageData.reset();
    chatModal.reset();
});

onBeforeRouteUpdate(async () => {
    await stomp.unsubscribe(`/topic/page/${routeParam.id}/header`);
    await stomp.unsubscribe(`/topic/page/${routeParam.id}/chat`);
    await stomp.unsubscribe(`/topic/page/${routeParam.id}/block.transaction`);
    await stomp.unsubscribe(`/topic/page/${routeParam.id}/block.move`);
    await stomp.unsubscribe(`/topic/page/${routeParam.id}/block.add`);
    await stomp.unsubscribe(`/topic/page/${routeParam.id}/block.delete`);
    await stomp.unsubscribe(`/topic/page/${routeParam.id}/user/${app.user!.id}/error`);
    editorBody.reset();
    pageData.reset();
    chatModal.reset();
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
        <PageChatArea />
    </div>
</template>
