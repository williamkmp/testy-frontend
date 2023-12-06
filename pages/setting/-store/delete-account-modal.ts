import { defineStore } from 'pinia';

export const useDeleteAccountModalStore = defineStore(
    'PageSettingDeleteAccountModal',
    () => {
        const isOpen = ref(false);
        return { isOpen };
    },
);
