<script setup lang="ts">
import { BubbleMenu, EditorContent } from '@tiptap/vue-3';
import type { Editor } from '@tiptap/vue-3';
import { useEditorBodyStore } from '~/pages/page/-store/editor-body';

const props = defineProps<{
    index: number
    editor: Editor
}>();

const editorBody = useEditorBodyStore();

function handleEnter(e: Event) {
    e.preventDefault();
    const curentContent = props.editor.getJSON();
    const newBlockContent = curentContent?.content?.pop();
    props.editor.commands.setContent(curentContent);
    editorBody.insertBlockAt(props.index, newBlockContent);
}

function handleDelete() {
    if (props.editor.view.state.selection.$anchor.pos === 1)
        editorBody.deleteBlockAt(props.index);
}

onUnmounted(() => {
    props.editor.destroy();
});
</script>

<template>
    <div class="group flex items-start justify-start gap-1">
        <div data-role="control" class="flex items-center justify-center gap-0.5 opacity-0 transition duration-100 group-hover:opacity-100">
            <div class="rounded px-1 py-0.5 hover:bg-gray-200 dark:hover:bg-gray-100/10">
                <UIcon class="text-gray-500" name="i-ic-round-plus" />
            </div>
            <div
                class="rounded p-0.5 hover:bg-gray-200/50 dark:hover:bg-gray-100/10"
                :class="[editorBody.DRAGGABLE_CLASS]"
            >
                <UIcon class="text-gray-500" name="i-ic-round-drag-indicator" />
            </div>
        </div>
        <div class="w-full">
            <EditorContent
                :editor="props.editor"
                class="w-full max-w-full hover:cursor-text"
                @keydown.enter="handleEnter"
                @keyup.delete="handleDelete"
                @focus="() => console.log(`focus at index: ${$props.index}`)"
            />
        </div>
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
    </div>
</template>
