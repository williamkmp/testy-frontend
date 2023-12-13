<script setup lang="ts">
const emit = defineEmits<{
    remove: []
    choose: [emojiKey: string]
}>();

const searchText = ref('');
const debouncedText = refDebounced(searchText, 500);
const emojis = ref<any>([]);

watch(
    debouncedText,
    () => {
        const emojiList = Object.entries(EMOJI).map(e => e[1]);
        if (debouncedText.value.trim() === '')
            emojis.value = emojiList;
        else
            emojis.value = emojiList.filter(emoji => emoji.keyword.includes(debouncedText.value));
    },
    { immediate: true },
);

function chooseRandom() {
    const emojiKeys = Object.keys(EMOJI);
    const randomEmojiKeys = emojiKeys[emojiKeys.length * Math.random() << 0];
    emit('choose', randomEmojiKeys);
}
</script>

<template>
    <div class="flex h-full w-full flex-col gap-4">
        <header class="flex w-full items-center gap-2">
            <UInput
                v-model="searchText"
                class="w-full"
                color="gray"
                variant="outline"
                size="xs"
                placeholder="Fiter ..."
                icon="i-heroicons-magnifying-glass"
            />
            <UTooltip text="Random">
                <UButton
                    icon="i-heroicons-puzzle-piece"
                    color="gray"
                    variant="solid"
                    size="xs"
                    @click="chooseRandom"
                />
            </UTooltip>
            <UTooltip text="Remove">
                <UButton
                    icon="i-heroicons-x-circle"
                    color="red"
                    variant="soft"
                    size="xs"
                    @click="$emit('remove')"
                />
            </UTooltip>
        </header>
        <main class="flex h-min max-h-full w-full flex-wrap content-start items-start justify-evenly gap-1 overflow-y-auto overflow-x-hidden">
            <div
                v-for="emoji in emojis"
                :key="emoji.key"
                class="h-9 w-9 rounded p-1 hover:bg-gray-900/10 dark:hover:bg-gray-200/10"
                @click="$emit('choose', emoji.key)"
            >
                <EmojiIcon :emoji-name="emoji.key" minified />
            </div>
        </main>
    </div>
</template>
