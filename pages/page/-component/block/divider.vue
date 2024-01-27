<script setup lang="ts">
import BlockControl from './control/control.vue';
import type { BlockEmit, BlockProps, BlockType } from '~/types';

// Component Definition
const props = defineProps<BlockProps>();
const emit = defineEmits<BlockEmit>();
</script>

<template>
    <div class="group flex items-center justify-start gap-1">
        <BlockControl
            :is-focused="props.isFocused"
            @click-menu="$emit('focus')"
            @add="$emit('enter')"
            @change="(blockType: BlockType) => emit('turn', blockType)"
        />
        <!-- block body -->
        <div class="h-full w-full py-1">
            <UDivider />
        </div>
    </div>
</template>
