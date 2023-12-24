<script setup lang="ts">
import Paragraph from './paragraph.vue';
import Heading from './heading.vue';
import type { Block } from '~/types';

defineProps<{ block: Block, index: number }>();
</script>

<template>
    <template v-if="block.type === 'PARAGRAPH'">
        <Paragraph :index="index" />
    </template>
    <template v-else-if="['HEADING_1', 'HEADING_2', 'HEADING_3'].includes(block.type)">
        <Heading :index="index" />
    </template>
</template>
