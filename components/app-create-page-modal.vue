<script lang="ts" setup>
import { AUTHORITY, type Authority, type ImageResponse, type PageDataResponse, type ServerResponseError } from '~/types';
import resizeImage from '~/utils/resize-image';

// Dependency
const { privateApi, path } = useApi();
const notif = useNotification();
const createPageModal = useCreatePageModalStore();
const sideMenu = useSideMenuStore();
const authStore = useAuthStore();

// Refs
const imageContainerRef = ref<HTMLDivElement>();
const imageRef = ref<HTMLImageElement>();
const emojiPickerRef = ref<HTMLDivElement>();
const mouse = useMouse();
const file = useFileDialog({
    accept: 'image/*',
    directory: false,
    multiple: false,
});

// States
const isSubmittingPage = ref(false);
const isEmojiPickerOpen = ref(false);
const isTitleHover = ref(false);
const isTitleFocus = ref(false);
const isImageHover = ref(false);
const isRepositioning = ref(false);
const isDragging = ref(false);
const inviteEmailText = ref<string>();
const inviteList = ref<Array<{ email: string, authority: Authority }>>([]);
const pageData = ref<{
    title?: string
    imagePosition: number
    imageSrc?: string
    iconKey?: string
    image?: Blob
}>({
    imagePosition: 50,
});

const hasCoverImage = computed(() => {
    return pageData.value.imageSrc !== undefined;
});

// Emoji Picker Event Listener
onClickOutside(emojiPickerRef, () => isEmojiPickerOpen.value = false);

// File Event Listener
file.onChange((files: FileList) => {
    pageData.value.image = files[0];
    pageData.value.imageSrc = URL.createObjectURL(files[0]);
});

// Dragging Listener
useEventListener(imageContainerRef, 'mousedown', enableRepositionDragging);
useEventListener(window, 'blur', disableRepositionDragging);
useEventListener(window, 'mouseup', disableRepositionDragging);

function enableRepositionDragging(e: Event) {
    e.preventDefault();
    if (isRepositioning.value && !isDragging.value)
        isDragging.value = true;
}

function disableRepositionDragging(e: Event) {
    e.preventDefault();
    if (isRepositioning.value && isDragging.value)
        isDragging.value = false;
}

watch(mouse.y, (newValue, oldValue) => {
    if (isDragging.value && isRepositioning.value && imageRef.value) {
        const delta = oldValue - newValue;
        let newPosition = pageData.value.imagePosition;
        newPosition = (delta >= 0)
            ? newPosition += 1
            : newPosition -= 1;
        pageData.value.imagePosition = clampNumber(0, newPosition, 100);
    }
});

watch(isRepositioning, () => {
    if (isRepositioning.value) {
        imageContainerRef.value!.style.cursor = 'ns-resize';
    }
    else {
        imageContainerRef.value!.style.cursor = 'default';
        isDragging.value = false;
    }
});

// Actions
async function submitPage() {
    isSubmittingPage.value = true;
    try {
        let imageResponse: ImageResponse | undefined;
        if (pageData.value.imageSrc && pageData.value.image) {
            imageResponse = await privateApi.postForm(path.image, {
                image: await resizeImage(pageData.value.image, 3500),
            });
        }
        const pageResponse: PageDataResponse = await privateApi.post(path.page, {
            title: pageData.value.title,
            iconKey: pageData.value.iconKey,
            imageId: (imageResponse !== undefined)
                ? imageResponse.data.id
                : undefined,
            imagePosition: pageData.value.imagePosition,
            members: inviteList.value.map(invite => ({
                email: invite.email,
                authority: invite.authority,
            })),
        });

        sideMenu.addPage({
            id: pageResponse.data.id,
            title: pageResponse.data.title,
            iconKey: pageResponse.data.iconKey,
        });

        await navigateTo(`/page/${pageResponse.data.id}`);
        createPageModal.isOpen = false;
        resetModal();
    }
    catch (e) {
        console.error(e);
        notif.error({ message: 'upload_fail' });
    }
    isSubmittingPage.value = false;
}

function showRandomEmoji() {
    const emojiKeys = Object.keys(EMOJI);
    const randomEmojiKey = emojiKeys[emojiKeys.length * Math.random() << 0];
    pageData.value.iconKey = randomEmojiKey;
}

function resetModal() {
    pageData.value.title = undefined;
    pageData.value.imagePosition = 50;
    pageData.value.imageSrc = undefined;
    pageData.value.iconKey = undefined;
    pageData.value.image = undefined;
    isRepositioning.value = false;
    isEmojiPickerOpen.value = false;
    inviteEmailText.value = undefined;
    inviteList.value = [];
}

function pickEmoji(emojiKey: string) {
    pageData.value.iconKey = emojiKey;
    isEmojiPickerOpen.value = false;
}

function removeEmoji() {
    pageData.value.iconKey = undefined;
    isEmojiPickerOpen.value = false;
}

function addEmail() {
    if (inviteEmailText.value !== undefined && inviteEmailText.value.trim() !== '') {
        // Email is the same as user
        if (inviteEmailText.value === authStore.user!.email)
            return;
        // Email is already in invite list
        if (inviteList.value.some(invite => invite.email === inviteEmailText.value!.trim()))
            return;
        inviteList.value.push({
            email: inviteEmailText.value!.trim(),
            authority: AUTHORITY.VIEWERS,
        });
    }
    inviteEmailText.value = '';
}

function removeInvite(email: string) {
    inviteList.value = inviteList.value.filter(invite => invite.email !== email);
}

function updateAuthority(email: string, authority: Authority) {
    inviteList.value.forEach((invite) => {
        if (invite.email === email)
            invite.authority = authority;
    });
}

// Style
const btnClass = 'opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-100 font-normal py-1 px-1.5';
</script>

<template>
    <UModal
        v-model="createPageModal.isOpen"
        :ui="{
            width: 'w-full sm:max-w-2xl max-w-2xl',
            padding: 'sm:p-8 p-8',
        }"
        :prevent-close="isDragging || isSubmittingPage"
        @close="resetModal"
    >
        <!-- container -->
        <UCard
            :ui="{
                base: 'w-full bg-red-300',
                header: { padding: 'px-2 py-2 sm:px-2' },
                body: { padding: 'px-0 py-0 sm:p-0 pb-6 sm:pb-6' },
            }"
        >
            <template #default>
                <header class="w-full overflow-hidden">
                    <template v-if="hasCoverImage">
                        <div
                            ref="imageContainerRef"
                            class="relative flex h-40 w-full justify-center overflow-hidden bg-gray-200 dark:bg-gray-700"
                            @mouseenter="isImageHover = true"
                            @mouseleave="isImageHover = false"
                        >
                            <img
                                ref="imageRef"
                                :src="pageData.imageSrc"
                                alt="Backgound Image"
                                class="w-full object-cover"
                                :style="{ objectPosition: `center ${pageData.imagePosition}%` }"
                            >
                            <div class="pointer-events-none absolute flex h-full w-full max-w-md items-center justify-center transition-opacity" :class="[(isRepositioning || isImageHover) ? 'opacity-100' : 'opacity-0']">
                                <div class="pointer-events-auto absolute right-0 top-0 mt-2">
                                    <template v-if="!isRepositioning">
                                        <UButtonGroup size="xs" orientation="horizontal">
                                            <UButton label="Change" color="gray" variant="solid" @click="file.open" />
                                            <UButton label="Remove" color="gray" variant="solid" @click="pageData.imageSrc = undefined" />
                                            <UButton label="Reposition" color="gray" variant="solid" @click="isRepositioning = true" />
                                        </UButtonGroup>
                                    </template>
                                    <template v-else>
                                        <UButton label="Save" color="gray" variant="solid" size="xs" @click="isRepositioning = false" />
                                    </template>
                                </div>

                                <span v-if="isRepositioning" class="rounded-md bg-black px-3 py-1 text-xs font-normal text-white opacity-70">
                                    Drag image to reposition
                                </span>
                            </div>
                        </div>
                    </template>
                </header>

                <section
                    class="mt-6 flex w-full justify-center px-8"
                    @mouseenter="isTitleHover = true" @mouseleave="isTitleHover = false"
                >
                    <div class="flex w-full max-w-md flex-col gap-6">
                        <div
                            v-if="pageData.imageSrc === undefined || pageData.iconKey === undefined "
                            class="flex items-center justify-start gap-1.5"
                            :class="[(isTitleFocus || isTitleHover) ? 'opacity-100' : 'opacity-0']"
                        >
                            <UButton
                                v-if="pageData.iconKey === undefined"
                                :disabled="isSubmittingPage"
                                label="Add Icon"
                                icon="i-heroicons-face-smile"
                                variant="ghost" color="zinc" size="md"
                                :ui="{ variant: { ghost: btnClass } }"
                                @click="showRandomEmoji"
                            />
                            <UButton
                                v-if="pageData.imageSrc === undefined"
                                :disabled="isSubmittingPage"
                                label="Add Cover"
                                icon="i-heroicons-photo"
                                variant="ghost" color="zinc" size="md"
                                :ui="{ variant: { ghost: btnClass } }"
                                @click="file.open"
                            />
                        </div>
                        <div class="flex w-full gap-2">
                            <template v-if="pageData.iconKey !== undefined">
                                <UPopover
                                    :disabled="isSubmittingPage"
                                    :open="isEmojiPickerOpen"
                                    class="h-min w-min"
                                    :popper="{ placement: 'bottom' }"
                                    @update:open="(t) => console.log(t)"
                                >
                                    <template #default>
                                        <div
                                            class="flex h-12 w-12 items-center justify-center rounded bg-transparent p-0.5 transition-all hover:cursor-pointer hover:bg-gray-400/20"
                                            @click="isEmojiPickerOpen = true"
                                        >
                                            <EmojiIcon :emoji-name="pageData.iconKey" />
                                        </div>
                                    </template>
                                    <template #panel>
                                        <div
                                            ref="emojiPickerRef"
                                            class="z-[100] h-80 w-[24rem] px-2 py-3"
                                        >
                                            <EmojiPicker
                                                @choose="pickEmoji"
                                                @remove="removeEmoji"
                                            />
                                        </div>
                                    </template>
                                </UPopover>
                            </template>
                            <UTextarea
                                v-model="pageData.title"
                                :disabled="isSubmittingPage"
                                :rows="1"
                                placeholder="Untitled"
                                autoresize
                                variant="none"
                                class="w-full font-extrabold"
                                size="xl"
                                :ui="{
                                    size: { xl: 'text-4xl tracking-wide' },
                                    padding: { xl: 'py-0.5 px-0' },
                                }"
                                autofocus
                                @focus="isTitleFocus = true"
                                @blur="isTitleFocus = false"
                            />
                        </div>

                        <div class="flex w-full flex-col gap-6">
                            <div class="flex w-full items-end gap-2">
                                <UInput
                                    v-model="inviteEmailText"
                                    :disabled="isSubmittingPage"
                                    icon="i-heroicons-envelope"
                                    placeholder="user@email.com"
                                    size="sm"
                                    class="grow"
                                    color="gray"
                                    variant="outline"
                                    @click="addEmail"
                                    @keydown.enter="addEmail"
                                />
                                <UButton
                                    :disabled="isSubmittingPage"
                                    label="Add"
                                    color="gray"
                                    variant="solid"
                                    trailing-icon="i-heroicons-plus"
                                    size="sm"
                                    @click="addEmail"
                                />
                            </div>
                            <div
                                class="flex max-h-[14rem] flex-col divide-y overflow-y-auto rounded-md border-gray-200"
                                :class="{ border: (inviteList.length > 0) }"
                            >
                                <template v-if="inviteList.length > 0">
                                    <template v-for="person in inviteList" :key="person.email">
                                        <div class="flex items-center justify-between px-2 py-1 hover:bg-gray-200/60">
                                            <div class="flex items-center justify-start gap-2">
                                                <UTooltip
                                                    text="Remove"
                                                    :popper="{ placement: 'left' }"
                                                >
                                                    <UButton
                                                        :disabled="isSubmittingPage"
                                                        icon="i-heroicons-x-circle"
                                                        color="red"
                                                        variant="ghost"
                                                        size="xs"
                                                        @click="removeInvite(person.email)"
                                                    />
                                                </UTooltip>
                                                <span class="text-sm font-normal text-gray-700 dark:text-gray-300">
                                                    {{ person.email }}
                                                </span>
                                            </div>
                                            <UPopover
                                                :disabled="isSubmittingPage"
                                                :popper="{ placement: 'right' }"
                                            >
                                                <template #default>
                                                    <UButton
                                                        :disabled="isSubmittingPage"
                                                        color="gray"
                                                        variant="ghost"
                                                        size="xs"
                                                        :label="capitalize(person.authority)"
                                                        trailing-icon="i-heroicons-chevron-down"
                                                    />
                                                </template>
                                                <template #panel="{ close }">
                                                    <div class="flex flex-col divide-y rounded-md border border-gray-100">
                                                        <template v-for="authority in Object.keys(AUTHORITY)" :key="authority">
                                                            <div
                                                                class="px-2 py-1 text-sm font-normal text-gray-700 hover:cursor-pointer hover:bg-gray-200/60 dark:text-gray-300"
                                                                @click="() => {
                                                                    updateAuthority(person.email, authority as Authority);
                                                                    close();
                                                                }"
                                                            >
                                                                <span>{{ capitalize(authority) }}</span>
                                                            </div>
                                                        </template>
                                                    </div>
                                                </template>
                                            </UPopover>
                                        </div>
                                    </template>
                                </template>
                                <template v-else>
                                    <!--  -->
                                </template>
                            </div>
                        </div>
                        <div class="w-full">
                            <UButton block color="gray" variant="solid" label="Save" size="xs" :loading="isSubmittingPage" @click="submitPage" />
                        </div>
                    </div>
                </section>
            </template>
        </UCard>
    </UModal>
</template>
