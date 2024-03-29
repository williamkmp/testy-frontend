<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';
import { HttpStatusCode } from 'axios';
import type { StompSubscription } from '@stomp/stompjs';
import DeletePageModal from './-component/delete-page-modal.vue';
import EditorBackgroundImage from './-component/editor-bacground-image.vue';
import EditorBody from './-component/editor-body.vue';
import EditorHeader from './-component/editor-header.vue';
import ManageMemberModal from './-component/manage-member-modal.vue';
import PageChatArea from './-component/page-chat-area.vue';
import PageSkeletonLoader from './-component/page-skeleton-loader.vue';
import { useChatModalStore } from './-store/chat-modal';
import { useEditorBodyStore } from './-store/editor-body';
import { useMemberModalStore } from './-store/member-modal';
import { usePageDataStore } from './-store/page-data';
import { usePageUserCache } from './-store/user-cache';
import { createEditor, editorHTMLToJSON } from './-utils/editor-utils';
import type { BlockMessageDto, ChatDto, ChatListResponse, PageBlockResponse, PageDataResponse, PageHeaderDto, PageMessagingErrorDto } from '~/types';

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
const userCache = usePageUserCache();
const memberModal = useMemberModalStore();

// States
const pageLoading = ref(true);
const stompTopicSubscribtions = ref<StompSubscription[]>([]);

onMounted(async () => {
    pageLoading.value = true;
    chatModal.reset();
    editorBody.reset();
    memberModal.reset();

    try {
        const responses = await Promise.all([
            privateApi(path.pagePageId({ pageId: routeParam.id })),
            privateApi(path.pageBlocks({ pageId: routeParam.id })),
            privateApi.get(path.chatPage(routeParam.id)),
        ]);
        const pageResponse = responses[0] as PageDataResponse;
        const blockResponse = responses[1] as PageBlockResponse;
        const chatListResponse = responses[2] as ChatListResponse;

        // Setting page data
        pageData.title = pageResponse.data.title;
        pageData.imageId = pageResponse.data.imageId;
        pageData.iconKey = pageResponse.data.iconKey;
        pageData.authority = pageResponse.data.authority;
        pageData.imagePosition = pageResponse.data.imagePosition;
        pageData.id = pageResponse.data.id;
        pageData.collectionId = pageResponse.data.collectionId;

        // Mapping block data
        editorBody.blockList = blockResponse.data.map(blockData => ({
            id: blockData.id,
            type: blockData.type,
            editor: blockData.content !== undefined
                ? createEditor(editorHTMLToJSON(blockData.content))
                : undefined,
            fileId: blockData.fileId,
            iconKey: blockData.iconKey ?? 'emoji-1215',
            width: blockData.width ?? 100,
            isChecked: blockData.isChecked ?? false,
            numbering: 0,
        }));

        // Loading page comments and cache user information
        chatModal.chatList = chatListResponse.data.reverse();
        for (const chatData of chatListResponse.data)
            await userCache.cacheUser(chatData.senderId);

        pageLoading.value = false;
        chatModal.isLoading = false;

        stompTopicSubscribtions.value.push(
            await stomp.subscribe(`/topic/page/${routeParam.id}/header`, (payload: PageHeaderDto, header: any) => {
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
            }),
        );

        stompTopicSubscribtions.value.push(
            await stomp.subscribe(`/topic/page/${routeParam.id}/block.transaction`, (payload: BlockMessageDto, header) => {
                if (header.sessionId !== app.sessionId) {
                    const block = editorBody.blockList.find(block => block.id === payload.id)!;
                    const editor = block?.editor as Editor;
                    const currentContent = editor.getHTML();

                    block.type = payload.type;
                    block.width = payload.width;
                    block.iconKey = payload.iconKey;
                    block.fileId = payload.fileId;
                    block.isChecked = payload.isChecked;
                    if (payload.content !== currentContent)
                        editor.commands.setContent(editorHTMLToJSON(payload.content!));
                }
            }),
        );

        stompTopicSubscribtions.value.push(
            await stomp.subscribe(`/topic/page/${routeParam.id}/block.move`, (payload: BlockMessageDto, header) => {
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
            }),
        );

        stompTopicSubscribtions.value.push(
            await stomp.subscribe(`/topic/page/${routeParam.id}/block.add`, (payload: BlockMessageDto, header) => {
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
            }),
        );

        stompTopicSubscribtions.value.push(
            await stomp.subscribe(`/topic/page/${routeParam.id}/block.delete`, (payload: BlockMessageDto, header) => {
                if (header.sessionId === app.sessionId)
                    return;
                const deletedBlockIndex = editorBody.blockList.findIndex(block => block.id === payload.id);
                if (deletedBlockIndex < 0 || deletedBlockIndex >= editorBody.blockList.length)
                    return;
                editorBody.blockList.splice(deletedBlockIndex, 1);
            }),
        );

        stompTopicSubscribtions.value.push(
            await stomp.subscribe(`/topic/page/${routeParam.id}/user/${app.user!.id}/error`, async (payload: PageMessagingErrorDto) => {
                if (payload.status === HttpStatusCode.NotFound) {
                    notif.info({
                        title: 'Page Deleted',
                        message: 'Page is deleted contact page owner for information',
                    });
                    const redirectPath = payload.redirectUrl || '/';
                    await navigateTo(redirectPath);
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
            }),
        );

        stompTopicSubscribtions.value.push(
            await stomp.subscribe(`/topic/page/${routeParam.id}/chat`, async (payload: ChatDto) => {
                chatModal.chatList.push({
                    id: payload.id,
                    content: payload.content,
                    pageId: payload.pageId,
                    senderId: payload.senderId,
                    sentAt: payload.sentAt,
                });
                await userCache.cacheUser(payload.senderId);
            }),
        );
    }
    catch (e: any) {
        console.error('Page load error', e);
        if (e.status) {
            const error = e.status as number;
            if (error === HttpStatusCode.Forbidden) {
                notif.warn({
                    title: 'Forbidden Access',
                    message: 'You aren\'t registered as page member',
                });
            }
        }
        await navigateTo('/');
    }
});

onBeforeRouteLeave(async () => {
    for (const subscribtions of stompTopicSubscribtions.value)
        subscribtions.unsubscribe();
    editorBody.reset();
    pageData.reset();
    chatModal.reset();
});

onBeforeRouteUpdate(async () => {
    for (const subscribtions of stompTopicSubscribtions.value)
        subscribtions.unsubscribe();
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
        <DeletePageModal />
        <ManageMemberModal />
    </div>
</template>
