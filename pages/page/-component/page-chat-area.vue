<script setup lang="ts">
import { useChatModalStore } from '../-store/chat-modal';

const chatModal = useChatModalStore();
</script>

<template>
    <USlideover v-model="chatModal.isOpen">
        <!-- TODO: impelement chat area -->
    </USlideover>
</template>
