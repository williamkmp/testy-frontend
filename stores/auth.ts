import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import type { ServerResponseError, TokenResponse, UserDto, UserResponse } from '~/types';

export const useAuthStore = defineStore('GlobalAuth', () => {
    // dependency
    const REFRESH_TOKEN_KEY = 'TESTY_REFRESHTOKEN_STORAGE_KEY';
    const { path, publicApi, privateApi } = useApi();
    const router = useRouter();
    const notif = useNotification();

    // states
    const user = ref<UserDto>();
    const accessToken = ref<string>();
    const refreshToken = useStorage<string>(REFRESH_TOKEN_KEY, null);

    async function refreshAuth() {
        try {
            const tokenResponse: TokenResponse = await publicApi.post(path.authToken, {
                refreshToken: refreshToken.value || 'invalid_token',
            });
            accessToken.value = tokenResponse.data!.accessToken;
            refreshToken.value = tokenResponse.data!.refreshToken;

            if (user.value === undefined) {
                const userResponse: UserResponse = await privateApi.get(path.userMe);
                user.value = {
                    id: userResponse.data!.id,
                    email: userResponse.data!.email,
                    tagName: userResponse.data!.tagName,
                    fullName: userResponse.data!.fullName,
                    imageId: userResponse.data!.imageId,
                };
            }
        }
        catch (e) {
            const response = e as ServerResponseError;
            if (response.status && response.message)
                notif.warn({ message: response.message });
            await logout();
        }
    }

    async function logout() {
        refreshToken.value = null;
        accessToken.value = undefined;
        user.value = undefined;
        router.push('/login');
        return await navigateTo('/login');
    }

    return {
        user,
        accessToken,
        refreshToken,
        refreshAuth,
        logout,
    };
});
