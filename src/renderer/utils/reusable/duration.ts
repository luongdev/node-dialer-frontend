import { ref } from 'vue';
import Timer from "@renderer/utils/timer";

export const useDuration = (initStartTime = Date.now(), every = 1000) => {
    const formattedTime = ref<string>(formatDuration(0));

    const start = (startTime?: number) => {
        startTime = startTime ? startTime : initStartTime;
        Timer.interval(every, () => formattedTime.value = formatDuration(Date.now() - startTime));
    }

    return { duration: formattedTime, start }
}

export const useCountDown = (secs: number) => {
    const formattedTime = ref<string>(formatDuration(secs * 1000));
    const countDownTime = Date.now() + (secs * 1000);

    const start = () => {
        Timer.interval(1000, () => formattedTime.value = formatDuration(countDownTime - Date.now()));
    }

    return { duration: formattedTime, start }
}


const formatDuration = (ms: number) => {
    if (ms <= 0) return '00:00';

    const minutes = Math.round(ms / 1000 / 60);
    const seconds = Math.round(ms / 1000 % 60);

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

