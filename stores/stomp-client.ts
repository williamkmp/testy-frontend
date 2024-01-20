import { Client, type StompHeaders, type messageCallbackType } from '@stomp/stompjs';
import { v4 as uuidv4 } from 'uuid';

let client: Client | undefined;

export function useStompClient() {
    // Dependencies
    const config = useRuntimeConfig();
    const auth = useAuthStore();

    // States
    const wsHandshakeUrl = config.public.WS_BASE_URL || 'ws://localhost:5000/ws';
    const sessionId = ref<string>();
    const connection = ref<Client>();

    if (client === undefined) {
        client = new Client({
            brokerURL: wsHandshakeUrl,
            // eslint-disable-next-line no-console
            onConnect: () => console.log('[WebSocket]: Init client'),
            // eslint-disable-next-line no-console
            onStompError: frame => console.log('ws err: ', frame),
        });
        client.activate();
        connection.value = client;
        sessionId.value = uuidv4();
    }

    function subscribe<T>(
        destiniation: string,
        callback: (payload: T, header: Record<string, unknown>) => void,
    ): void {
        if (!connection.value)
            throw new Error(`[WS] have no existing connection: ${destiniation}`);
        if (!sessionId.value)
            throw new Error(`[WS] have no existing sessionId: ${destiniation}`);
        if (!auth.user)
            throw new Error(`[WS] have no existing user: ${destiniation}`);

        connection.value.subscribe(
            destiniation,
            payload => callback(JSON.parse(payload.body), payload.headers),
            {
                sessionId: sessionId.value!,
                userId: auth.user!.id,
            },
        );
    }

    function unsubscribe(destiniation: string): void {
        if (!connection.value)
            throw new Error(`[WS] have no existing connection: ${destiniation}`);
        if (!sessionId.value)
            throw new Error(`[WS] have no existing sessionId: ${destiniation}`);
        if (!auth.user)
            throw new Error(`[WS] have no existing user: ${destiniation}`);

        connection.value.unsubscribe(
            destiniation,
            {
                sessionId: sessionId.value!,
                userId: auth.user!.id,
            },
        );
    }

    function send(destiniation: string, payload: Record<string, any>) {
        if (!connection.value)
            throw new Error(`[WS] have no existing connection: ${destiniation}`);
        if (!sessionId.value)
            throw new Error(`[WS] have no existing sessionId: ${destiniation}`);
        if (!auth.user)
            throw new Error(`[WS] have no existing user: ${destiniation}`);

        connection.value.publish({
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
