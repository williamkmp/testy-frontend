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
import PlaceHolder from '@tiptap/extension-placeholder';
import type { Block, BlockType } from '~/types';

export const useEditorBodyStore = defineStore('PageEditorBody', () => {
    // Dependencies
    const _app = useAppStore();

    // States
    const DRAGGABLE_CLASS = 'draggable';
    const focusedBlock = ref(0);
    const blockList = ref<Array<Block>>([]);

    function createEditor(_type: BlockType): Editor {
        const editor = new Editor({
            extensions: [
                Document,
                Paragraph.configure({
                    HTMLAttributes: { class: 'py-0.5' },
                }),
                Text,
                PlaceHolder.configure({
                    includeChildren: true,
                    showOnlyCurrent: true,
                    placeholder: 'Type something...',
                }),
                Underline,
                Bold,
                Italic,
                Highlight,
                TextStyle,
            ],
            editorProps: {
                attributes: { class: 'focus:outline-none w-full h-full' },
            },
        });
        return editor;
    }

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
        const newBlock = createEditor('paragraph');
        newBlock.commands.setContent(editorContent);
        blockList.value.splice(index + 1, 0, {
            id: `block-${_app.getId()}`,
            type: 'paragraph',
            editor: newBlock,
        });
        newBlock.commands.focus('start');
    }

    function deleteBlockAt(index: number) {
        const tobeRemoved = blockList.value[index];
        const previousBlock = blockList.value[index - 1];
        const currentEditor = tobeRemoved.editor as Editor;
        const previousEditor = previousBlock.editor as Editor;
        const currentContent = currentEditor.getJSON();
        if (previousBlock === undefined)
            return;

        if (tobeRemoved === undefined)
            return;
        blockList.value.splice(index, 1);
        if (!currentEditor.isEmpty) {
            previousEditor.commands.insertContentAt(
                previousEditor.getText().length + 1,
                currentContent,
            );
        }
        previousEditor.chain().focus().setTextSelection(previousEditor.getText().length - currentEditor.getText().length + 1).joinBackward().run();
    }

    return {
        DRAGGABLE_CLASS,
        blockList,
        insertBlockAt,
        deleteBlockAt,
        focusedBlock,
        reset,
    };
});
