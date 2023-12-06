export default defineNuxtRouteMiddleware(async (to) => {
    const auth = useAuthStore();

    // Configuration
    const excludeRoutes = ['/login', '/register'];

    // public route guard
    const routeIsPublic = excludeRoutes.includes(to.path);
    if (routeIsPublic)
        return;

    await auth.refreshAuth();
});
