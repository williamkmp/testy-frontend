/* eslint-disable no-console */
import { Client } from '@stomp/stompjs';

export const useStompClient = defineStore('StompConnection', () => {
    const app = useAppStore();
    const connection = ref<Client>();

    async function getConnection() {
        await new Promise((resolve) => {
            if (connection.value === undefined) {
                connection.value = new Client({
                    brokerURL: useRuntimeConfig().public.WS_BASE_URL,
                    onConnect: () => resolve(true),
                    onStompError: frame => console.error('[STOMP] error: ', frame),
                });
                connection.value.activate();
            }
            else {
                resolve(false);
            }
        });
        return connection.value!;
    }

    async function subscribe(
        destiniation: string,
        callback: (payload: any, header: Record<string, any>) => void,
        retry?: boolean,
    ) {
        const connection = await getConnection();
        try {
            connection.subscribe(
                destiniation,
                payload => callback(JSON.parse(payload.body), payload.headers),
                {
                    sessionId: app.sessionId,
                    userId: app.user!.id,
                },
            );
        }
        catch (error) {
            console.error(`[STOMP]: Error subscribing to '${destiniation}'`);
            console.error(error);
            if (!retry)
                await subscribe(destiniation, callback, true);
        }
    }

    async function unsubscribe(destiniation: string) {
        const connection = await getConnection();
        try {
            connection.unsubscribe(
                destiniation,
                {
                    sessionId: app.sessionId,
                    userId: app.user!.id,
                },
            );
            console.log(`[STOMP]: Unsubscribed ${destiniation}`);
        }
        catch (error) {
            console.error(`[STOMP]: Error unsubscribing to '${destiniation}'`);
            console.error(error);
        }
    }

    async function send(destiniation: string, payload: Record<string, any>) {
        const connection = await getConnection();
        try {
            connection.publish({
                destination: destiniation,
                body: JSON.stringify(payload),
                headers: {
                    sessionId: app.sessionId,
                    userId: app.user!.id,
                },
            });

            console.log(`[STOMP]: Send message to ${destiniation}`);
        }
        catch (error) {
            console.error(`[STOMP]: Error sending to '${destiniation}'`);
            console.error(error);
        }
    }

    return { subscribe, unsubscribe, send };
});
