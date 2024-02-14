<script setup lang="ts">
import { DragHandle } from 'vue-slicksort';
import { useEditorBodyStore } from '../../../-store/editor-body';
import type { BlockType } from '~/types';

const props = defineProps({
    isFocused: { type: Boolean, required: true },
    isDisabled: { type: Boolean, required: false, default: false },
    nonTurnable: { type: Boolean, required: false, default: false },
});
const emit = defineEmits<{ change: [blockType: BlockType]; delete: []; add: []; clickMenu: [] }>();

const editorBody = useEditorBodyStore();
const blockTypes = [
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
        icon: 'i-ic-round-check-box',
        label: 'Checkbox',
        click: () => emit('change', 'CHECKBOX'),
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
        icon: 'i-ic-round-horizontal-rule',
        label: 'Divider',
        click: () => emit('change', 'DIVIDER'),
    },
    {
        icon: 'i-material-symbols-folder',
        label: 'File',
        click: () => emit('change', 'FILE'),
    },
    {
        icon: 'i-material-symbols-image',
        label: 'Image',
        click: () => emit('change', 'IMAGE'),
    },
    {
        icon: 'i-material-symbols-stacks-rounded',
        label: 'Collections',
        click: () => emit('change', 'COLLECTION'),
    },
];
</script>

<template>
    <div
        data-role="control"
        class="flex items-center justify-center gap-0.5 transition duration-100 group-hover:opacity-100"
        :class="[props.isFocused ? 'opacity-100' : 'opacity-0']"
    >
        <template v-if="!props.isDisabled">
            <!-- menu  -->
            <UPopover v-if="!isDisabled" :popper="{ placement: 'left' }">
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
                                key="add-below"
                                label="Add Below"
                                icon="i-heroicons-plus-circle"
                                color="blue"
                                variant="soft"
                                @click="() => $emit('add')"
                            />
                            <UButton
                                key="delete"
                                label="Delete"
                                icon="i-heroicons-trash"
                                color="red"
                                variant="soft"
                                @click="() => $emit('delete')"
                            />
                            <template v-if="!props.nonTurnable">
                                <UButton
                                    v-for="menu in blockTypes"
                                    :key="menu.label"
                                    :label="menu.label"
                                    :icon="menu.icon"
                                    color="gray"
                                    variant="ghost"
                                    @click="menu.click"
                                />
                            </template>
                        </UButtonGroup>
                    </div>
                </template>
            </UPopover>

            <!-- drag handle -->
            <DragHandle v-if="!isDisabled">
                <div
                    :class="[editorBody.DRAGGABLE_CLASS]"
                    class="rounded px-1 py-0.5 hover:cursor-grab hover:bg-gray-200 dark:hover:bg-gray-100/10"
                >
                    <UIcon class="text-gray-500" name="i-ic-round-drag-indicator" />
                </div>
            </DragHandle>
        </template>
        <template v-else>
            <div data-role="placeholder" class=" w-[2.875rem]" />
        </template>
    </div>
</template>
