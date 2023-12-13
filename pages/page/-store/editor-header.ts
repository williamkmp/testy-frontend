import { defineStore } from 'pinia';

export const useEditorHeaderStore = defineStore('EditorPageEditorHeader', () => {
    const title = ref<string>();
    const iconKey = ref<string>();
    const coverImageSrc = ref<string>();
    const coverImagePosition = ref<number>(0);
    const hasCoverImage = computed(() => coverImageSrc.value !== undefined);
    const hasIcon = computed(() => iconKey.value !== undefined);

    function showEditorIcon() {
        const emojiKeys = Object.keys(EMOJI);
        const randomEmojiKeys = emojiKeys[emojiKeys.length * Math.random() << 0];
        iconKey.value = randomEmojiKeys;
    }

    return {
        iconKey,
        hasIcon,
        showEditorIcon,
        title,
        coverImageSrc,
        hasCoverImage,
        coverImagePosition,
    };
});
