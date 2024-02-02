<script setup lang="ts">
import BlockControl from './control/control.vue';
import type { BlockEmit, BlockModel, BlockProps, BlockType, FilePreviewResponse, FileUploadResponse } from '~/types';

// Component Definition
const props = defineProps<BlockProps>();
const emit = defineEmits<BlockEmit>();
const block = defineModel<BlockModel>({ required: true });

// Dependecies
const path = useApiPath();
const privateApi = usePrivateApi();

// States
const mouse = useMouse();
const resizeHandler = ref<HTMLDivElement>();
const imageRef = ref<HTMLImageElement>();
const isResizing = ref(false);
const isLoading = ref(false);
const hasFile = computed(() => block.value.fileId !== undefined);
const fileDialog = useFileDialog({
    accept: 'image/*',
    multiple: false,
    directory: false,
    reset: true,
});

// Actions
function uploadImage() {
    if (!hasFile.value)
        fileDialog.open();
}

fileDialog.onChange(async (files: FileList | null) => {
    if (files == null || files[0] == null)
        return;
    isLoading.value = true;
    const resizedImage = await resizeImage(files[0], 5000);
    const fileUploadResponse: FileUploadResponse = await privateApi.postForm(path.file, {
        file: resizedImage,
    });
    block.value.fileId = fileUploadResponse.data.id;
    isLoading.value = false;
    emit('change');
});

useEventListener(window, 'blur', () => isResizing.value = false);
useEventListener(window, 'mouseup', () => isResizing.value = false);
useEventListener(resizeHandler, 'mouseup', () => isResizing.value = false);
useEventListener(resizeHandler, 'mousedown', () => isResizing.value = true);

watch(mouse.y, (newY, oldY) => {
    if (!isResizing.value || !resizeHandler.value || !imageRef.value)
        return;
    const delta = newY - oldY;
    block.value.width = block.value.width + delta;
});

watchDebounced(
    () => block.value.width,
    (newHeight, oldHeight) => {
        if (newHeight !== oldHeight)
            emit('change');
    },
    { debounce: 300 },
);
</script>

<template>
    <div class="group flex items-start justify-start gap-1">
        <BlockControl
            :is-focused="props.isFocused"
            @click-menu="$emit('focus')"
            @add="$emit('enter')"
            @delete="$emit('delete')"
            @change="(blockType: BlockType) => emit('turn', blockType)"
        />
        <!-- block body -->
        <div class="w-full py-1">
            <!-- No image display -->
            <template v-if="!hasFile">
                <div
                    class="flex w-full cursor-pointer items-center justify-start rounded bg-gray-300/50 px-3 py-2 hover:bg-gray-400/50 dark:bg-gray-50/20 hover:dark:bg-gray-200/50"
                    @click="uploadImage"
                >
                    <sections class="flex items-center gap-2" :class="{ 'opacity-50': !hasFile }">
                        <UIcon name="i-ic-baseline-upload-file" class="text-2xl" />
                        <span>Upload image</span>
                    </sections>
                </div>
            </template>
            <template v-else>
                <div
                    class="relative flex w-full flex-col items-center justify-center gap-1 overflow-hidden"
                    @mousedown="(e) => e.preventDefault()"
                >
                    <!-- Download button -->
                    <div class="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
                        <a :href="path.getFile(block.fileId)" download>
                            <UButton variant="ghost" icon="i-ic-baseline-download-for-offline" />
                        </a>
                    </div>

                    <!-- Image -->
                    <img
                        ref="imageRef"
                        class="rounded-lg"
                        :src="path.getFile(block.fileId)"
                        :style="{ height: `${block.width}px` }"
                        alt="image"
                    >

                    <!-- Resize handle -->
                    <div
                        ref="resizeHandler"
                        class="flex w-full cursor-row-resize justify-center opacity-0 transition group-hover:opacity-100"
                    >
                        <div class="h-1.5 w-full max-w-32 rounded-3xl bg-gray-500/50" />
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>
