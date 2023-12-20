import { defineStore } from 'pinia';
import { Editor } from '@tiptap/vue-3';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import type { Block } from '~/types';

export const useEditorBodyStore = defineStore('PageEditorBody', () => {
    // Dependencies
    const _app = useAppStore();

    // States
    const DRAGGABLE_CLASS = 'draggable';
    const focusedBlock = ref(0);
    const blockList = ref<Array<Block>>([]);
    const _datas = computed(() => blockList.value.map(block => block.editor ? (block.editor as Editor).getText() : '-none-'));

    function reset() {
        for (const block of blockList.value) {
            if (block.editor)
                (block.editor as Editor).destroy();
        }
        blockList.value = [];
    }

    function insertBlockAt(index: number, content?: any) {
        const editorContent = {
            type: 'doc',
            content: content !== undefined
                ? [content]
                : undefined,
        };
        blockList.value.splice(index + 1, 0, {
            id: `block-${_app.getId()}`,
            type: 'paragraph',
            editor: createEditor(editorContent),
        });
    }

    function createEditor(content?: any): Editor {
        const newEditor = new Editor({
            content,
            extensions: [
                Document,
                Paragraph,
                Text,
                Underline,
                Bold,
                Italic,
            ],
        });
        return newEditor;
    }

    function deleteBlockAt(index: number) {
        const removedBlock = blockList.value[index];
        const previousBlock = blockList.value[index - 1];
        if (!previousBlock || !removedBlock)
            return;

        blockList.value.splice(index, 1);
        const currentEditor = removedBlock.editor as Editor;
        const previousEditor = previousBlock.editor as Editor;

        if (removedBlock.editor && previousBlock.editor && !currentEditor.isEmpty) {
            previousBlock.editor.commands.insertContentAt(
                previousEditor.getText().length + 1,
                removedBlock.editor.getJSON(),
            );

            const previousTextLen = (previousBlock.editor as Editor).getText().length;
            const removedTextLen = (removedBlock.editor as Editor).getText().length;
            const caretPosition = previousTextLen - removedTextLen + 1;
            previousEditor
                .chain()
                .focus()
                .setTextSelection(caretPosition)
                .joinBackward()
                .run();
        }
    }

    return {
        DRAGGABLE_CLASS,
        blockList,
        insertBlockAt,
        deleteBlockAt,
        focusedBlock,
        reset,
        _datas,
    };
});