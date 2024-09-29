<template>
  <a-spin :spinning="loading?.state">
    <div class="flex flex-col justify-center items-center h-screen w-full bg-red-100">
      <div class="bg-white p-6 rounded-lg shadow-lg w-[80%] text-center">
        <h1 class="text-2xl font-bold text-red-600">Error: {{ error }}</h1>
        <p class="text-md text-gray-700 mt-4">{{ message }}</p>
      </div>
      <div>
        <a-button type="primary" class="mt-6" @click="goCheck">Kiểm tra</a-button>
      </div>
    </div>
  </a-spin>
</template>

<script setup lang="ts">
import {onMounted, toRefs, watch} from 'vue'
import {useLoading} from "@store/loading";

const props = defineProps(['error', 'message']);
const {message, error} = toRefs(props);

const loading = useLoading();

onMounted(() => {
 
});

const goCheck = () => {

  loading.set(true);
}
</script>
