<script lang="ts" setup>
const props = withDefaults(defineProps<
    {
        emojiName?: string
        minified: boolean
    }
>(), {
    emojiName: 'emoji-1241',
    minified: false,
});

const isFallback = ref(props.minified);
const emoji = computed(() => {
    const keys = Object.keys(EMOJI);
    const emojiCode = keys.includes(props.emojiName) ? props.emojiName as string : 'emoji-1241' as string;
    return EMOJI[emojiCode];
});
</script>

<template>
    <div class="relative aspect-square h-full w-full">
        <img v-if="!props.minified" class="h-full w-full" :class="{ hidden: isFallback }" :src="emoji.image" @error="isFallback = true">
        <div v-if="isFallback || props.minified" class="absolute h-full w-full" :style="{ background: emoji.background }" />
    </div>
</template>
