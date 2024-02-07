<script setup lang="ts">
import { useDeletePageModalStore } from '../-store/delete-page-modal';
import { usePageDataStore } from '../-store/page-data';

const path = useApiPath();
const privateApi = usePrivateApi();
const pageData = usePageDataStore();
const deletePageModal = useDeletePageModalStore();
const isLoading = ref(false);
const notif = useNotification();

async function doDeletePage() {
    try {
        isLoading.value = true;
        if (pageData.id)
            await privateApi.delete(path.pagePageId({ pageId: pageData.id }));
        isLoading.value = false;
    }
    catch (error) {
        console.error(error);
        notif.error({
            title: 'Delete Error',
            message: 'Please refresh the page.',
        });
    }
    deletePageModal.isOpen = false;
}
</script>

<template>
    <UModal v-model="deletePageModal.isOpen" :prevent-close="isLoading">
        <UCard>
            <div class="mb-8">
                <p class="w-full text-center text-lg font-semibold">
                    Are you sure you want to delete page?
                </p>
            </div>
            <div class="flex items-center justify-center gap-6">
                <div class="grow">
                    <UButton label="Yes" color="red" variant="soft" block :loading="isLoading" @click="doDeletePage" />
                </div>
            </div>
        </UCard>
    </UModal>
</template>
