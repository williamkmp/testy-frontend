<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';
import { EditorContent } from '@tiptap/vue-3';
import { createEditor, getEditorYdoc } from '../../-utils/editor-utils';
import BlockControl from './control/control.vue';
import type { BlockEmit, BlockModel, BlockProps, BlockType } from '~/types';

// Component Definition
const props = defineProps<BlockProps>();
const emit = defineEmits<BlockEmit>();
const block = defineModel<BlockModel>({ required: true });

// States
const editor = computed(() => block.value.editor as Editor | undefined);
const ydoc = computed (() => getEditorYdoc(block.value.editor));
const headingLevel = computed(() => {
    if (block.value.type === 'HEADING_2')
        return 2;
    else if (block.value.type === 'HEADING_3')
        return 3;
    else
        return 1;
});

// Hooks
onBeforeMount(() => {
    const previousContent = editor.value?.getJSON().content;
    editor.value?.destroy();
    block.value.editor = createEditor(previousContent);
    ydoc.value?.on('update', (_update: Uint8Array) => {
        // TODO: implemnet transaction handling
    });
    editor.value?.on('blur', () => emit('blur'));
    editor.value?.on('focus', () => emit('focus'));
    editor.value?.commands.unsetMark('bold');
    editor.value?.commands.unsetMark('underline');
    editor.value?.commands.unsetMark('italic');
    editor.value?.commands.focus('start');
});

onUnmounted(() => {
    editor.value?.destroy();
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
        emit('delete');
}
</script>

<template>
    <div
        class="group flex items-start justify-start gap-1"
        :class="{
            'mt-8': headingLevel === 1,
            'mt-5': headingLevel === 2,
            'mt-4': headingLevel === 3,
        }"
    >
        <BlockControl
            :is-focused="props.isFocused"
            @click-menu="$emit('focus')"
            @add="$emit('enter')"
            @change="(blockType: BlockType) => emit('turn', blockType)"
        />
        <!-- block body -->
        <div
            class="w-full py-1 font-medium"
            :class="{
                'text-3xl': headingLevel === 1,
                'text-2xl': headingLevel === 2,
                'text-xl': headingLevel === 3,
            }"
        >
            <EditorContent
                v-if="editor !== undefined"
                :editor="editor"
                class="w-full max-w-full hover:cursor-text"
                @keydown.enter="handleEnter"
                @keydown.delete="handleDelete"
            />
        </div>
    </div>
</template>
