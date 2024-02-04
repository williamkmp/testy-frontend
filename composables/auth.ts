import type { LoginResponse, ServerResponseError, TokenResponse, UserResponse } from '~/types';

export function useAuth() {
    // dependency
    const app = useAppStore();
    const path = useApiPath();
    const publicApi = usePublicApi();
    const notif = useNotification();

    async function doLogin(param: { email: string; password: string }) {
        const response: LoginResponse = await publicApi.post(
            path.authLogin,
            {
                email: param.email,
                password: param.password,
            },
        );
        app.refreshToken = response.data.token.refreshToken;
        app.accessToken = response.data.token.accessToken;
        app.user = {
            id: response.data.id,
            email: response.data.email,
            tagName: response.data.tagName,
            fullName: response.data.fullName,
            imageId: response.data.imageId,
        };
    }

    async function refreshAuth() {
        try {
            const response: LoginResponse = await publicApi.post(path.authToken, {
                refreshToken: app.refreshToken || 'invalid_token',
            });
            app.accessToken = response.data.token.accessToken;
            app.refreshToken = response.data.token.refreshToken;
            app.user = {
                id: response.data.id,
                email: response.data.email,
                tagName: response.data.tagName,
                fullName: response.data.fullName,
                imageId: response.data.imageId,
            };
        }
        catch (e) {
            const response = e as ServerResponseError;
            if (response.status && response.message)
                notif.warn({ message: response.message });
            await logout();
        }
    }

    async function logout() {
        app.refreshToken = 'invalid_token';
        app.accessToken = 'invalid_token';
        app.user = undefined;
        return await navigateTo('/login');
    }

    return {
        refreshAuth,
        logout,
        doLogin,
    };
}
