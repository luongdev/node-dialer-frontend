<template>
  <div class="relative w-full flex justify-end text-green-500" ref="target">
    <a-dropdown>
      <a class="ant-dropdown-link" onclick="return false;">
        Ext: 10000
      </a>
      <template #overlay>
        <a-menu style="width: 160px;">
          <a-menu-item @click="onClickSignOut">
            Log Out
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';

import { useUser } from '@renderer/store/modules/auth/user';
import { useLoading } from "@store/loading";

const loading = useLoading();


const user = useUser();

const target = ref(null);
const dropdownOpen = ref(false);

onClickOutside(target, () => {
  dropdownOpen.value = false;
});

const onClickSignOut = async () => {
  loading.set(true);
  // user.clear();
}



</script>
