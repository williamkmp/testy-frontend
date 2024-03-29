import type { FormError } from '@nuxt/ui/dist/runtime/types';
import type { Authority } from './_authority';
import type { BlockType } from './_block';

export interface ImageDto {
    id: string;
    src: string;
}

export interface UserDto {
    id: string;
    fullName: string;
    tagName: string;
    email: string;
    imageId?: string;
}

export interface TokenDto {
    accessToken: string;
    refreshToken: string;
}

export interface UFormApi {
    validate: <T>(path: string, opts: { silent?: boolean }) => Promise<T>;
    clear: (path?: string) => void;
    getErrors: (path?: string) => FormError[];
    setErrors: (errors: FormError[], path?: string) => void;
    errors: Ref<FormError[]>;
}

export type MenuItemType = 'COLLECTION' | 'PAGE';
export interface MenuItem {
    id: string;
    type: MenuItemType;
    title: string;
    isOpen: boolean;
    iconKey?: string;
    isChildrenFetched: boolean;
    children: MenuItem[];
}

export interface PagePreviewDto {
    id: string;
    title: string;
    iconKey?: string;
}

export interface PageDataDto {
    id: string;
    title: string;
    authority: Authority;
    iconKey: string;
    imageId: string;
    imagePosition: number;
    collectionId?: string;
}

export interface BlockDto {
    id: string;
    type: BlockType;
    content: string;
    width: number;
    iconKey: string;
    fileId: string;
    isChecked: boolean;
}

export interface MenuMessagePayloadDto {
    action: 'ADD' | 'UPDATE' | 'DELETE';
    parentId?: string;
    id: string;
    name: string;
    iconKey?: string;
}

export interface PageHeaderDto {
    id: string;
    title: string;
    iconKey: string;
    imageId: string;
    imagePosition: number;
}

export interface BlockMessageDto {
    id: string;
    type: BlockType;
    content: string;
    width: number;
    iconKey: string;
    isChecked: boolean;
    fileId?: string;

    prevId?: string;
    nextId?: string;
}

export interface FilePreviewDto {
    id: string;
    name: string;
    url: string;
    size: number;
    extension: string;
}

export interface PageMessagingErrorDto {
    status: number;
    message: string;
    pageId: string;
    userId: string;
    redirectUrl?: string;
}

export interface ChatDto {
    id: string;
    content: string;
    senderId: string;
    pageId: string;
    sentAt: string;
}

export interface MemberDto {
    id: string;
    tagName: string;
    email: string;
    fullName: string;
    imageId?: string;
    authority: Authority;
}

export interface AuthorityMessageDto {
    id: string;
    role: Authority;
    action: 'ADD' | 'UPDATE' | 'DELETE';
}
