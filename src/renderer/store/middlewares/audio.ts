import {PiniaPlugin, Store} from "pinia";
import {Router, useRouter} from "vue-router";

let timer: NodeJS.Timeout;

export const audioStoreMiddleware: PiniaPlugin = ({store}) => {
    if (store.$id !== 'audio-stream') return;

    const router = useRouter();
    store.$onAction(async (action) => {
        if ('start' === action.name) {
            await onAudioStart(store, router);
        } else if ('stop' === action.name) {
            await onAudioStop(store, router);
        } else if ('play' === action.name) {
            await onAudioPlay(store, router);
        }
    });
}

const onAudioStart = async (store: any, router: Router) => {
    navigator.mediaDevices.ondevicechange = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.find(device => device.kind === 'audioinput');

        if (!audioInputs) {
            router
                .push('/error?error=Microphone&message=Bạn phải có microphone để thực hiện cuộc gọi')
                .catch(console.error);
        } else {
            store.stop();
            await store.start();
        }
    }

    timer = setInterval(async () => {
        try {
            await navigator.mediaDevices.getUserMedia({audio: true});
            store.error = '';
        } catch (e: any) {
            store.error = e.message;
            router
                ?.push('/error?error=Microphone&message=Bạn phải có microphone để thực hiện cuộc gọi')
                ?.catch(console.error);
        }
    }, 10000);
}

const onAudioStop = async (_, router: Router) => {
    clearInterval(timer);
}

const onAudioPlay = async (_, router: Router) => {

}
