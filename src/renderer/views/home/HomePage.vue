<template>
  <DefaultLayout>
    Layoutuuuasdf
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from "@layouts/DefaultLayout.vue";

import {useCallStore} from "@store/call/call";
import {onMounted} from "vue";

const call = useCallStore();

onMounted(() => {
  call.reset();
})

</script>
