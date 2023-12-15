import { defineStore } from 'pinia';
import { usePageDataStore } from './page-data';

/**
 * Derived coomponent store from page-data.ts
 */
export const useEditorHeaderStore = defineStore('EditorHeader', () => {
    // Dependency
    const pageData = usePageDataStore();

    // States
    const hasCoverImage = computed(() => pageData.imageSrc !== undefined);
    const hasIcon = computed(() => pageData.iconKey !== undefined);

    // Actions
    function showEditorIcon() {
        const emojiKeys = Object.keys(EMOJI);
        const randomEmojiKey = emojiKeys[emojiKeys.length * Math.random() << 0];
        pageData.iconKey = randomEmojiKey;
    }

    return {
        hasIcon,
        showEditorIcon,
        hasCoverImage,
    };
});
