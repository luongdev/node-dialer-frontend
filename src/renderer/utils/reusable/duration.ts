import { ref, onMounted } from 'vue';
import Timer from "@renderer/utils/timer";

const useDuration = (initStartTime = Date.now(), every = 1000) => {
    const formattedTime = ref<string>('00:00');

    const start = (startTime?: number) => {
        startTime = startTime ?? initStartTime;
        Timer.interval(every, () => {
            const now = Date.now()
            const duration = Math.floor((now - startTime) / 1000)
            const minutes = Math.floor(duration / 60)
            const seconds = duration % 60

            formattedTime.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        })
    }

    return { duration: formattedTime, start }
}


export { useDuration };
