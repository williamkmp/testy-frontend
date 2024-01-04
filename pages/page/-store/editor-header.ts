import { defineStore } from 'pinia';
import { usePageDataStore } from './page-data';
import type { ImageResponse } from '~/types';

/**
 * Derived coomponent store from page-data.ts
 */
export const useEditorHeaderStore = defineStore('EditorHeader', () => {
    // Dependency
    const pageData = usePageDataStore();
    const { path, privateApi } = useApi();

    // States
    const hasCoverImage = computed(() => pageData.imageId !== undefined);
    const imageSrc = computed(() => path.getImage(pageData.imageId));
    const hasIcon = computed(() => pageData.iconKey !== undefined);
    const isUploadingImage = ref(false);
    const fileDialog = useFileDialog({
        accept: 'image/*',
        multiple: false,
        directory: false,
    });

    // Actions
    function showEditorIcon() {
        const emojiKeys = Object.keys(EMOJI);
        const randomEmojiKey = emojiKeys[emojiKeys.length * Math.random() << 0];
        pageData.iconKey = randomEmojiKey;
    }

    fileDialog.onChange(async (files: FileList | null) => {
        if (files === null)
            return;
        isUploadingImage.value = true;
        const blob = files[0];
        if (blob) {
            const resizedBlob = await resizeImage(blob, 3500);
            const response: ImageResponse = await privateApi.postForm(path.image, {
                image: resizedBlob,
            });
            pageData.imageId = response.data.id;
        }
        isUploadingImage.value = false;
    });

    return {
        hasIcon,
        imageSrc,
        isUploadingImage,
        showEditorIcon,
        hasCoverImage,
        fileDialog,
    };
});
