<script lang="ts" setup>
// Dependencies
const searchModal = useSearchModalStore();
const createPageModal = useCreatePageModalStore();
const shortcut = useShortcuts();
const sideMenu = useSideMenuStore();
const auth = useAuthStore();
const { path } = useApi();

const aside = ref<HTMLDivElement>();
const isFetchingMenuItem = ref(true);
defineExpose({ aside });

onMounted(async () => {
    initSize();
    await initMenuItemData();
});

// Actions
function initSize() {
    if (!aside.value)
        return;

    if (sideMenu.size !== null)
        aside.value.style.width = sideMenu.size;
    else
        aside.value.style.width = `${getComputedStyle(aside.value).minWidth}px`;
}

async function initMenuItemData() {
    isFetchingMenuItem.value = true;
    sideMenu.menuItems = await sideMenu.fetchPages();
    isFetchingMenuItem.value = false;
}
</script>

<template>
    <!-- aside must have a min and max width -->
    <aside
        ref="aside"
        data-role="aside-container"
        class="h-full select-none overflow-hidden transition-all duration-300"
        :class="[
            sideMenu.isOpen
                ? 'min-w-[14rem] max-w-[30rem]'
                : 'min-w-0 max-w-0',
        ]"
    >
        <div
            class="flex h-full w-full min-w-[14rem] flex-col gap-4 overflow-hidden bg-gray-300/20 px-4 py-3"
        >
            <header
                class="flex w-full select-none items-center justify-start"
            >
                <div class="flex h-full w-full items-center gap-2">
                    <UAvatar
                        :src="path.getImage(auth.user!.imageId)"
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
                    :shortcuts="[shortcut.metaSymbol.value, 'Shift', 'P']"
                    :popper="{ placement: 'right' }"
                >
                    <UButton
                        color="gray"
                        label="Search"
                        icon="i-heroicons-magnifying-glass"
                        variant="ghost"
                        class="justify-start text-gray-600/60 hover:bg-white dark:text-gray-400"
                        size="sm"
                        block
                        @click="searchModal.isOpen = true"
                    />
                </UTooltip>

                <UButton
                    color="gray"
                    label="Updates & Notification"
                    icon="i-heroicons-clock"
                    variant="ghost"
                    class="justify-start text-gray-600/60 hover:bg-white dark:text-gray-400"
                    size="sm"
                    block
                />

                <UButton
                    color="gray"
                    label="Setting"
                    icon="i-heroicons-cog-6-tooth"
                    variant="ghost"
                    class="justify-start text-gray-600/60 hover:bg-white dark:text-gray-400"
                    size="sm"
                    block
                    @click="navigateTo('/setting')"
                />

                <UTooltip
                    text="Add Page"
                    :popper="{ placement: 'right' }"
                    :shortcuts="[shortcut.metaSymbol.value, 'P']"
                >
                    <UButton
                        color="gray"
                        label="Add Page"
                        icon="i-heroicons-plus-circle"
                        variant="ghost"
                        class="justify-start text-gray-600/60 hover:bg-white dark:text-gray-400"
                        size="sm"
                        block
                        @click="createPageModal.isOpen = true"
                    />
                </UTooltip>
            </section>

            <section data-role="pages-tree-container" class="flex w-full grow flex-col gap-1 overflow-y-auto">
                <header>
                    <span class="text-xs font-medium  text-gray-600/60 dark:text-gray-400">workspace</span>
                </header>
                <div class="h-full w-full overflow-y-auto overflow-x-hidden">
                    <div
                        v-if="isFetchingMenuItem"
                        class="flex flex-col gap-2"
                    >
                        <USkeleton class="h-5 w-full" />
                        <USkeleton class="h-5 w-full" />
                        <USkeleton class="h-5 w-full" />
                    </div>
                    <div
                        v-else
                        class="flex flex-col gap-0.5"
                    >
                        <template v-if="sideMenu.menuItems.length > 0">
                            <template v-for="(item, index) in sideMenu.menuItems" :key="item.id">
                                <PageItem v-model="sideMenu.menuItems[index]" />
                            </template>
                        </template>
                        <template v-else>
                            <section
                                class="my-1 select-none pl-[1.25rem] text-xs font-medium text-gray-400 dark:text-gray-400"
                            >
                                <span>No Pages</span>
                            </section>
                        </template>
                    </div>
                </div>
            </section>
        </div>
    </aside>
</template>
