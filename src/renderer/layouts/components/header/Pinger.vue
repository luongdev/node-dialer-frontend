<template>
    PING:&nbsp;<span :class="textColor" class="">
        {{ `${typeof requestTime === 'string' ? requestTime : `${requestTime} ms`}` }}
    </span>
</template>

<script setup lang="ts">
import { computed, onMounted, toRefs, defineProps, ref, onUnmounted } from 'vue';

const props = defineProps(['time', 'interval', 'url']);
const { time, interval, url } = toRefs(props);
const requestTime = ref(null);

let timer: NodeJS.Timeout;

onMounted(() => {
    pingUrl();
    timer = setInterval(pingUrl, interval.value);
});

onUnmounted(() => {
    clearInterval(timer);
})

const textColor = computed(() => {
    if (typeof requestTime.value === 'string') {
        return 'text-red-500';
    }

    if (requestTime.value <= time.value) {
        return 'text-green-500';
    } else if (requestTime.value > time.value && requestTime.value < 2 * time.value) {
        return 'text-yellow-500';
    }

    return 'text-red-500';
})

const pingUrl = () => {
    try {
        const startTime = Date.now();
        fetch(url.value, { method: 'HEAD' }).catch(() => { }).finally(() => {
            const endTime = Date.now();
            requestTime.value = endTime - startTime;
        });
    } catch (e: any) {

    }
}
</script>
