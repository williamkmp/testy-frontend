import { defineStore } from 'pinia';
import { usePageDataStore } from './page-data';

/**
 * Derived coomponent store from page-data.ts
 */
export const useEditorHeaderStore = defineStore('EditorHeader', () => {
    // Dependency
    const pageData = usePageDataStore();
    const { path } = useApi();

    // States
    const hasCoverImage = computed(() => pageData.imageId !== undefined);
    const imageSrc = computed(() => path.getImage(pageData.imageId));
    const hasIcon = computed(() => pageData.iconKey !== undefined);

    // Actions
    function showEditorIcon() {
        const emojiKeys = Object.keys(EMOJI);
        const randomEmojiKey = emojiKeys[emojiKeys.length * Math.random() << 0];
        pageData.iconKey = randomEmojiKey;
    }

    return {
        hasIcon,
        imageSrc,
        showEditorIcon,
        hasCoverImage,
    };
});
