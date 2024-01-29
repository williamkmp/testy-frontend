export interface ServerResponseOkay {
    status: number;
    message: string;
}

export interface ServerResponseData<T> {
    status: number;
    message?: string;
    data: T;
}

export interface ServerResponseError {
    status: number;
    message?: string;
    error?: {
        [k: string]: string;
    };
}

export type ServerStandardResposne<Data> = ServerResponseOkay | ServerResponseError | ServerResponseData<Data>;
