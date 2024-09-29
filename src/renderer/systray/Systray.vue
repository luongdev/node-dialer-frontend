<template>
  <div class="fixed w-full h-4" style="-webkit-app-region: drag" />
  <div class="h-screen w-full">
    <router-view v-slot="{ Component }">
      <component :is="Component"/>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useSIP } from './store/sip';
import { useUser } from '@renderer/store/modules/auth/user';

const sip = useSIP();
const user = useUser();
const router = useRouter();

watch(() => sip.registered, (registered) => {
  if (registered) {
    router.push('/call');
  } else {
    router.push('/');
  }
})

onMounted(() => {
  if (user.validate()) {
    sip.connect();
    router.push('/call');
  }
});
</script>
