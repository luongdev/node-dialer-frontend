<template>
    <div class="flex flex-col items-center justify-center w-full h-screen">
        <input
            class="text-3xl mb-4 py-2 text-gray-700 text-center border-b border-gray-300 focus:outline-none focus:border-blue-500"
            placeholder="Enter a number" maxlength="15" v-model="inputStr" />
        <Numpad @keypress="onInput" />

        <button
            class="w-20 h-20 rounded-full text-xl flex items-center justify-center border-2 border-white bg-green-500 text-white active:bg-white active:text-green-500 active:border-green-500">
            Call
        </button>
    </div>
</template>

<script setup lang="ts">
import Numpad from '@renderer/components/keyboard/Numpad.vue';
import { ref } from 'vue';


const inputStr = ref('');
const onInput = (key: string) => {
    inputStr.value += key;

}

const makeCall = () => {

}
</script>
