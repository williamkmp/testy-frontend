<script lang="ts" setup>
import { useEditorHeaderStore } from '../-store/editor-header';
import { usePageDataStore } from '../-store/page-data';

// Dependencies
const pageData = usePageDataStore();
const editorHeader = useEditorHeaderStore();

// States & Refs
const emojiPickerRef = ref<HTMLDivElement>();
const isEmojiPickerOpen = ref(false);
const isHover = ref(false);
const isFocus = ref(false);

// Style
const btnClass = 'opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-100 font-normal py-1 px-1.5';

// Events
onClickOutside(emojiPickerRef, () => isEmojiPickerOpen.value = false);

// Actions
async function pickEmoji(emojiKey: string) {
    pageData.iconKey = emojiKey;
    isEmojiPickerOpen.value = false;
}

async function removeEmoji() {
    pageData.iconKey = undefined;
    isEmojiPickerOpen.value = false;
}
</script>

<template>
    <div
        class="mb-4 ml-11 flex w-full flex-col gap-2"
        @mouseenter="isHover = true" @mouseleave="isHover = false"
    >
        <template v-if="editorHeader.hasIcon">
            <UPopover
                :open="isEmojiPickerOpen"
                class="h-min w-min"
                :popper="{ placement: 'bottom' }"
                @update:open="(t) => console.log(t)"
            >
                <template #default>
                    <div
                        class="flex h-20 w-20 items-center justify-center rounded bg-transparent p-3 transition-all hover:cursor-pointer hover:bg-gray-400/20"
                        @click="isEmojiPickerOpen = true"
                    >
                        <EmojiIcon :emoji-name="pageData.iconKey" />
                    </div>
                </template>
                <template #panel>
                    <div
                        ref="emojiPickerRef"
                        class="h-80 w-[24rem] px-2 py-3"
                    >
                        <EmojiPicker
                            @choose="pickEmoji"
                            @remove="removeEmoji"
                        />
                    </div>
                </template>
            </UPopover>
        </template>

        <div
            v-if="!editorHeader.hasCoverImage || !editorHeader.hasIcon "
            class="flex items-center justify-start gap-1.5"
            :class="[(isHover || isFocus) ? 'opacity-100' : 'opacity-0']"
        >
            <UButton
                v-if="!editorHeader.hasIcon"
                label="Add Icon"
                icon="i-heroicons-face-smile"
                variant="ghost" color="zinc" size="md"
                :ui="{ variant: { ghost: btnClass } }"
                @click="editorHeader.showEditorIcon"
            />
            <UButton
                v-if="!editorHeader.hasCoverImage"
                label="Add Cover"
                icon="i-heroicons-photo"
                variant="ghost" color="zinc" size="md"
                :ui="{ variant: { ghost: btnClass } }"
                @click="editorHeader.fileDialog.open"
            />
        </div>
        <UTextarea
            v-model="pageData.title"
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
