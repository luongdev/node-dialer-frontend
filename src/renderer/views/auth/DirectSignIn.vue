<template>
  <a-page-header style="border: 1px solid rgb(235, 237, 240)" title="Login" />
  <div class="max-w-lg mx-auto p-4">
    <a-form :colon="false" :model="formState" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }" ref="loginFormRef"
      autocomplete="off" @finish="onFinish" @finishFailed="onFinishFailed">
      <a-form-item label="Extension" name="extension" placeholder="Extension"
        :rules="[{ required: true, message: 'Please input your extension!' }]">
        <a-input v-model:value="formState.extension" class="w-full" />
      </a-form-item>

      <a-form-item label="Password" name="password"
        :rules="[{ required: true, message: 'Please input your password!' }]">
        <a-input-password v-model:value="formState.password" class="w-full" />
      </a-form-item>

      <a-form-item label="Domain" name="domain" :rules="[{ required: true, message: 'Please input your domain!' }]">
        <a-input v-model:value="formState.domain" class="w-full" />
      </a-form-item>

      <a-form-item label="Gateway" name="gateway" :rules="[{ required: true, message: 'Please input your gateway!' }]">
        <a-input v-model:value="formState.gateway" class="w-full">
          <template #addonBefore>
            <a-select v-model:value="formState.protocol" style="width: 80px">
              <a-select-option value="ws">WS</a-select-option>
              <a-select-option value="wss">WSS</a-select-option>
            </a-select>
          </template>
        </a-input>
      </a-form-item>

      <a-form-item label="ICE:">
        <a-switch v-model:checked="formState.iceEnabled" />
      </a-form-item>

      <a-space block v-if="formState.iceEnabled" v-for="(server, index) in formState.iceServers" :key="`ICE-${index}`"
        class="w-full ant-custom">
        <a-form-item label=" " :name="['iceServers', index, 'uri']"
          :rules="{ required: true, message: 'Please input ICE address' }">
          <a-input v-model:value="server.uri" placeholder="Address">
            <template #addonBefore>
              <a-select v-model:value="server.protocol">
                <a-select-option value="stun">STUN</a-select-option>
                <a-select-option value="turn">TURN</a-select-option>
              </a-select>
            </template>

            <template #addonAfter>
              <span @click="removeICE(index)" class="cursor-pointer hover:border-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
              </span>
            </template>
          </a-input>

        </a-form-item>
      </a-space>

      <a-form-item class="block" v-if="formState.iceEnabled" label=" ">
        <a-button type="dashed" class="w-full" @click="addICE" :disabled="!iceAddAllow">
          Add STUN / TURN
        </a-button>
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
        <a-button type="primary" html-type="submit">Submit</a-button>
      </a-form-item>
    </a-form>

  </div>
</template>

<script setup lang="ts">

import { reactive, ref, computed } from 'vue';

export type ICE = {
  uri: string;
  protocol: string;
}

const iceAddAllow = computed(() => {
  if (formState.iceServers.length > 2) {
    return false;
  }

  if (formState.iceServers.length) {
    const lastICE = formState.iceServers[formState.iceServers.length - 1];
    if (!lastICE.uri) {
      return false;
    }
  }

  return true;
})

const formState = reactive({
  extension: '10000',
  password: 'Abcd@54321',
  domain: 'voiceuat.metechvn.com',
  gateway: '101.99.20.58:7080',
  protocol: 'ws',
  iceEnabled: false,
  iceServers: [] as ICE[],
});

const loginFormRef = ref();
// const auth = useAuthStore();


const onFinish = (values: any) => {
  // auth.configure(formState.extension, formState.password, formState.domain, formState.protocol, formState.gateway, formState.iceServers);

  // if (auth.configured) {
  //   router.push(auth.returnUrl ?? '/').catch(console.error)
  // }

};
const onFinishFailed = (errorInfo: any) => {
  console.log(errorInfo);
};


const removeICE = (index: number) => {
  formState.iceServers.splice(index, 1);
}

const addICE = () => {
  if (formState.iceServers.length > 2) {
    return;
  }

  if (formState.iceServers.length) {
    const lastICE = formState.iceServers[formState.iceServers.length - 1];
    if (!lastICE.uri) {
      return;
    }
  }

  formState.iceServers.push({ uri: '', protocol: 'stun' });
}

</script>

<style>
.ant-custom {
  .ant-space-item {
    width: 100%;
  }
}
</style>