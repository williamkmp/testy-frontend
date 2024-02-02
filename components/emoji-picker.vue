<script setup lang="ts">
import type { EmojiDefinition } from '~/utils/emoji';

const props = defineProps({
    removeable: { type: Boolean, default: false },
    randomable: { type: Boolean, default: false },
    searchable: { type: Boolean, default: false },
});

const emit = defineEmits<{
    remove: [];
    choose: [emojiKey: string];
}>();

const isLoading = ref(true);
const emojiDefinitionList = ref<EmojiDefinition[]>([]);
const emojiList = ref<EmojiDefinition[]>([]);
const searchText = ref('');
const debouncedText = refDebounced(searchText, 500);

watchImmediate(
    [debouncedText, emojiDefinitionList],
    () => emojiList.value = (debouncedText.value.trim() === '')
        ? emojiDefinitionList.value
        : emojiDefinitionList.value.filter(emoji => emoji.keyword.includes(debouncedText.value.toLocaleLowerCase()))
    ,
);

function initEmoji() {
    return new Promise<void>((resolve) => {
        isLoading.value = true;
        setTimeout(() => {
            emojiDefinitionList.value = Object.entries(EMOJI).map(entry => entry[1]);
            isLoading.value = false;
            resolve();
        }, 300);
    });
}

onMounted(async () => {
    await initEmoji();
});

function chooseRandom() {
    const emojiKeys = Object.keys(EMOJI);
    const randomEmojiKeys = emojiKeys[emojiKeys.length * Math.random() << 0];
    emit('choose', randomEmojiKeys);
}
</script>

<template>
    <div class="flex size-full flex-col gap-4">
        <header class="flex w-full items-center gap-2">
            <UInput
                v-model="searchText" placeholder="Fiter ..." size="xs" variant="outline" color="gray" class="w-full"
                icon="i-heroicons-magnifying-glass" :disabled="isLoading"
            />
            <UTooltip v-if="props.randomable" text="Random">
                <UButton
                    icon="i-heroicons-puzzle-piece" color="gray" variant="solid" size="xs" :disabled="isLoading"
                    @click="chooseRandom"
                />
            </UTooltip>
            <UTooltip v-if="props.removeable" text="Remove">
                <UButton
                    icon="i-heroicons-x-circle" color="red" variant="soft" size="xs" :disabled="isLoading"
                    @click="$emit('remove')"
                />
            </UTooltip>
        </header>
        <main class="size-full max-h-full overflow-auto pr-1">
            <template v-if="!isLoading">
                <div class="grid w-full grid-cols-[repeat(auto-fill,minmax(36px,1fr))] gap-1">
                    <div
                        v-for="emoji in emojiList" :key="emoji.key"
                        class="size-9 rounded p-1 hover:bg-gray-900/10 dark:hover:bg-gray-200/10"
                        @click="$emit('choose', emoji.key)"
                    >
                        <EmojiIcon :emoji-name="emoji.key" minified />
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="flex size-full items-center justify-center">
                    <UIcon name="i-heroicons-arrow-path" class="animate-spin text-gray-500" />
                </div>
            </template>
        </main>
    </div>
</template>
