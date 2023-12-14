<script lang="ts" setup>
import type { MenuItem } from '~/types';

const props = defineProps({
    level: { type: Number, default: 0 },
});
const page = defineModel<MenuItem>({ required: true });

// Dependencies
const sideMenu = useSideMenuStore();
const sleep = useSleep();

// States
const childRefs = ref<any[]>([]);
const isFetchingChildren = ref(true);

async function clickhandler() {
    // eslint-disable-next-line no-console
    console.log(`clicked ${page.value.title}`);
    return await navigateTo(encodeURI(`/page/${page.value.id}`));
}

async function toggleExpand() {
    page.value.isOpen = !page.value.isOpen;
    if (page.value.isOpen === false)
        forceCloseChildren(page.value);
    if (!page.value.isChildrenFetched) {
        page.value.isChildrenFetched = true;
        isFetchingChildren.value = true;

        if (props.level <= 1)
            page.value.children = await sideMenu.fetchPages(page.value.id);
        else
            await sleep.for(1000);

        isFetchingChildren.value = false;
    }
}

function forceCloseChildren(page: MenuItem) {
    for (const item of page.children) {
        item.isOpen = false;
        forceCloseChildren(item);
    }
}

const buttonIcon = computed(() => page.value.isOpen
    ? 'i-heroicons-chevron-down'
    : 'i-heroicons-chevron-right',
);
</script>

<template>
    <div
        class="flex w-full shrink-0 select-none items-center justify-start rounded-md px-2.5 py-0.5 text-sm font-medium tracking-wide text-gray-600/60 hover:bg-white hover:text-gray-700 focus:outline-none focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-75 dark:text-gray-400 dark:hover:bg-gray-950/30 dark:hover:text-white"
        :style="{ paddingLeft: `${props.level}rem` }"
    >
        <UButton :icon="buttonIcon" variant="ghost" color="gray" class="opacity-70" size="2xs" @click="toggleExpand" />
        <button class="flex h-full w-full items-center justify-start gap-2 pr-5" @click="clickhandler">
            <div class="grid h-4 w-4 shrink-0 place-items-center">
                <EmojiIcon v-if="page.iconKey !== undefined" :emoji-name="page.iconKey" minified />
                <UIcon v-else name="i-heroicons-document" />
            </div>
            <span class="truncate">{{ page.title }}</span>
        </button>
    </div>
    <div v-show="page.isOpen" class="flex w-full flex-col gap-0.5">
        <template v-if="page.children.length > 0 && !isFetchingChildren">
            <template
                v-for="(item, index) in page.children"
                :key="item.id"
            >
                <PageItem
                    :ref="childRefs[index]"
                    v-model="page.children[index]"
                    :level="props.level + 1"
                />
            </template>
        </template>
        <section
            v-else-if="page.children.length === 0 && !isFetchingChildren"
            :style="{ paddingLeft: `${props.level + 1.25}rem` }"
            class="my-1 select-none text-xs text-gray-400 dark:text-gray-400"
        >
            <span>No Pages</span>
        </section>
        <div v-else class="w-full" :style="{ paddingLeft: `${props.level + 1.25}rem` }">
            <USkeleton class="h-5 w-full" />
        </div>
    </div>
</template>
