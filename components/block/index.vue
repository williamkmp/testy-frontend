<script setup lang="ts">
import type { Block } from '~/types';

const props = defineProps<{ block: Block, index: number }>();
</script>

<template>
    <template v-if="props.block.type === 'paragraph'">
        <BlockParagraph :index="props.index" />
    </template>
</template>
