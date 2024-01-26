import type { JSONContent } from '@tiptap/vue-3';
import type { Block, BlockType } from '~/types';

export interface BlockProps {
    index: number
}

export interface BlockEmit {
    (e: 'enter', content?: JSONContent): void
    (e: 'turn', type: BlockType): void
    (e: 'delete'): void
    (e: 'focus'): void
    (e: 'blur'): void
    (e: 'change', uuid: string, content: JSONContent): void
    (e: 'transaction', uuid: string, transaction: Uint8Array): void
}

export type BlockModel = Block;
