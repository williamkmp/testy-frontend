<script setup lang="ts">
import { Cropper } from 'vue-advanced-cropper';
import { useUserPictureModalStore } from '../-store/user-picture-modal';
import type { ImageResponse, UserResponse } from '~/types';

// Dependencies
const userPictureModal = useUserPictureModalStore();
const app = useAppStore();
const path = useApiPath();
const privateApi = usePrivateApi();
const notif = useNotification();

// States
const isSubmitting = ref(false);
const fileInputRef = ref<HTMLInputElement>();
const cropperRef = ref();
const chosenImageSrc = ref<string>();
const isCroppingPicture = computed(() => chosenImageSrc.value !== undefined);
function cropperBoundry({ cropper }: any) {
    return {
        width: cropper.clientWidth,
        height: cropper.clientHeight,
    };
}

// Actions
function choosePicture() {
    const fileInputEl = fileInputRef.value as HTMLInputElement;
    if (!fileInputEl || !fileInputEl.files)
        return;
    const uploadedImage = fileInputEl.files[0];
    const fileType = uploadedImage.type;
    if (!fileType.startsWith('image/') || fileType.endsWith('svg')) {
        userPictureModal.isOpen = false;
        notif.error({
            title: 'Upload Failed',
            message: 'Image file type not supported',
        });
        chosenImageSrc.value = undefined;
        return;
    }
    chosenImageSrc.value = URL.createObjectURL(uploadedImage);
}

async function doUpload() {
    isSubmitting.value = true;
    if (cropperRef.value) {
        const image = cropperRef.value.getResult().canvas as HTMLCanvasElement;
        const blob = await new Promise(resolve => image.toBlob(resolve));
        try {
            const imageUploadResponse: ImageResponse = await privateApi.postForm(path.image, {
                image: blob,
            });

            const userUpdateResponse: UserResponse = await privateApi.put(
                path.user,
                {
                    email: app.user!.email,
                    tagName: app.user!.tagName,
                    fullName: app.user!.fullName,
                    imageId: imageUploadResponse.data!.id,
                },
            );

            app.user!.imageId = userUpdateResponse.data.imageId;
            notif.ok({ message: 'upload_success' });
        }
        catch (err: any) {
            notif.error({ message: 'upload_fail' });
        }
    }
    userPictureModal.isOpen = false;
    resetModal();
}

async function doDelete() {
    isSubmitting.value = true;
    try {
        await privateApi.put(
            path.user,
            {
                email: app.user!.email,
                tagName: app.user!.tagName,
                fullName: app.user!.fullName,
            },
        );
        app.user!.imageId = undefined;
        notif.ok({ message: 'update_success' });
    }
    catch (err: any) {
        notif.error({ message: 'update_fail' });
    }
    userPictureModal.isOpen = false;
    resetModal();
}

function cropperError() {
    userPictureModal.isOpen = false;
    notif.error({
        title: 'Upload Failed',
        message: 'Image file type not supported',
    });
    chosenImageSrc.value = undefined;
}

function resetModal() {
    isSubmitting.value = false;
    chosenImageSrc.value = undefined;
}

function closeModal() {
    resetModal();
    userPictureModal.isOpen = false;
}
</script>

<template>
    <UModal
        v-model="userPictureModal.isOpen"
        :prevent-close="isSubmitting"
        @close="closeModal"
    >
        <UCard>
            <!-- header -->
            <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-xl font-bold">
                        Profile Image
                    </h3>
                    <UButton
                        variant="ghost"
                        icon="i-heroicons-x-mark-20-solid"
                        :padded="false"
                        :disabled="isSubmitting"
                        @click="closeModal"
                    />
                </div>
            </template>

            <!-- body -->
            <template #default>
                <div class="w-full">
                    <div
                        v-if="!isCroppingPicture"
                        class="flex w-full flex-col items-center justify-center gap-8"
                    >
                        <UAvatar
                            :src="path.getImage(app.user?.imageId)"
                            :alt="app.user?.fullName.toUpperCase()"
                            size="3xl"
                        />
                        <input
                            ref="fileInputRef"
                            class="hidden"
                            type="file"
                            accept="image/*"
                            @change="choosePicture"
                        >
                        <div class="flex w-full flex-col gap-2">
                            <UButton
                                label="Change"
                                :loading="isSubmitting"
                                block
                                @click="fileInputRef?.click()"
                            />
                            <UButton
                                label="Delete"
                                :loading="isSubmitting"
                                color="red"
                                variant="outline"
                                block
                                @click="doDelete"
                            />
                        </div>
                    </div>
                    <div
                        v-else
                        class="flex w-full flex-col items-center justify-center gap-6"
                    >
                        <div
                            class="h-96 w-full max-w-full overflow-hidden rounded-md border border-gray-200"
                        >
                            <Cropper
                                ref="cropperRef"
                                class="size-full"
                                image-restriction="stencil"
                                :src="chosenImageSrc"
                                :default-boundaries="cropperBoundry"
                                :resize-image="{
                                    adjustStencil: false,
                                }"
                                :transition="false"
                                :debounce="false"
                                :stencil-props="{
                                    handlers: {},
                                    movable: false,
                                    resizable: false,
                                    scalable: false,
                                    aspectRatio: 1,
                                }"
                                :canvas="{
                                    height: 300,
                                    width: 300,
                                }"
                                :stencil-size="{
                                    width: 200,
                                    height: 200,
                                }"
                                :onerror="cropperError"
                            />
                        </div>

                        <div
                            class="flex w-full items-center justify-center gap-10"
                        >
                            <UButton
                                icon="i-heroicons-magnifying-glass-plus"
                                variant="outline"
                                @click="cropperRef.zoom(1.3)"
                            />
                            <UButton
                                icon="i-heroicons-magnifying-glass-minus"
                                variant="outline"
                                @click="cropperRef.zoom(0.7)"
                            />
                        </div>

                        <UButton
                            label="Save"
                            block
                            :loading="isSubmitting"
                            @click="doUpload"
                        />
                    </div>
                </div>
            </template>
        </UCard>
    </UModal>
</template>
