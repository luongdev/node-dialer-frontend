<template>
  <template v-if="'Microphone' === error">
    <Microphone :error="error" :message="message"/>
  </template>

  <div v-else class="flex flex-col justify-center items-center h-screen w-full bg-red-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[80%] text-center">
      <h1 class="text-2xl font-bold text-red-600">Error: {{ error }}</h1>
      <p class="text-md text-gray-700 mt-4">{{ message }}</p>
    </div>
    <div>
      <a-button type="primary" class="mt-6" @click="goBack">Go Home</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {toRefs} from 'vue'
import {useRouter} from 'vue-router'
import Microphone from "@renderer/views/error/Microphone.vue";

const router = useRouter();

const props = defineProps(['error', 'message']);
const {error, message} = toRefs(props);

const goBack = () => {
  router.push('/');
}
</script>

<style scoped>
</style>
