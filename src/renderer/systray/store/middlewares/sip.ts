import {PiniaPlugin} from "pinia";
import {ConnectedEvent, ConnectingEvent, DisconnectEvent, RegisteredEvent, UnRegisteredEvent} from 'jssip/lib/UA';

const {ipcRendererChannel} = window;

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

    await ipcRendererChannel.Broadcast.invoke({
        type: 'Agent',
        body: {
            connected: store.connected,
            connecting: store.connecting,
        }
    });
}

const connectedHandler = async (_: ConnectedEvent, store: any) => {
    store.connected = true;
    store.connecting = false;

    if (store.autoRegister) {
        store.registering = true;
    }

    await ipcRendererChannel.Broadcast.invoke({
        type: 'Agent',
        body: {
            connected: store.connected,
            connecting: store.connecting,
        }
    });
}

const disconnectedHandler = async (event: DisconnectEvent, store: any) => {
    store.connected = false;
    store.connecting = false;

    if (event.error) {
        store.error = event.reason;
    }

    await ipcRendererChannel.Broadcast.invoke({
        type: 'Agent',
        body: {
            connected: store.connected,
            connecting: store.connecting,
            error: store.error,
        }
    });
}

const registeredHandler = async (_: RegisteredEvent, store: any) => {
    store.registering = false;
    store.registered = true;

    await ipcRendererChannel.Broadcast.invoke({
        type: 'Agent',
        body: {
            registering: store.registering,
            registered: store.registered,
        }
    });
}

const unregisteredHandler = async (_: UnRegisteredEvent, store: any) => {
    store.registering = false;
    store.registered = false;

    await ipcRendererChannel.Broadcast.invoke({
        type: 'Agent',
        body: {
            registering: store.registering,
            registered: store.registered,
        }
    });
}

const registrationFailedHandler = async (event: UnRegisteredEvent, store: any) => {
    store.registering = false;
    store.registered = false;

    if (event.cause) {
        store.error = event.cause;
    }

    await ipcRendererChannel.Broadcast.invoke({
        type: 'Agent',
        body: {
            registering: store.registering,
            registered: store.registered,
            error: store.error,
        }
    });
}
