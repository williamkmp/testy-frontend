import axios, { type AxiosError, type AxiosResponse, type CreateAxiosDefaults, HttpStatusCode, type InternalAxiosRequestConfig } from 'axios';
import type { ServerResponseData, ServerResponseError, ServerResponseOkay, ServerStandardResposne } from '~/types';

type RetryableRequest = InternalAxiosRequestConfig & {
    _isRetry: boolean
};

export function usePrivateApi() {
    // Dependency
    const app = useAppStore();
    const auth = useAuth();

    // datas
    const api = axios.create({
        baseURL: useRuntimeConfig().public.API_BASE_URL,
        headers: {
            Accept: 'application/json',
        },
    });

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

    api.interceptors.request.use(
        // handling request
        (config: InternalAxiosRequestConfig) => {
            config.headers.Authorization = `Bearer ${app.accessToken}`;
            config.headers.sessionId = app.sessionId;
            return config;
        },

        // handling request error
        (error: AxiosError<any, any>) => {
            const response = responseOrErr(error.response);
            return Promise.reject(response);
        },
    );

    api.interceptors.response.use(
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
                return api(originalRequest);
            }
            return Promise.reject(response);
        },
    );

    return api;
}
