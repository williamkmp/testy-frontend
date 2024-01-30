<script lang="ts" setup>
const sideMenu = useSideMenuStore();
const app = useAppStore();
const shortcut = useShortcuts();
</script>

<template>
    <header
        class="flex w-full items-center justify-between border-b border-gray-200 px-4 py-2 shadow dark:border-gray-800"
    >
        <!-- Left control -->
        <div class="flex items-center gap-4">
            <UTooltip
                :text=" sideMenu.isOpen ? 'Close Menu' : 'Open menu' "
                :shortcuts="[shortcut.metaSymbol.value, '\\']"
                :popper="{ placement: 'right' }"
            >
                <UButton
                    :icon="sideMenu.isOpen ? 'i-heroicons-chevron-double-left' : 'i-heroicons-chevron-double-right'"
                    color="white"
                    size="sm"
                    variant="soft"
                    @click="sideMenu.isOpen = !sideMenu.isOpen"
                />
            </UTooltip>

            <div class="flex h-full items-center justify-start gap-2">
                <div v-if="app.emojiKey !== undefined" class="size-4">
                    <EmojiIcon :emoji-name="app.emojiKey" />
                </div>
                <h2 class="font-semibold">
                    {{ app.headerTitle }}
                </h2>
            </div>
        </div>

        <!-- right control -->
        <div class="flex items-center">
            <slot name="right-control" />
        </div>
    </header>
</template>
