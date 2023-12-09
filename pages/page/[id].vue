<script setup lang="ts">
// Dependency
const routeParam = useRoute().params as { id: string };
const app = useAppStore();
const sleep = useSleep();

const { data, pending } = await useAsyncData(`document`, async () => {
    await sleep.for(5000);
    app.headerTitle = `Page Title - ${routeParam.id}`;
    return {
        title: `Page Title - ${routeParam.id}`,
        imageSrc: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?q=80&w=3864&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    };
});
</script>

<template>
    <div :key="`page-${routeParam.id}`" class="flex min-h-full w-full flex-col">
        <!-- Page Loading View -->
        <template v-if="pending">
            <header class="mb-4 flex w-full flex-col">
                <USkeleton class="h-60 w-full rounded-none" />
            </header>
            <main>
                <USkeleton class="h-60 w-full rounded-none" />
            </main>
        </template>

        <!-- Page Loaded View -->
        <template v-else>
            <header class="mb-4 flex w-full flex-col overflow-hidden">
                <div class="flex h-60 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img :src="data?.imageSrc" alt="" class="w-full object-cover">
                </div>
            </header>

            <main class="mb-5 w-full px-5">
                <UContainer class="w-full max-w-4xl">
                    <h1 class="text-4xl font-extrabold">
                        {{ data?.title }}
                    </h1>
                </UContainer>
            </main>
        </template>
    </div>
</template>
