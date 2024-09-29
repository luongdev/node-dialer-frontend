import {PiniaPlugin} from 'pinia';

let timer: NodeJS.Timeout;
const {ipcRendererChannel} = window;

export const audioMiddleware: PiniaPlugin = ({store}) => {
    if (store.$id !== 'audio') return;

    store.$onAction(async (action) => {
        if ('start' === action.name) {
            action.after(async () => await onAudioStart(action.store));
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
        return;
    }
}


const onAudioStart = async (store: any) => {
    navigator.mediaDevices.ondevicechange = async () => {
        const devices = await findAudioInput();
        console.log('Current devices: ', devices);
        if (!devices?.length) {
            store.audioId = '';
            return await ipcRendererChannel.Broadcast.invoke({type: 'Audio', body: {event: 'MicrophoneError'}});
        }

        const inUse = devices.find(device => device.deviceId === store.inputId);
        if (!inUse) {
            store.stop();

            const devId = devices[0].deviceId;
            if ('default' === devId) {
                await store.start();
            } else {
                await store.start(devId);
            }
        }
    }

    timer = setInterval(async () => {
        const devices = await findAudioInput();
        if (!devices?.length) {
            store.audioId = '';
            return await ipcRendererChannel.Broadcast.invoke({type: 'Audio', body: {event: 'MicrophoneError'}});
        }
    }, 10000);
}

const onAudioStop = async (_) => {
    clearInterval(timer);
}
