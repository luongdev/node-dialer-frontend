<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <a-card
        class="w-full bg-white shadow-lg rounded-lg overflow-hidden h-screen flex flex-col justify-center items-center">
      <div class="flex justify-center mt-4">
        <a-avatar size={80} src="https://randomuser.me/api/portraits/men/75.jpg"/>
      </div>
      <div class="text-center mt-6">
        <p class="text-2xl">{{  call.to  }}</p>
        <p class="text-lg text-gray-500 mt-2">{{  call.from  }}</p>
      </div>
      <div class="text-center mt-4">
        <p v-if="endTimer" class="text-xl text-gray-700 font-bold">{{ duration }}</p>
      </div>
      <div class="text-center mt-4">
        <p class="text-xl text-gray-700 font-bold">{{ callStatusLabel }}</p>
      </div>

      <!-- Nút Cancel -->
      <div class="flex justify-center w-full px-6 mt-10">
        <a-button danger size="large" type="primary" class="" @click="terminateCall">
          Cancel
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { useCallStore } from '@renderer/store/modules/call/call';
import {computed, ref, watch} from 'vue';

import { useDuration } from '@renderer/utils/reusable/duration';
import router from '@renderer/router';

const endTimer = ref(false);
const { duration, start } = useDuration();

const call = useCallStore();

const terminateCall = () => {
  let code = 200;
  let phrase = 'NORMAL_CLEARING';
  if ('ANSWERED' !== call.callStatus) {
    code = 487;
    phrase = 'ORIGINATOR_CANCEL';
  }

  call.terminate(code, phrase);

  router.push('/')
}

watch(() => call.callStatus, (callStatus: string) => {
  if ('TERMINATED' === callStatus) {
    endTimer.value = true;
    start(Date.now());
  }
})

const callStatusLabel = computed(() => {
  console.log('Day la call status label:', call.callStatus)
  switch (call.callStatus) {
    case 'NEW':
      return 'Đang khởi tạo';
    case 'RINGING':
      return 'Đang đổ chuông';
    case 'ANSWERED':
      return 'Đã kết nối';
    case 'TERMINATED':
      return 'Đã kết thúc';
    default:
      return 'Đang kết nối';
  }
})
</script>

