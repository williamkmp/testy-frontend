import { defineStore } from 'pinia';
import { v4 as uuid } from 'uuid';
import type { Editor, JSONContent } from '@tiptap/vue-3';
import { createEditor, editorHTMLToJSON } from '../-utils/editor-utils';
import type { Block, BlockType } from '~/types';

export const useEditorBodyStore = defineStore('PageEditorBody', () => {
    // States
    const DRAGGABLE_CLASS = 'draggable';
    const focusedBlockIndex = ref(-1);
    const blockList = ref<Array<Block>>([]);

    function reset() {
        for (const block of blockList.value) {
            if (block.editor)
                (block.editor as Editor).destroy();
        }
        blockList.value = [];
    }

    function insertBlockAt(index: number, content?: JSONContent) {
        const newBlockEditor = createEditor(content);
        const currentBlockType = blockList.value.at(index)?.type || 'PARAGRAPH';
        const newBlockType: BlockType = (currentBlockType === 'NUMBERED_LIST' || currentBlockType === 'BULLET_LIST')
            ? currentBlockType
            : 'PARAGRAPH';
        const newBlock = {
            id: uuid(),
            type: newBlockType,
            editor: newBlockEditor as any,
            iconKey: 'emoji-1215',
            numbering: 0,
            width: 100,
        };
        blockList.value.splice(index + 1, 0, newBlock);
        return newBlock;
    }

    function removeBlockAt(index: number) {
        blockList.value.splice(index, 1);
    }

    function turnInto(index: number, type: BlockType) {
        const block = blockList.value[index];
        if (!block || block.type === type)
            return;
        const isBlockTypeNonEditor = (type === 'DIVIDER' || type === 'IMAGE' || type === 'FILE');
        const EMPTY_CONTENT = '<p></p>';

        block.type = type;
        if (isBlockTypeNonEditor)
            (block.editor as Editor).commands.setContent(editorHTMLToJSON(EMPTY_CONTENT));
    }

    return {
        DRAGGABLE_CLASS,
        blockList,
        insertBlockAt,
        removeBlockAt,
        focusedBlockIndex,
        reset,
        turnInto,
    };
});
