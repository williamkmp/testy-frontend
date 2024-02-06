import { defineStore } from 'pinia';
import type { ChatDto } from '~/types';

export const useChatModalStore = defineStore('GlobalPageChatModal', () => {
    // States
    const isOpen = ref(false);
    const isLoading = ref(true);
    const chatList = ref<ChatDto[]>([]);

    function reset() {
        isOpen.value = false;
        isLoading.value = true;
        chatList.value = [];
    }

    return {
        isOpen,
        isLoading,
        chatList,
        reset,
    };
});
