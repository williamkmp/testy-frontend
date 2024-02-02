<script setup lang="ts">
import BlockControl from './control/control.vue';
import type { BlockEmit, BlockModel, BlockProps, BlockType, FilePreviewResponse, FileUploadResponse } from '~/types';
import localizeFileSize from '~/utils/localize-file-size';

// Component Definition
const props = defineProps<BlockProps>();
const emit = defineEmits<BlockEmit>();
const block = defineModel<BlockModel>({ required: true });

// Dependecies
const path = useApiPath();
const privateApi = usePrivateApi();

// States
const isLoading = ref(false);
const message = ref('Upload file');
const hasFile = computed(() => block.value.fileId !== undefined);
const fileDialog = useFileDialog({
    multiple: false,
    directory: false,
    reset: true,
});

// Actions
function clickHandler() {
    if (!hasFile.value)
        fileDialog.open();
}

watchImmediate(() => block.value.fileId, async (fileId) => {
    if (!fileId) {
        message.value = 'Upload file';
    }
    else {
        isLoading.value = true;
        const response: FilePreviewResponse = await privateApi.get(path.getFilePreview(fileId));
        const fileName = response.data.name;
        const fileSize = localizeFileSize(response.data.size);
        message.value = `${fileName} - ${fileSize}`;
        isLoading.value = false;
    }
});

fileDialog.onChange(async (files: FileList | null) => {
    if (files == null || files[0] == null)
        return;
    isLoading.value = true;
    const fileUploadResponse: FileUploadResponse = await privateApi.postForm(path.file, {
        file: files[0],
    });
    block.value.fileId = fileUploadResponse.data.id;
    isLoading.value = false;
    emit('change');
});
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
            <div
                class="flex w-full items-center justify-start rounded bg-gray-300/50 px-3 py-2 dark:bg-gray-50/20"
                :class="{ 'cursor-pointer hover:bg-gray-400/50 hover:dark:bg-gray-200/50': !hasFile }"
                @click="clickHandler"
            >
                <sections class="flex items-center gap-2" :class="{ 'opacity-50': !hasFile }">
                    <UIcon name="i-ic-baseline-upload-file" class="text-2xl" />
                    <template v-if="!isLoading">
                        <span>{{ message }}</span>
                    </template>
                    <template v-else>
                        <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
                    </template>
                </sections>
                <div class="grow" />
                <section v-if="hasFile" class="flex items-center justify-end">
                    <a :href="path.getFile(block.fileId)" download>
                        <UButton variant="ghost" icon="i-ic-baseline-download-for-offline" />
                    </a>
                </section>
            </div>
        </div>
    </div>
</template>
