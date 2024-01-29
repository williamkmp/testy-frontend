<script setup lang="ts">
import { z } from 'zod';
import SettingSection from '../-layout/setting-section.vue';
import { useUserPictureModalStore } from '../-store/user-picture-modal';
import type { UserResponse } from '~/types';

// Dependencies
const userPictureModal = useUserPictureModalStore();
const app = useAppStore();
const path = useApiPath();
const privateApi = usePrivateApi();
const { $v } = useMessage();
const notif = useNotification();

// Actions
const profileForm = useFormDeclaration({
    initial: {
        email: app.user?.email,
        fullName: app.user?.fullName,
        tagName: app.user?.tagName,
    },

    schema: z.object({
        email: z
            .string({
                required_error: $v('required'),
            })
            .max(100, $v('string_max:100'))
            .trim(),
        fullName: z
            .string({
                required_error: $v('required'),
            })
            .max(100, $v('string_max:100'))
            .trim(),
        tagName: z
            .string({
                required_error: $v('required'),
            })
            .max(30, $v('string_max:30'))
            .trim(),
    }),

    onSubmit: async (form) => {
        const response: UserResponse = await privateApi.put(
            path.user,
            {
                email: form.data.email,
                tagName: form.data.tagName,
                fullName: form.data.fullName,
                imageId: app.user?.imageId,
            },
        );
        if (app.user) {
            app.user.id = response.data.id;
            app.user.email = response.data.email;
            app.user.tagName = response.data.tagName;
            app.user.fullName = response.data.fullName;
            app.user.imageId = response.data.imageId;
        }
        notif.ok({ message: 'update_success' });
    },
});
</script>

<template>
    <SettingSection>
        <template #header>
            Account
        </template>

        <template #body>
            <UiForm
                :form="profileForm"
                class="grid w-full grid-cols-2 items-center justify-items-start gap-8"
            >
                <!-- Change Picture -->
                <UAvatar
                    :src="path.getImage(app.user?.imageId)"
                    :alt="app.user?.fullName.toUpperCase()"
                    size="2xl"
                />
                <div class="flex size-full items-end justify-end">
                    <UButton
                        label="Change"
                        variant="outline"
                        @click="userPictureModal.isOpen = true"
                    />
                </div>

                <!-- User email field -->
                <div
                    class="flex size-full flex-col items-start justify-start gap-1"
                >
                    <label class="text-base font-semibold">
                        Email
                    </label>
                    <span class="text-xs">
                        Account's email address
                    </span>
                </div>
                <UFormGroup name="email">
                    <UInput
                        v-model="profileForm.state.email"
                        icon="i-heroicons-envelope"
                        :disabled="profileForm.isLoading.value"
                    />
                </UFormGroup>

                <!-- User name field -->
                <div
                    class="flex size-full flex-col items-start justify-start gap-1"
                >
                    <label class="text-base font-semibold">
                        Name
                    </label>
                    <span class="text-xs">
                        Account's display name
                    </span>
                </div>
                <UFormGroup name="fullName">
                    <UInput
                        v-model="profileForm.state.fullName"
                        :disabled="profileForm.isLoading.value"
                    />
                </UFormGroup>

                <!-- User tagname field -->
                <div
                    class="flex size-full flex-col items-start justify-start gap-1"
                >
                    <label class="text-base font-semibold">
                        Username
                    </label>
                    <span class="text-xs">
                        Handle for mention and identification
                    </span>
                </div>
                <UFormGroup name="tagName">
                    <UInput
                        v-model="profileForm.state.tagName"
                        :disabled="profileForm.isLoading.value"
                        icon="i-heroicons-at-symbol"
                    />
                </UFormGroup>

                <!-- save btn -->
                <div class="col-span-full flex w-full justify-end">
                    <UButton
                        label="Save"
                        :loading="profileForm.isLoading.value"
                        type="submit"
                        size="sm"
                    />
                </div>
            </UiForm>
        </template>
    </SettingSection>
</template>
