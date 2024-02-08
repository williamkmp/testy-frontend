import { defineStore } from 'pinia';
import type { UserDto, UserResponse } from '~/types';

export const usePageUserCache = defineStore('EditorUserInformationCache', () => {
    const path = useApiPath();
    const privateApi = usePrivateApi();
    const users = ref<Record<string, UserDto>>({});

    async function cacheUser(userId: string) {
        const existingUserInfo = users.value[userId];
        if (!existingUserInfo) {
            const response: UserResponse = await privateApi.get(path.userUserId({
                userId,
            }));
            users.value[userId] = response.data;
        }
    }

    return {
        users,
        cacheUser,
    };
});
