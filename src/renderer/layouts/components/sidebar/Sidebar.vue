<template>
    <!-- Sidebar (Tabs) -->
    <!-- <div class="bg-black h-screen w-20 flex flex-col items-center justify-center py-4 space-y-4">
        <div :class="[
            'w-12 h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all',
            activeTab === 1 ? 'bg-green-700' : 'bg-green-500 hover:bg-green-600'
        ]" @click="setActiveTab(1)">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-6 h-6 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
            </svg>
        </div>

        <div :class="[
            'w-12 h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all',
            activeTab === 2 ? 'bg-green-700' : 'bg-green-500 hover:bg-green-600'
        ]" @click="setActiveTab(2)">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-6 h-6 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
            </svg>
        </div>
    </div> -->
</template>

<script>
export default {
    data() {
        return {
            activeTab: 1, // Tab mặc định là 1
        };
    },
    methods: {
        setActiveTab(tabNumber) {
            this.activeTab = tabNumber;
        },
    },
};
</script>

<style scoped>
/* Thêm CSS nếu cần thiết */
</style>