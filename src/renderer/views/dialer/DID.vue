<template>
  <a-select class="w-full" placeholder="Chọn đầu số"
            v-model:value="value"
            @change="onDIDChange"
            :show-search="true"
            :options="user.listDID.map((item: string) => ({ value: item }))"
  >
    <template #dropdownRender="{ menuNode, ...props }">
      <VNodes :vnodes="menuNode"/>
      <a-divider style="margin: 4px 0"/>
      <a-space class="w-full flex justify-around">
        <a-input
            placeholder="Nhập số" class="w-full"
            v-model:value="name.value"
            :status="name.status"
            @keyup.enter="addItem"/>
        <a-button type="text" @click="addItem">
          <template #icon>
            <span class="flex justify-between items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                   stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            </span>
          </template>
        </a-button>
      </a-space>
    </template>
  </a-select>
</template>
<script lang="ts" setup>
import {defineComponent, reactive, ref} from 'vue';
import {useUserStore} from "@store/auth/user";

const regex = /^\d{8,12}$/;

const VNodes = defineComponent({
  props: {vnodes: {type: Object, required: true}},
  render: function () {
    return this.vnodes;
  }
});

const user = useUserStore();

const items = ref(user.listDID);
const name = reactive({value: '', status: ''});

const value = ref(user.currentDID);

const onDIDChange = (value: any) => {
  if (!value || value === user.currentDID) return;

  user.currentDID = value;
}

const addItem = (e: any) => {
  e.preventDefault();

  if (!name.value || items.value.includes(name.value) || !regex.test(name.value)) {
    name.status = 'error';
    return;
  }

  items.value.push(name.value);
  name.value = '';
  name.status = '';
};
</script>

