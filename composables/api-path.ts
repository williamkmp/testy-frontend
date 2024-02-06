export function useApiPath() {
    const baseUrl = useRuntimeConfig().public.API_BASE_URL;
    return {
        // auth
        authLogin: encodeURI('/auth/login'),
        authRegister: encodeURI('/auth/register'),
        authToken: encodeURI('/auth/token'),

        // user
        user: encodeURI('/user'),
        userUserId: (p: { userId: string }) => encodeURI(`/user/${p.userId}`),
        userMe: encodeURI('/user/me'),
        userPassword: encodeURI('/user/password'),

        // image
        image: encodeURI('/image'),
        getImage: (id?: string) => encodeURI(`${baseUrl}image/${id || '-1'}`),
        file: encodeURI(`/file`),
        getFile: (id?: string) => encodeURI(`${baseUrl}file/${id || '-1'}`),
        getFilePreview: (id?: string) => encodeURI(`${baseUrl}file/${id || '-1'}/preview`),

        // page
        page: encodeURI('/page'),
        pagePreview: encodeURI('/page/preview'),
        pagePageId: (p: { pageId: string }) => encodeURI(`/page/${p.pageId}`),
        pageCollectionPreview: (p: { pageId: string }) => encodeURI(`/page/${p.pageId}/collection/preview`),
        pageBlocks: (p: { pageId: string }) => encodeURI(`/page/${p.pageId}/block`),
        pageMembers: (p: { pageId: string }) => encodeURI(`/page/${p.pageId}/user`),
        pageMemberInfo: (p: { pageId: string; userId: string }) => encodeURI(`/page/${p.pageId}/user/${p.userId}`),

        // block
        collectionPagePreview: (p: { collectionId: string }) => encodeURI(`/block/collection/${p.collectionId}/page/preview`),

        // chat
        chatPage: (pageId: string) => encodeURI(`/chat/page/${pageId}`),
    };
}
