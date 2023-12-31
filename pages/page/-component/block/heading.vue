<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3';
import Text from '@tiptap/extension-text';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import BlockControl from './left-control.vue';
import type { Block, BlockType } from '~/types';

const props = defineProps<{ isFocused: boolean, isDragging: boolean }>();
const emit = defineEmits<{
    enter: [content?: any]
    turn: [type: BlockType]
    delete: []
    focus: []
    blur: []
}>();
const block = defineModel<Block>({ required: true });
const editor = computed(() => block.value.editor as Editor);
const headingLevel = computed(() => {
    if (block.value.type === 'HEADING_1')
        return 1;
    if (block.value.type === 'HEADING_2')
        return 2;
    if (block.value.type === 'HEADING_3')
        return 3;
    return 1;
});

function handleEnter(e: Event) {
    e.preventDefault();
    if (editor.value) {
        const curentContent = editor.value.getJSON();
        const newBlockContent = curentContent?.content?.pop();
        editor.value.commands.setContent(curentContent);
        emit('enter', newBlockContent);
    }
}

function handleDelete() {
    if (editor.value !== undefined) {
        const caretPosition = editor.value.view.state.selection.$anchor.pos;
        if (caretPosition <= 1)
            emit('delete');
    }
}

onBeforeMount(() => {
    const existingContent = editor.value?.getJSON();
    block.value.editor = new Editor({
        content: existingContent,
        extensions: [
            Document,
            Paragraph,
            Text,
        ],
        editorProps: {
            attributes: { class: 'focus:outline-none w-full h-full' },
        },
        onBlur: () => emit('blur'),
        onTransaction: (tr) => {
            if (editor.value && editor.value.isFocused)
                emit('focus');
            if (tr.transaction.docChanged) {
                // TODO: impelement transaction handling
            }
        },
    });
    editor.value?.commands.focus('start');
});

onUnmounted(() => {
    editor.value?.destroy();
});
</script>

<template>
    <div
        class="group flex items-start justify-start gap-1"
        :class="{
            'mt-8': headingLevel === 1 && !isDragging,
            'mt-5': headingLevel === 2 && !isDragging,
            'mt-4': headingLevel === 3 && !isDragging,
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
            class="w-full py-0.5 font-bold"
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
                @keyup.delete="handleDelete"
            />
        </div>
    </div>
</template>
