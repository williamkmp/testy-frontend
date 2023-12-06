<script setup lang="ts">
const props = defineProps({
    form: {
        required: true,
        type: Object,
    },
});
const buttonRef = ref<HTMLButtonElement>();
onMounted(() => {
    // eslint-disable-next-line vue/no-mutating-props
    props.form.submit.value = () => {
        buttonRef.value!.click();
    };
});
</script>

<template>
    <UForm
        :ref="props.form.ref"
        :state="props.form.state"
        :schema="props.form.schema"
        :validate-on="['submit']"
        @submit="props.form.submitEvent"
    >
        <!-- hiddenbtn -->
        <button ref="buttonRef" type="submit" class="hidden" />
        <!-- hiddenbtn -->
        <slot />
    </UForm>
</template>
