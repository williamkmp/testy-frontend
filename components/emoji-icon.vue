<script lang="ts" setup>
const props = defineProps({
    emojiName: { default: 'emoji-1241', type: String, required: false },
    minified: { default: true, type: Boolean, required: false },
});

const isFallback = ref(props.minified);
const emoji = computed(() => {
    const keys = Object.keys(EMOJI);
    const emojiCode = keys.includes(props.emojiName) ? props.emojiName as string : 'emoji-1241' as string;
    return EMOJI[emojiCode];
});
</script>

<template>
    <div class="relative aspect-square size-full">
        <img v-if="!props.minified" class="size-full" :class="{ hidden: isFallback }" :src="emoji.image" @error="isFallback = true">
        <div v-if="isFallback || props.minified" class="absolute size-full" :style="{ background: emoji.background }" />
    </div>
</template>
