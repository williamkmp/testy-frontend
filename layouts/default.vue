<script setup lang="ts">
</script>

<template>
    <div class="flex h-screen w-screen">
        <AppAside />
        <section class="flex h-full grow flex-col">
            <AppHeader />
            <div data-role="page-container" class="relative flex w-full grow items-start justify-start overflow-y-auto overflow-x-hidden">
                <slot />
            </div>
        </section>
        <UNotifications />
    </div>
</template>
