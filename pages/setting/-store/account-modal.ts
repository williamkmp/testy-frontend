import { defineStore } from 'pinia';

export const useAccountModalStore = defineStore(
    'PageSettingAccountModal',
    () => {
        const isOpen = ref(false);
        return {
            isOpen,
        };
    },
);
