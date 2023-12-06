<script setup lang="ts">
import ChangePasswordModal from './-component/change-password-modal.vue';
import DeleteAccountModal from './-component/delete-account-modal.vue';
import ChangePictureModal from './-component/profile-picture-modal.vue';
import UserLogoutModal from './-component/user-logout-modal.vue';
import AccountSettingSection from './-component/account-setting-section.vue';
import GeneralSettingSection from './-component/general-setting-section.vue';

const app = useAppStore();
app.headerTitle = 'Setting';
</script>

<template>
    <UContainer class="flex flex-col items-center">
        <div class="my-8 flex w-full flex-col items-center gap-10">
            <AccountSettingSection />
            <GeneralSettingSection />
        </div>
        <ChangePasswordModal />
        <ChangePictureModal />
        <UserLogoutModal />
        <DeleteAccountModal />
    </UContainer>
</template>
