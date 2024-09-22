<template>
    <div :class="textColor" class="">
        {{ `${typeof requestTime === 'string' ? requestTime : `${requestTime} ms`}` }}
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, toRefs, defineProps, ref } from 'vue';
import Timer from '@renderer/utils/timer';

const props = defineProps(['time', 'interval', 'url']);
const { time, interval, url } = toRefs(props);
const requestTime = ref(null);

onMounted(async () => {
    await pingUrl();
    
    Timer.interval(interval.value, async () => await pingUrl());
});

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

const pingUrl = async () => {
    try {
        const startTime = Date.now();
        const response = await fetch(url.value, { method: 'HEAD' });
        if (response.ok) {
            const endTime = Date.now();
            requestTime.value = endTime - startTime;
        } else {
            requestTime.value = '!!!';
        }
    } catch (error) {
        requestTime.value = '!!!';
    }
}
</script>
