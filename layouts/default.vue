<template>
    <div class="flex h-screen w-screen">
        <AppAside />
        <div class="flex grow flex-col overflow-auto">
            <AppHeader />
            <div data-role="page-container" class="h-full w-full overflow-hidden">
                <div data-role="page-scrollable" class="h-full w-full overflow-auto">
                    <slot />
                </div>
            </div>
        </div>
        <UNotifications />
    </div>
</template>
