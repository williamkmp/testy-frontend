<script lang="ts" setup>
import { EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

const editor = useEditor({
    content: '<p>I’m running Tiptap with Vue.js. 🎉</p>',
    extensions: [
        StarterKit,
    ],
});
</script>

<template>
    <div class="hover:cursor-text">
        <EditorContent :editor="editor" />
    </div>
</template>
