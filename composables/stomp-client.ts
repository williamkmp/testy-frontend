export function useStompClient() {
    const app = useAppStore();
    const connectionStore = useStompConnectionStore();

    async function subscribe(
        destiniation: string,
        callback: (payload: any, header: Record<string, any>) => void,
    ) {
        const connection = await connectionStore.getConnection();
        connection.subscribe(
            destiniation,
            payload => callback(JSON.parse(payload.body), payload.headers),
            {
                sessionId: app.sessionId,
                userId: app.user!.id,
            },
        );
    }

    async function unsubscribe(destiniation: string) {
        const connection = await connectionStore.getConnection();
        connection.unsubscribe(
            destiniation,
            {
                sessionId: app.sessionId,
                userId: app.user!.id,
            },
        );
    }

    async function send(destiniation: string, payload: Record<string, any>) {
        const connection = await connectionStore.getConnection();
        connection.publish({
            destination: destiniation,
            body: JSON.stringify(payload),
            headers: {
                sessionId: app.sessionId,
                userId: app.user!.id,
            },
        });
    }

    return { subscribe, unsubscribe, send };
}
