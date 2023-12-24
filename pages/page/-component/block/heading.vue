<script setup lang="ts">
import { BubbleMenu, Editor, EditorContent } from '@tiptap/vue-3';
import Text from '@tiptap/extension-text';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import { useEditorBodyStore } from '../../-store/editor-body';
import BlockControl from './left-control.vue';
import type { Block, BlockType } from '~/types';

const props = defineProps<{ index: number }>();
const editorBody = useEditorBodyStore();
const headingLevel = ref(1);
const editor = computed({
    get: () => {
        const block = editorBody.blockList.at(props.index) as Block;
        if (block.type === 'HEADING_1' || block.type === 'HEADING_2' || block.type === 'HEADING_3')
            return block.editor as Editor;
        else
            return undefined;
    },
    set: (newValue) => {
        const block = editorBody.blockList.at(props.index) as Block;
        if (block.type === 'HEADING_1' || block.type === 'HEADING_2' || block.type === 'HEADING_3')
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
    console.log(`mounted - heading ${props.index}`);
    const block = editorBody.blockList[props.index];
    if (block.type === 'HEADING_1')
        headingLevel.value = 1;
    else if (block.type === 'HEADING_2')
        headingLevel.value = 2;
    else if (block.type === 'HEADING_3')
        headingLevel.value = 3;
    if (block.type === 'HEADING_1' || block.type === 'HEADING_2' || block.type === 'HEADING_3') {
        const existingEditor = block.editor as Editor;
        block.editor = new Editor({
            content: `<p>${existingEditor.getText()}</p>`,
            extensions: [
                Document,
                Paragraph,
                Text,
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
    console.log(`unmount - heading ${props.index}`);
    editor.value?.destroy();
});
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
        <!-- NOTE: for vuedraggable to work there can only be one root node -->
        <BlockControl
            :is-focused="isFocused"
            @click-menu="editorBody.focusedBlock = props.index"
            @add="editorBody.insertBlockAt(props.index)"
            @change="(blockType: BlockType) => editorBody.turnInto(props.index, blockType)"
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
                @focus="() => console.log(`focus at index: ${$props.index}`)"
            />
        </div>
    </div>
</template>
