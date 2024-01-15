import axios, { type AxiosError, type AxiosResponse, type CreateAxiosDefaults, HttpStatusCode, type InternalAxiosRequestConfig } from 'axios';
import type { ServerResponseData, ServerResponseError, ServerResponseOkay, ServerStandardResposne } from '~/types';

type RetryableRequest = InternalAxiosRequestConfig & {
    _isRetry: boolean
};

export function useApi() {
    // Dependency
    const config = useRuntimeConfig();
    const auth = useAuthStore();

    // datas
    const baseUrl = config.public.API_BASE_URL || 'http://localhost:5000/';
    const axiosDefault: CreateAxiosDefaults = {
        baseURL: baseUrl,
        headers: {
            Accept: 'application/json',
        },
    };
    const publicApi = axios.create(axiosDefault);
    const privateApi = axios.create(axiosDefault);

    const path = {
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

        // page
        pagePreview: encodeURI('/page/preview'),
        pagePageId: (p: { pageId: string }) => encodeURI(`/page/${p.pageId}`),
        pageCollectionPreview: (p: { pageId: string }) => encodeURI(`/page/${p.pageId}/collection/preview`),
        collectionPagePreview: (p: { collectionId: string }) => encodeURI(`/block/collection/${p.collectionId}/page/preview`),
    };

    function responseOrErr(obj?: AxiosResponse): ServerStandardResposne<any> {
        if (obj && obj.data) {
            return obj.data as ServerResponseData<any> | ServerResponseOkay;
        }
        else {
            const noResponseError: ServerResponseError = {
                status: HttpStatusCode.InternalServerError,
                message: 'server_no_response',
            };
            return noResponseError;
        }
    }

    publicApi.interceptors.response.use(
        // handling response
        (response: AxiosResponse) => response.data,

        // handling response error
        (error: AxiosError<any, any>) => {
            const response = responseOrErr(error.response);
            return Promise.reject(response);
        },
    );

    privateApi.interceptors.request.use(
        // handling request
        (config: InternalAxiosRequestConfig) => {
            const accessToken = auth.accessToken;
            if (accessToken)
                config.headers.Authorization = `Bearer ${accessToken}`;

            return config;
        },

        // handling request error
        (error: AxiosError<any, any>) => {
            const response = responseOrErr(error.response);
            return Promise.reject(response);
        },
    );

    privateApi.interceptors.response.use(
        // handling response
        (response: AxiosResponse) => {
            return response.data;
        },

        // handling response error
        async (error: AxiosError<any, any>) => {
            const response = responseOrErr(error.response);
            const originalRequest = error.config as RetryableRequest;

            // Retry unauthorized request for the first time
            if (
                response.status === HttpStatusCode.Unauthorized
                && !originalRequest._isRetry
            ) {
                originalRequest._isRetry = true;
                await auth.refreshAuth();
                return privateApi(originalRequest);
            }
            return Promise.reject(response);
        },
    );

    return {
        publicApi,
        privateApi,
        path,
    };
}
