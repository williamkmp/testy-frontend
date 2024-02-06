import { defineStore } from 'pinia';

export const useDeletePageModalStore = defineStore('EditorDeletePageModal', () => {
    const isOpen = ref(false);
    return {
        isOpen,
    };
});
