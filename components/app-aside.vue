<script lang="ts" setup>
const app = useAppStore();
const tree = usePagesTreeStore();
const auth = useAuthStore();

const aside = ref<HTMLDivElement>();
defineExpose({ aside });

onMounted(() => {
    if (app.sideMenuSize !== null && aside.value)
        aside.value.style.width = app.sideMenuSize;
});
</script>

<template>
    <aside
        ref="aside"
        data-role="aside-container"
        class="h-full select-none overflow-hidden transition-all duration-300"
        :class="[
            app.isMenuOpen
                ? 'min-w-[16rem] max-w-[25rem]'
                : 'min-w-0 max-w-0',
        ]"
    >
        <div
            class="flex h-full w-full min-w-[16rem] flex-col gap-4 overflow-hidden bg-gray-300/20 px-4 py-3"
        >
            <header
                class="flex w-full select-none items-center justify-start"
            >
                <div class="flex h-full w-full items-center gap-2">
                    <UAvatar
                        :src="auth.user!.imageSrc"
                        :alt="auth.user!.fullName.toUpperCase()"
                        size="sm"
                    />
                    <p class="truncate text-sm font-semibold">
                        {{ auth.user?.fullName }}
                    </p>
                </div>
            </header>

            <section class="flex w-full flex-col">
                <UTooltip
                    text="Jump and open page"
                    :shortcuts="['Ctrl', 'Shift', 'K']"
                    :popper="{ placement: 'right' }"
                >
                    <UButton
                        color="gray"
                        label="Search"
                        icon="i-heroicons-magnifying-glass"
                        variant="ghost"
                        class="justify-start hover:bg-white"
                        size="xs"
                        block
                    />
                </UTooltip>

                <UButton
                    color="gray"
                    label="Updates & Notification"
                    icon="i-heroicons-clock"
                    variant="ghost"
                    class="justify-start hover:bg-white"
                    size="xs"
                    block
                />

                <UButton
                    color="gray"
                    label="Setting"
                    icon="i-heroicons-cog-6-tooth"
                    variant="ghost"
                    class="justify-start hover:bg-white"
                    size="xs"
                    block
                    @click="navigateTo('/setting')"
                />

                <UTooltip
                    text="Add Page"
                    :popper="{ placement: 'right' }"
                    :shortcuts="['Ctrl', 'Shift', 'A']"
                >
                    <UButton
                        color="gray"
                        label="Add Page"
                        icon="i-heroicons-plus-circle"
                        variant="ghost"
                        class="justify-start hover:bg-white"
                        size="xs"
                        block
                    />
                </UTooltip>
            </section>

            <section data-role="pages-tree-container" class="flex w-full grow flex-col gap-1 overflow-y-auto">
                <header>
                    <span class="text-xs font-medium tracking-tight">workspace</span>
                </header>
                <div class="h-full w-full overflow-y-auto overflow-x-hidden">
                    <div class="flex flex-col">
                        <template v-for="(page, index) in tree.pages" :key="page.id">
                            <PageItem
                                v-model="tree.pages[index]"
                            />
                        </template>
                    </div>
                </div>
            </section>
        </div>
    </aside>
</template>
