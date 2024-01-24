export default defineNuxtRouteMiddleware(async (to) => {
    const auth = useAuth();

    const excludedRoutes = {
        '/login': true,
        '/register': true,
    };

    // public route guard
    if (to.path in excludedRoutes)
        return;

    await auth.refreshAuth();
});
