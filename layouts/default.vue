<script setup lang="ts">
const sideMenu = useSideMenuStore();

// Feature: side menu open on press shortcut
defineShortcuts({
    'meta_\\': {
        usingInput: true,
        handler: () => sideMenu.isOpen = !sideMenu.isOpen,
    },
});

// Feature: Side menu resize
const resizeHandle = ref<HTMLDivElement>();
const sideMenuPanel = ref();
const mouse = useMouse();
const isResizing = ref(false);

useEventListener(window, 'mouseup', () => isResizing.value = false);
useEventListener(window, 'blur', () => isResizing.value = false);
useEventListener(resizeHandle, 'mousedown', (e) => {
    e.preventDefault();
    if (sideMenu.isOpen)
        isResizing.value = true;
});

watch([isResizing, mouse.x], () => {
    // Is Resizing
    if (isResizing.value && sideMenuPanel.value?.aside != null && sideMenu.isOpen) {
        sideMenuPanel.value.aside.style.transitionProperty = 'none';
        document.getElementsByTagName('body').item(0)!.style.cursor = 'col-resize';

        const maximumPanelWidth = Number.parseInt(getComputedStyle(sideMenuPanel.value.aside).maxWidth);
        const minimumPanelWidth = Number.parseInt(getComputedStyle(sideMenuPanel.value.aside).minWidth);
        const sidePanelWidth = mouse.x.value - sideMenuPanel.value.aside.getBoundingClientRect().left;

        if (sidePanelWidth >= maximumPanelWidth)
            sideMenuPanel.value.aside.style.width = `${maximumPanelWidth}px`;
        else if (minimumPanelWidth < sidePanelWidth && sidePanelWidth < maximumPanelWidth)
            sideMenuPanel.value.aside.style.width = `${sidePanelWidth}px`;
        else
            sideMenuPanel.value.aside.style.width = `${minimumPanelWidth}px`;
        sideMenu.size = sideMenuPanel.value.aside.style.width;
    }
    // Is Not Resizing
    else if (!isResizing.value && sideMenuPanel.value?.aside != null) {
        sideMenuPanel.value.aside.style.transitionProperty = 'all';
        document.getElementsByTagName('body').item(0)!.style.cursor = 'default';
    }
});
</script>

<template>
    <div class="flex h-screen w-screen">
        <AppAside ref="sideMenuPanel" />

        <!-- Resize Handle -->
        <div
            v-show="sideMenu.isOpen"
            ref="resizeHandle"
            class="w-1 bg-gray-100 hover:cursor-col-resize hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-500"
        />

        <section class="flex h-full grow flex-col">
            <AppHeader />
            <div data-role="page-container" class="relative flex grow items-start justify-start overflow-y-auto overflow-x-hidden">
                <slot />
            </div>
        </section>
    </div>
    <UNotifications />
</template>
