<template>
    <header class="sticky top-0 z-999 flex w-full bg-gray-100">
        <div class="flex flex-grow items-center justify-between py-4 px-4 shadow-2 md:px-6 2xl:px-11">
            <div v-if="false" class="flex items-center gap-2 sm:gap-5 w-full">
                <DropdownStatus />
            </div>
            <div class="w-full flex justify-center">
                <Pinger v-if="ping" :interval="5000" :time="100" :url="pingUrl" />
            </div>
            <div class="flex items-center gap-3 2xsm:gap-7 w-full">
                <!-- User Area -->
                <DropdownUser />
                <!-- User Area -->
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import DropdownUser from './DropdownUser.vue'
import DropdownStatus from "./DropdownStatus.vue";
import Pinger from './Pinger.vue';
import { useUserStore } from '@renderer/store/modules/auth/user';

const user = useUserStore();
const ping = ref(true);

const pingUrl = ref(`${user.tls ? 'https' : 'http'}://${user.gateway}`);
watch(() => user.gateway, (val) => {
    if (val) {
        pingUrl.value = `${user.tls ? 'https' : 'http'}://${user.gateway}`;
        ping.value = true;
    } else {
        ping.value = false;
    }
    
})

</script>