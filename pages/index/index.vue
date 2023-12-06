<script setup lang="ts">
const tree = usePagesTreeStore();
</script>

<template>
    <div class="flex h-full w-full flex-col items-center justify-start gap-4 py-4">
        <div class="rounded-md bg-gray-200 p-4 text-xs dark:bg-gray-800">
            <pre>{{ JSON.stringify(tree.pages, null, 4) }}</pre>
        </div>
    </div>
</template>
