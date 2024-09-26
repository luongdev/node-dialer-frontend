<template>
  <div class="h-full w-full rounded-lg flex justify-between items-center py-2 px-4">
    <div class="w-full flex flex-col justify-around items-center">
      <div v-if="'ANSWERED' !== call.status" class="text-lg font-bold">{{ callLabel }}</div>
      <div v-else class="text-lg font-bold text-green-500 text-center">{{ duration }}</div>
      <div class="text-md text-gray-700">{{ call.current?.from }}</div>
      <div class="text-md text-gray-700">{{ call.current?.to }}</div>
    </div>
    
    <template v-if="call.status">
      <div class="flex flex-col justify-between items-center space-y-2">
        <a-tooltip :title="call.status === 'RINGING' ? 'Từ chối' : 'Kết thúc'" placement="right">
          <button 
            @click="ternmiate" 
            v-show="call.status && call.status !== 'TERMINATED'" 
            class="bg-red-500 text-white rounded-full w-10 h-10 flex justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </a-tooltip>
        <a-tooltip :title="'Nhận'" placement="right">
          <button 
              @click="answer" 
              v-show="call.status === 'RINGING'" 
              class="bg-green-500 text-white rounded-full w-10 h-10 flex justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </button>
        </a-tooltip>

        <div v-show="call.status === 'ANSWERED'" class="flex justify-center space-x-3 w-14">
          <a-tooltip :title="call.mute ? 'Bật tiếng' : 'Tắt tiếng'" placement="bottom">
            <button class="h-10 flex items-center" @click="toggleMute">
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
            </button>
          </a-tooltip>

          <a-tooltip :title="call.hold ? 'Tiếp tục' : 'Giữ'" placement="bottom">
            <button class="h-10 flex items-center" @click="toggleHold">
              <svg v-if="!call.hold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406
                    1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811Z"/>
              </svg>
            </button>
          </a-tooltip>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { useSIP } from '../store/sip';

import { useDuration } from '@renderer/utils/reusable/duration';
import { useCall, useLabel } from '@store/call/call';

const call = useCall();
const callLabel = useLabel();

const sip = useSIP();

const phoneNumber = ref('0123456789');

const { duration, start, stop } = useDuration();

const answer = () => sip.answer();

const ternmiate = () => {
  let code = 200;
  let cause = 'NORMAL_CLEARING';

  if (call.status === 'RINGING') {
    code = 486;
    cause = 'REJECTED';
  }

  return sip.terminate(code, cause);
}

const toggleMute = () => sip.toggleMute();

const toggleHold = () => sip.toggleHold();

</script>
