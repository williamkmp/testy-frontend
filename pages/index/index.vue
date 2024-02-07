<script setup lang="ts">
const app = useAppStore();
const route = useRoute();

app.headerTitle = undefined;
app.emojiKey = undefined;

if (route.query.refresh) {
    await navigateTo('/');
    location.reload();
}
</script>

<template>
    <div class="flex size-full flex-col items-center justify-start gap-4 py-4" />
</template>
