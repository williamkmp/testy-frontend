<script setup lang="ts">
import { z } from 'zod';
import { usePasswordModalStore } from '../-store/password-modal';

// Dependencies
const passwordModalStore = usePasswordModalStore();
const { $v } = useMessage();
const { privateApi, path } = useApi();

// Actions
const passwordForm = useFormDeclaration({
    schema: z.object({
        oldPassword: z
            .string({ required_error: $v('required') })
            .max(100, $v('string_max:100'))
            .trim(),
        newPassword: z
            .string({ required_error: $v('required') })
            .max(100, $v('string_max:100'))
            .trim(),
    }),
    onSubmit: async (form) => {
        await privateApi.put(path.userPassword, {
            oldPassword: form.data.oldPassword,
            newPassword: form.data.newPassword,
        });
        closeModal();
    },
});

function closeModal() {
    passwordModalStore.isOpen = false;
    passwordForm.reset();
}
</script>

<template>
    <UModal
        v-model="passwordModalStore.isOpen"
        :prevent-close="passwordForm.isLoading.value"
        @close="closeModal"
    >
        <UCard>
            <!-- header -->
            <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-xl font-bold">
                        Password
                    </h3>
                    <UButton
                        variant="ghost"
                        icon="i-heroicons-x-mark-20-solid"
                        :padded="false"
                        :disabled="passwordForm.isLoading.value"
                        @click="closeModal"
                    />
                </div>
            </template>

            <!-- body -->
            <template #default>
                <UiForm
                    :form="passwordForm"
                    class="flex w-full flex-col items-center justify-center gap-6"
                >
                    <UFormGroup
                        label="Current Password"
                        name="oldPassword"
                    >
                        <UInput
                            v-model="passwordForm.state.oldPassword"
                            :disabled="passwordForm.isLoading.value"
                            placeholder="*****"
                            icon="i-heroicons-lock-closed"
                            type="password"
                            autofocus
                        />
                    </UFormGroup>

                    <UFormGroup
                        label="New Password"
                        name="newPassword"
                    >
                        <UInput
                            v-model="passwordForm.state.newPassword"
                            :disabled="passwordForm.isLoading.value"
                            placeholder="*****"
                            type="password"
                            icon="i-heroicons-lock-closed"
                        />
                    </UFormGroup>

                    <UButton
                        label="Save"
                        class="mt-6"
                        :loading="passwordForm.isLoading.value"
                        type="submit"
                        block
                    />
                </UiForm>
            </template>
        </UCard>
    </UModal>
</template>
