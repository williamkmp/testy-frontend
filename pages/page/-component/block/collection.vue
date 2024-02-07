<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';
import { EditorContent } from '@tiptap/vue-3';
import { useColelction } from '../../-composeables/collection-state';
import BlockControl from './control/control.vue';
import type { BlockEmit, BlockModel, BlockProps, BlockType } from '~/types';

// Component Definition
const props = defineProps<BlockProps>();
const emit = defineEmits<BlockEmit>();
const block = defineModel<BlockModel>({ required: true });

// States
const editor = computed(() => block.value.editor as Editor);
const isEmojiPickerOpen = ref(false);
const emojiPickerRef = ref<HTMLDivElement>();
const collection = useColelction(block.value.id);

// Hooks
onBeforeMount(() => {
    editor.value.on('update', onContentUpdate);
    editor.value.on('blur', onEditorBlur);
    editor.value.on('focus', onEditorFocus);
    if (props.isFocused)
        editor.value.commands.focus('start');
});

onUnmounted(() => {
    editor.value.off('update', onContentUpdate);
    editor.value.off('blur', onEditorBlur);
    editor.value.off('focus', onEditorFocus);
});

// Actions
function handleEnter(e: Event) {
    e.preventDefault();
    if (!editor.value)
        return;
    const curentContent = editor.value.getJSON();
    const newBlockContent = curentContent?.content?.pop();
    editor.value.commands.setContent(curentContent);
    emit('enter', newBlockContent);
}

function onContentUpdate() {
    emit('change', editor.value.getHTML());
}

function onEditorFocus() {
    emit('focus');
}

function onEditorBlur() {
    emit('blur');
}

async function pickEmoji(emojiKey: string) {
    block.value.iconKey = emojiKey;
    isEmojiPickerOpen.value = false;
    emit('change', editor.value.getHTML());
}
</script>

<template>
    <div class="group my-2 flex items-start justify-start gap-1">
        <BlockControl
            non-turnable
            :is-focused="props.isFocused"
            @click-menu="$emit('focus')"
            @add="$emit('enter')"
            @delete="$emit('delete')"
            @change="(blockType: BlockType) => emit('turn', blockType)"
        />
        <!-- block body -->
        <div class="w-full py-1">
            <header class="flex flex-col gap-2 font-bold">
                <section class="flex items-center justify-start gap-2 text-xl">
                    <UPopover
                        :open="isEmojiPickerOpen"
                        class="size-min"
                        :popper="{ placement: 'right' }"
                    >
                        <template #default>
                            <div
                                class="flex size-8 items-center justify-center rounded bg-transparent transition-all hover:cursor-pointer hover:bg-gray-400/20"
                                @click="isEmojiPickerOpen = true"
                            >
                                <EmojiIcon :emoji-name="block.iconKey" minified />
                            </div>
                        </template>
                        <template #panel>
                            <div ref="emojiPickerRef" class="h-60 w-[24rem] px-2 py-3">
                                <EmojiPicker @choose="pickEmoji" />
                            </div>
                        </template>
                    </UPopover>
                    <EditorContent
                        v-if="editor !== undefined"
                        :editor="editor"
                        class="w-full max-w-full hover:cursor-text"
                        @keydown.enter="handleEnter"
                    />
                    <div class="opacity-0 transition group-hover:opacity-100">
                        <UButton
                            leading-icon="i-heroicons-plus"
                            label="New"
                            color="blue"
                            variant="soft"
                            size="xs"
                            @click="collection.addPage"
                        />
                    </div>
                </section>
            </header>

            <!-- Body -->
            <div class="max-h-96 w-full overflow-y-auto">
                <UDivider class="mb-2" />
                <template v-if="!collection.isLoading.value">
                    <div class="flex w-full flex-col">
                        <template v-for="page in collection.pages.value" :key="page.id">
                            <NuxtLink :to="`/page/${page.id}`">
                                <div class="flex w-full items-center justify-start gap-2 rounded-lg p-2 hover:bg-gray-200/50">
                                    <div class="grid size-6 shrink-0 place-items-center">
                                        <EmojiIcon v-if="page.iconKey !== undefined" :emoji-name="page.iconKey" minified />
                                        <UIcon v-else name="i-heroicons-document" />
                                    </div>
                                    <span class="text-gray-800 decoration-gray-50 dark:text-white">{{ page.title || 'Untitled' }}</span>
                                </div>
                            </NuxtLink>
                        </template>
                    </div>
                </template>
                <template v-else>
                    <div class="flex size-full items-center justify-center rounded-lg bg-gray-200">
                        <UIcon name="i-heriocons-arrow-path" class="animate-spin" />
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>
