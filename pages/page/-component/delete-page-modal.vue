<script setup lang="ts">
import { useDeletePageModalStore } from '../-store/delete-page-modal';

const deletePageModal = useDeletePageModalStore();

async function doDeletePage() {
    deletePageModal.isOpen = false;
    // TODO: implement delete page action
}
</script>

<template>
    <UModal v-model="deletePageModal.isOpen">
        <UCard>
            <div class="mb-8">
                <p class="w-full text-center text-lg font-semibold">
                    Are you sure you want to delete page?
                </p>
            </div>
            <div class="flex items-center justify-center gap-6">
                <div class="grow">
                    <UButton label="Yes" color="red" variant="soft" block @click="doDeletePage" />
                </div>
            </div>
        </UCard>
    </UModal>
</template>
