<script setup lang="ts">
import EditorBackgroundImage from './-component/editor-bacground-image.vue';
import EditorHeader from './-component/editor-header.vue';
import { usePageDataStore } from './-store/page-data';
import type { PageDataResponse } from '~/types';

// Dependency
const app = useAppStore();
const { privateApi, path } = useApi();
const routeParam = useRoute().params as { id: string };
const pageData = usePageDataStore();

const { pending } = await useLazyAsyncData(`document`, async () => {
    const response: PageDataResponse = await privateApi(path.pagePageId({ pageId: routeParam.id }));
    pageData.id = response.data.id;
    pageData.title = response.data.title;
    pageData.imageSrc = response.data.imageSrc;
    pageData.iconKey = response.data.iconKey;
    pageData.authority = response.data.authority;
    pageData.imagePosition = response.data.imagePosition;
});

watchImmediate([() => pageData.iconKey, () => pageData.title], () => {
    app.headerTitle = pageData.title;
    app.emojiKey = pageData.iconKey;
});
</script>

<template>
    <div :key="`page-${routeParam.id}`" class="flex h-full min-h-full w-full flex-col items-center">
        <!-- Page Loading View -->
        <template v-if="pending">
            <header class="mb-4 flex w-full flex-col">
                <USkeleton class="h-60 w-full rounded-none" />
            </header>
            <main class="mb-6 flex h-full w-full grow flex-col items-center">
                <div class="flex h-full w-full max-w-4xl flex-col items-center gap-6 px-5">
                    <USkeleton class="h-10 w-full rounded-md" />
                    <USkeleton class="h-20 w-full rounded-md" />
                    <USkeleton class="h-full w-full rounded-md" />
                </div>
            </main>
        </template>

        <!-- Page Loaded View -->
        <template v-else>
            <EditorBackgroundImage />

            <!-- Editor -->
            <UContainer class="w-full max-w-3xl">
                <EditorHeader />
                <main class="mb-5 w-full">
                    <!-- TODO: implement editor -->
                </main>
            </UContainer>
        </template>
    </div>
</template>
