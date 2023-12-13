<script lang="ts" setup>
import { useEditorHeaderStore } from '../-store/editor-header';

const editorHeader = useEditorHeaderStore();

// States & Refs
const imageRef = ref<HTMLImageElement>();
const containerRef = ref<HTMLDivElement>();
const mouse = useMouse();
const isHover = ref(false);
const isRepositioning = ref(false);
const isDragging = ref(false);

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
        let newPosition = editorHeader.coverImagePosition;
        newPosition = (delta >= 0)
            ? newPosition += 1
            : newPosition -= 1;
        editorHeader.coverImagePosition = clampNumber(0, newPosition, 100);
    }
});

watch(isRepositioning, () => {
    if (isRepositioning.value) {
        containerRef.value!.style.cursor = 'ns-resize';
    }
    else {
        containerRef.value!.style.cursor = 'default';
        isDragging.value = false;
    }
});

// Actions
function saveReposition() {
    isRepositioning.value = false;
}
</script>

<template>
    <header ref="containerRef" class="mb-2 flex min-h-[5rem] w-full flex-col overflow-hidden">
        <template v-if="editorHeader.hasCoverImage">
            <div class="relative flex h-60 w-full justify-center overflow-hidden bg-gray-200 dark:bg-gray-700" @mouseenter="isHover = true" @mouseleave="isHover = false">
                <img ref="imageRef" :src="editorHeader.coverImageSrc" alt="Backgound Image" class="w-full object-cover" :style="{ objectPosition: `center ${editorHeader.coverImagePosition}%` }">
                <div class="pointer-events-none absolute flex h-full w-full max-w-3xl items-center justify-center transition-opacity" :class="[(isRepositioning || isHover) ? 'opacity-100' : 'opacity-0']">
                    <div class="pointer-events-auto absolute right-0 top-0 mt-2">
                        <template v-if="!isRepositioning">
                            <UButtonGroup size="xs" orientation="horizontal">
                                <UButton label="Change" color="gray" variant="solid" />
                                <UButton label="Remove" color="gray" variant="solid" @click="editorHeader.coverImageSrc = undefined" />
                                <UButton label="Reposition" color="gray" variant="solid" @click="isRepositioning = true" />
                            </UButtonGroup>
                        </template>
                        <template v-else>
                            <UButton label="Save" color="gray" variant="solid" size="xs" @click="saveReposition" />
                        </template>
                    </div>

                    <span v-if="isRepositioning" class="rounded-md bg-black px-3 py-1 text-xs font-normal text-white opacity-70">
                        Drag image to reposition
                    </span>
                </div>
            </div>
        </template>
    </header>
</template>
