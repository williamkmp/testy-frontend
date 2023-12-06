<script lang="ts" setup>
import { usePasswordModalStore } from '../-store/password-modal';
import { useDeleteAccountModalStore } from '../-store/delete-account-modal';
import { useLogoutModalStore } from '../-store/logout-modal';
import SettingSection from '../-layout/setting-section.vue';

const app = useAppStore();
const passwordModal = usePasswordModalStore();
const deleteAccountModalStore = useDeleteAccountModalStore();
const logoutModalStore = useLogoutModalStore();
</script>

<template>
    <SettingSection>
        <template #header>
            General
        </template>

        <template #body>
            <div
                class="grid w-full grid-cols-2 items-center justify-items-start gap-8"
            >
                <div
                    class="flex flex-col items-start justify-start gap-1"
                >
                    <label class="text-base font-semibold">
                        Dark Mode
                    </label>
                    <span class="text-xs">
                        Toggle darkmode appereance.
                    </span>
                </div>
                <div class="flex h-full w-full items-end justify-end">
                    <UToggle v-model="app.isDark" />
                </div>

                <div
                    class="flex flex-col items-start justify-start gap-1"
                >
                    <label class="text-base font-semibold">
                        Password
                    </label>
                    <span class="text-xs">
                        Change account password
                    </span>
                </div>
                <div class="flex h-full w-full items-end justify-end">
                    <UButton
                        label="Change"
                        variant="outline"
                        size="sm"
                        @click="passwordModal.isOpen = true"
                    />
                </div>

                <div
                    class="flex w-full flex-col items-start justify-start gap-1"
                >
                    <label class="text-base font-semibold">
                        Logout
                    </label>
                    <span class="text-xs">
                        Logout from all devices
                    </span>
                </div>
                <div class="flex h-full w-full items-end justify-end">
                    <UButton
                        label="Logout"
                        icon="i-heroicons-arrow-left-on-rectangle"
                        variant="soft"
                        size="sm"
                        @click="logoutModalStore.isOpen = true"
                    />
                </div>

                <div
                    class="flex w-full flex-col items-start justify-start gap-1"
                >
                    <label class="text-base font-semibold text-red-500">
                        Delete
                    </label>
                    <span class="text-xs text-red-500">
                        Delete account premanently.
                    </span>
                </div>
                <div class="flex h-full w-full items-end justify-end">
                    <UButton
                        label="Delete"
                        icon="i-heroicons-trash"
                        variant="soft"
                        color="red"
                        @click="deleteAccountModalStore.isOpen = true"
                    />
                </div>
            </div>
        </template>
    </SettingSection>
</template>
