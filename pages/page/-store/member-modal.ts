import { defineStore } from 'pinia';
import type { MemberDto } from '~/types';

export const useMemberModalStore = defineStore('EditorPageMemberModal', () => {
    const isOpen = ref(false);
    const members = ref<Record<string, MemberDto>>({});

    async function reset() {
        isOpen.value = false;
    }

    return {
        members,
        isOpen,
        reset,
    };
});
