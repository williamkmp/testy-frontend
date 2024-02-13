import { Editor, type JSONContent } from '@tiptap/vue-3';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';

export function createEditor(content?: JSONContent): Editor {
    const editorContent = {
        type: 'doc',
        content: content !== undefined
            ? [content]
            : undefined,
    };
    return new Editor({
        content: editorContent,
        editorProps: {
            attributes: { class: 'focus:outline-none w-full h-full' },
        },
        extensions: [
            Document,
            Paragraph,
            Text,
            Underline,
            Bold,
            Italic,
        ],
    });
}

export function editorHTMLToJSON(html: string = '<p></p>') {
    const editor = new Editor({
        content: html,
        editable: false,
        extensions: [
            Document,
            Paragraph,
            Text,
            Underline,
            Bold,
            Italic,
        ],
    });
    const json = editor.getJSON().content?.at(0) as JSONContent;
    editor.destroy();
    return json;
}
