<script lang="ts" setup>
import { useChatModalStore } from '~/pages/page/-store/chat-modal';
import { usePageDataStore } from '~/pages/page/-store/page-data';
import { useDeletePageModalStore } from '~/pages/page/-store/delete-page-modal';

const sideMenu = useSideMenuStore();
const chatModal = useChatModalStore();
const deletaPageModal = useDeletePageModalStore();
const pageData = usePageDataStore();
const app = useAppStore();
const shortcut = useShortcuts();

const userCanDeletePage = computed(() => {
    if (pageData.authority === 'FULL_ACCESS')
        return true;
    else if (pageData.authority === 'COLLABORATORS')
        return !pageData.isRootPage;
    else
        return false;
});
</script>

<template>
    <header
        class="flex w-full items-center justify-between border-b border-gray-200 px-4 py-2 shadow dark:border-gray-800"
    >
        <!-- Left control -->
        <div class="flex items-center gap-4">
            <UTooltip
                :text="sideMenu.isOpen ? 'Close Menu' : 'Open menu'"
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
            <!-- Editor Page Controller -->
            <div v-if="pageData.id !== undefined" class="flex items-center justify-center gap-2">
                <UTooltip
                    text="Comments"
                    :popper="{ placement: 'bottom' }"
                >
                    <UButton
                        icon="i-heroicons-chat-bubble-bottom-center-text"
                        color="black"
                        variant="ghost"
                        @click="() => chatModal.isOpen = true"
                    />
                </UTooltip>

                <UTooltip
                    text="Members"
                    :popper="{ placement: 'bottom' }"
                >
                    <UButton
                        icon="i-heroicons-user-group"
                        color="black"
                        variant="ghost"
                        @click="() => chatModal.isOpen = true"
                    />
                </UTooltip>

                <UTooltip
                    v-if="userCanDeletePage"
                    text="Delete"
                    :popper="{ placement: 'bottom' }"
                >
                    <UButton
                        icon="i-heroicons-trash"
                        color="red"
                        variant="ghost"
                        @click="() => deletaPageModal.isOpen = true"
                    />
                </UTooltip>
            </div>
        </div>
    </header>
</template>
