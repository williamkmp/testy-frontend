<script setup lang="ts">
import EditorBody from './-component/editor-body.vue';
import EditorBackgroundImage from './-component/editor-bacground-image.vue';
import EditorHeader from './-component/editor-header.vue';
import { usePageDataStore } from './-store/page-data';
import { useEditorBodyStore } from './-store/editor-body';
import type { PageDataResponse } from '~/types';

// Dependency
const app = useAppStore();
const { privateApi, path } = useApi();
const routeParam = useRoute().params as { id: string };
const pageData = usePageDataStore();
const editorBody = useEditorBodyStore();

const { pending } = await useLazyAsyncData(`document`, async () => {
    editorBody.reset();
    const response: PageDataResponse = await privateApi(path.pagePageId({ pageId: routeParam.id }));
    pageData.title = response.data.title;
    pageData.imageId = response.data.imageId;
    pageData.iconKey = response.data.iconKey;
    pageData.authority = response.data.authority;
    pageData.imagePosition = response.data.imagePosition;
    pageData.id = response.data.id;
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
            <UContainer class="w-full max-w-4xl">
                <EditorHeader />
                <EditorBody />
            </UContainer>
        </template>
    </div>
</template>
