<template>
    <div class="relative flex h-screen w-screen items-center justify-center p-8">
        <!-- Logo -->
        <section class="absolute left-0 top-0 ml-8 mt-8">
            <span class="select-none font-semibold tracking-widest">
                TESTY.
            </span>
        </section>

        <section>
            <slot />
        </section>
    </div>
    <UNotifications />
</template>
