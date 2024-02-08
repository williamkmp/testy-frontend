<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';
import { HttpStatusCode } from 'axios';
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
import type { AuthorityMessageDto, BlockMessageDto, ChatDto, ChatListResponse, PageBlockResponse, PageDataResponse, PageHeaderDto, PageMemberResponse, PageMembersResponse, PageMessagingErrorDto } from '~/types';

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

const pageLoading = ref(true);
onMounted(async () => {
    pageLoading.value = true;
    chatModal.reset();
    editorBody.reset();
    memberModal.reset();

    try {
        const pageResponse: PageDataResponse = await privateApi(path.pagePageId({ pageId: routeParam.id }));
        const blockResponse: PageBlockResponse = await privateApi(path.pageBlocks({ pageId: routeParam.id }));
        const chatListResponse: ChatListResponse = await privateApi.get(path.chatPage(routeParam.id));
        const membersResponse: PageMembersResponse = await privateApi.get(path.pageMembers({ pageId: routeParam.id }));

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
            iconKey: blockData.iconKey || 'emoji-1215',
            width: blockData.width || 100,
            numbering: 0,
        }));

        // Load page members
        for (const memberData of membersResponse.data) {
            memberModal.members[memberData.id] = memberData;
            userCache.users[memberData.id] = {
                id: memberData.id,
                email: memberData.email,
                fullName: memberData.fullName,
                tagName: memberData.tagName,
                imageId: memberData.imageId,
            };
        }

        // Loading page comments and cache user information
        chatModal.chatList = chatListResponse.data.reverse();
        for (const chatData of chatListResponse.data)
            await userCache.cacheUser(chatData.senderId);

        pageLoading.value = false;
        chatModal.isLoading = false;

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
        });

        stomp.subscribe(`/topic/page/${routeParam.id}/chat`, async (payload: ChatDto) => {
            chatModal.chatList.push({
                id: payload.id,
                content: payload.content,
                pageId: payload.pageId,
                senderId: payload.senderId,
                sentAt: payload.sentAt,
            });
            await userCache.cacheUser(payload.senderId);
        });

        stomp.subscribe(`/topic/page/${routeParam.id}/members`, async (payload: AuthorityMessageDto) => {
            // TODO: member operation
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
    await stomp.unsubscribe(`/topic/page/${routeParam.id}/chat`);
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
    await stomp.unsubscribe(`/topic/page/${routeParam.id}/chat`);
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
