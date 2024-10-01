<template>
  <template v-if="'MICROPHONE' === error.eType">
    <Microphone />
  </template>

  <div v-else class="flex flex-col justify-center items-center h-screen w-full bg-red-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[80%] text-center">
      <h1 class="text-2xl font-bold text-red-600">Error: {{ error }}</h1>
      <p class="text-md text-gray-700 mt-4">{{ error.eMsg }}</p>
    </div>
    <div>
      <a-button type="primary" class="mt-6" @click="goBack">Go Home</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import Microphone from "@renderer/views/error/Microphone.vue";
import { useError } from '@renderer/store/modules/error';

const router = useRouter();
const error = useError();

const goBack = () => {
  router.push('/');
}
</script>
