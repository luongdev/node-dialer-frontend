<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <a-card class="w-full bg-white overflow-hidden h-screen flex flex-col justify-center items-center">
      <!--      <div class="flex justify-center mt-4">-->
      <!--        <a-avatar size={80} src="https://randomuser.me/api/portraits/men/75.jpg"/>-->
      <!--      </div>-->
      <div class="text-center mt-6">
        <p class="text-2xl "> {{ call.current?.to }} </p>
        <p class="text-xl text-gray-500 mt-2">
          {{ !call.current.inbound && user.currentDID?.length ? user.currentDID : call.current?.from }}
        </p>
      </div>

      <div class="text-center mt-4">
        <p class="text-xl text-green-400 font-bold">{{ duration }}</p>
        <p class="text-xl font-bold">{{ label }}</p>
      </div>

      <div v-if="'TERMINATED' !== call.status" class="flex justify-center w-full px-6 mt-10">
        <a-button danger type="primary" size="large" @click="callHangup">
          Hangup
        </a-button>
      </div>

      <div v-if="'TERMINATED' !== call.status" class="flex justify-around w-full px-6 mt-8">
        <a-tooltip :title="call.mute ? 'Unmute' : 'Mute'">
          <a-button
              @click="call.toggleMute"
              type="default" size="large" class="bg-gray-200 hover:bg-gray-300 text-gray-600 text-lg p-2 mx-1">
            <svg v-if="call.mute" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path d="M176.4,181.3A72,72,0,0,1,56.4,136" fill="none" stroke="#000" stroke-linecap="round"
                    stroke-linejoin="round" stroke-width="16"/>
              <path d="M154.9,157.6A39.6,39.6,0,0,1,128,168h0a40,40,0,0,1-40-40V84" fill="none" stroke="#000"
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
              <line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="128"
                    x2="128" y1="200" y2="232"/>
              <line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="48"
                    x2="208" y1="40" y2="216"/>
              <path d="M94,43a39.8,39.8,0,0,1,34-19h0a40,40,0,0,1,40,40v60.4" fill="none" stroke="#000"
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
              <path d="M199.6,136a72.4,72.4,0,0,1-4.5,18.2" fill="none" stroke="#000" stroke-linecap="round"
                    stroke-linejoin="round" stroke-width="16"/>
            </svg>
            <svg v-else viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" height="24">
              <rect fill="none" height="144" rx="40" stroke="#000" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="16" width="80" x="88" y="24"/>
              <line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="128"
                    x2="128" y1="200" y2="232"/>
              <path d="M199.6,136a72.1,72.1,0,0,1-143.2,0" fill="none" stroke="#000" stroke-linecap="round"
                    stroke-linejoin="round" stroke-width="16"/>
            </svg>
          </a-button>
        </a-tooltip>
        <a-tooltip :title="call.hold ? 'Unhold' : 'Hold'">
          <a-button
              @click="call.toggleHold"
              type="default" size="large" class="bg-gray-200 hover:bg-gray-300 text-gray-600 text-lg p-2 mx-1">
            <svg v-if="call.hold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                 stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5"/>
            </svg>

            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                 stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406
                  1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811Z"/>
            </svg>
          </a-button>
        </a-tooltip>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, watch} from "vue";
import {useDuration} from "@renderer/utils/reusable/duration";
import {useWebRTCAgent} from "@renderer/store/modules/agent/webrtc-agent";
import {CallStatus, useCall, useLabel} from "@renderer/store/modules/call/call";
import {useUserStore} from "@store/auth/user";

const {startTime} = defineProps({
  startTime: {type: Number, default: () => Date.now()},
})

const call = useCall();
const user = useUserStore();
const wrtcAgent = useWebRTCAgent();

const fromNum = computed(() => {

});

const toNum = computed(() => {

});

const label = useLabel();
const {duration, start, stop} = useDuration();

watch(() => call.status, (status) => {
  if (CallStatus.S_TERMINATED === status) {
    stop();
  }
});


onMounted(() => start(startTime));
onUnmounted(() => stop());

const callHangup = () => {
  call.terminate();
}

</script>
