import { defineStore } from 'pinia';

export const useSearchModalStore = defineStore('GlobalSearchModal', () => {
    const isOpen = ref(false);
    const searchedText = ref('');
    const isLoading = ref(true);
    return {
        isOpen,
        isLoading,
        searchedText,
    };
});
