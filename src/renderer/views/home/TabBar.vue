<template>
    <div class="bg-gray-50 h-screen w-20 flex flex-col items-center justify-center py-4">
        <button @click="changeTab('tab1', $event)"
            :class="activeTab === 'tab1' ? 'border border-black' : ''"
            class="w-16 h-40 my-1 text-4xl flex items-center justify-center rounded-lg bg-green-400 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-6 h-6 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
            </svg>
        </button>

        <button @click="changeTab('tab2', $event)"
            :class="activeTab === 'tab2' ? 'border border-black' : ''"
            class="w-16 h-40 my-1 text-4xl flex items-center justify-center rounded-lg bg-green-400 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-6 h-6 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
            </svg>
        </button>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = defineProps(['onTabClick']);
const activeTab = ref('tab1');

watch(() => activeTab, (v) => console.log(v));

const changeTab = (key: string, event: any) => {
    activeTab.value = key;
    return props.onTabClick(key, event);
}

</script>
