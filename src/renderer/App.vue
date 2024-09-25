<template>
    <title-bar/>
    <router-view v-slot="{ Component }">
      <component :is="Component"/>
    </router-view>
</template>

<script setup lang="ts">
import TitleBar from "@renderer/components/title-bar/title-bar.vue";
import {onMounted, watch} from "vue";
import {useUserStore} from "@store/auth/user";
import {useWebRTCAgent} from "@store/agent/webrtc-agent";
import {useRouter} from "vue-router";
import {useAudioStore} from "@store/agent/audio";

const router = useRouter();

const user = useUserStore();
const audio = useAudioStore();
const wrtcAgent = useWebRTCAgent()

const { ipcRendererChannel } = window;


onMounted(() => {
  if (user.validate()) {
    watch(() => wrtcAgent.registered, () => router.push('/'));
    wrtcAgent.start();
  } else {
    router.push('/signin');
  }
  audio.start();
});

</script>

<style>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f0f2f5;
}
</style>
