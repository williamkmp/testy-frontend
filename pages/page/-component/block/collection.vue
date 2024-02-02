<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';
import { BubbleMenu, EditorContent } from '@tiptap/vue-3';
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

function handleDelete() {
    if (!editor.value)
        return;
    const caretPosition = editor.value.view.state.selection.$anchor.pos;
    if (caretPosition <= 1)
        emit('deleteAppend');
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
                                <EmojiIcon :emoji-name="block.iconKey" />
                            </div>
                        </template>
                        <template #panel>
                            <div
                                ref="emojiPickerRef"
                                class="h-60 w-[24rem] px-2 py-3"
                            >
                                <EmojiPicker @choose="pickEmoji" />
                            </div>
                        </template>
                    </UPopover>
                    <EditorContent
                        v-if="editor !== undefined"
                        :editor="editor"
                        class="w-full max-w-full hover:cursor-text"
                        @keydown.enter="handleEnter"
                        @keydown.delete="handleDelete"
                    />
                </section>
                <UDivider />
            </header>

            <table class="min-w-full">
                <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Page 1</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
