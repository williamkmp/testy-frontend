import { defineStore } from 'pinia';

export const useEditorHeaderStore = defineStore('EditorPageEditorHeader', () => {
    // Dependency
    const title = ref<string>();

    const coverImageSrc = ref<string>();
    const coverImagePosition = ref<number>(0);
    const hasCoverImage = computed(() => coverImageSrc.value !== undefined);

    return {
        title,
        coverImageSrc,
        hasCoverImage,
        coverImagePosition,
    };
});
