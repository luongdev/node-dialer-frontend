import { PiniaPlugin } from 'pinia';
import { useAudio } from '../audio';
import { ErrorType, useError } from '@renderer/store/modules/error';

let timer: NodeJS.Timeout;
const { ipcRendererChannel } = window;

export const audioMiddleware: PiniaPlugin = ({ store }) => {
    if (store.$id !== 'audio') return;

    store.$onAction(async (action) => {
        if ('start' === action.name) {
            action.after(async (data: any) => await onAudioStart(data, action.store));
        } else if ('stop' === action.name) {
            action.after(async () => await onAudioStop(action.store));
        }
    });
}

const findAudioInput = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === 'audioinput');
    } catch (_) {
        return [];
    }
}

const checkAudioReady = async (store: any) => {
    const error = useError();
    const devices = await findAudioInput();
    if (!devices?.length) {
        store.inputId = '';
        error.set(ErrorType.E_MICROPHONE, 'Không tìm thấy microphone');
        return;
    }

    const inUse = devices.find(device => device.deviceId === store.inputId);
    let result: { error: any; };

    if (!store.inputId?.length) {
        result = await store.start();
    } else if (!inUse) {
        store.stop();
        const devId = devices[0].deviceId;

        if ('default' === devId) {
            result = await store.start();
        } else {
            result = await store.start(devId);
        }
    }

    if (result && !result.error) {
        if (error.eType === ErrorType.E_MICROPHONE) {
            error.clear();
        }
    }
}


const onAudioStart = async (data: any, store: any) => {
    const error = useError();
    if (data.error) {
        store.audioId = '';
        error.set(ErrorType.E_MICROPHONE, 'Không tìm thấy microphone');
    }

    navigator.mediaDevices.ondevicechange = async () => {
        await checkAudioReady(store);
    }

    if (!timer) {
        timer = setInterval(async () => {
            await checkAudioReady(store);
        }, 10000);
    }
}

const onAudioStop = async (_) => {
    clearInterval(timer);
}

let audioEventHandled = false;
if (!audioEventHandled) {
    audioEventHandled = true;
    ipcRendererChannel.BroadcastAudio.on(async (_, data) => {
        const { event } = data || {};
        if ('RequestMicrophone' === event) {
            checkAudioReady(useAudio());
        }
    });
}