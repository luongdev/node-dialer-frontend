<template>
  <a-spin :spinning="loading.state">
    <div class="flex h-screen overflow-hidden">
      <div class="relative flex flex-1 flex-col overflow-y-hidden overflow-x-hidden h-screen">
        <Header/>

        <div class="flex h-screen">
          <Sidebar/>
          <slot></slot>
        </div>
      </div>
    </div>
  </a-spin>
</template>

<script setup lang="ts">
import Header from "@layouts/components/header/Header.vue";
import Sidebar from "@layouts/components/sidebar/Sidebar.vue";
import {useLoading} from "@store/loading";

const loading = useLoading();

</script>

