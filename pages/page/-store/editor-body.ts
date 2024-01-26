import { defineStore } from 'pinia';
import { v4 as uuid } from 'uuid';
import type { Editor, JSONContent } from '@tiptap/vue-3';
import { createEditor } from '../-utils/editor-utils';
import type { Block, BlockType } from '~/types';

export const useEditorBodyStore = defineStore('PageEditorBody', () => {
    // States
    const DRAGGABLE_CLASS = 'draggable';
    const focusedBlockIndex = ref(-1);
    const blockList = ref<Array<Block>>([]);
    const _contents = computed(() => blockList.value.map(block => block.editor
        ? ({
                isActive: !(block.editor as Editor).isDestroyed,
                isEditable: !(block.editor as Editor).isEditable,
                content: JSON.stringify((block.editor as Editor).getHTML()),
            })
        : '- none -'));

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

        blockList.value.splice(
            index + 1,
            0,
            {
                id: uuid(),
                type: newBlockType,
                editor: newBlockEditor as any,
            },
        );
    }

    function removeBlockAt(index: number) {
        blockList.value.splice(index, 1);
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
        removeBlockAt,
        focusedBlockIndex,
        reset,
        turnInto,
        _contents,
    };
});
