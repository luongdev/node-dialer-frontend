<template>
    <div class="min-w-[180px]">
      <a-select v-model:value="status" class="mr-2 w-full" :bordered="true" :loading="statusLoading">
        <a-select-option value="ready">
              <span class="text-green-500">
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span>
                Ready
              </span>
        </a-select-option>
        <a-select-option value="not_ready">
              <span class="text-red-500">
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></span>
                Not Ready
              </span>
        </a-select-option>
        <a-select-option value="taling">
              <span class="text-blue-500">
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>
                Talking
              </span>
        </a-select-option>
        <a-select-option value="ringing">
              <span class="text-yellow-500">
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500 mr-2"></span>
                Ringing
              </span>
        </a-select-option>
        <template #dropdownRender>
          <a-list :bordered="false" :data-source="allowStatuses" size="small">
            <template #renderItem="{ item }">
              <a-list-item class="hover:cursor-pointer" @click="status = item.key" :key="`status-${item.key}`">
                <span :class="`text-${item.color}`">
                  <span :class="`bg-${item.color}`" class="inline-block rounded-full mr-2"></span>
                  {{ item.label }}
                </span>
              </a-list-item>
            </template>
          </a-list>
        </template>
      </a-select>
    </div>
  
  </template>
  
  <script setup lang="ts">
  import {computed, ref} from 'vue';
  
  export type StatusItem = {
    key: string;
    label: string;
    color: string;
  };
  
  const statuses: StatusItem[] = [
    { key: 'ready', label: 'Ready', color: 'green-500' },
    { key: 'not_ready', label: 'Not Ready', color: 'red-500' },
  ];
  
  const allowStatuses = computed(() => {
    return statuses.filter((item) => item.key !== status.value);
  });
  
  const status = ref('ringing');
  const statusLoading = ref(false);
  
  </script>