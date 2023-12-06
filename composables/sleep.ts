export function useSleep() {
    function sleep<T>(timeMs: number, result?: T): Promise<T | undefined> {
        return new Promise(resolve =>
            setTimeout(() => resolve(result), timeMs),
        );
    }
    return { for: sleep };
}
