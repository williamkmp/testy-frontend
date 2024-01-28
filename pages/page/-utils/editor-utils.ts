import { Editor, type JSONContent } from '@tiptap/vue-3';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import type { Block } from '~/types';

export function getEditorYdoc(editor: Editor): Y.Doc | undefined {
    const collaborationPlugin = editor.options.extensions.find(e => e.name === 'collaboration');
    return collaborationPlugin?.options.document as Y.Doc | undefined;
}

export function createEditor(content?: JSONContent): Editor {
    const ydoc = new Y.Doc();
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

export function editorHTMLToJSON(html: string) {
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

export function applyBlockTransaction(block: Block, transaction: Uint8Array, origin: string | undefined) {
    if (!block || !block.editor)
        return;
    const blockDocument = getEditorYdoc(block.editor);
    if (blockDocument)
        Y.applyUpdate(blockDocument, transaction, origin);
}
