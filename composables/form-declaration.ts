import type { ZodType, z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui/dist/runtime/types';
import type { UnwrapNestedRefs } from 'vue';
import type { ServerResponseError, UFormApi } from '~/types';

type FormInitialValue<T extends ZodType<any, any, any>> = Partial<{
    [k in keyof z.output<T>]: any;
}>;

export function useFormDeclaration<T extends z.ZodRawShape>(arg: {
    schema: z.ZodObject<T>;

    onSubmit: (
        formSubmitEvent: FormSubmitEvent<z.output<typeof arg.schema>>,
        formElementApi: Ref<UFormApi | undefined>
    ) => Promise<void>;

    onError?: (
        error: any,
        formElementApi: Ref<UFormApi | undefined>
    ) => Promise<void>;

    initial?: FormInitialValue<typeof arg.schema>;
}) {
    const notif = useNotification();

    const clientSubmitWrapperFunction = ref<() => void>();
    const isLoading = ref(false);
    const state = reactive(initialStates(arg.schema, arg.initial));
    const error = ref<string>();
    const formRef = ref<UFormApi>();

    async function submitEvent(
        formSubmitEvent: FormSubmitEvent<z.output<typeof arg.schema>>,
    ) {
        isLoading.value = true;
        error.value = undefined;
        try {
            await arg.onSubmit(formSubmitEvent, formRef);
        }
        catch (e) {
            const response = e as ServerResponseError;
            notify(response);
            error.value = mapError(formRef, response);
            if (arg.onError)
                await arg.onError(error, formRef);
        }
        isLoading.value = false;
    }

    function notify(response: ServerResponseError) {
        if (response.message && response.status) {
            if (response.status >= 400 && response.status <= 499)
                notif.warn({ message: response.message });
            else if (response.status >= 500 && response.status <= 599)
                notif.error({ message: response.message });
            else if (response.status >= 200 && response.status <= 299)
                notif.ok({ message: response.message });
        }
    }

    function reset() {
        const states = Object.entries(state);
        for (const [name] of states) {
            state[name] = undefined;
            if (arg.initial && arg.initial[name])
                state[name] = arg.initial[name];
        }
    }

    function initialStates(schema: z.AnyZodObject, defaults?: any) {
        const initialState = {} as any;
        for (const key in schema.shape) {
            initialState[key] = undefined;
            if (defaults)
                initialState[key] = defaults[key];
        }
        return initialState;
    }

    function mapError(
        formApi: Ref<UFormApi | undefined>,
        response: ServerResponseError,
    ) {
        let rootErrorMessage: string | undefined;
        const { $v } = useMessage();

        if (
            response.status >= 400
            && response.status <= 599
            && response.error
        ) {
            const errorEntries = Object.entries(response.error);
            formApi.value?.setErrors(
                errorEntries
                    .filter(([key, validationCode]) => {
                        if (key === '@root')
                            rootErrorMessage = $v(validationCode);
                        return key !== '@root';
                    })
                    .map(([key, validationCode]) => {
                        return {
                            path: key,
                            message: $v(validationCode),
                        };
                    }),
            );
        }

        return rootErrorMessage;
    }

    return {
        state: state as UnwrapNestedRefs<z.infer<typeof arg.schema>>,
        isLoading: isLoading as Ref<boolean>,
        schema: arg.schema,
        submitEvent,
        error,
        ref: formRef,
        reset,
        submit: clientSubmitWrapperFunction,
    };
}
