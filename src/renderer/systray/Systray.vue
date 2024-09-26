<template>
  <div class="fixed w-full h-4" style="-webkit-app-region: drag" />
  <div class="h-screen w-full">
    <router-view v-slot="{ Component }">
      <component :is="Component"/>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {

  router.push('/call');

});
</script>
