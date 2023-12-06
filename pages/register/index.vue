<script lang="ts" setup>
import { z } from 'zod';

definePageMeta({ layout: 'authentication' });

// Dependency
const { $v } = useMessage();
const { publicApi, path } = useApi();
const notif = useNotification();

const loginForm = useFormDeclaration({
    schema: z.object({
        email: z
            .string({ required_error: $v('required') })
            .min(1, $v('string_min:1'))
            .max(100, $v('string_min:100'))
            .email($v('string_email')),
        tagName: z
            .string({ required_error: $v('required') })
            .min(1, $v('string_min:1'))
            .max(100, $v('string_min:100')),
        fullName: z
            .string({ required_error: $v('required') })
            .min(1, $v('string_min:1'))
            .max(100, $v('string_min:100')),
        password: z
            .string({ required_error: $v('required') })
            .min(1, $v('string_min:1'))
            .max(100, $v('string_min:100')),
    }),
    onSubmit: async (form) => {
        await publicApi.post(
            path.authRegister,
            {
                email: form.data.email,
                tagName: form.data.tagName,
                fullName: form.data.fullName,
                password: form.data.password,
            },
        );
        notif.ok({ message: 'Signup succes, please login using your accout' });
        await navigateTo('/login');
    },
});
</script>

<template>
    <div class="flex flex-col gap-10">
        <header class="flex flex-col gap-6">
            <h1 class="text-5xl font-extrabold">
                SignUp.
            </h1>
            <p class="text-sm">
                Create an ccount to start using the application.
            </p>
        </header>

        <UiForm :form="loginForm" class="flex w-80 flex-col gap-6">
            <UFormGroup label="Full Name" name="fullName">
                <UInput
                    v-model="loginForm.state.fullName"
                    icon="i-heroicons-user"
                    placeholder="John Doe"
                    :disabled="loginForm.isLoading.value"
                    size="md"
                    autofocus
                />
            </UFormGroup>

            <UFormGroup label="Username" name="tagName">
                <UInput
                    v-model="loginForm.state.tagName"
                    icon="i-heroicons-at-symbol"
                    placeholder="john_doe"
                    :disabled="loginForm.isLoading.value"
                    size="md"
                />
            </UFormGroup>

            <UFormGroup label="Email" name="email">
                <UInput
                    v-model="loginForm.state.email"
                    icon="i-heroicons-envelope"
                    placeholder="john@email.com"
                    :disabled="loginForm.isLoading.value"
                    size="md"
                />
            </UFormGroup>

            <UFormGroup label="Password" name="password">
                <UInput
                    v-model="loginForm.state.password"
                    icon="i-heroicons-lock-closed"
                    placeholder="password"
                    size="md"
                    :disabled="loginForm.isLoading.value"
                />
            </UFormGroup>
        </UiForm>

        <div class="mt-3 flex w-full flex-col gap-4">
            <span class="w-full text-center text-sm text-red-500">
                {{ loginForm.error.value }}
            </span>
            <UButton
                :loading="loginForm.isLoading.value"
                block
                @click="loginForm.submit.value"
            >
                Register
            </UButton>

            <UDivider label="or" />

            <span class="text-sm">
                Already have an ccount? click <ULink to="/login">here</ULink> to login.
            </span>
        </div>
    </div>
</template>
