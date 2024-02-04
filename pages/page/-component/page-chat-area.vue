<script setup lang="ts">
import { useChatModalStore } from '../-store/chat-modal';
import { usePageDataStore } from '../-store/page-data';
import type { ChatDto, UserResponse } from '~/types';

// Dependency
const path = useApiPath();
const privateApi = usePrivateApi();
const app = useAppStore();
const pageData = usePageDataStore();
const chatModal = useChatModalStore();
const stomp = useStompClient();

// States
const chatAreaRef = ref<HTMLDivElement>();
const loadingIndicator = ref<HTMLDivElement>();
const isLoading = ref(false);
const message = ref('');
const isFetching = ref(false);

// Actions
function closeModal() {
    chatModal.isOpen = false;
}

watch(
    () => chatModal.isOpen,
    async (isOpen) => {
        if (isOpen && pageData.id && !chatModal.isLoaded) {
            isLoading.value = true;
            await chatModal.loadChat();
            await stomp.subscribe(`/topic/page/${pageData.id}/chat`, async (payload: ChatDto) => {
                chatModal.chatList.push(payload);
                await nextTick();
                chatAreaRef.value!.scrollTo(0, chatAreaRef.value!.scrollHeight);
                const userId = payload.senderId;
                const existingUserInfo = chatModal.users[userId];
                if (!existingUserInfo) {
                    const response: UserResponse = await privateApi.get(path.userUserId({ userId }));
                    chatModal.users[userId] = {
                        id: response.data.id,
                        name: response.data.fullName,
                        url: path.getFile(response.data.imageId),
                    };
                }
            });
            chatAreaRef.value?.scrollTo(0, chatAreaRef.value?.scrollHeight);
            isLoading.value = false;
        }
    },
);

async function sendMessage() {
    if (pageData.id && message.value.trim() !== '') {
        await privateApi.post(path.chatPage(pageData.id), {
            content: message.value.trim(),
            senderId: app.user?.id,
            pageId: pageData.id,
        });
    }
    message.value = '';
}

useIntersectionObserver(loadingIndicator, async ([{ isIntersecting }]) => {
    if (isIntersecting && !isFetching.value) {
        isFetching.value = true;
        await chatModal.loadChat();
        isFetching.value = false;
    }
});
</script>

<template>
    <USlideover v-model="chatModal.isOpen">
        <div class="flex size-full flex-col">
            <header class="flex w-full items-center justify-between px-4 py-2">
                <h1 class="text-xl font-semibold">
                    Comments
                </h1>
                <UButton
                    icon="i-heroicons-x-circle"
                    color="red"
                    variant="ghost"
                    @click="closeModal"
                />
            </header>

            <div class="h-full max-h-full grow overflow-y-auto bg-gray-100 dark:bg-gray-950">
                <div class="flex size-full max-h-full flex-col pb-2">
                    <div ref="chatAreaRef" class="relative overflow-y-auto">
                        <!-- Loading Indicator: Infinite Scroller -->
                        <section v-if="chatModal.hasMoreChat" ref="loadingIndicator" class="w-full px-8 py-2">
                            <div class="flex items-center justify-center rounded-3xl bg-white py-1 shadow dark:bg-slate-800">
                                <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
                            </div>
                        </section>

                        <!-- Loading Template -->
                        <template v-if="isLoading">
                            <div class="absolute left-0 top-0 grid size-full place-items-center">
                                <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
                            </div>
                        </template>

                        <!-- Chat List -->
                        <template v-else>
                            <template v-for="chat in chatModal.chatList" :key="chat.id">
                                <section
                                    class="flex w-full"
                                    :class="[chat.senderId === app.user?.id ? 'justify-end ' : 'justify-start']"
                                >
                                    <div class="flex max-w-sm flex-col gap-0.5 px-2 py-1">
                                        <!-- Sender information -->
                                        <div
                                            v-if="chat.senderId !== app.user?.id"
                                            class="mb-0.5 flex w-full gap-0.5"
                                        >
                                            <UAvatar
                                                :alt="capitalize(chatModal.users[chat.senderId].name)"
                                                :src="chatModal.users[chat.senderId].url"
                                                size="3xs"
                                            />
                                            <span class="truncate text-xs">{{ capitalize(chatModal.users[chat.senderId].name) }}</span>
                                        </div>

                                        <!-- Chat content -->
                                        <div
                                            class="w-full rounded px-2 py-1"
                                            :class="[chat.senderId === app.user?.id ? 'bg-sky-200 dark:bg-sky-700' : 'bg-slate-200 dark:bg-slate-700']"
                                        >
                                            {{ chat.content }}
                                        </div>

                                        <span class="w-full text-xs" :class="[chat.senderId === app.user?.id ? 'text-right' : 'text-left']">
                                            {{ new Date(chat.sentAt).toLocaleTimeString() }}
                                        </span>
                                    </div>
                                </section>
                            </template>
                        </template>
                    </div>
                </div>
            </div>

            <footer class="flex w-full items-center gap-2 p-4">
                <UTextarea v-model="message" :rows="1" autoresize class="grow" autofocus @keydown.enter="sendMessage" />
                <UButton icon="i-heroicons-paper-airplane" @click="sendMessage" />
            </footer>
        </div>
    </USlideover>
</template>
