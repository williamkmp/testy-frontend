import axios, { type AxiosError, type AxiosResponse, HttpStatusCode } from 'axios';
import type { ServerResponseData, ServerResponseError, ServerResponseOkay, ServerStandardResposne } from '~/types';

export function usePublicApi() {
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

    api.interceptors.response.use(
        // handling response
        (response: AxiosResponse) => response.data,

        // handling response error
        (error: AxiosError<any, any>) => {
            const response = responseOrErr(error.response);
            return Promise.reject(response);
        },
    );

    return api;
}
