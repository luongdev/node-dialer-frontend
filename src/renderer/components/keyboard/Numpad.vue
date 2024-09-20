<template>
    <div class="flex justify-center items-center w-full m-4">
        <div class="grid grid-cols-3 gap-2">
            <a-button 
                v-for="key in keys" :key="'Numpad-btn-' + key"
                @click="keypressEmitter('keypress', key)"
                class="w-16 h-16 text-2xl bg-white shadow-lg rounded-xl">
                {{ key }}
            </a-button>
        </div>
    </div>
</template>

<script setup lang="ts">
const keypressEmitter = defineEmits(['keypress'])

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
</script>
