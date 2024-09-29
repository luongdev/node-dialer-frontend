<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <a-card
      class="w-full bg-white shadow-lg rounded-lg overflow-hidden h-screen flex flex-col justify-center items-center">
<!--      <div class="flex justify-center mt-4">-->
<!--        <a-avatar size={80} src="https://randomuser.me/api/portraits/men/75.jpg" />-->
<!--      </div>-->
      <div class="text-center mt-6">
        <p class="text-2xl">{{ call.current?.to }}</p>
        <p class="text-xl text-gray-500 mt-2">{{ user.currentDID?.length ? user.currentDID : call.current?.from }}</p>
      </div>
      <!-- <div class="text-center mt-4">
        <p v-if="endTimer" class="text-xl text-gray-700 font-bold">{{ duration }}</p>
      </div> -->
      <div class="text-center mt-4">
        <p class="text-xl text-gray-700 font-bold">{{ callStatusLabel }}</p>
      </div>

      <div class="flex justify-center w-full px-6 mt-10">
        <a-button danger size="large" type="primary" class="" @click="terminateCall">
          Cancel
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { CallStatus, useCall } from '@renderer/store/modules/call/call';
import { computed } from 'vue';

import { useUser } from "@store/auth/user";

const call = useCall();
const user = useUser();

const terminateCall = () => {
  let code = 200;
  let cause = 'BYE';
  if (CallStatus.S_ANSWERED !== call.status) {
    code = 487;
    cause = 'ORIGINATOR_CANCEL';
  }

  call.terminate(code, cause);
}

const callStatusLabel = computed(() => {
  switch (call.status) {
    case CallStatus.S_NEW:
    case CallStatus.S_CONNECTING:
      return 'Đang khởi tạo';
    case CallStatus.S_RINGING:
      return 'Đang đổ chuông';
    case CallStatus.S_ANSWERED:
      return 'Đã kết nối';
    case CallStatus.S_TERMINATED:
      return 'Đã kết thúc';
    case CallStatus.S_ERROR:
      return 'Lỗi kết nối';
    default:
      return 'Đang kết nối';
  }
});
</script>
