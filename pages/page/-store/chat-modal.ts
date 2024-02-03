import { defineStore } from 'pinia';

export const useChatModalStore = defineStore('GlobalPageChatModal', () => {
    const isOpen = ref(false);
    return {
        isOpen,
    };
});
