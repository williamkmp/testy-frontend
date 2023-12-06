import { defineStore } from 'pinia';

export const useUserPictureModalStore = defineStore(
    'PageSettingUserPictureModal',
    () => {
        const isOpen = ref(false);

        return {
            isOpen,
        };
    },
);
