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
            :is-disabled="!props.isEditable"
            @click-menu="$emit('focus')"
            @add="$emit('enter')"
            @delete="$emit('delete')"
            @change="(blockType: BlockType) => emit('turn', blockType)"
        />
        <!-- block body -->
        <div class="size-full py-1">
            <UDivider />
        </div>
    </div>
</template>
