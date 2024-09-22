<template>
  <title-bar/>
  <router-view v-slot="{ Component }">
    <component :is="Component"/>
  </router-view>
</template>

<script setup lang="ts">
import TitleBar from "@renderer/components/title-bar/title-bar.vue";
import {onMounted, watch} from "vue";
import { useUserStore } from "./store/modules/auth/user";
import {useWebRTCAgent} from "@store/agent/webrtc-agent";
import router from "./router";

const user = useUserStore();
const wrtcAgent = useWebRTCAgent()

onMounted(() => {
  if (user.validate()) {
    watch(() => wrtcAgent.registered, () => router.push('/'));
    wrtcAgent.start();
  } else {
    router.push('/signin');
  }
});

</script>

<style></style>
