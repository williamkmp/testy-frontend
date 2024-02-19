interface MessageMap {
    [k: string]: (arg: any[]) => string;
};

const messageMap: MessageMap = {
    unauthorized: () => 'Session timeout, please login again',
    forbidden: () => 'You cannot access this resource',
    internal_error: () => 'Internal server error, please try again',
    upload_success: () => 'Upload success',
    upload_fail: () => 'Upload failed, please try again',
    update_success: () => 'Update succes',
    update_fail: () => 'Update failed, please try agaian',
    no_resource: () => 'Resource not found',
    large_payload: () => 'Flie size too large',

    // Client only
    server_no_response: () => `Dev: Server is not responding`,
    unstandarized_response: () => `Dev: Response unstandarized`,
};

const validationMap: MessageMap = {
    required: () => `cannot be empty`,
    unique: () => `is taken, input another value`,
    invalid: () => `is invalid`,
    wrong: () => `wrong, input correct value`,
    invalid_credential: () => `wrong email or password`,

    string_email: () => `must be an email address`,
    string_alphanum: () => `can only contains letters, numbers, underscores, and period`,
    string_min: (arg: any[]) => `must be at least ${arg[0]} characters`,
    string_max: (arg: any[]) => `must contain at most ${arg[0]} characters`,
    string_between: (arg: any[]) => `must be between ${arg[0]} and ${arg[1]} characters`,

    number_min: (arg: any[]) => `must be greater than ${arg[0]}`,
    number_max: (arg: any[]) => `must be lesser than ${arg[0]}`,
    number_between: (arg: any[]) => `must be between ${arg[0]} and ${arg[1]}`,
};

function parseCodedMessage(messageCode: string) {
    return {
        code: messageCode.split(':').shift() as string,
        params: messageCode.split(':').pop()?.split(',') || [],
    };
}

export function useMessage() {
    function validation(
        messageCode: string,
    ): string {
        const m = parseCodedMessage(messageCode);
        const getMessage = validationMap[m.code];
        if (!getMessage) {
            console.warn(`ValidationMap: unimplemented code [${m.code}]`);
            return messageCode;
        }
        return getMessage(m.params);
    }

    function message(
        messageCode: string,
    ): string {
        const m = parseCodedMessage(messageCode);
        const getMessage = messageMap[m.code];
        if (!getMessage) {
            console.warn(`MessageMap: unimplemented code [${m.code}]`);
            return messageCode;
        }
        return getMessage(m.params);
    }

    return {
        $v: validation,
        $m: message,
    };
}
