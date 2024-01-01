<script setup lang="ts">
import { BubbleMenu, Editor, EditorContent } from '@tiptap/vue-3';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import { useEditorBodyStore } from '../../-store/editor-body';
import BlockControl from './left-control.vue';
import type { Block, BlockType } from '~/types';

const props = defineProps<{ isFocused: boolean, index: number }>();
const emit = defineEmits<{
    enter: [content?: any]
    turn: [type: BlockType]
    delete: []
    focus: []
    blur: []
}>();
const editorBody = useEditorBodyStore();
const block = defineModel<Block>({ required: true });
const editor = computed(() => block.value.editor as Editor);
const previousBlockNumbering = computed(() => editorBody.blockList[props.index - 1]?.numbering || 0);
watchImmediate(previousBlockNumbering, () => {
    block.value.numbering = previousBlockNumbering.value + 1;
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
            Underline,
            Bold,
            Italic,
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
    block.value.numbering = undefined;
    editor.value?.destroy();
});
</script>

<template>
    <div class="group flex items-start justify-start gap-1">
        <BlockControl
            :is-focused="props.isFocused"
            @click-menu="$emit('focus')"
            @add="$emit('enter')"
            @change="(blockType: BlockType) => emit('turn', blockType)"
        />
        <!-- block body -->
        <div class="my-1 flex min-h-max w-full items-start justify-start gap-2">
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
            <div>
                <template v-if="block.type === 'BULLET_LIST'">
                    •
                </template>
                <template v-else-if="block.type === 'NUMBERED_LIST'">
                    {{ block.numbering }}.
                </template>
            </div>
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
