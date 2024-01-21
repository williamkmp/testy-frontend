import { Client } from '@stomp/stompjs';
import { v4 as uuidv4 } from 'uuid';

let client: Client | undefined;

export function useStompClient() {
    // Dependencies
    const config = useRuntimeConfig();
    const auth = useAuthStore();

    // States
    const connection = ref<Client>();
    const sessionId = ref<string>();
    const wsHandshakeUrl = config.public.WS_BASE_URL || 'ws://localhost:5000/ws';

    async function connect() {
        return new Promise((resolve) => {
            if (client === undefined) {
                client = new Client({
                    brokerURL: wsHandshakeUrl,
                    onConnect: () => {
                        // eslint-disable-next-line no-console
                        console.log('[STOMP]: websocket connected');
                        resolve(true);
                    },
                    // eslint-disable-next-line no-console
                    onStompError: frame => console.log('[STOMP] err: ', frame),
                });
                client.activate();
                connection.value = client;
                sessionId.value = uuidv4();
            }
            else {
                resolve(true);
            }
        });
    }

    async function subscribe(
        destiniation: string,
        callback: (payload: any, header: Record<string, any>) => void,
    ) {
        await connect();
        connection.value!.subscribe(
            destiniation,
            payload => callback(JSON.parse(payload.body), payload.headers),
            {
                sessionId: sessionId.value!,
                userId: auth.user!.id,
            },
        );
    }

    async function unsubscribe(destiniation: string) {
        await connect();
        connection.value!.unsubscribe(
            destiniation,
            {
                sessionId: sessionId.value!,
                userId: auth.user!.id,
            },
        );
    }

    async function send(destiniation: string, payload: Record<string, any>) {
        await connect();
        connection.value!.publish({
            destination: destiniation,
            body: JSON.stringify(payload),
            headers: {
                sessionId: sessionId.value!,
                userId: auth.user!.id,
            },
        });
    }

    return { subscribe, unsubscribe, send };
}
