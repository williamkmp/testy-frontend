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

    function subscribe(
        destiniation: string,
        callback: (payload: unknown, header: Record<string, unknown>) => void,
    ): void {
        const connection = preMessageCheck(destiniation);
        connection.subscribe(
            destiniation,
            payload => callback(JSON.parse(payload.body), payload.headers),
            {
                sessionId: sessionId.value!,
                userId: auth.user!.id,
            },
        );
    }

    function unsubscribe(destiniation: string): void {
        const connection = preMessageCheck(destiniation);
        connection.unsubscribe(
            destiniation,
            {
                sessionId: sessionId.value!,
                userId: auth.user!.id,
            },
        );
    }

    function send(destiniation: string, payload: Record<string, any>) {
        const connection = preMessageCheck(destiniation);
        connection.publish({
            destination: destiniation,
            body: JSON.stringify(payload),
            headers: {
                sessionId: sessionId.value!,
                userId: auth.user!.id,
            },
        });
    }

    function preMessageCheck(destination: string) {
        if (!connection.value)
            throw new Error(`[WS] have no existing connection: ${destination}`);
        if (!sessionId.value)
            throw new Error(`[WS] have no existing sessionId: ${destination}`);
        if (!auth.user)
            throw new Error(`[WS] have no existing user: ${destination}`);
        return connection.value;
    }

    return { connect, subscribe, unsubscribe, send };
}
