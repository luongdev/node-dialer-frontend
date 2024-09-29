<template>
  <title-bar/>
  <router-view v-slot="{ Component }">
    <component :is="Component"/>
  </router-view>
</template>

<script setup lang="ts">
import TitleBar from "@renderer/components/title-bar/title-bar.vue";
import {onMounted} from "vue";
import {useUser} from "@store/auth/user";
import {useRouter} from "vue-router";

const router = useRouter();
const user = useUser();

const {ipcRendererChannel} = window;

onMounted(async () => {
  if (user.validate()) {
    await ipcRendererChannel.Broadcast.invoke({
      type: 'Agent',
      body: {event: 'StartConnect'}
    })
  } else {
    await router.push('/signin');
  }
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
