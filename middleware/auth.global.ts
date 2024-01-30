export default defineNuxtRouteMiddleware(async (to) => {
    const auth = useAuth();
    const stomp = useStompClient();

    const excludedRoutes = {
        '/login': true,
        '/register': true,
    };

    // public route guard
    if (to.path in excludedRoutes)
        return;

    await stomp.getConnection();
    await auth.refreshAuth();
});
