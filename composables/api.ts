import axios, { type AxiosError, type AxiosResponse, type CreateAxiosDefaults, HttpStatusCode, type InternalAxiosRequestConfig } from 'axios';
import { z } from 'zod';
import type { ServerResponseError, ServerResponseOkay } from '~/types';

type RetryableRequest = InternalAxiosRequestConfig & {
    _isRetry: boolean
};

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

};

export function useApi() {
    // Dependency
    const config = useRuntimeConfig();
    const auth = useAuthStore();

    // datas
    const axiosDefault: CreateAxiosDefaults = {
        baseURL: config.public.API_BASE_URL || 'http://localhost:5000/',
        headers: {
            Accept: 'application/json',
        },
    };
    const publicApi = axios.create(axiosDefault);
    const privateApi = axios.create(axiosDefault);

    function responseOrErr(obj?: AxiosResponse): ServerResponseOkay<any> | ServerResponseError {
        if (obj && obj.data) {
            return obj.data as ServerResponseOkay<any>;
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
                response.status === HTTP_STATUS.UNAUTHORIZED
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
