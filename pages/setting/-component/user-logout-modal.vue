<script setup lang="ts">
import { useLogoutModalStore } from '../-store/logout-modal';

const logoutModalStore = useLogoutModalStore();
const auth = useAuthStore();
const notif = useNotification();

async function doLogoutAction() {
    auth.logout();
    notif.ok({ message: 'Please login using your account' });
    logoutModalStore.isOpen = false;
}
</script>

<template>
    <UModal v-model="logoutModalStore.isOpen">
        <UCard>
            <div class="mb-8">
                <p class="w-full text-center text-lg font-semibold">
                    Are you sure you want to logout?
                </p>
            </div>
            <div class="flex items-center justify-center gap-6">
                <div class="grow">
                    <UButton
                        label="Yes"
                        color="red"
                        variant="soft"
                        block
                        @click="doLogoutAction"
                    />
                </div>
                <div class="grow">
                    <UButton
                        label="No"
                        color="primary"
                        variant="soft"
                        block
                        @click="logoutModalStore.isOpen = false"
                    />
                </div>
            </div>
        </UCard>
    </UModal>
</template>
