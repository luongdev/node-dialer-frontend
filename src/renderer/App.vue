<template>
  <title-bar/>
  <router-view v-slot="{ Component }">
    <component :is="Component"/>
  </router-view>
</template>

<script setup lang="ts">
import TitleBar from "@renderer/components/title-bar/title-bar.vue";
import {onMounted} from "vue";
import {useWebRTCAgent} from "@store/agent/webrtc-agent";

const wrtcAgent = useWebRTCAgent()

onMounted(() => {
  wrtcAgent.start();
})

</script>

<style></style>
