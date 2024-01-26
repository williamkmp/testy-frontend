<script setup lang="ts">
import { SlickItem, SlickList } from 'vue-slicksort';
import type { Editor, JSONContent } from '@tiptap/vue-3';
import { useEditorBodyStore } from '../-store/editor-body';
import { usePageDataStore } from '../-store/page-data';
import Paragraph from './block/paragraph.vue';
import BlockQuotes from './block/blockquotes.vue';
import List from './block/list.vue';
import Heading from './block/heading.vue';
import Divider from './block/divider.vue';
import type { BlockType } from '~/types';

// Dependency
const pageData = usePageDataStore();
const stomp = useStompClient();

const editorBody = useEditorBodyStore();
const focusedBlock = computed({
    get: () => editorBody.focusedBlockIndex,
    set: value => editorBody.focusedBlockIndex = value,
});

// TODO: implement block @transaction event handling

function handleUserDelete(index: number) {
    const removedBlock = editorBody.blockList[index];
    const previousBlock = editorBody.blockList[index - 1];
    if (!previousBlock || !removedBlock)
        return;

    editorBody.removeBlockAt(index);
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

    if (currentEditor)
        currentEditor.destroy();
}

function handleUserEnter(index: number, content?: JSONContent) {
    editorBody.insertBlockAt(index, content);
    focusedBlock.value = index + 1;
}

function handleUserChangeBlockType(index: number, newType: BlockType) {
    handleUserChangeBlockType(index, newType);
}

function handleTransaction(uuid: string, transaction: Uint8Array) {
    // TODO: impelmement transaction publish
    stomp.send('/app/page');
}

onMounted(() => {
    stomp.subscribe(`/topic/page/${pageData.id}/block.transaction`, (payload, header) => {
        // TODO: apply transaction to block using Y.applyUpdate(block, payload.transaction, origin);
    });
});
</script>

<template>
    <main class="mb-20 w-full ">
        <template v-if="editorBody.blockList && editorBody.blockList.length > 0">
            <SlickList
                v-model:list="editorBody.blockList"
                use-drag-handle
            >
                <SlickItem v-for="(block, index) in editorBody.blockList" :key="block.id" :index="index">
                    <template v-if="block.type === 'PARAGRAPH'">
                        <Paragraph
                            v-model="editorBody.blockList[index]"
                            :index="index"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => handleUserDelete(index)"
                            @turn="(type) => handleUserChangeBlockType(index, type)"
                            @transaction="handleTransaction"
                        />
                    </template>
                    <template v-else-if="block.type === 'BLOCK_QUOTES'">
                        <BlockQuotes
                            v-model="editorBody.blockList[index]"
                            :index="index"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => handleUserDelete(index)"
                            @turn="(type) => handleUserChangeBlockType(index, type)"
                        />
                    </template>
                    <template v-else-if="block.type === 'NUMBERED_LIST' || block.type === 'BULLET_LIST' ">
                        <List
                            v-model="editorBody.blockList[index]"
                            :index="index"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => handleUserDelete(index)"
                            @turn="(type) => handleUserChangeBlockType(index, type)"
                        />
                    </template>
                    <template v-else-if="block.type === 'HEADING_1' || block.type === 'HEADING_2' || block.type === 'HEADING_3'">
                        <Heading
                            v-model="editorBody.blockList[index]"
                            :index="index"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => handleUserDelete(index)"
                            @turn="(type) => handleUserChangeBlockType(index, type)"
                        />
                    </template>
                    <template v-else-if="block.type === 'DIVIDER'">
                        <Divider
                            v-model="editorBody.blockList[index]"
                            :index="index"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => handleUserDelete(index)"
                            @turn="(type) => handleUserChangeBlockType(index, type)"
                        />
                    </template>
                </SlickItem>
            </SlickList>
        </template>
        <template v-else>
            <UButton
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
