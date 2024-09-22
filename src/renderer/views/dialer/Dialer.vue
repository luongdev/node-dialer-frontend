<template>
    <!-- <DefaultLayout> -->
    <div class="flex flex-col items-center justify-center w-full h-screen">
        <div class="relative mb-6 max-w-[50%]">
            <a-input id="dialer-input-center" size="large" v-model:value="inputStr" class="text-3xl mb-4"
                :maxlength="maxLength">
                <template #suffix>
                    <a-button type="text" size="large" @click="removeLastNum">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="size-4">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                    </a-button>
                </template>
            </a-input>
        </div>

        <Numpad @keypress="onInput" />

        <button @click="makeCall" class="
                w-20 h-20 rounded-full text-xl mt-6
                flex items-center justify-center border-2 border-white 
                bg-green-500 text-white active:bg-white active:text-green-500 active:border-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 
                    2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 
                    1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 
                    3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            </svg>


        </button>
    </div>
    <!-- </DefaultLayout> -->
</template>

<script setup lang="ts">
const maxLength = 12;

import Numpad from '@renderer/components/keyboard/Numpad.vue';
import { ref } from 'vue';
import { useWebRTCAgent } from '@store/agent/webrtc-agent';
import DefaultLayout from '@renderer/layouts/DefaultLayout.vue';

const wrtcAgent = useWebRTCAgent();
const inputStr = ref('');

const onInput = (key: string) => {
    if (inputStr.value.length < 12) inputStr.value += key;
}

const removeLastNum = () => {
    if (inputStr.value.length > 0) inputStr.value = inputStr.value.slice(0, -1)
}

const makeCall = () => {
    wrtcAgent.call(inputStr.value)
}
</script>

<style scoped>
:global(#dialer-input-center) {
    text-align: center;
}
</style>