<script setup lang="ts">
import type { Editor, JSONContent } from '@tiptap/vue-3';
import { SlickItem, SlickList } from 'vue-slicksort';
import { useEditorBodyStore } from '../-store/editor-body';
import { usePageDataStore } from '../-store/page-data';
import BlockQuotes from './block/blockquotes.vue';
import Checkbox from './block/checkbox.vue';
import File from './block/file.vue';
import Divider from './block/divider.vue';
import Heading from './block/heading.vue';
import List from './block/list.vue';
import Paragraph from './block/paragraph.vue';
import Image from './block/image.vue';
import Collection from './block/collection.vue';
import type { Block, BlockMessageDto, BlockType } from '~/types';

// Dependency
const stomp = useStompClient();
const pageData = usePageDataStore();
const editorBody = useEditorBodyStore();

const draggedBlockId = ref<string>();
const userCanUpdateBlock = computed(() => pageData.authority !== 'VIEWERS' && pageData.authority !== undefined);
const focusedBlock = computed({
    get: () => editorBody.focusedBlockIndex,
    set: value => editorBody.focusedBlockIndex = value,
});

function handleUserDelete(index: number, append: boolean = false) {
    const removedBlock = editorBody.blockList[index];
    const previousBlock = editorBody.blockList[index - 1];
    editorBody.removeBlockAt(index);
    stomp.send(`/app/page/${pageData.id}/block.delete`, { id: removedBlock.id });

    if (!previousBlock || !removedBlock)
        return;

    const currentEditor = removedBlock?.editor as Editor | undefined;
    const previousEditor = previousBlock?.editor as Editor | undefined;

    if (currentEditor && previousEditor && !currentEditor.isEmpty && append) {
        if (previousEditor.isEmpty) {
            previousEditor.commands.setContent(
                currentEditor.getJSON(),
            );
        }
        else {
            previousEditor.commands.insertContentAt(
                previousEditor.getText().length + 1,
                currentEditor.getJSON().content ?? [],
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

function handleUserEnter(index: number, content?: JSONContent) {
    const prevBlock = editorBody.blockList[index];
    const nextBlock = editorBody.blockList[index + 1];
    const createdBlock = editorBody.insertBlockAt(index, content);
    focusedBlock.value = index + 1;
    const payload: BlockMessageDto = {
        id: createdBlock.id,
        type: createdBlock.type,
        content: (createdBlock.editor as Editor).getHTML(),
        nextId: nextBlock?.id,
        prevId: prevBlock?.id,
        width: createdBlock.width,
        iconKey: createdBlock.iconKey,
        isChecked: createdBlock.isChecked,
        fileId: createdBlock.fileId,
    };
    stomp.send(`/app/page/${pageData.id}/block.add`, payload);
}

function handleUserChangeBlockType(index: number, newType: BlockType) {
    editorBody.turnInto(index, newType);
    const block = editorBody.blockList.at(index) as Block;
    const blockContent = (block.editor as Editor).getHTML();
    const payload: BlockMessageDto = {
        id: block.id,
        type: newType,
        content: blockContent,
        width: block.width,
        iconKey: block.iconKey,
        isChecked: block.isChecked,
    };
    stomp.send(`/app/page/${pageData.id}/block.transaction`, payload);
}

const handleContentUpdate = useDebounceFn((block: Block, content?: string) => {
    const payload: BlockMessageDto = {
        id: block.id,
        type: block.type,
        content: content ?? '<p></p>',
        width: block.width,
        iconKey: block.iconKey,
        fileId: block.fileId,
        isChecked: block.isChecked,
    };
    stomp.send(`/app/page/${pageData.id}/block.transaction`, payload);
}, 500);

function setBlockMove(selected: { index: number }) {
    const block = editorBody.blockList.at(selected.index) as Block;
    draggedBlockId.value = block.id;
}

async function saveBlockMove() {
    if (draggedBlockId.value) {
        await nextTick();
        const index = editorBody.blockList.findIndex(block => block.id === draggedBlockId.value);
        if (index < 0)
            return;
        const block = editorBody.blockList[index] as Block;
        const prevBlock = editorBody.blockList[index - 1];
        const nextBlock = editorBody.blockList[index + 1];
        stomp.send(`/app/page/${pageData.id}/block.move`, {
            id: block.id,
            prevId: prevBlock ? prevBlock.id : undefined,
            nextId: nextBlock ? nextBlock.id : undefined,
        });
        draggedBlockId.value = undefined;
    }
}
</script>

<template>
    <main class="mb-20 w-full ">
        <template v-if="editorBody.blockList && editorBody.blockList.length > 0">
            <SlickList
                v-model:list="editorBody.blockList"
                use-drag-handle
                use-window-as-scroll-container
                @sort-start="setBlockMove"
                @sort-end="saveBlockMove"
            >
                <SlickItem v-for="(block, index) in editorBody.blockList" :key="block.id" :index="index">
                    <template v-if="block.type === 'PARAGRAPH'">
                        <Paragraph
                            v-model="editorBody.blockList[index]"
                            :index="index"
                            :is-focused="focusedBlock === index"
                            :is-editable="userCanUpdateBlock"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => handleUserDelete(index, false)"
                            @delete-append="() => handleUserDelete(index, true)"
                            @turn="(type) => handleUserChangeBlockType(index, type)"
                            @change="(content) => handleContentUpdate(block, content)"
                        />
                    </template>
                    <template v-else-if="block.type === 'BLOCK_QUOTES'">
                        <BlockQuotes
                            v-model="editorBody.blockList[index]"
                            :index="index"
                            :is-focused="focusedBlock === index"
                            :is-editable="userCanUpdateBlock"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => handleUserDelete(index)"
                            @delete-append="() => handleUserDelete(index, true)"
                            @turn="(type) => handleUserChangeBlockType(index, type)"
                            @change="(content) => handleContentUpdate(block, content)"
                        />
                    </template>
                    <template v-else-if="block.type === 'NUMBERED_LIST' || block.type === 'BULLET_LIST' ">
                        <List
                            v-model="editorBody.blockList[index]"
                            :index="index"
                            :is-focused="focusedBlock === index"
                            :is-editable="userCanUpdateBlock"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => handleUserDelete(index)"
                            @delete-append="() => handleUserDelete(index, true)"
                            @turn="(type) => handleUserChangeBlockType(index, type)"
                            @change="(content) => handleContentUpdate(block, content)"
                        />
                    </template>
                    <template v-else-if="block.type === 'CHECKBOX'">
                        <Checkbox
                            v-model="editorBody.blockList[index]"
                            :index="index"
                            :is-focused="focusedBlock === index"
                            :is-editable="userCanUpdateBlock"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => handleUserDelete(index)"
                            @delete-append="() => handleUserDelete(index, true)"
                            @turn="(type) => handleUserChangeBlockType(index, type)"
                            @change="(content) => handleContentUpdate(block, content)"
                        />
                    </template>
                    <template v-else-if="block.type === 'HEADING_1' || block.type === 'HEADING_2' || block.type === 'HEADING_3'">
                        <Heading
                            v-model="editorBody.blockList[index]"
                            :index="index"
                            :is-focused="focusedBlock === index"
                            :is-editable="userCanUpdateBlock"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => handleUserDelete(index)"
                            @delete-append="() => handleUserDelete(index, true)"
                            @turn="(type) => handleUserChangeBlockType(index, type)"
                            @change="(content) => handleContentUpdate(block, content)"
                        />
                    </template>
                    <template v-else-if="block.type === 'DIVIDER'">
                        <Divider
                            v-model="editorBody.blockList[index]"
                            :index="index"
                            :is-focused="focusedBlock === index"
                            :is-editable="userCanUpdateBlock"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => handleUserDelete(index)"
                            @delete-append="() => handleUserDelete(index, true)"
                            @turn="(type) => handleUserChangeBlockType(index, type)"
                        />
                    </template>
                    <template v-else-if="block.type === 'FILE'">
                        <File
                            v-model="editorBody.blockList[index]"
                            :index="index"
                            :is-focused="focusedBlock === index"
                            :is-editable="userCanUpdateBlock"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => handleUserDelete(index)"
                            @delete-append="() => handleUserDelete(index, true)"
                            @turn="(type) => handleUserChangeBlockType(index, type)"
                            @change="() => handleContentUpdate(block)"
                        />
                    </template>
                    <template v-else-if="block.type === 'IMAGE'">
                        <Image
                            v-model="editorBody.blockList[index]"
                            :index="index"
                            :is-focused="focusedBlock === index"
                            :is-editable="userCanUpdateBlock"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => handleUserDelete(index)"
                            @delete-append="() => handleUserDelete(index, true)"
                            @turn="(type) => handleUserChangeBlockType(index, type)"
                            @change="() => handleContentUpdate(block)"
                        />
                    </template>
                    <template v-else-if="block.type === 'COLLECTION'">
                        <Collection
                            v-model="editorBody.blockList[index]"
                            :index="index"
                            :is-focused="focusedBlock === index"
                            :is-editable="userCanUpdateBlock"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => handleUserDelete(index)"
                            @delete-append="() => handleUserDelete(index, true)"
                            @turn="(type) => handleUserChangeBlockType(index, type)"
                            @change="(content) => handleContentUpdate(block, content)"
                        />
                    </template>
                </SlickItem>
            </SlickList>
        </template>
        <template v-else>
            <UButton
                v-if="userCanUpdateBlock"
                label="Add Block"
                icon="i-heroicons-plus"
                color="primary"
                variant="soft"
                block size="xs"
                @click="handleUserEnter(-1)"
            />
        </template>
    </main>
</template>
