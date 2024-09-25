<template>
  <div class="h-screen w-full">
    <div class="w-full h-2 bg-red-100" style="-webkit-app-region: drag"></div>
    <router-view v-slot="{ Component }">
      <component :is="Component"/>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import {useSIP} from './store/sip';
import {onMounted} from "vue";

const sip = useSIP();

onMounted(() => {
  sip.connect();
})
</script>
