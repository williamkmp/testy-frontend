import { defineStore } from 'pinia';

export const useSearchModalStore = defineStore('GlobalSearchModal', () => {
    const isOpen = ref(false);
    return {
        isOpen,
    };
});
