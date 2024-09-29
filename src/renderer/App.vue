<template>
  <title-bar />
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script setup lang="ts">
import TitleBar from "@renderer/components/title-bar/title-bar.vue";
import { onMounted, watch } from "vue";
import { useUser } from "@store/auth/user";
import { useRouter } from "vue-router";
import { useLoading } from "./store/modules/loading";

const router = useRouter();
const user = useUser();
const loading = useLoading();

watch(() => user.loggedIn, (loggedIn) => initRoute(loggedIn));

onMounted(async () => {
  if (user.validate()) {
    user.register();
  }

  initRoute(user.loggedIn);
});

const initRoute = (loggedIn: boolean) => {
  router.push(loggedIn ? '/' : '/signin').catch(console.error);
  loading.set(false);
}

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
