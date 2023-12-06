import { defineStore } from 'pinia';

export const useLogoutModalStore = defineStore(
    'PageSettingLogoutModalStore',
    () => {
        const isOpen = ref(false);
        return { isOpen };
    },
);
