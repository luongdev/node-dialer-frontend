<template>
  <EmptyLayout>
    <div class="flex justify-center items-center h-screen w-full bg-gray-100">
      <a-card class="w-full h-screen bg-white flex flex-col justify-center items-center">
        <div class="flex justify-center mt-4">
          <a-avatar size={480} src="https://randomuser.me/api/portraits/men/75.jpg" />
        </div>
        <div class="text-center mt-6">
          <p class="text-2xl ">John Doe</p>
          <p class="text-lg text-gray-500 mt-2">+1 234 567 890</p>
          <p class="text-lg text-gray-500 mt-2">From: New York, USA</p>
        </div>
        <div class="flex justify-around w-full px-6 mt-10">
          <a-button
              type="primary"
              size="large"
              class="bg-green-500 text-white text-xl py-3 mx-2 rounded-lg"
          >
            Answer
          </a-button>
          <a-button
              danger
              type="primary"
              size="large"
              class="bg-red-500 text-white text-xl py-3 mx-2 rounded-lg"
          >
            Decline
          </a-button>
        </div>
      </a-card>
    </div>
  </EmptyLayout>
</template>

<script setup lang="ts">

import EmptyLayout from "@layouts/EmptyLayout.vue";
</script>
