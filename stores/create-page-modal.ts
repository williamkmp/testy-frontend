import { defineStore } from 'pinia';

export const useCreatePageModalStore = defineStore('GlobalCreatePageModal', () => {
    const isOpen = ref(false);
    return {
        isOpen,
    };
});
