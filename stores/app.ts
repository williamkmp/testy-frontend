import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { v4 as uuid } from 'uuid';
import type { UserDto } from '~/types';

export const useAppStore = defineStore('GlobalApp', () => {
    // Dependency
    const colorMode = useColorMode();
    // States
    const user = ref<UserDto>();
    const accessToken = ref<string>('invalid_token');
    const sessionId = ref<string>(uuid());
    const refreshToken = useStorage<string>(useRuntimeConfig().public.REFRESH_TOKEN_KEY, null);

    const headerTitle = ref<string>();
    const emojiKey = ref<string>();
    const isDark = computed({
        get: () => colorMode.value === 'dark',
        set: (value: boolean) => colorMode.preference = value ? 'dark' : 'light',
    });

    return {
        user,
        accessToken,
        refreshToken,
        sessionId,
        isDark,
        headerTitle,
        emojiKey,
    };
});
