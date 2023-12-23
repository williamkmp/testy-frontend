export const BLOCK_TYPE = {
    HEADING_1: 'HEADING_1',
    HEADING_2: 'HEADING_2',
    HEADING_3: 'HEADING_3',
    BLOCK_QUOTES: 'BLOCK_QUOTES',
    CALLOUT: 'CALLOUT',
    BULLET_LIST: 'BULLET_LIST',
    PARAGRAPH: 'PARAGRAPH',
    DIVIDER: 'DIVIDER',
    FILE: 'FILE',
    IMAGE: 'IMAGE',
} as const;

type ValuesAsKeys<T extends Record<any, PropertyKey>> = keyof T;
export type BlockType = ValuesAsKeys<typeof BLOCK_TYPE>;

export type Block =
    {
        type: 'FILE'
        id: string
        refrenceId: string
        editor: undefined
    } | {
        type: 'IMAGE'
        id: string
        refrenceId: string
        size: number
        editor: undefined
    } | {
        type: 'DIVIDER'
        id: string
        editor: undefined
    } | {
        type: 'HEADING_1' | 'HEADING_2' | 'HEADING_3' | 'BLOCK_QUOTES' | 'BULLET_LIST' | 'PARAGRAPH'
        id: string
        editor: any
    } | {
        type: 'CALLOUT'
        id: string
        editor: any
        color: string
        iconKey: string
    };
