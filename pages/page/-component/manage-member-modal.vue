<script lang="ts" setup>
import { useMemberModalStore } from '../-store/member-modal';

const memberModal = useMemberModalStore();
const isSubmitting = ref(false);
const isLoading = ref(true);
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
                <div class="flex h-[30rem] w-full flex-col">
                    <header class="flex w-full gap-2">
                        <UInput placeholder="member@email.com" class="w-full" />
                        <UButton label="search" />
                    </header>

                    <!-- TODO: impelement -->
                </div>
            </template>
        </UCard>
    </UModal>
</template>
