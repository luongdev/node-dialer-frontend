import {PiniaPlugin, Store} from "pinia";
import router from "@renderer/router";

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
}

const onAudioStop = async (_) => {

}

const onAudioPlay = async (_) => {

}
