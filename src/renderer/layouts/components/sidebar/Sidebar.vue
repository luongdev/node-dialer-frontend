<template>
    <!-- <div class="flex items-center justify-center h-screen border border-gray-100">
        <a-tabs v-model="activeTab" tab-position="left" class="">
            <a-tab-pane key="tab1" class="my-4">
                <template #tab>
                    <div class="h-16 flex justify-center items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 
                                2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 
                                1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 
                                3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                        </svg>
                    </div>
                </template>
            </a-tab-pane>
            <a-tab-pane key="tab2" class="my-4">
                <template #tab>
                    <div class="h-16 flex justify-center items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>

                    </div>
                </template>
            </a-tab-pane>
        </a-tabs>
    </div> -->
</template>

<script>
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: 'TabView',
    setup() {
        const activeTab = ref('tab1');

        const tabClass = (key) => {
            return activeTab.value === key ? 'bg-green-500 text-white' : 'bg-white text-black';
        };

        return { activeTab, tabClass };
    },
});
</script>

<style scoped></style>