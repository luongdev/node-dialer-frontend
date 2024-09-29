import { ref } from 'vue';

export const useDuration = (initStartTime = Date.now(), every = 1000) => {
    const formattedTime = ref<string>(formatDuration(0));
    let timer: NodeJS.Timeout;

    const start = (startTime?: number) => {
        startTime = startTime ? startTime : initStartTime;
        if (!timer) timer = setInterval(() => formattedTime.value = formatDuration(Date.now() - startTime), every);
    }

    const stop = (reset = false) => {
        clearInterval(timer);
        if (reset) formattedTime.value = formatDuration(0);

        timer = null;
    }

    return { duration: formattedTime, start, stop }
}

const formatDuration = (ms: number) => {
    if (ms <= 0) return '00:00';

    const minutes = Math.round(ms / 1000 / 60);
    const seconds = Math.round(ms / 1000 % 60);

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

