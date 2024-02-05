<script lang="ts" setup>
import type { MenuItem } from '~/types';

const props = defineProps({
    level: { type: Number, default: 0 },
});
const menu = defineModel<MenuItem>({ required: true });

// Dependencies
const sideMenu = useSideMenuStore();

// States
const childRefs = ref<any[]>([]);
const isFetchingChildren = ref(true);
const pageTitle = computed(() => {
    const title = menu.value.type === 'COLLECTION'
        ? menu.value.title.replace(/<[^>]*>/g, '')
        : menu.value.title;
    if (title === undefined || title.trim() === '')
        return 'Untitled';
    return title;
});

function clickhandler() {
    if (menu.value.type === 'COLLECTION')
        return;
    const pagePath = `/page/${menu.value.id}`;
    navigateTo(pagePath);
}

async function toggleExpand() {
    menu.value.isOpen = !menu.value.isOpen;
    if (menu.value.isOpen === false)
        forceCloseChildren(menu.value);
    if (!menu.value.isChildrenFetched) {
        menu.value.isChildrenFetched = true;
        isFetchingChildren.value = true;

        if (props.level <= 1)
            menu.value.children = await sideMenu.fetchPreviewsOf(menu.value.type, menu.value.id);

        isFetchingChildren.value = false;
    }
}

function forceCloseChildren(page: MenuItem) {
    for (const item of page.children) {
        item.isOpen = false;
        forceCloseChildren(item);
    }
}
</script>

<template>
    <div>
        <div
            class="flex w-full shrink-0 select-none items-center justify-start rounded-md px-2.5 py-0.5 text-sm font-medium tracking-wide text-gray-600/60 focus:outline-none focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-75 dark:text-gray-400 "
            :class="[
                menu.type === 'PAGE'
                    ? 'hover:bg-white hover:text-gray-700 dark:hover:bg-gray-950/30 dark:hover:text-white'
                    : 'cursor-default',
            ]"
            :style="{ paddingLeft: `${props.level}rem` }"
        >
            <UButton icon="i-ep-arrow-right-bold" variant="ghost" color="gray" class="opacity-60 transition-transform" :class="[menu.isOpen ? 'rotate-90' : 'rotate-0']" size="2xs" @click="toggleExpand" />
            <button class="flex size-full items-center justify-start gap-2 pr-5" @click="clickhandler">
                <div class="grid size-4 shrink-0 place-items-center">
                    <EmojiIcon v-if="menu.iconKey !== undefined" :emoji-name="menu.iconKey" minified />
                    <UIcon v-else name="i-heroicons-document" />
                </div>
                <span class="truncate">{{ pageTitle }}</span>
            </button>
        </div>
        <div v-show="menu.isOpen" class="flex w-full flex-col gap-0.5">
            <template v-if="menu.children.length > 0 && !isFetchingChildren">
                <template
                    v-for="(item, index) in menu.children"
                    :key="item.id"
                >
                    <PreviewItem
                        :ref="childRefs[index]"
                        v-model="menu.children[index]"
                        :level="props.level + 1"
                    />
                </template>
            </template>
            <section
                v-else-if="menu.children.length === 0 && !isFetchingChildren"
                :style="{ paddingLeft: `${props.level + 1}rem` }"
                class="my-1 select-none text-xs font-medium text-gray-400 dark:text-gray-400"
            >
                <span>No Pages</span>
            </section>
            <div v-else class="w-full" :style="{ paddingLeft: `${props.level + 1.25}rem` }">
                <USkeleton class="h-5 w-full" />
            </div>
        </div>
    </div>
</template>
