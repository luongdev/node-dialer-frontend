import { PiniaPlugin } from "pinia";
import {
    ConnectedEvent,
    ConnectingEvent,
    DisconnectEvent,
    RegisteredEvent,
    RTCSessionEvent,
    UA,
    UnRegisteredEvent
} from 'jssip/lib/UA';
import { useSIP } from "../sip";
import { useAudio } from "../audio";
import {
    EndEvent,
    ConnectingEvent as RTCConnectingEvent,
    IncomingAckEvent,
    IncomingEvent,
    OutgoingAckEvent,
    OutgoingEvent
} from "jssip/lib/RTCSession";

import { CallStatus, useCall } from '@store/call/call';

const { ipcRendererChannel } = window;

ipcRendererChannel.BroadcastAgent.on(async (_, data) => {
    const { event } = data || {};

    const sip = useSIP();
    if ('StartConnect' === event) {
        const audio = useAudio();
        await audio.start();

        await sip.connect();
    }
});

ipcRendererChannel.BroadcastCall.on(async (_, data) => {
    const { event, payload } = data || {};

    const sip = useSIP();
    if ('Make' === event) {
        const { number, headers } = payload || {};
        sip.call(number, headers);
    } else if ('Answer' === event) {
        sip.answer();
    } else if ('Terminated' === event) {
        const { code, cause } = payload || {};
        sip.terminate(code, cause);
    } else if ('ToggleHold' === event) {
        await sip.toggleHold();
    } else if ('ToggleMute' === event) {
        await sip.toggleMute();
    }
});

const connectInject = async (ua: UA, store: any) => {
    bindEvents(ua, store);

    ua.start();
}

export const sipMiddleware: PiniaPlugin = ({ store }) => {
    if (store.$id !== 'sip') return;

    store.$onAction(act => {
        if (act.name === 'connect') {
            act.after(async (ua: UA) => await connectInject(ua, act.store));
        } else if (act.name === 'call') {
            act.after(async (session) => {
                if (!session) { useCall().status = CallStatus.S_ERROR; }
            });
        }
    }, true);

    store.$subscribe(async (_, state) => {
        await ipcRendererChannel.Broadcast.invoke({
            type: 'Agent',
            body: { event: 'StateUpdated', payload: { ...state } },
        });
    }, { detached: true })
}


const bindEvents = (ua: UA, store: any) => {
    if (!ua) return;

    ua.on('connecting', (event: any) => connectingHandler(event, store));
    ua.on('connected', (event: any) => connectedHandler(event, store));
    ua.on('disconnected', (event: any) => disconnectedHandler(event, store));
    ua.on('registered', (event: any) => registeredHandler(event, store));
    ua.on('unregistered', (event: any) => unregisteredHandler(event, store));
    ua.on('registrationFailed', (event: any) => registrationFailedHandler(event, store));

    ua.on('newRTCSession', (event: any) => rtcSessionHandler(event, store));
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
    const { request, session } = event || {};
    const { from, to } = request || {};
    if (!from || !to || !session) {
        return;
    }

    const call = useCall();
    call.init({
        id: session.id,
        to: to.uri.user,
        from: from.uri.user,
        startTime: Date.now(),
        inbound: event.originator === 'remote',
    });

    store.session = session;

    session.on('accepted', (event: any) => onSessionAccepted(event, store));
    session.on('confirmed', onSessionConfirmed);
    session.on('failed', (event: any) => onSessionEnded(event, store));
    session.on('ended', (event: any) => onSessionEnded(event, store));

    session.on('muted', async (event: any) => {
        console.debug('UA[onSessionMuted]: ', event);
        store.mute = true;

        await _broadcastCallState({ mute: true, hold: store.hold });
    });

    session.on('unmuted', async (event: any) => {
        console.debug('UA[onSessionUnmuted]: ', event);
        store.mute = false;

        await _broadcastCallState({ mute: false, hold: store.hold });
    });

    session.on('hold', async (event: any) => {
        console.debug('UA[onSessionHold]: ', event);
        store.hold = true;

        await _broadcastCallState({ hold: true, mute: store.mute });
    });

    session.on('unhold', async (event: any) => {
        console.debug('UA[onSessionUnhold]: ', event);
        store.hold = false;

        await _broadcastCallState({ hold: false, mute: store.mute });
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

    const call = useCall();
    call.status = CallStatus.S_CONNECTING;
}

const onSessionAccepted = async (event: (IncomingEvent | OutgoingEvent), store: any) => {
    console.debug('UA[onSessionAccepted]: ', event);

    const call = useCall();
    call.status = CallStatus.S_ANSWERED;

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

    const call = useCall();
    call.status = CallStatus.S_RINGING;
}

const onSessionConfirmed = async (event: IncomingAckEvent | OutgoingAckEvent) => {
    console.debug('UA[onSessionConfirmed]: ', event);

    const call = useCall();
    call.status = CallStatus.S_ANSWERED;
}

const onSessionEnded = async (event: EndEvent, store: any) => {
    console.debug('UA[onSessionEnded]: ', event);
    const call = useCall();
    if ('Rejected' === event.cause) {
        call.status = CallStatus.S_REJECTED;
    } else if ('Terminated' !== event.cause) {
        call.status = CallStatus.S_ERROR;
    } else {
        call.status = CallStatus.S_TERMINATED;
    }

    store.session.removeAllListeners();
    store.session = null;
}

const _broadcastCallStatus = async (status: string) => {
    return await ipcRendererChannel.Broadcast.invoke({
        type: 'Call',
        body: { event: 'StatusUpdated', payload: { status } },
    });
}

const _broadcastCallState = async (state: { mute?: boolean, hold?: boolean }) => {
    return await ipcRendererChannel.Broadcast.invoke({
        type: 'Call',
        body: { event: 'StateUpdated', payload: { ...state } },
    });
}
