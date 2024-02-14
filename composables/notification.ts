import { v4 as uuid } from 'uuid';

export function useNotification() {
    const TIMEOUT = 3500;
    const toast = useToast();
    const { $m } = useMessage();

    return {
        info: (p: { title?: string; message: string }) => {
            const toastId = `toats-${uuid()}`;
            toast.add({
                id: toastId,
                click: () => toast.remove(toastId),
                color: 'blue',
                timeout: TIMEOUT,
                title: p.title ?? 'Info',
                description: $m(p.message),
            });
        },

        ok: (p: { title?: string; message: string }) => {
            const toastId = `toats-${uuid()}`;
            toast.add({
                id: toastId,
                click: () => toast.remove(toastId),
                icon: 'i-heroicons-check-circle',
                color: 'green',
                timeout: TIMEOUT,
                title: p.title ?? 'Success',
                description: $m(p.message),
            });
        },

        warn: (p: { title?: string; message: string }) => {
            const toastId = `toats-${uuid()}`;
            toast.add({
                id: toastId,
                click: () => toast.remove(toastId),
                icon: 'i-heroicons-exclamation-triangle',
                color: 'amber',
                timeout: TIMEOUT,
                title: p.title ?? 'Warning',
                description: $m(p.message),
            });
        },

        error: (p: { title?: string; message: string }) => {
            const toastId = `toats-${uuid()}`;
            toast.add({
                id: toastId,
                click: () => toast.remove(toastId),
                icon: 'i-heroicons-no-symbol',
                color: 'red',
                timeout: TIMEOUT,
                title: p.title ?? 'Error',
                description: $m(p.message),
            });
        },
    };
};
