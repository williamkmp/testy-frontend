<script setup lang="ts">
import { DragHandle } from 'vue-slicksort';
import { useEditorBodyStore } from '../../../-store/editor-body';
import type { BlockType } from '~/types';

const props = defineProps<{ isFocused: boolean }>();
const emit = defineEmits<{ change: [blockType: BlockType], delete: [], add: [], clickMenu: [] }>();

const editorBody = useEditorBodyStore();
const options = [
    {
        icon: 'i-heroicons-trash',
        label: 'Delete',
        click: () => emit('delete'),
    },
    {
        icon: 'i-heroicons-plus-circle',
        label: 'Add Below',
        click: () => emit('add'),
    },
    {
        icon: 'i-heroicons-trash',
        label: 'Delete',
        click: () => emit('delete'),
    },
    {
        icon: 'i-material-symbols-format-h1-rounded',
        label: 'Heading 1',
        click: () => emit('change', 'HEADING_1'),
    },
    {
        icon: 'i-material-symbols-format-h2-rounded',
        label: 'Heading 2',
        click: () => emit('change', 'HEADING_2'),
    },
    {
        icon: 'i-material-symbols-format-h3-rounded',
        label: 'Heading 3',
        click: () => emit('change', 'HEADING_3'),
    },
    {
        icon: 'i-material-symbols-text-fields-rounded',
        label: 'Text',
        click: () => emit('change', 'PARAGRAPH'),
    },
    {
        icon: 'i-material-symbols-format-list-bulleted-rounded',
        label: 'Bullet List',
        click: () => emit('change', 'BULLET_LIST'),
    },
    {
        icon: 'i-ic-round-123',
        label: 'Numbered List',
        click: () => emit('change', 'NUMBERED_LIST'),
    },
    {
        icon: 'i-material-symbols-format-quote-rounded',
        label: 'Quote',
        click: () => emit('change', 'BLOCK_QUOTES'),
    },
    {
        icon: 'i-material-symbols-rectangle-outline-rounded',
        label: 'Callout',
        click: () => emit('change', 'CALLOUT'),
    },
    {
        icon: 'i-material-symbols-folder',
        label: 'File',
        click: () => emit('change', 'FILE'),
    },
    // TODO: implemnet collection option
    // {
    //     icon: 'i-material-symbols-stacks-rounded',
    //     label: 'Collections',
    //     click: () => emit('change', 'COLLECTION'),
    // },
];
</script>

<template>
    <div
        data-role="control"
        class="flex items-center justify-center gap-0.5 transition duration-100 group-hover:opacity-100"
        :class="[props.isFocused ? 'opacity-100' : 'opacity-0']"
    >
        <!-- menu  -->
        <UPopover :popper="{ placement: 'left' }">
            <template #default>
                <div
                    class="rounded p-0.5 hover:bg-gray-200/50 dark:hover:bg-gray-100/10"
                    @click="$emit('clickMenu')"
                >
                    <UIcon class="text-gray-500" name="i-heroicons-cog-6-tooth-solid" />
                </div>
            </template>
            <template #panel>
                <div class="relative p-1">
                    <UButtonGroup orientation="vertical" size="xs">
                        <UButton
                            v-for="menu in options"
                            :key="menu.label"
                            :label="menu.label"
                            :icon="menu.icon"
                            color="gray"
                            variant="ghost"
                            @click="menu.click"
                        />
                    </UButtonGroup>
                </div>
            </template>
        </UPopover>

        <!-- drag handle -->
        <DragHandle>
            <div
                :class="[editorBody.DRAGGABLE_CLASS]"
                class="rounded px-1 py-0.5 hover:cursor-grab hover:bg-gray-200 dark:hover:bg-gray-100/10"
            >
                <UIcon class="text-gray-500" name="i-ic-round-drag-indicator" />
            </div>
        </DragHandle>
    </div>
</template>
