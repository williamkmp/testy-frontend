<template>
    <section class="flex w-full flex-col gap-6">
        <header class="w-full">
            <h1 class="mb-4 ml-6 w-full text-2xl font-extrabold">
                <slot name="header" />
            </h1>
            <UDivider />
            <div class="mt-6 w-full px-6">
                <slot name="body" />
            </div>
        </header>
    </section>
</template>
