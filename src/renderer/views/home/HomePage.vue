<template>
  <DefaultLayout>
    <a-tabs tab-position="left" class="w-full h-screen">
      <a-tab-pane key="tab1">
        <Dialer />
      </a-tab-pane>
      <a-tab-pane key="tab2" class="my-4">
      </a-tab-pane>

      <template #renderTabBar="{ ...props }">
        <TabBar v-bind="props" />
      </template>
    </a-tabs>
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from "@layouts/DefaultLayout.vue";
import Dialer from "../dialer/Dialer.vue";
import TabBar from "./TabBar.vue";



</script>
