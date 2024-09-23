import {PiniaPlugin, Store} from "pinia";
import router from '@renderer/router';

let timer: NodeJS.Timeout;

export const audioStoreMiddleware: PiniaPlugin = ({store}) => {
    if (store.$id !== 'audio-stream') return;

    store.$onAction(async (action) => {
        if ('start' === action.name) {
            await onAudioStart(store);
        } else if ('stop' === action.name) {
            await onAudioStop(store);
        } else if ('play' === action.name) {
            await onAudioPlay(store);
        }
    });
}

const onAudioStart = async (store: any) => {
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

const onAudioStop = async (_) => {
    clearInterval(timer);
}

const onAudioPlay = async (_) => {

}
