import { defineStore } from 'pinia';
import { usePageDataStore } from './page-data';
import type { ImageResponse } from '~/types';

export const useEditorHeaderStore = defineStore('EditorHeader', () => {
    // Dependency
    const pageData = usePageDataStore();
    const path = useApiPath();
    const privateApi = usePrivateApi();
    const notif = useNotification();

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
    async function showEditorIcon() {
        const emojiKeys = Object.keys(EMOJI);
        const randomEmojiKey = emojiKeys[emojiKeys.length * Math.random() << 0];
        await pageData.updatePageData({
            iconKey: randomEmojiKey,
        });
    }

    fileDialog.onChange(async (files: FileList | null) => {
        if (files === null)
            return;
        const blob = files[0];
        if (!blob.type.startsWith('image/') || blob.type.endsWith('svg')) {
            notif.error({
                title: 'Upload Failed',
                message: 'Image file type not supported',
            });
            return;
        }
        isUploadingImage.value = true;
        if (blob) {
            const resizedBlob = await resizeImage(blob, 3500);
            const response: ImageResponse = await privateApi.postForm(path.image, {
                image: resizedBlob,
            });
            await pageData.updatePageData({
                imageId: response.data.id,
            });
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
