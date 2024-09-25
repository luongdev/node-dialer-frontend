import {PiniaPlugin} from "pinia";
import {
    ConnectedEvent,
    ConnectingEvent,
    DisconnectEvent,
    RegisteredEvent,
    RTCSessionEvent,
    UnRegisteredEvent
} from 'jssip/lib/UA';
import {useSIP} from "../sip";
import {useAudio} from "../audio";
import {
    ConnectingEvent as RTCConnectingEvent, EndEvent,
    IncomingAckEvent,
    IncomingEvent, OutgoingAckEvent,
    OutgoingEvent
} from "jssip/lib/RTCSession";

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

ipcRendererChannel.BroadcastCall.on(async (_, data) => {
    const {event} = data || {};

    const sip = useSIP();
    if ('Answer' === event) {
       sip.session?.answer();
    }
});

const connectInject = async (store: any) => {
    bindEvents(store);

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


const bindEvents = (store: any) => {
    if (!store.ua) return;

    store.ua.on('connecting', (event: any) => connectingHandler(event, store));
    store.ua.on('connected', (event: any) => connectedHandler(event, store));
    store.ua.on('disconnected', (event: any) => disconnectedHandler(event, store));
    store.ua.on('registered', (event: any) => registeredHandler(event, store));
    store.ua.on('unregistered', (event: any) => unregisteredHandler(event, store));
    store.ua.on('registrationFailed', (event: any) => registrationFailedHandler(event, store));

    store.ua.on('newRTCSession', (event: any) => rtcSessionHandler(event, store));
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

const rtcSessionHandler = async (event: RTCSessionEvent, store: any) => {
    const {request, session} = event || {};
    const {from, to} = request || {};
    if (!from || !to || !session) {
        return;
    }

    store.session = session;
    await ipcRendererChannel.Broadcast.invoke({
        type: 'Call',
        body: {
            event: 'Initialized',
            payload: {from: from.uri.user, to: to.uri.user, id: session.id, inbound: event.originator !== 'local'},
        }
    });


    session.on('accepted', (event: any) => onSessionAccepted(event, store));
    session.on('confirmed', onSessionConfirmed);
    session.on('failed', onSessionEnded);
    session.on('ended', onSessionEnded);

    session.on('muted', (event: any) => {
        console.debug('UA[onSessionMuted]: ', event);
        store.mute = true;
    });

    session.on('unmuted', (event: any) => {
        console.debug('UA[onSessionUnmuted]: ', event);
        store.mute = false;
    });

    session.on('hold', (event: any) => {
        console.debug('UA[onSessionHold]: ', event);
        store.hold = true;
    });

    session.on('unhold', (event: any) => {
        console.debug('UA[onSessionUnhold]: ', event);
        store.hold = false;
    });


    // Outbound call trigger connection
    session.on('connecting', onSessionConnecting);
    session.on('sending', (e) => console.debug('UA[onSessionSending]: ', e));

    // Inbound call trigger progress & peerconnection
    session.on('progress', onSessionProgress);
    session.on('peerconnection', (event: any) => console.debug('UA[onSessionPeerConnection]: ', event));

    session.on('icecandidate', (event: any) => console.debug('UA[onSessionCandidate]: ', event));
}

const onSessionConnecting = async (event: RTCConnectingEvent) => {
    console.debug('UA[onSessionConnecting]: ', event);
    await _broadcastCallStatus('CONNECTING');
}

const onSessionAccepted = async (event: (IncomingEvent | OutgoingEvent), store: any) => {
    console.debug('UA[onSessionAccepted]: ', event);
    await _broadcastCallStatus('ANSWERED');
    const audio = useAudio();
    if (!audio.remote) {
        audio.remote = new MediaStream();
    }

    store.session?.connection?.getReceivers()?.forEach((receiver: any) => {
        if (receiver.track) audio.remote.addTrack(receiver.track);
    })
    audio.play();
}

const onSessionProgress = async (event: IncomingEvent | OutgoingEvent) => {
    console.debug('UA[onSessionProgress]: ', event);
    await _broadcastCallStatus('RINGING');
}

const onSessionConfirmed = async (event: IncomingAckEvent | OutgoingAckEvent) => {
    console.debug('UA[onSessionConfirmed]: ', event);
    await _broadcastCallStatus('ANSWERED');
}

const onSessionEnded = async (event: EndEvent) => {
    console.debug('UA[onSessionEnded]: ', event);
    if ('Rejected' === event.cause) {
        await _broadcastCallStatus('REJECTED');
    } else if ('Terminated' !== event.cause) {
        await _broadcastCallStatus('ERROR');
    } else {
        await _broadcastCallStatus('TERMINATED');
    }
}

const _broadcastCallStatus = async (status: string) => {
    return await ipcRendererChannel.Broadcast.invoke({
        type: 'Call',
        body: {event: 'StatusUpdated', payload: {status}},
    });
}
