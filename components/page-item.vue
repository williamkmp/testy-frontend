<script lang="ts" setup>
import type { PagePreview } from '~/types';

const props = defineProps({
    level: { type: Number, default: 0 },
});
const page = defineModel<PagePreview>({ required: true });
const sleep = useSleep();
const app = useAppStore();

// States
const childRefs = ref<any[]>([]);
const isFetchingChildren = ref(true);

async function clickhandler() {
    // eslint-disable-next-line no-console
    console.log(`clicked ${page.value.title}`);
}

async function toggleExpand() {
    page.value.isOpen = !page.value.isOpen;
    if (page.value.isOpen === false)
        forceCloseChildren(page.value);
    if (!page.value.isChildrenFetched) {
        page.value.isChildrenFetched = true;
        isFetchingChildren.value = true;
        if (props.level <= 1) {
            const response = await sleep.for(3000, [
                {
                    id: `page-${app.getId()}`,
                    title: `Child 1 of ${page.value.title}`,
                },
                {
                    id: `page-${app.getId()}`,
                    title: `Child 2 of ${page.value.title}`,
                },
            ]);
            for (const data of response!) {
                page.value.children.push({
                    id: data.id,
                    title: data.title,
                    children: [],
                    isChildrenFetched: false,
                    isOpen: false,
                });
            }
        }
        else {
            await sleep.for(3000);
        }
        isFetchingChildren.value = false;
    }
}

function forceCloseChildren(page: PagePreview) {
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
        class="flex w-full shrink-0 select-none items-center justify-start rounded-md px-2.5 text-xs font-medium text-gray-700 hover:bg-white hover:text-gray-900 focus:outline-none focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-75 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
        :style="{ paddingLeft: `${props.level}rem` }"
    >
        <UButton :icon="buttonIcon" variant="ghost" color="gray" size="2xs" @click="toggleExpand" />
        <button class="flex h-full w-full items-center justify-start pl-1 pr-6" @click="clickhandler">
            <span class="truncate font-medium">{{ page.title }}</span>
        </button>
    </div>
    <div v-show="page.isOpen" class="w-full">
        <secion v-if="page.children.length > 0 && !isFetchingChildren" class="flex w-full flex-col">
            <div
                v-for="(item, index) in page.children"
                :key="item.id"
                class="w-full"
            >
                <PageItem
                    :ref="childRefs[index]"
                    v-model="page.children[index]"
                    :level="props.level + 1"
                />
            </div>
        </secion>
        <section
            v-else-if="page.children.length === 0 && !isFetchingChildren"
            :style="{ paddingLeft: `${props.level + 2}rem` }"
            class="my-1 select-none text-xs font-medium text-gray-400 dark:text-gray-400"
        >
            <span>No Pages</span>
        </section>
    </div>
</template>
