<script setup lang="ts">
const searchModal = useSearchModalStore();
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
                        v-model="searchModal.searchedText"
                        :loading="searchModal.isLoading"
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
                <main class="h-[50dvh] w-full overflow-y-auto overflow-x-hidden">
                    <template v-if="searchModal.isLoading">
                        <div class="grid h-full w-full place-items-center">
                            <UIcon class="h-6 w-6 animate-spin text-gray-400" name="i-heroicons-arrow-path-20-solid" />
                        </div>
                    </template>
                    <template v-else>
                        <div class="fle-col flex h-full w-full">
                            ini
                        </div>
                    </template>
                </main>
            </template>
        </UCard>
    </UModal>
</template>
