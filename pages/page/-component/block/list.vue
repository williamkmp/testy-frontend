<script setup lang="ts">
import { BubbleMenu, EditorContent } from '@tiptap/vue-3';
import type { Editor } from '@tiptap/vue-3';
import { createEditor, getEditorYdoc } from '../../-utils/editor-utils';
import { useEditorBodyStore } from '../../-store/editor-body';
import BlockControl from './control/control.vue';
import type { BlockEmit, BlockModel, BlockProps, BlockType } from '~/types';

// Component Definition
const props = defineProps<BlockProps>();
const emit = defineEmits<BlockEmit>();
const block = defineModel<BlockModel>({ required: true });

// Dependencies
const editorBody = useEditorBodyStore();

// States
const editor = computed(() => block.value.editor as Editor | undefined);
const ydoc = computed (() => getEditorYdoc(block.value.editor));
const previousBlockNumbering = computed(() => editorBody.blockList[props.index - 1]?.numbering || 0);
watchImmediate([previousBlockNumbering, () => block.value.type], () => block.value.numbering = block.value.type === 'NUMBERED_LIST' ? previousBlockNumbering.value + 1 : 0);

// Hooks
onBeforeMount(() => {
    const previousContent = editor.value?.getJSON().content;
    editor.value?.destroy();
    block.value.editor = createEditor(previousContent);
    ydoc.value?.on('update', (_update: Uint8Array) => {
        // TODO: implemnet transaction handling
    });
    editor.value?.on('blur', () => emit('blur'));
    editor.value?.on('focus', () => emit('focus'));
    editor.value?.commands.focus('start');
});

onUnmounted(() => {
    block.value.numbering = 0;
    editor.value?.destroy();
});
// Actions
function handleEnter() {
    if (!editor.value)
        return;
    const curentContent = editor.value.getJSON();
    const newBlockContent = curentContent?.content?.pop();
    editor.value.commands.setContent(curentContent);
    emit('enter', newBlockContent);
}

function handleDelete() {
    if (!editor.value)
        return;
    const caretPosition = editor.value.view.state.selection.$anchor.pos;
    if (caretPosition <= 1)
        emit('delete');
}
</script>

<template>
    <div class="group flex items-start justify-start gap-1">
        <BlockControl
            :is-focused="props.isFocused"
            @click-menu="$emit('focus')"
            @add="$emit('enter')"
            @change="(blockType: BlockType) => emit('turn', blockType)"
        />
        <!-- block body -->
        <div class="my-1 flex min-h-max w-full items-start justify-start gap-2">
            <BubbleMenu
                v-if="editor"
                :editor="editor"
            >
                <UButtonGroup orientation="horizontal" size="xs">
                    <UButton
                        icon="i-ic-round-format-bold"
                        :color="editor.isActive('bold') ? 'black' : 'gray'"
                        @click="editor.chain().focus().toggleBold().run()"
                    />
                    <UButton
                        icon="i-ic-round-format-italic"
                        :color="editor.isActive('italic') ? 'black' : 'gray'"
                        @click="editor.chain().focus().toggleItalic().run()"
                    />
                    <UButton
                        icon="i-ic-round-format-underlined"
                        :color="editor.isActive('underline') ? 'black' : 'gray'"
                        @click="editor.chain().focus().toggleUnderline().run()"
                    />
                </UButtonGroup>
            </BubbleMenu>
            <div>
                <template v-if="block.type === 'BULLET_LIST'">
                    <span class="text-xl">•</span>
                </template>
                <template v-else-if="block.type === 'NUMBERED_LIST'">
                    <span>{{ `${block.numbering}.` }}</span>
                </template>
            </div>
            <EditorContent
                v-if="editor !== undefined"
                :editor="editor"
                class="w-full max-w-full hover:cursor-text"
                @keydown.enter="handleEnter"
                @keyup.delete="handleDelete"
            />
        </div>
    </div>
</template>
