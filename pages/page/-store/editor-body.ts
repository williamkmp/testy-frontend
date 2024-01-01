import { defineStore } from 'pinia';
import { Editor } from '@tiptap/vue-3';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import type { Block, BlockType } from '~/types';

export const useEditorBodyStore = defineStore('PageEditorBody', () => {
    // Dependencies
    const _app = useAppStore();

    // States
    const DRAGGABLE_CLASS = 'draggable';
    const focusedBlockIndex = ref(-1);
    const draggingBlockIndex = ref(-1);
    const blockList = ref<Array<Block>>([]);
    const _contents = computed(() => blockList.value.map(block => block.editor
        ? ({
                isActive: !(block.editor as Editor).isDestroyed,
                isEditable: !(block.editor as Editor).isEditable,
                content: (block.editor as Editor).getHTML(),
            })
        : '- none -'));

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
        const currentBlockType = blockList.value.at(index)?.type || 'PARAGRAPH';
        let newBlockType: BlockType = 'PARAGRAPH';
        if (
            currentBlockType === 'NUMBERED_LIST'
            || currentBlockType === 'BULLET_LIST'
        )
            newBlockType = currentBlockType;
        blockList.value.splice(index + 1, 0, {
            id: `block-${_app.getId()}`,
            type: newBlockType,
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
        const currentEditor = removedBlock?.editor as Editor | undefined;
        const previousEditor = previousBlock?.editor as Editor | undefined;

        if (currentEditor && previousEditor && !currentEditor.isEmpty) {
            if (previousEditor.isEmpty) {
                previousEditor.commands.setContent(
                    currentEditor.getJSON(),
                );
            }
            else {
                previousEditor.commands.insertContentAt(
                    previousEditor.getText().length + 1,
                    currentEditor.getJSON().content || [],
                );
            }

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
        else {
            if (previousEditor)
                previousEditor.commands.focus('end');
        }
    }

    function turnInto(index: number, type: BlockType) {
        const block = blockList.value[index];
        if (!block || block.type === type)
            return;
        block.type = type;
    }

    return {
        DRAGGABLE_CLASS,
        blockList,
        insertBlockAt,
        deleteBlockAt,
        focusedBlockIndex,
        draggingBlockIndex,
        reset,
        turnInto,
        _contents,
    };
});
