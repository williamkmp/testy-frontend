<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';
import { BubbleMenu, EditorContent } from '@tiptap/vue-3';
import BlockControl from './control/control.vue';
import type { BlockEmit, BlockModel, BlockProps, BlockType } from '~/types';

// Component Definition
const props = defineProps<BlockProps>();
const emit = defineEmits<BlockEmit>();
const block = defineModel<BlockModel>({ required: true });

// States
const editor = computed(() => block.value.editor as Editor);
const headingLevel = computed(() => {
    if (block.value.type === 'HEADING_2')
        return 2;
    else if (block.value.type === 'HEADING_3')
        return 3;
    else
        return 1;
});

// Hooks
onBeforeMount(() => {
    editor.value.on('update', handleContentUpdate);
    editor.value.on('blur', onEditorBlur);
    editor.value.on('focus', onEditorFocus);
    if (props.isFocused)
        editor.value.commands.focus('start');
});

onUnmounted(() => {
    editor.value.off('update', handleContentUpdate);
    editor.value.off('blur', onEditorBlur);
    editor.value.off('focus', onEditorFocus);
});

// Actions
function handleEnter(e: Event) {
    e.preventDefault();
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

function handleContentUpdate() {
    emit('change', editor.value.getHTML());
}
function onEditorFocus() {
    emit('focus');
}

function onEditorBlur() {
    emit('blur');
}
</script>

<template>
    <div
        class="group flex items-start justify-start gap-1"
        :class="{
            'mt-8': headingLevel === 1,
            'mt-5': headingLevel === 2,
            'mt-4': headingLevel === 3,
        }"
    >
        <BlockControl
            :is-focused="props.isFocused"
            @click-menu="$emit('focus')"
            @add="$emit('enter')"
            @change="(blockType: BlockType) => emit('turn', blockType)"
        />
        <!-- block body -->
        <div
            class="w-full py-1 font-medium"
            :class="{
                'text-3xl': headingLevel === 1,
                'text-2xl': headingLevel === 2,
                'text-xl': headingLevel === 3,
            }"
        >
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
            <EditorContent
                v-if="editor !== undefined"
                :editor="editor"
                class="w-full max-w-full hover:cursor-text"
                @keydown.enter="handleEnter"
                @keydown.delete="handleDelete"
            />
        </div>
    </div>
</template>
