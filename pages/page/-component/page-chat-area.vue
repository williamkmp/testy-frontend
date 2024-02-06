<script setup lang="ts">
import { useChatModalStore } from '../-store/chat-modal';
import { usePageDataStore } from '../-store/page-data';
import { usePageMemberStore } from '../-store/page-member';

// Dependency
const path = useApiPath();
const app = useAppStore();
const privateApi = usePrivateApi();
const pageData = usePageDataStore();
const chatModal = useChatModalStore();
const pageMemmbers = usePageMemberStore();

// States
const chatAreaRef = ref<HTMLDivElement>();
const message = ref('');

async function sendMessage() {
    if (pageData.id && message.value.trim() !== '') {
        await privateApi.post(path.chatPage(pageData.id), {
            senderId: app.user?.id,
            content: message.value.trim(),
            pageId: pageData.id,
        });
    }
    message.value = '';
}

function handleInput(e: KeyboardEvent) {
    if (!e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}
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
                    @click="() => chatModal.isOpen = false"
                />
            </header>

            <div class="h-full max-h-full grow overflow-y-auto bg-gray-100 dark:bg-gray-950">
                <div class="flex size-full max-h-full flex-col py-2">
                    <div ref="chatAreaRef" class="relative overflow-y-auto">
                        <!-- Loading Template -->
                        <template v-if="chatModal.isLoading">
                            <div class="absolute left-0 top-0 grid size-full place-items-center">
                                <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
                            </div>
                        </template>

                        <!-- Chat List -->
                        <template v-else>
                            <template v-for="(chat, index) in chatModal.chatList" :key="chat.id">
                                <section
                                    class="flex w-full"
                                    :class="[chat.senderId === app.user?.id ? 'justify-end ' : 'justify-start']"
                                >
                                    <div class="flex max-w-sm flex-col gap-0.5 px-2 py-1">
                                        <!-- Sender information -->
                                        <div
                                            v-if="chat.senderId !== app.user?.id && chat.senderId !== (chatModal.chatList[index - 1]?.senderId || -1)"
                                            class="mb-0.5 flex w-full gap-0.5"
                                        >
                                            <UAvatar
                                                :alt="capitalize(pageMemmbers.members[chat.senderId].fullName)"
                                                :src="path.getFile(pageMemmbers.members[chat.senderId].imageId)"
                                                size="3xs"
                                            />
                                            <span class="truncate text-xs">
                                                {{ pageMemmbers.members[chat.senderId].tagName }}
                                            </span>
                                        </div>

                                        <!-- Chat content -->
                                        <div
                                            class="w-full break-all rounded px-2 py-1"
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
                <UTextarea v-model="message" :rows="1" autoresize class="grow" autofocus @keydown.enter="handleInput" />
                <UButton icon="i-heroicons-paper-airplane" @click="sendMessage" />
            </footer>
        </div>
    </USlideover>
</template>
