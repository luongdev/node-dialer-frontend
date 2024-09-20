<template>
  Day la 404 page
</template>

<script setup lang="ts">

import { useStoreTemplate } from "@store/template";
const { ipcRendererChannel } = window;
const storeTemplate = useStoreTemplate();
console.log(storeTemplate.$state.testData);

ipcRendererChannel.SendDataTest.on((event, data) => {
  console.log(event);
  console.log(data);
});
</script>
