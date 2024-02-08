<script lang="ts" setup>
import { useMemberModalStore } from '../-store/member-modal';
import { usePageDataStore } from '../-store/page-data';
import { AUTHORITY, type Authority } from '~/types';

// Dependency
const app = useAppStore();
const pageData = usePageDataStore();
const memberModal = useMemberModalStore();
const path = useApiPath();

// States
const isSubmitting = ref(false);
const isLoading = ref(false);
const isSearchingMember = ref(false);
const canUpdateMember = computed(() => pageData.authority === 'FULL_ACCESS');
const memberList = computed(() => Object.values(memberModal.members));
const authorities = Object.keys(AUTHORITY).map(authority => ({ name: capitalize(authority), value: authority }));

// Actions
function handleAuthorityChange(userId: string, newAuthority: Authority) {
    // TODO: implement authority change
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

                    <section class="flex w-full gap-2">
                        <UInput
                            placeholder="member@email.com"
                            class="w-full"
                            :disabled="!canUpdateMember"
                        />
                        <UButton
                            label="search"
                            :disabled="!canUpdateMember"
                        />
                    </section>

                    <div class="size-full">
                        <!-- Loading Indicator -->
                        <template v-if="isLoading">
                            <div class="grid size-full place-items-center rounded-lg bg-gray-200 p-2 dark:bg-gray-800">
                                <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
                            </div>
                        </template>

                        <!-- Edit Member Tabe -->
                        <template v-else-if="!isLoading && !isSearchingMember">
                            <div class="flex flex-col">
                                <template v-for="member of memberList" :key="member.id">
                                    <div class="flex w-full items-center justify-between py-2">
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
                                            @change="handleAuthorityChange(member.id, member.authority)"
                                        />
                                    </div>
                                </template>
                            </div>
                        </template>
                    </div>
                </div>
            </template>
        </UCard>
    </UModal>
</template>
