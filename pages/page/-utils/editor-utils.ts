import { Editor, type JSONContent } from '@tiptap/vue-3';
import { Doc } from 'yjs';
import Collaboration from '@tiptap/extension-collaboration';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';

export function getEditorYdoc(editor: Editor): Doc | undefined {
    const collaborationPlugin = editor.options.extensions.find(e => e.name === 'collaboration');
    return collaborationPlugin?.options.document as Doc | undefined;
}

export function createPlaceHolderEditor(content?: JSONContent) {
    const editorContent = {
        type: 'doc',
        content: content !== undefined
            ? [content]
            : undefined,
    };

    return new Editor({
        content: editorContent,
        editable: false,
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

export function createEditor(content?: JSONContent): Editor {
    const ydoc = new Doc();
    const editorContent = {
        type: 'doc',
        content: content !== undefined
            ? [content]
            : undefined,
    };

    return new Editor({
        content: editorContent,
        editable: true,
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
            Collaboration.configure({
                document: ydoc,
            }),
        ],
    });
}
