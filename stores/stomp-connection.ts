import { Client } from '@stomp/stompjs';

export const useStompConnectionStore = defineStore('StompConnection', () => {
    const connection = ref<Client>();

    async function connect() {
        return new Promise((resolve) => {
            if (connection.value === undefined) {
                connection.value = new Client({
                    brokerURL: useRuntimeConfig().public.WS_BASE_URL,
                    onConnect: () => resolve(true),
                    onStompError: frame => console.error('[STOMP] err: ', frame),
                });
                connection.value.activate();
            }
            else {
                resolve(true);
            }
        });
    }

    async function getConnection() {
        await connect();
        return connection.value!;
    }

    return { getConnection };
});
