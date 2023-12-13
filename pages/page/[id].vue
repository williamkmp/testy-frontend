<script setup lang="ts">
import draggable from 'vuedraggable';
import EditorBackgroundImage from './-component/editor-bacground-image.vue';
import EditorHeader from './-component/editor-header.vue';
import { useEditorHeaderStore } from './-store/editor-header';

// Dependency
const routeParam = useRoute().params as { id: string };
const app = useAppStore();
const editorHeader = useEditorHeaderStore();

const { data, pending } = await useLazyAsyncData(`document`, async () => {
    const imageSrc = 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?q=80&w=3864&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    const title = 'Page Title';
    editorHeader.title = title;
    editorHeader.coverImageSrc = imageSrc;
    app.headerTitle = editorHeader.title;

    return {
        title,
        imageSrc,
    };
});

interface PageBlock {
    id: string
    type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'divider' | 'bullet'
    content: string
};

const pageBlocks = ref<PageBlock[]>([]);
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
                <EditorHeader v-model="data!.title" />
                <main class="mb-5 w-full">
                    <draggable v-model="pageBlocks" item-key="id">
                        <template #item="{ element }">
                            <div> {{ element.content }} </div>
                        </template>
                    </draggable>
                </main>
            </UContainer>
        </template>
    </div>
</template>
