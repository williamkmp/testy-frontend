<script setup lang="ts">
import { BubbleMenu, Editor, EditorContent } from '@tiptap/vue-3';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import { useEditorBodyStore } from '../../-store/editor-body';
import BlockControl from './rignt-control.vue';
import type { Block } from '~/types';

const props = defineProps<{ index: number }>();
const editorBody = useEditorBodyStore();
const editor = computed({
    get: () => {
        const block = editorBody.blockList.at(props.index) as Block;
        if (block.type === 'PARAGRAPH')
            return block.editor as Editor;
        else
            return undefined;
    },
    set: (newValue) => {
        const block = editorBody.blockList.at(props.index) as Block;
        if (block.type === 'PARAGRAPH')
            block.editor = newValue;
    },
});

const isFocused = computed(() => editorBody.focusedBlock === props.index);

function handleEnter(e: Event) {
    e.preventDefault();
    if (editor.value) {
        const curentContent = editor.value.getJSON();
        const newBlockContent = curentContent?.content?.pop();
        editor.value.commands.setContent(curentContent);
        editorBody.insertBlockAt(props.index, newBlockContent);
    }
}

function handleDelete() {
    if (editor.value !== undefined) {
        const caretPosition = editor.value.view.state.selection.$anchor.pos;
        if (caretPosition <= 1)
            editorBody.deleteBlockAt(props.index);
    }
}

onBeforeMount(() => {
    // eslint-disable-next-line no-console
    console.log(`mounted - paragraph ${props.index}`);
    editorBody.blockList[props.index].type = 'PARAGRAPH';
    const block = editorBody.blockList[props.index];
    if (block.type === 'PARAGRAPH') {
        const existingEditor = block.editor as Editor;
        block.editor = new Editor({
            content: existingEditor?.getJSON(),
            extensions: [
                Document,
                Paragraph,
                Text,
                Underline,
                Bold,
                Italic,
            ],
            editorProps: {
                attributes: { class: 'focus:outline-none w-full h-full' },
            },
            onBlur: () => editorBody.focusedBlock = -1,
            onTransaction: (tr) => {
                if (editor.value && editor.value.isFocused)
                    editorBody.focusedBlock = props.index;
                if (tr.transaction.docChanged) {
                    // TODO: impelement transaction handling
                }
            },
        });
        block.editor.commands.focus('start');
    }
});

onUnmounted(() => {
    // eslint-disable-next-line no-console
    console.log(`unmount - paragraph ${props.index}`);
    editor.value?.destroy();
});
</script>

<template>
    <div class="group flex items-start justify-start gap-1">
        <!-- NOTE: for vuedraggable to work there can only be one root node -->
        <BlockControl
            :is-focused="isFocused"
            @click-menu="editorBody.focusedBlock = props.index"
        />
        <!-- block body -->
        <div class="w-full py-0.5">
            <BubbleMenu
                v-if="editor"
                :editor="editor"
            >
                <UButtonGroup orientation="horizontal" size="xs">
                    <UButton
                        icon="i-ic-round-format-bold"
                        :color="editor.isActive('bold') ? 'black' : 'gray'"
                        @click="editor.chain().focus().toggleBold().run()"
                    />
                    <UButton
                        icon="i-ic-round-format-italic"
                        :color="editor.isActive('italic') ? 'black' : 'gray'"
                        @click="editor.chain().focus().toggleItalic().run()"
                    />
                    <UButton
                        icon="i-ic-round-format-underlined"
                        :color="editor.isActive('underline') ? 'black' : 'gray'"
                        @click="editor.chain().focus().toggleUnderline().run()"
                    />
                </UButtonGroup>
            </BubbleMenu>
            <EditorContent
                v-if="editor !== undefined"
                :editor="editor"
                class="w-full max-w-full hover:cursor-text"
                @keydown.enter="handleEnter"
                @keyup.delete="handleDelete"
                @focus="() => console.log(`focus at index: ${$props.index}`)"
            />
        </div>
    </div>
</template>
