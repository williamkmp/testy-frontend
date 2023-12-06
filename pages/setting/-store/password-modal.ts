import { defineStore } from 'pinia';

export const usePasswordModalStore = defineStore(
    'PageSettingChangePasswordModal',
    () => {
        const isOpen = ref(false);
        return { isOpen };
    },
);
