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

      <a-form-item label="ICE:" v-if="true">
        <a-switch v-model:checked="formState.iceEnabled" />
      </a-form-item>

      <a-space block v-if="formState.iceEnabled" v-for="(server, index) in formState.iceServers" :key="`ICE-${index}`"
        class="w-full ant-custom">
        <a-form-item label=" " :name="['iceServers', index, 'address']"
          :rules="{ required: true, message: 'Please input ICE address' }">
          <a-input v-model:value="(server as ICEServer).address" placeholder="Address">
            <template #addonBefore>
              <a-select v-model:value="(server as ICEServer).protocol">
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

      <a-form-item :wrapper-col="{ offset: 5, span: 16 }">
        <a-button type="primary" html-type="submit" :loading="!registerAllow">Register</a-button>
      </a-form-item>
    </a-form>

  </div>
</template>

<script setup lang="ts">

import { reactive, ref, computed, watch, onMounted } from 'vue';
import { useUserStore, ICEServer } from '@renderer/store/modules/auth/user';
import { useWebRTCAgent } from '@renderer/store/modules/agent/webrtc-agent';
import router from '@renderer/router';

const user = useUserStore();
const wrtcAgent = useWebRTCAgent();

const registerAllow = computed(() => !(wrtcAgent.connecting || wrtcAgent.registering));

const iceAddAllow = computed(() => {
  if (formState.iceServers.length > 2) {
    return false;
  }

  if (formState.iceServers.length) {
    const lastICE = formState.iceServers[formState.iceServers.length - 1];
    if (typeof lastICE === 'string') {
      return !!lastICE.length;
    } else {
      return !!lastICE.address?.length;
    }
  }

  return true;
})


const formState = reactive({
  extension: '',
  password: '',
  domain: '',
  gateway: '',
  protocol: 'wss',
  iceServers: [],
  iceEnabled: false,
});


// onMounted(() => {
//   user.extension = '10000';
//   user.password = 'Abcd@54321';
//   user.domain = 'voiceuat.metechvn.com';
//   user.gateway = '101.99.20.58:7080';
//   user.iceServers = [];
//   user.tls = false;
// });

onMounted(() => {
  // user.extension = '10000';
  // user.password = 'Abcd@54321';
  // user.domain = 'voiceuat.metechvn.com';
  user.gateway = '101.99.20.58:7080';
  user.iceServers = [];
  user.tls = false;

  formState.extension = user.extension;
  formState.password = user.password;
  formState.domain = user.domain;
  formState.gateway = user.gateway;
  formState.iceServers = user.iceServers;
  formState.iceEnabled = !!user.iceServers?.length;
  formState.protocol = user.tls ? 'wss' : 'ws';

});


const loginFormRef = ref();

const onFinish = () => {
  const { extension, password, domain, gateway, protocol, iceServers, iceEnabled } = formState;

  user.extension = extension;
  user.password = password;
  user.domain = domain;
  user.gateway = gateway;
  
  user.tls = protocol === 'wss';

  if (iceEnabled) {
    user.iceServers = iceServers;
  } else {
    user.iceServers = [];
  }

  watch(() => wrtcAgent.registered, async () => {
    await router.push('/');
  })

  wrtcAgent.start();
};

const onFinishFailed = (errorInfo: any) => {
  console.error(errorInfo);
};


const removeICE = (index: number) => {
  formState.iceServers.splice(index, 1);
}

const addICE = () => {
  if (!iceAddAllow) return;

  formState.iceServers = [
    ...formState.iceServers, { address: '', protocol: 'stun' }
  ]
}

</script>

<style>
.ant-custom {
  .ant-space-item {
    width: 100%;
  }
}
</style>