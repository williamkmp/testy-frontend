import { defineStore } from 'pinia';
import { usePageDataStore } from './page-data';
import type { MemberDto, PageMemberResponse } from '~/types';

export const usePageMemberStore = defineStore('EditorPageMember', () => {
    const path = useApiPath();
    const privateApi = usePrivateApi();
    const members = ref<Record<string, MemberDto>>({});
    const pageData = usePageDataStore();

    async function addMember(userId: string) {
        const existingUserInfo = members.value[userId];
        if (!existingUserInfo && pageData.id) {
            const response: PageMemberResponse = await privateApi.get(path.pageMemberInfo({
                userId,
                pageId: pageData.id,
            }));
            members.value[userId] = response.data;
        }
    }

    return {
        members,
        addMember,
    };
});
