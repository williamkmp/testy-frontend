<script setup lang="ts">
// import Draggable from 'vuedraggable';
import { SlickItem, SlickList } from 'vue-slicksort';
import { useEditorBodyStore } from '../-store/editor-body';
import Paragraph from './block/paragraph.vue';
import BlockQuotes from './block/blockquotes.vue';
import List from './block/list.vue';
import Heading from './block/heading.vue';

const editorBody = useEditorBodyStore();
const focusedBlock = computed({
    get: () => editorBody.focusedBlockIndex,
    set: value => editorBody.focusedBlockIndex = value,
});
const draggingBlock = computed({
    get: () => editorBody.draggingBlockIndex,
    set: value => editorBody.draggingBlockIndex = value,
});

function onDragStart({ index }: { index: number }) {
    draggingBlock.value = index;
}
function onDragEnd() {
    draggingBlock.value = -1;
}
</script>

<template>
    <main class="mb-20 w-full ">
        <template v-if="editorBody.blockList && editorBody.blockList.length > 0">
            <SlickList
                v-model:list="editorBody.blockList"
                use-drag-handle
                @sort-start="onDragStart"
                @sort-end="onDragEnd"
            >
                <SlickItem v-for="(block, index) in editorBody.blockList" :key="block.id" :index="index">
                    <template v-if="block.type === 'PARAGRAPH'">
                        <Paragraph
                            v-model="editorBody.blockList[index]"
                            :is-focused="index === focusedBlock"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => editorBody.insertBlockAt(index, content)"
                            @delete="() => editorBody.deleteBlockAt(index)"
                            @turn="(type) => editorBody.turnInto(index, type)"
                        />
                    </template>
                    <template v-else-if="block.type === 'BLOCK_QUOTES'">
                        <BlockQuotes
                            v-model="editorBody.blockList[index]"
                            :is-focused="index === focusedBlock"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => editorBody.insertBlockAt(index, content)"
                            @delete="() => editorBody.deleteBlockAt(index)"
                            @turn="(type) => editorBody.turnInto(index, type)"
                        />
                    </template>
                    <template v-else-if="['NUMBERED_LIST', 'BULLET_LIST'].includes(block.type)">
                        <List
                            v-model="editorBody.blockList[index]"
                            :is-focused="index === focusedBlock"
                            :index="index"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => editorBody.insertBlockAt(index, content)"
                            @delete="() => editorBody.deleteBlockAt(index)"
                            @turn="(type) => editorBody.turnInto(index, type)"
                        />
                    </template>
                    <template v-else-if="['HEADING_1', 'HEADING_2', 'HEADING_3'].includes(block.type)">
                        <Heading
                            v-model="editorBody.blockList[index]"
                            :is-focused="index === focusedBlock"
                            :is-dragging="draggingBlock === index"
                            @focus="focusedBlock = index"
                            @blur="focusedBlock = -1"
                            @enter="(content) => editorBody.insertBlockAt(index, content)"
                            @delete="() => editorBody.deleteBlockAt(index)"
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
                @click="editorBody.insertBlockAt(0)"
            />
        </template>
    </main>
</template>
