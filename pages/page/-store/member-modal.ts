import { defineStore } from 'pinia';

export const useMemberModalStore = defineStore('EditorPageMemberModal', () => {
    const isOpen = ref(false);

    async function reset() {
        isOpen.value = false;
    }

    return {
        isOpen,
        reset,
    };
});
