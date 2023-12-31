import { plugin as VueSlickSort } from 'vue-slicksort';

/**
 * plugin registration for vue-slicksort.js
 *
 * @link https://github.com/Jexordexan/vue-slicksort
 */
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(VueSlickSort);
});
