import type { FormError } from '@nuxt/ui/dist/runtime/types';
import type { Authority } from './_authority';

export interface ImageDto {
    id: string
    src: string
}

export interface UserDto {
    id: string
    fullName: string
    tagName: string
    email: string
    imageId?: string
}

export interface TokenDto {
    accessToken: string
    refreshToken: string
}

export interface UFormApi {
    validate: <T>(path: string, opts: { silent?: boolean }) => Promise<T>
    clear: (path?: string) => void
    getErrors: (path?: string) => FormError[]
    setErrors: (errors: FormError[], path?: string) => void
    errors: Ref<FormError[]>
}

export type BlockType = 'paragraph' | 'image' | 'bullet-list' | 'block-quote' | 'heading-1' | 'heading-2' | 'heading-3' | 'divider';

export interface Block {
    id: string
    type: BlockType
    editor: any
}

export interface MenuItem {
    id: string
    title: string
    isOpen: boolean
    iconKey?: string
    isChildrenFetched: boolean
    children: MenuItem[]
}

export interface PagePreviewDto {
    id: string
    title: string
    iconKey?: string
}

export interface PageDataDto {
    id: string
    title: string
    authority: Authority
    iconKey: string
    imageId: string
    imagePosition: number
}
