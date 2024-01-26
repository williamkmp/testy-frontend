<script setup lang="ts">
import { SlickItem, SlickList } from 'vue-slicksort';
import type { JSONContent } from '@tiptap/vue-3';
import { useEditorBodyStore } from '../-store/editor-body';
import Paragraph from './block/paragraph.vue';
import BlockQuotes from './block/blockquotes.vue';
import List from './block/list.vue';
import Heading from './block/heading.vue';
import Divider from './block/divider.vue';

const editorBody = useEditorBodyStore();
const focusedBlock = computed({
    get: () => editorBody.focusedBlockIndex,
    set: value => editorBody.focusedBlockIndex = value,
});

// TODO: implement block @transaction event handling

function handleUserDelete(index: number) {
    // TODO: move method from store to this component
    const removedBlock = blockList.value[index];
    const previousBlock = blockList.value[index - 1];
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
                            :is-focused="index === focusedBlock"
                            :index="index"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => editorBody.handleUserDelete(index)"
                            @turn="(type) => editorBody.turnInto(index, type)"
                        />
                    </template>
                    <template v-else-if="block.type === 'BLOCK_QUOTES'">
                        <BlockQuotes
                            v-model="editorBody.blockList[index]"
                            :is-focused="index === focusedBlock"
                            :index="index"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => editorBody.handleUserDelete(index)"
                            @turn="(type) => editorBody.turnInto(index, type)"
                        />
                    </template>
                    <template v-else-if="block.type === 'NUMBERED_LIST' || block.type === 'BULLET_LIST' ">
                        <List
                            v-model="editorBody.blockList[index]"
                            :is-focused="index === focusedBlock"
                            :index="index"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => editorBody.handleUserDelete(index)"
                            @turn="(type) => editorBody.turnInto(index, type)"
                        />
                    </template>
                    <template v-else-if="block.type === 'HEADING_1' || block.type === 'HEADING_2' || block.type === 'HEADING_3'">
                        <Heading
                            v-model="editorBody.blockList[index]"
                            :is-focused="index === focusedBlock"
                            :index="index"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => editorBody.handleUserDelete(index)"
                            @turn="(type) => editorBody.turnInto(index, type)"
                        />
                    </template>
                    <template v-else-if="block.type === 'DIVIDER'">
                        <Divider
                            v-model="editorBody.blockList[index]"
                            :is-focused="index === focusedBlock"
                            :index="index"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => handleUserEnter(index, content)"
                            @delete="() => editorBody.handleUserDelete(index)"
                            @turn="(type) => editorBody.turnInto(index, type)"
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
