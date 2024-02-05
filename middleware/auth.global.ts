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

    const isRefreshSuccess = await auth.refreshAuth();
    if (!isRefreshSuccess)
        return navigateTo('/login');
    else
        await stomp.getConnection();
});
