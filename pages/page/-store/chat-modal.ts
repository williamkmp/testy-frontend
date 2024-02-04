import { defineStore } from 'pinia';
import { usePageDataStore } from './page-data';
import type { ChatDto, ChatListResponse, UserDto, UserResponse } from '~/types';

interface UserInfo {
    id: string;
    name: string;
    url: string;
};

export const useChatModalStore = defineStore('GlobalPageChatModal', () => {
    // Dependency
    const pageData = usePageDataStore();
    const path = useApiPath();
    const privateApi = usePrivateApi();
    const users = ref<Record<string, UserInfo>>({});

    // States
    const isOpen = ref(false);
    const isLoaded = ref(false);
    const chatList = ref<ChatDto[]>([]);
    const hasMoreChat = ref(true);
    const currentPagination = ref(0);

    function reset() {
        isOpen.value = false;
        isLoaded.value = false;
        chatList.value = [];
        currentPagination.value = 0;
    }

    async function loadChat() {
        if (pageData.id) {
            const response: ChatListResponse = await privateApi.get(path.chatPage(pageData.id), {
                params: { page: currentPagination.value },
            });
            const chats = response.data.reverse();
            for (const chat of chats) {
                const userId = chat.senderId;
                const existingUserInfo = users.value[userId];
                if (!existingUserInfo) {
                    const response: UserResponse = await privateApi.get(path.userUserId({ userId }));
                    users.value[userId] = {
                        id: response.data.id,
                        name: response.data.fullName,
                        url: path.getFile(response.data.imageId),
                    };
                }
            }
            hasMoreChat.value = chats.length > 0;
            chatList.value.unshift(...chats);
            isLoaded.value = true;
            currentPagination.value = currentPagination.value + 1;
        }
    }

    return {
        isOpen,
        isLoaded,
        hasMoreChat,
        chatList,
        users,
        reset,
        loadChat,
    };
});
