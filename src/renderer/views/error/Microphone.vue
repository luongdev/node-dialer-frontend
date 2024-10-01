<template>
  <a-spin :spinning="loading?.state">
    <div class="flex flex-col justify-center items-center h-screen w-full bg-red-100">
      <div class="bg-white p-6 rounded-lg shadow-lg w-[80%] text-center">
        <h1 class="text-2xl font-bold text-red-600">{{ label }}</h1>
        <p class="text-md text-gray-700 mt-4">{{ error.eMsg }}</p>
      </div>
      <div>
        <a-button type="primary" class="mt-6" @click="goCheck">Kiểm tra</a-button>
      </div>
    </div>
  </a-spin>
</template>

<script setup lang="ts">
import { useLoading } from "@store/loading";
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { useError, useErrorLabel } from '@renderer/store/modules/error';
import { useUser } from '@renderer/store/modules/auth/user';


const user = useUser();
const loading = useLoading();
const error = useError();
const router = useRouter();
const label = useErrorLabel();

watch(() => error.eType, (typ) => {
  loading.set(false);
  if (!typ?.length) {
    router.push('/').catch(console.error);
  }
});

const goCheck = () => {
  loading.set(true);
  user.deviceCheck();
  setTimeout(() => {
    loading.set(false);
  }, 1369);
}
</script>
