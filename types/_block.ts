export const BLOCK_TYPE = {
    HEADING_1: 'HEADING_1',
    HEADING_2: 'HEADING_2',
    HEADING_3: 'HEADING_3',
    BLOCK_QUOTES: 'BLOCK_QUOTES',
    CALLOUT: 'CALLOUT',
    BULLET_LIST: 'BULLET_LIST',
    NUMBERED_LIST: 'NUMBERED_LIST',
    PARAGRAPH: 'PARAGRAPH',
    DIVIDER: 'DIVIDER',
    FILE: 'FILE',
    IMAGE: 'IMAGE',
} as const;

type ValuesAsKeys<T extends Record<any, PropertyKey>> = keyof T;
export type BlockType = ValuesAsKeys<typeof BLOCK_TYPE>;

export interface Block {
    type: BlockType
    id: string
    numbering?: number
    width?: number
    refrenceId?: string
    color?: string
    iconKey?: string
    editor?: any
};
