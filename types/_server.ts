export interface ServerResponseOkay<T> {
    status: number
    message?: string
    data?: T
}

export interface ServerResponseError {
    status: number
    message?: string
    error?: {
        [k: string]: string
    }
}

export type ServerStandardResposne<Data> = ServerResponseOkay<Data> | ServerResponseError;
