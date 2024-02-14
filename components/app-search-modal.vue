<script setup lang="ts">
import type { PagePreviewDto, SearchPageResponse } from '~/types';

// Dependency
const path = useApiPath();
const privateApi = usePrivateApi();

// States
const searchModal = useSearchModalStore();
const isLoading = ref(false);
const searchTextField = ref('');
const pageList = ref<PagePreviewDto[]>([]);

watchDebounced(
    searchTextField,
    async () => {
        if (searchTextField.value.trim() !== '') {
            const text = searchTextField.value.trim();
            const response: SearchPageResponse = await privateApi.get(path.pageSearch(text));
            pageList.value = response.data.map(data => ({
                id: data.id,
                title: data.title,
                iconKey: data.iconKey,
            }));
        }
        else {
            searchTextField.value = '';
            pageList.value = [];
        }
        isLoading.value = false;
    },
    {
        debounce: 500,
        onTrigger: () => isLoading.value = true,
        immediate: false,
    },
);

watch(
    () => searchModal.isOpen,
    () => {
        if (searchModal.isOpen) {
            isLoading.value = false;
            searchTextField.value = '';
            pageList.value = [];
        }
    },
);

// Action
async function navigate(pageid: string) {
    searchModal.isOpen = false;
    await navigateTo(`/page/${pageid}`);
}
</script>

<template>
    <UModal v-model="searchModal.isOpen">
        <UCard
            :ui="{
                header: { padding: 'p-2 p-2 sm:p-2' },
                body: { padding: 'p-2 p-2 sm:p-2' },
            }"
        >
            <!-- header -->
            <template #header>
                <div class="flex items-center justify-between">
                    <UInput
                        v-model="searchTextField"
                        placeholder="Search pages ..."
                        class="w-full"
                        variant="none"
                        icon="i-heroicons-magnifying-glass"
                        size="xl"
                    />
                </div>
            </template>

            <!-- body -->
            <template #default>
                <main class="h-80 w-full overflow-y-auto overflow-x-hidden">
                    <!-- Empty search prompt -->
                    <template v-if="searchTextField.trim() === ''">
                        <div class="flex size-full items-center justify-center">
                            <section class="flex flex-col items-center justify-center">
                                <UIcon name="i-heroicons-magnifying-glass" class="text-6xl" />
                                <span class="text-base font-semibold opacity-70">Search Page</span>
                                <span class="text-sm opacity-70">search and jump pages for quick access </span>
                            </section>
                        </div>
                    </template>

                    <!-- Loading indicator -->
                    <template v-if="isLoading && searchTextField.trim() !== ''">
                        <div class="grid size-full place-items-center">
                            <UIcon class="size-6 animate-spin text-gray-400" name="i-heroicons-arrow-path-20-solid" />
                        </div>
                    </template>

                    <!-- Search Result -->
                    <template v-if="!isLoading && searchTextField.trim() !== '' && pageList.length > 0">
                        <div class="size-full overflow-y-auto">
                            <div class="flex size-full max-h-full flex-col divide-y divide-gray-200 overflow-y-auto dark:divide-gray-700">
                                <template v-for="page in pageList" :key="page.id">
                                    <button
                                        class="flex w-full cursor-pointer items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                                        @click="navigate(page.id)"
                                    >
                                        <div class="size-8">
                                            <EmojiIcon minified :emoji-name="page.iconKey" />
                                        </div>
                                        <span class="text-xl">{{ page.title }}</span>
                                    </button>
                                </template>
                            </div>
                        </div>
                    </template>

                    <!-- Empty search result -->
                    <template v-if="!isLoading && searchTextField.trim() !== '' && pageList.length === 0">
                        <div class="flex size-full items-center justify-center">
                            <section class="flex flex-col items-center justify-center">
                                <UIcon name="i-heroicons-no-symbol" class="text-6xl" />
                                <span class="text-base font-semibold opacity-70">Not Found</span>
                                <span class="text-sm opacity-70">No page found</span>
                            </section>
                        </div>
                    </template>
                </main>
            </template>
        </UCard>
    </UModal>
</template>
