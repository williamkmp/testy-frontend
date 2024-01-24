<script setup lang="ts">
import { useDeleteAccountModalStore } from '../-store/delete-account-modal';

const deleteAccountModal = useDeleteAccountModalStore();
const auth = useAuth();
const notif = useNotification();

async function doDeleteAcoount() {
    auth.logout();
    notif.ok({ message: 'Logout success, please login' });
    deleteAccountModal.isOpen = false;
}
</script>

<template>
    <UModal v-model="deleteAccountModal.isOpen">
        <UCard>
            <div class="mb-8">
                <p class="w-full text-center text-lg font-semibold">
                    Are you sure you want to permanently delete your account?
                </p>
            </div>
            <div class="flex items-center justify-center gap-6">
                <div class="grow">
                    <UButton
                        label="Yes"
                        color="red"
                        variant="soft"
                        block
                        @click="doDeleteAcoount"
                    />
                </div>
                <div class="grow">
                    <UButton
                        label="No"
                        color="primary"
                        variant="soft"
                        block
                        @click="deleteAccountModal.isOpen = false"
                    />
                </div>
            </div>
        </UCard>
    </UModal>
</template>
