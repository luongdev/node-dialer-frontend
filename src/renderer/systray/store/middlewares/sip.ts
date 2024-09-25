import {PiniaPlugin} from "pinia";
import {ConnectedEvent, ConnectingEvent, DisconnectEvent, RegisteredEvent, UnRegisteredEvent} from 'jssip/lib/UA';
import {useSIP} from "../sip";
import {useAudio} from "../audio";

const {ipcRendererChannel} = window;
ipcRendererChannel.BroadcastAgent.on(async (_, data) => {
    const {event} = data || {};

    const sip = useSIP();
    if ('StartConnect' === event) {
        const audio = useAudio();
        await audio.start();

        await sip.connect()
    }
});

const connectInject = async (store: any) => {
    bindConnectionEvents(store);

    store.ua.start();
}

export const sipMiddleware: PiniaPlugin = ({store}) => {
    if (store.$id !== 'sip') return;

    store.$onAction(act => {
        if (act.name === 'connect') {
            act.after(async () => await connectInject(act.store))
        }
    }, true);

    store.$subscribe(async (_, state) => {
        await ipcRendererChannel.Broadcast.invoke({
            type: 'Agent',
            body: {event: 'StateUpdated', payload: {...state}},
        });
    }, {detached: true})
}


const bindConnectionEvents = (store: any) => {
    if (!store.ua) return;

    store.ua.on('connecting', (event: any) => connectingHandler(event, store));
    store.ua.on('connected', (event: any) => connectedHandler(event, store));
    store.ua.on('disconnected', (event: any) => disconnectedHandler(event, store));
    store.ua.on('registered', (event: any) => registeredHandler(event, store));
    store.ua.on('unregistered', (event: any) => unregisteredHandler(event, store));
    store.ua.on('registrationFailed', (event: any) => registrationFailedHandler(event, store));
}

const connectingHandler = async (_: ConnectingEvent, store: any) => {
    store.connecting = true;
}

const connectedHandler = async (_: ConnectedEvent, store: any) => {
    store.connected = true;
    store.connecting = false;

    if (store.autoRegister) {
        store.registering = true;
    }
}

const disconnectedHandler = async (event: DisconnectEvent, store: any) => {
    store.connected = false;
    store.connecting = false;

    if (event.error) {
        store.error = event.reason;
    }
}

const registeredHandler = async (_: RegisteredEvent, store: any) => {
    store.registering = false;
    store.registered = true;
}

const unregisteredHandler = async (_: UnRegisteredEvent, store: any) => {
    store.registering = false;
    store.registered = false;
}

const registrationFailedHandler = async (event: UnRegisteredEvent, store: any) => {
    store.registering = false;
    store.registered = false;

    if (event.cause) {
        store.error = event.cause;
    }
}
