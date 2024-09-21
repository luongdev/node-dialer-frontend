<script setup lang="ts">
import DropdownUser from './DropdownUser.vue'
import DropdownStatus from "./DropdownStatus.vue";
import Pinger from './Pinger.vue';

</script>

<template>
    <header class="sticky top-0 z-999 flex w-full bg-gray-100">
        <div class="flex flex-grow items-center justify-between py-4 px-4 shadow-2 md:px-6 2xl:px-11">
            <div class="flex items-center gap-2 sm:gap-5 w-full">
                <DropdownStatus />
            </div>
            <div class="w-full flex justify-center">
                <Pinger 
                :interval="10000"
                :time="200"
                :url="'https://google.com'"
            />
            </div>
            <div class="flex items-center gap-3 2xsm:gap-7 w-full">
                <!-- User Area -->
                <DropdownUser />
                <!-- User Area -->
            </div>
        </div>
    </header>
</template>