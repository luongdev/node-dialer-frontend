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
    OutgoingEvent,
    RTCSession
} from "jssip/lib/RTCSession";

import { CallStatus, useCall } from '@store/call/call';
import { ResetFn } from "@renderer/store/modules/types";
import { useUser } from "@renderer/store/modules/auth/user";

const { ipcRendererChannel } = window;

ipcRendererChannel.BroadcastAgent.on(async (_, data) => {
    const { event } = data || {};

    const sip = useSIP();
    if ('StartConnect' === event) {
        await sip.connect();
    } else if ('Stop' === event) {
        sip.close();
        audio.stop();
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

let _session: RTCSession;

export const sipMiddleware: PiniaPlugin = ({ store }) => {
    if (store.$id !== 'sip') return;

    store.$onAction(act => {
        if (act.name === 'connect') {
            act.after(async (ua: UA) => {
                if (!ua) {
                    console.warn('Events bind before ua created');
                    return;
                }

                if (!store.connected) {
                    await connectInject(ua, act.store)
                }
            });
        } else if (act.name === 'call') {
            act.after(async (session) => {
                if (!session) { useCall().status = CallStatus.S_ERROR; }
            });
        } else if (act.name === 'answer') {
            act.after(() => {
                _session.answer({
                    pcConfig: { iceServers: [] },
                    rtcAnswerConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: false },
                });
            });
        } else if (act.name === 'terminate') {
            act.after(({ code, cause }: { code?: number; cause?: string }) => {
                _session.terminate({ status_code: code ?? 200, reason_phrase: cause ?? 'NORMAL_CLEARING' });
            });
        } else if (act.name === 'toggleMute') {
            act.after(() => {
                const { audio: audioMuted } = _session.isMuted();
                if (audioMuted) {
                    _session.unmute({ audio: true });
                } else {
                    _session.mute({ audio: true });
                }
            });
        } else if (act.name === 'toggleHold') {
            act.after(() => {
                const { local: localHold } = _session.isOnHold();
                if (localHold) {
                    _session.unhold();
                } else {
                    _session.hold();
                }
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
    const user = useUser();
    user.loggedIn = false;
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
    const user = useUser();
    user.loggedIn = false;

    store.connected = false;
    store.connecting = false;

    if (event.error) {
        store.error = event.reason;
        user.error = event.reason;
    }

}

const registeredHandler = async (_: RegisteredEvent, store: any) => {
    store.registering = false;
    store.registered = true;

    const user = useUser();
    user.loggedIn = true;
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

    _session = session;

    const call = useCall();
    call.init({
        id: session.id,
        to: to.uri.user,
        from: from.uri.user,
        startTime: Date.now(),
        inbound: event.originator === 'remote',
    });

    session.connection?.addEventListener('track', async (event: RTCTrackEvent) => {
        const audio = useAudio();
        audio.remote.addTrack(event.track);
        audio.play();
    });

    session.on('accepted', (event: any) => onSessionAccepted(event, store));
    session.on('confirmed', onSessionConfirmed);
    session.on('failed', (event: any) => onSessionEnded(event, store));
    session.on('ended', (event: any) => onSessionEnded(event, store));

    session.on('muted', async (event: any) => {
        console.debug('UA[onSessionMuted]: ', event);
        const call = useCall();
        call.mute = true;

        // await _broadcastCallState({ mute: true, hold: store.hold });
    });

    session.on('unmuted', async (event: any) => {
        console.debug('UA[onSessionUnmuted]: ', event);
        const call = useCall();
        call.mute = false;
    });

    session.on('hold', async (event: any) => {
        console.debug('UA[onSessionHold]: ', event);
        const call = useCall();
        call.hold = true;
    });

    session.on('unhold', async (event: any) => {
        console.debug('UA[onSessionUnhold]: ', event);
        const call = useCall();
        call.hold = false;
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
    call.answerTime = Date.now();
    call.status = CallStatus.S_ANSWERED;

    if (event.originator === 'local') {
        const audio = useAudio();
        _session?.connection?.getReceivers()?.forEach((receiver: any) => {
            if (receiver.track) audio.remote.addTrack(receiver.track);
        })
        audio.play();
    }
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
    useAudio().stop();

    if ('Rejected' === event.cause) {
        call.status = CallStatus.S_REJECTED;
    } else if ('Canceled' === event.cause) {
        call.status = CallStatus.S_CANCELED;
    } else if ('Terminated' !== event.cause) {
        call.status = CallStatus.S_ERROR;
    } else {
        call.status = CallStatus.S_TERMINATED;
    }

    call.timer = setTimeout(() => call[ResetFn]?.(), 1500);
}

