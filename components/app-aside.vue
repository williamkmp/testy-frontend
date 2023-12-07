<script lang="ts" setup>
const app = useAppStore();
const tree = usePagesTreeStore();
const auth = useAuthStore();

const pressedKey = useMagicKeys();
const ctrl_backslash = pressedKey['Ctrl+backslash'];
// const ctrl_shift_p = pressedKey['Ctrl+Shift+K'];

whenever(ctrl_backslash, () => app.isMenuOpen = !app.isMenuOpen);
</script>

<template>
    <aside
        class="flex h-full flex-col gap-4 overflow-hidden border-r border-gray-200 bg-gray-300/20 py-3 transition-all dark:border-gray-700"
        :class="[
            app.isMenuOpen
                ? 'min-w-[16rem] max-w-[16rem] px-4'
                : 'w-0 min-w-0 px-0',
        ]"
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
    </aside>
</template>
