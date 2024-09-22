<template>
    <template v-if="'direct' === refType">
        <DirectSignIn />
    </template>
</template>

<script setup lang="ts">
import router from '@renderer/router';
import DirectSignIn from './DirectSignIn.vue';
import { ref } from 'vue';

const { query: { type } } = router.currentRoute.value;
const refType = ref(type);

</script>
