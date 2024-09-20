<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <a-card
        class="w-full bg-white shadow-lg rounded-lg overflow-hidden h-screen flex flex-col justify-center items-center">
      <div class="flex justify-center mt-4">
        <a-avatar size={80} src="https://randomuser.me/api/portraits/men/75.jpg"/>
      </div>
      <div class="text-center mt-6">
        <p class="text-2xl">+1 987 654 321</p>
        <p class="text-lg text-gray-500 mt-2">To: California, USA</p>
      </div>

      <div class="text-center mt-4">
        <p class="text-xl text-gray-700 font-bold">{{ callStatus }}</p>
      </div>

      <!-- Nút Cancel -->
      <div class="flex justify-center w-full px-6 mt-10">
        <a-button danger size="large" type="primary" class="" @click="cancelCall">
          Cancel
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

const callStatus = ref<string>('Đang kết nối...')


const cancelCall = () => {
  callStatus.value = 'Cuộc gọi đã bị hủy'
}
</script>

