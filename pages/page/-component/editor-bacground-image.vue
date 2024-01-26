<script lang="ts" setup>
import { useEditorHeaderStore } from '../-store/editor-header';
import { usePageDataStore } from '../-store/page-data';

// Dependency
const pageData = usePageDataStore();
const editorHeader = useEditorHeaderStore();

// States & Refs
const imageRef = ref<HTMLImageElement>();
const containerRef = ref<HTMLDivElement>();
const mouse = useMouse();
const isHover = ref(false);
const isRepositioning = ref(false);
const isDragging = ref(false);
const newImagePosition = ref(pageData.imagePosition);

// Event Listeners
useEventListener(containerRef, 'mousedown', enableRepositionDragging);
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
        let newPosition = newImagePosition.value;
        newPosition = (delta >= 0)
            ? newPosition += 1
            : newPosition -= 1;
        newImagePosition.value = clampNumber(0, newPosition, 100);
    }
});

watch(isRepositioning, () => {
    if (isRepositioning.value) {
        newImagePosition.value = pageData.imagePosition;
        containerRef.value!.style.cursor = 'ns-resize';
    }
    else {
        containerRef.value!.style.cursor = 'default';
        isDragging.value = false;
    }
});

// Actions
async function saveReposition() {
    isRepositioning.value = false;
    pageData.updatePageData({
        imagePosition: newImagePosition.value,
    });
}

async function deleteBackgroundImage() {
    await pageData.updatePageData({
        imageId: null,
    });
}
</script>

<template>
    <header ref="containerRef" class="mb-2 flex min-h-[5rem] w-full shrink-0 flex-col overflow-hidden">
        <template v-if="editorHeader.hasCoverImage || editorHeader.isUploadingImage">
            <div
                class="relative flex h-60 w-full justify-center overflow-hidden bg-gray-200 dark:bg-gray-700"
                @mouseenter="isHover = true" @mouseleave="isHover = false"
            >
                <img
                    ref="imageRef"
                    :src="editorHeader.imageSrc"
                    alt="Backgound Image"
                    class="w-full object-cover"
                    :style="{ objectPosition: `center ${isRepositioning ? newImagePosition : pageData.imagePosition}%` }"
                >
                <div
                    class="pointer-events-none absolute flex h-full w-full items-center justify-center transition"
                    :class="[
                        editorHeader.isUploadingImage ? 'bg-black/50' : 'bg-transparent',
                    ]"
                >
                    <template v-if="!editorHeader.isUploadingImage">
                        <div
                            class="relative flex h-full w-full max-w-3xl items-center justify-center"
                            :class="[(isRepositioning || isHover) ? 'opacity-100' : 'opacity-0']"
                        >
                            <div class="pointer-events-auto absolute right-0 top-0 mt-2">
                                <template v-if="!isRepositioning && !editorHeader.isUploadingImage">
                                    <UButtonGroup size="xs" orientation="horizontal">
                                        <UButton label="Change" color="gray" variant="solid" @click="editorHeader.fileDialog.open" />
                                        <UButton label="Remove" color="gray" variant="solid" @click="deleteBackgroundImage" />
                                        <UButton label="Reposition" color="gray" variant="solid" @click="isRepositioning = true" />
                                    </UButtonGroup>
                                </template>
                                <template v-else-if="isRepositioning">
                                    <UButtonGroup size="xs" orientation="horizontal">
                                        <UButton label="Save" color="gray" variant="solid" @click="saveReposition" />
                                        <UButton label="Cancel" color="gray" variant="solid" @click="isRepositioning = false" />
                                    </UButtonGroup>
                                </template>
                            </div>

                            <span v-if="isRepositioning" class="rounded-md bg-black px-3 py-1 text-xs font-normal text-white opacity-70">
                                Drag image to reposition
                            </span>
                        </div>
                    </template>
                    <template v-else>
                        <div class="flex items-center gap-2 text-white ">
                            <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
                            <span class="text-xs font-normal">Uploading Image</span>
                        </div>
                    </template>
                </div>
            </div>
        </template>
    </header>
</template>
