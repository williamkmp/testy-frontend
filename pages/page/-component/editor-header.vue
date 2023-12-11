<script lang="ts" setup>
import { useEditorHeaderStore } from '../-store/editor-header';

const model = defineModel({ type: String, required: true });
const editorHeader = useEditorHeaderStore();
const isHover = ref(false);
const isFocus = ref(false);

// States & Refs
const fileInput = ref<HTMLInputElement>();

// Style
const btnClass = 'opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-100 font-normal py-1 px-1.5';

function uploadImage() {
    const imageInput = fileInput.value as HTMLInputElement;
    if (imageInput && imageInput.files && imageInput.files[0] !== null) {
        editorHeader.coverImageSrc = URL.createObjectURL(imageInput.files[0]);
        editorHeader.coverImagePosition = 0;
    }
}
</script>

<template>
    <div class="mb-4 flex w-full flex-col gap-2" @mouseenter="isHover = true" @mouseleave="isHover = false">
        <input ref="fileInput" type="file" name="backgroundImage" class="hidden" @change="uploadImage">
        <div class="flex items-center justify-start gap-1.5" :class="[(isHover || isFocus) ? 'opacity-100' : 'opacity-0']">
            <UButton
                label="Add Icon"
                icon="i-heroicons-face-smile"
                variant="ghost" color="zinc" size="md"
                :ui="{ variant: { ghost: btnClass } }"
            />
            <UButton
                v-if="!editorHeader.hasCoverImage"
                label="Add Cover"
                icon="i-heroicons-photo"
                variant="ghost" color="zinc" size="md"
                :ui="{ variant: { ghost: btnClass } }"
                @click="fileInput?.click()"
            />
        </div>
        <UTextarea
            v-model="model"
            :rows="1"
            placeholder="Untitled"
            autoresize
            variant="none"
            class="w-full font-extrabold"
            size="xl"
            :ui="{
                size: { xl: 'text-4xl tracking-wide' },
                padding: { xl: 'py-0.5 px-0' },
            }"
            @focus="isFocus = true"
            @blur="isFocus = false"
        />
    </div>
</template>
