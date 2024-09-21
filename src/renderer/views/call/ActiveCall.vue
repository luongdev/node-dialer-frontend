<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <a-card class="w-full bg-white overflow-hidden h-screen flex flex-col justify-center items-center">
      <div class="flex justify-center mt-4">
        <a-avatar size={80} src="https://randomuser.me/api/portraits/men/75.jpg"/>
      </div>
      <div class="text-center mt-6">
        <p class="text-2xl ">{{ call.from }}</p>
        <p class="text-lg text-gray-500 mt-2">{{ call.to }}</p>
      </div>

      <div class="text-center mt-4">
        <p class="text-xl text-green-400 font-bold">{{ duration }}</p>
      </div>

      <div class="flex justify-center w-full px-6 mt-10">
        <a-button danger type="primary" size="large" @click="callHangup">
          Hangup
        </a-button>
      </div>

      <div class="flex justify-around w-full px-6 mt-8">
        <a-button type="default" size="large" class="bg-gray-200 hover:bg-gray-300 text-gray-600 text-lg p-2 mx-1">
          Mute
        </a-button>
        <a-button type="default" size="large" class="bg-gray-200 hover:bg-gray-300 text-gray-600 text-lg p-2 mx-1">
          Mute
        </a-button>
        <a-button type="default" size="large" class="bg-gray-200 hover:bg-gray-300 text-gray-600 text-lg p-2 mx-1">
          Mute
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import {defineProps, onMounted, watch} from "vue";
import {useDuration} from "@renderer/utils/reusable/duration";
import {useCallStore} from "@store/call/call";

import router from '@renderer/router';


const {startTime} = defineProps({
  startTime: {type: Number, default: () => Date.now()},
})

const {duration, start} = useDuration(startTime);
onMounted(() => start())


const call = useCallStore();
watch(() => call.status, (status: string) => {
  console.log('Call status changed to: ', status);
  if ('TERMINATED' === status) {
    router.push('/');
  }
})

const callHangup = () => {
  call.terminate();
}


</script>
