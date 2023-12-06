import type { FormError } from '@nuxt/ui/dist/runtime/types';

export interface UserDto {
    id: string
    fullName: string
    tagName: string
    email: string
    imageSrc?: string
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

export interface PagePreview {
    id: string
    title: string
    isOpen: boolean
    isChildrenFetched: boolean
    children: PagePreview[]
    imageSrc?: string
}
