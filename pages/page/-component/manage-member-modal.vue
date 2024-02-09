<script lang="ts" setup>
import { useMemberModalStore } from '../-store/member-modal';
import { usePageDataStore } from '../-store/page-data';
import { AUTHORITY, type AuthorityMessageDto, type MemberDto, type PageMembersResponse, type SearchUserByEmailResponse, type UserDto } from '~/types';

// Dependency
const app = useAppStore();
const pageData = usePageDataStore();
const memberModal = useMemberModalStore();
const path = useApiPath();
const privateApi = usePrivateApi();
const notif = useNotification();

// States
const isSubmitting = ref(false);
const isLoading = ref(true);
const isSearchingMember = ref(false);
const emailField = ref('');
const canUpdateMember = computed(() => pageData.authority === 'FULL_ACCESS');
const authorities = Object.keys(AUTHORITY).map(authority => ({ name: capitalize(authority), value: authority }));
const initialMemberList = ref<MemberDto[]>([]);
const updatedMemberList = ref<MemberDto[]>([]);
const potentialUserList = ref<UserDto[]>([]);
const memberListDiff = useArrayDifference(
    updatedMemberList,
    initialMemberList,
    (updated, initial) => (initial.authority === updated.authority) && (initial.id === updated.id),
);
const isMemberListUpdated = computed(() => memberListDiff.value.length > 0);

watch(
    () => memberModal.isOpen,
    async (isModalOpen) => {
        // On modal open
        if (isModalOpen) {
            isLoading.value = true;
            potentialUserList.value = [];
            const memberResponse: PageMembersResponse = await privateApi.get(path.pageMembers({ pageId: pageData.id! }));
            for (const data of memberResponse.data) {
                if (app.user?.id !== data.id) {
                    initialMemberList.value.push({
                        id: data.id,
                        email: data.email,
                        authority: data.authority,
                        fullName: data.fullName,
                        tagName: data.tagName,
                        imageId: data.imageId,
                    });
                    updatedMemberList.value.push({
                        id: data.id,
                        email: data.email,
                        authority: data.authority,
                        fullName: data.fullName,
                        tagName: data.tagName,
                        imageId: data.imageId,
                    });
                }
            }
            isLoading.value = false;
        }
        // On modal open
        else {
            isSearchingMember.value = false;
            isSubmitting.value = false;
            isLoading.value = true;
            initialMemberList.value = [];
            updatedMemberList.value = [];
            potentialUserList.value = [];
            emailField.value = '';
        }
    },
);

watchDebounced(
    emailField,
    async () => {
        if (emailField.value.trim() !== '') {
            const searchString = emailField.value.trim();
            const resultList: SearchUserByEmailResponse = await privateApi.get(path.userSearchEmail(searchString));
            potentialUserList.value = resultList.data.map(record => ({
                id: record.id,
                fullName: record.fullName,
                email: record.email,
                tagName: record.tagName,
                imageId: record.imageId,
            }));
        }
        else {
            potentialUserList.value = [];
        }
        isLoading.value = false;
    },
    {
        debounce: 500,
        onTrigger: () => isLoading.value = true,
    },
);

// Actions
async function saveUpdate() {
    if (!isMemberListUpdated.value)
        return;
    isSubmitting.value = true;
    const request: AuthorityMessageDto[] = memberListDiff.value.map(user => ({
        id: user.id,
        action: user.authority === 'REMOVE'
            ? 'DELETE'
            : 'UPDATE',
        role: user.authority !== 'REMOVE'
            ? user.authority
            : 'VIEWERS',
    }));
    await privateApi.put(path.pageMember(pageData.id), request);
    isSubmitting.value = false;
    memberModal.isOpen = false;
}

async function doAddMember(userId: string) {
    isSubmitting.value = true;
    try {
        await privateApi.post(
            path.pageMember(pageData.id),
            {
                id: userId,
                action: 'ADD',
                role: 'VIEWERS',
            } satisfies AuthorityMessageDto,
        );
        memberModal.isOpen = false;
    }
    catch (e) {}
    isSubmitting.value = false;
}

async function leavePage() {
    isSubmitting.value = true;
    const isAdmin = pageData.authority === 'FULL_ACCESS';
    const isLastAdmin = initialMemberList.value
        .filter(member => member.id !== app.user?.id)
        .every(member => member.authority !== 'FULL_ACCESS');

    if (isAdmin && isLastAdmin) {
        memberModal.isOpen = false;
        notif.warn({
            title: 'Cannot Leave',
            message: 'Page admin cannot be empty, choose another member to have Full Access',
        });
        return;
    }

    try {
        await privateApi.delete(path.pageMember(pageData.id));
        memberModal.isOpen = false;
        await navigateTo('/');
    }
    catch (error) {
        console.error('error leaving page', error);
    }
    isSubmitting.value = false;
}
</script>

<template>
    <UModal
        v-model="memberModal.isOpen"
        :prevent-close="true"
    >
        <UCard
            :ui="{
                header: { padding: 'px-4 py-2 sm:px-4 sm:py-2' },
                body: { padding: 'px-4 py-4 sm:px-4 sm:py-4' },
            }"
        >
            <!-- header -->
            <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-xl font-bold">
                        Members
                    </h3>
                    <UButton
                        variant="ghost"
                        icon="i-heroicons-x-mark-20-solid"
                        :padded="false"
                        :disabled="isSubmitting"
                        @click="memberModal.isOpen = false"
                    />
                </div>
            </template>

            <!-- body -->
            <template #default>
                <div class="flex h-96 w-full flex-col gap-4">
                    <header class="flex w-full items-center gap-2 rounded bg-gray-200 px-2 py-1 dark:bg-gray-700">
                        <UAvatar :alt="capitalize(app.user!.fullName)" :src="path.getFile(app.user!.imageId)" size="xs" />
                        <span class="text-sm">
                            You have {{ capitalize(pageData.authority!) }} authority for this project
                        </span>
                    </header>

                    <section v-if="canUpdateMember" class="flex w-full gap-2">
                        <UInput
                            v-model="emailField"
                            placeholder="member@email.com"
                            class="w-full"
                            :disabled="!canUpdateMember"
                            @focus="isSearchingMember = true"
                            @blur="() => {
                                if (emailField.trim() === '') {
                                    isSearchingMember = false
                                }
                            }"
                        />
                        <UButton
                            label="search"
                            :disabled="!canUpdateMember"
                        />
                    </section>

                    <section class="flex size-full flex-col gap-4 overflow-y-auto">
                        <!-- Loading Indicator -->
                        <template v-if="isLoading">
                            <div class="grid size-full place-items-center rounded-lg bg-gray-200 p-2 dark:bg-gray-800">
                                <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
                            </div>
                        </template>

                        <!-- Edit Member Tab -->
                        <template v-if="!isLoading && !isSearchingMember">
                            <div class="flex h-full max-h-full flex-col overflow-y-auto pr-2">
                                <template v-for="member of updatedMemberList" :key="member.id">
                                    <div class="flex w-full items-center justify-between p-2">
                                        <!-- Member information -->
                                        <section class="flex items-center gap-3">
                                            <UAvatar :alt="capitalize(member.fullName)" :src="path.getFile(member.imageId)" size="md" />
                                            <div class="flex h-full flex-col items-start">
                                                <span class="text-sm">{{ capitalize(member.fullName) }}</span>
                                                <span class="text-xs opacity-60">{{ member.email }}</span>
                                            </div>
                                        </section>

                                        <USelect
                                            v-model="member.authority"
                                            :disabled="!canUpdateMember"
                                            :options="authorities"
                                            option-attribute="name"
                                            size="xs"
                                        />
                                    </div>
                                </template>
                            </div>
                        </template>

                        <!-- Search member tab -->
                        <template v-if="!isLoading && isSearchingMember">
                            <div class="flex h-full max-h-full flex-col overflow-y-auto pr-2">
                                <!-- Initial prompt -->
                                <template v-if="potentialUserList.length <= 0 && emailField.trim() === '' && !isLoading">
                                    <div class="flex size-full items-center justify-center">
                                        <section class="flex flex-col items-center justify-center">
                                            <UIcon name="i-heroicons-user-plus" class="text-6xl" />
                                            <span class="text-base font-semibold opacity-70">Invite Others</span>
                                            <span class="text-sm opacity-70">type and search user email to invite</span>
                                        </section>
                                    </div>
                                </template>

                                <!-- User search not found -->
                                <template v-if="potentialUserList.length <= 0 && emailField.trim() !== '' && !isLoading">
                                    <div class="flex size-full items-center justify-center">
                                        <section class="flex flex-col items-center justify-center">
                                            <UIcon name="i-heroicons-no-symbol" class="text-6xl" />
                                            <span class="text-base font-semibold opacity-70">Not Found</span>
                                            <span class="text-sm opacity-70">User with email not found</span>
                                        </section>
                                    </div>
                                </template>

                                <!-- Potential user list -->
                                <template v-for="user of potentialUserList" :key="user.id">
                                    <button
                                        class="flex w-full cursor-pointer items-center justify-between p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                                        @click="doAddMember(user.id)"
                                    >
                                        <section class="flex items-center gap-3">
                                            <UAvatar :alt="capitalize(user.fullName)" :src="path.getFile(user.imageId)" size="md" />
                                            <div class="flex h-full flex-col items-start">
                                                <span class="text-sm">{{ capitalize(user.fullName) }}</span>
                                                <span class="text-xs opacity-60">{{ user.email }}</span>
                                            </div>
                                        </section>
                                    </button>
                                </template>
                            </div>
                        </template>

                        <footer v-if="!isLoading && !isSearchingMember" class="flex w-full gap-4">
                            <div class="w-full">
                                <UButton
                                    label="Leave"
                                    color="red"
                                    variant="outline"
                                    block
                                    :disabled="isSubmitting"
                                    :loading="isSubmitting"
                                    @click="leavePage"
                                />
                            </div>
                            <div v-if="canUpdateMember" class="w-full">
                                <UButton
                                    label="Save"
                                    color="blue"
                                    block
                                    :disabled="!isMemberListUpdated || isSubmitting"
                                    :loading="isSubmitting"
                                    :variant="!isMemberListUpdated ? 'outline' : 'solid'"
                                    @click="saveUpdate"
                                />
                            </div>
                        </footer>
                    </section>
                </div>
            </template>
        </UCard>
    </UModal>
</template>
