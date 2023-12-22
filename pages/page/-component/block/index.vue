<script setup lang="ts">
import Paragraph from './paragraph.vue';
import type { Block } from '~/types';

const props = defineProps<{ block: Block, index: number }>();
</script>

<template>
    <template v-if="props.block.type === 'paragraph'">
        <Paragraph :index="props.index" />
    </template>
</template>
