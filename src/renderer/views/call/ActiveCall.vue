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
        <p class="text-xl font-bold">{{ callStatusLabel }}</p>
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
import {computed, defineProps, onMounted, onUnmounted, watch} from "vue";
import {useDuration} from "@renderer/utils/reusable/duration";
import {useWebRTCAgent} from "@renderer/store/modules/agent/webrtc-agent";
import {CallStatus, useCallStore} from "@renderer/store/modules/call/call";

const {startTime} = defineProps({
  startTime: {type: Number, default: () => Date.now()},
})


const call = useCallStore();

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
})

const {duration, start, stop} = useDuration();

watch(() => call.status, (status) => {
  if (CallStatus.S_TERMINATED === status) {
    stop();
  }
});


onMounted(() => start(startTime));
// onUnmounted(() => stop());

const wrtcAgent = useWebRTCAgent();

const callHangup = () => {
  wrtcAgent.terminate();
}


</script>
