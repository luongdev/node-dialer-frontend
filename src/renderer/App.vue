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
import { useError } from "./store/modules/error";

const router = useRouter();
const user = useUser();
const error = useError();
const loading = useLoading();

watch(() => user.loggedIn, (loggedIn) => initRoute(loggedIn));

watch(() => error.eType, () => {
  initRoute(user.loggedIn);
});

onMounted(async () => {
  if (user.validate()) {
    if (!user.loggedIn) {
      user.register();
    } else {
      user.deviceCheck();
    }
  }

  initRoute(user.loggedIn);
});

const initRoute = (loggedIn: boolean) => {
  if (error.eType?.length) {
    router.push(`/error`).catch(console.error);
  } else {
    router.push(loggedIn ? '/' : '/signin').catch(console.error);
  }
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
