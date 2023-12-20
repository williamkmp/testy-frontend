<script setup lang="ts">
import { BubbleMenu, Editor, EditorContent } from '@tiptap/vue-3';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import { useEditorBodyStore } from '~/pages/page/-store/editor-body';

const props = defineProps<{ index: number }>();
const editorBody = useEditorBodyStore();
const editor = computed({
    get: () => editorBody.blockList.at(props.index)?.editor as Editor | undefined,
    set: newValue => editorBody.blockList[props.index].editor = newValue,
});

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
    if (editor.value) {
        const tiptap = editor.value as Editor;
        if (tiptap.view.state.selection.$anchor.pos === 1)
            editorBody.deleteBlockAt(props.index);
    }
}

onBeforeMount(() => {
    console.log(`mounted - paragraph ${props.index}`);
    const existingEditor = editorBody.blockList[props.index]?.editor as Editor | undefined;
    editorBody.blockList[props.index].editor = new Editor({
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
        onTransaction: (tr) => {
            if (editor.value && editor.value.isFocused)
                editorBody.focusedBlock = props.index;
            if (tr.transaction.docChanged) {
                // TODO: impelement transaction handling
            }
        },
    });
    (editorBody.blockList[props.index].editor as Editor).commands.focus('start');
});

onUnmounted(() => {
    console.log(`unmount - paragraph ${props.index}`);
    editor.value?.destroy();
});
</script>

<template>
    <div class="group flex items-start justify-start gap-1">
        <div data-role="control" class="flex items-center justify-center gap-0.5 opacity-0 transition duration-100 group-hover:opacity-100">
            <div class="rounded px-1 py-0.5 hover:bg-gray-200 dark:hover:bg-gray-100/10">
                <UIcon class="text-gray-500" name="i-ic-round-plus" />
            </div>
            <div
                class="rounded p-0.5 hover:bg-gray-200/50 dark:hover:bg-gray-100/10"
                :class="[editorBody.DRAGGABLE_CLASS]"
            >
                <UIcon class="text-gray-500" name="i-ic-round-drag-indicator" />
            </div>
        </div>
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
