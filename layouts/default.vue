<script setup lang="ts">
const app = useAppStore();

const resizeHandle = ref<HTMLDivElement>();
const sidePanel = ref();
const mouse = useMouse();
const isResizing = ref(false);

// Feature: side menu open on press shortcut
const pressedKey = useMagicKeys();
const ctrl_backslash = pressedKey['Ctrl+backslash'];
whenever(ctrl_backslash, () => app.isMenuOpen = !app.isMenuOpen);

// Feature: Side menu resize
useEventListener(resizeHandle, 'mousedown', (e) => {
    e.preventDefault();
    if (app.isMenuOpen)
        isResizing.value = true;
});
useEventListener(window, 'mouseup', () => isResizing.value = false);
useEventListener(window, 'blur', () => isResizing.value = false);
watch([isResizing, mouse.x], () => {
    if (isResizing.value && sidePanel.value.aside && app.isMenuOpen) {
        sidePanel.value.aside.style.transitionProperty = 'none';
        document.getElementsByTagName('body').item(0)!.style.cursor = 'col-resize';

        const maximumPanelWidth = Number.parseInt(getComputedStyle(sidePanel.value.aside).maxWidth);
        const minimumPanelWidth = Number.parseInt(getComputedStyle(sidePanel.value.aside).minWidth);
        const sidePanelWidth = mouse.x.value - sidePanel.value.aside.getBoundingClientRect().left;

        if (sidePanelWidth >= maximumPanelWidth)
            sidePanel.value.aside.style.width = `${maximumPanelWidth}px`;
        else if (minimumPanelWidth < sidePanelWidth && sidePanelWidth < maximumPanelWidth)
            sidePanel.value.aside.style.width = `${sidePanelWidth}px`;
        else
            sidePanel.value.aside.style.width = `${minimumPanelWidth}px`;
        app.sideMenuSize = sidePanel.value.aside.style.width;
    }
    else {
        sidePanel.value.aside.style.transitionProperty = 'all';
        document.getElementsByTagName('body').item(0)!.style.cursor = 'default';
    }
});
</script>

<template>
    <div class="flex h-screen w-screen">
        <AppAside ref="sidePanel" />
        <div v-show="app.isMenuOpen" ref="resizeHandle" class="w-1 bg-gray-100 hover:cursor-col-resize hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-500" />
        <section class="flex h-full grow flex-col">
            <AppHeader />
            <div data-role="page-container" class="relative flex w-full grow items-start justify-start overflow-y-auto overflow-x-hidden">
                <slot />
            </div>
        </section>
        <UNotifications />
    </div>
</template>
