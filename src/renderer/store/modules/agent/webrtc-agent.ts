import {defineStore} from 'pinia';
import {Ref, ref, watch} from 'vue';
import {UA, WebSocketInterface, URI} from 'jssip';

import router from '@renderer/router';
import {
    EndEvent,
    IncomingAckEvent,
    OutgoingAckEvent,
    IncomingEvent,
    OutgoingEvent,
    RTCSession,
    ConnectingEvent as RTCConnectingEvent
} from "jssip/lib/RTCSession";
import {
    ConnectingEvent,
    ConnectedEvent,
    DisconnectEvent,
    RegisteredEvent,
    UnRegisteredEvent,
    RTCSessionEvent,
} from 'jssip/lib/UA';

import {useAudioStore} from '@store/agent/audio';
import {CallStatus, useCallStore} from "@store/call/call";
import {useUserStore} from '../auth/user';

interface WebrtcAgent {
    connecting: Ref<boolean>;
    connected: Ref<boolean>;
    registering: Ref<boolean>;
    registered: Ref<boolean>;
    error: Ref<string>;
    session?: RTCSession;
}

let _ua: UA;

const password = 'Abcd@54321';
const defaultDomain = 'voiceuat.metechvn.com';

export const useWebRTCAgent = defineStore({
    id: 'webrtc-agent',
    state: (): WebrtcAgent => {
        const connected = ref(false);
        const connecting = ref(false);
        const registering = ref(false);
        const registered = ref(false);
        const error = ref('');

        return {connected, registered, connecting, registering, error};
    },
    actions: {
        start: function () {
            if (this.connected) return _ua;

            const user = useUserStore();

            // const socket = new WebSocketInterface('ws://101.99.20.58:7080');
            const proto = !user.tls ? 'ws' : 'wss';
            const socket = new WebSocketInterface(`${proto}://${user.gateway}`);
            const contact = new URI('sip', user.extension, user.domain, null, {transport: 'ws'}).toString();

            _ua = new UA({
                sockets: [socket],
                uri: contact,
                contact_uri: contact,
                password: user.password,
                user_agent: 'NowfAgent',
                register: true,
            })

            bindConnectionEvents(_ua);
            bindSessionEvents(_ua);

            _ua.start();

            return _ua;
        },
        call: async function (number: string, headers: { [k: string]: string } = {}) {
            if (!number) return;

            const user = useUserStore();
            const {local} = await useAudioStore().start();
            let target = number;
            if (!number.startsWith('sip:')) {
                target = `sip:${number}@${user.domain ?? defaultDomain}`
            }

            const extraHeaders = Object.keys(headers).map(k => {
                return `X-${k}: ${headers[k]}`;
            })

            _ua.call(target, {
                extraHeaders,
                mediaStream: local,
                sessionTimersExpires: 120,
                rtcOfferConstraints: {offerToReceiveAudio: true, offerToReceiveVideo: false}
            });
        },
        answer: async function () {
            if (!this.session) return;

            const audio = useAudioStore();
            const {local} = await audio.start();

            this.session.answer({
                mediaStream: local,
                mediaConstraints: {audio: true, video: false},
                rtcAnswerConstraints: {offerToReceiveAudio: true, offerToReceiveVideo: false},
            })
        },
        terminate: function (code?: number, causes?: string) {
            this.session.terminate();
        },
        stop: function () {
            if (_ua && _ua.isConnected()) {
                _ua.stop();

                watch(this.connected, (connected) => {
                    _ua?.removeAllListeners();
                    if (!connected) {
                        _ua = null;
                    }
                })
            }

            this.connecting = false;
            this.connected = false;
            this.registering = false;
            this.registered = false;
        },
    }
})


const onConnecting = (event: ConnectingEvent) => {
    console.debug('UA[onConnecting]: ', event);

    const wrtcAgent = useWebRTCAgent();
    wrtcAgent.connecting = true;
}

const onConnected = (event: ConnectedEvent) => {
    console.debug('UA[onConnected]: ', event);

    const wrtcAgent = useWebRTCAgent();
    wrtcAgent.connected = true;
    wrtcAgent.connecting = false;
    wrtcAgent.registering = true;
    wrtcAgent.error = '';
}

const onDisconnected = (event: DisconnectEvent) => {
    console.debug('UA[onDisconnected]: ', event);

    const wrtcAgent = useWebRTCAgent();
    wrtcAgent.connected = false;
    wrtcAgent.connecting = false;
    wrtcAgent.registered = false;
    wrtcAgent.registering = false;
    wrtcAgent.error = '';
}

const onRegistered = (event: RegisteredEvent) => {
    console.debug('UA[onRegistered]: ', event);

    const wrtcAgent = useWebRTCAgent();
    wrtcAgent.registered = true;
    wrtcAgent.registering = false;
}

const onUnregistered = (event: UnRegisteredEvent) => {
    console.debug('UA[onUnregistered]: ', event);

    const wrtcAgent = useWebRTCAgent();
    wrtcAgent.registered = false;
}

const onRegistrationFailed = (event: UnRegisteredEvent) => {
    console.debug('UA[onRegistrationFailed]: ', event);

    const wrtcAgent = useWebRTCAgent();
    wrtcAgent.stop();

    event.response.status_code === 403 && (wrtcAgent.error = 'Thông tin đăng nhập chưa đúng');
    event.response.status_code === 500 && (wrtcAgent.error = 'Lỗi hệ thống, vui lòng thử lại sau');

    wrtcAgent.registered = false;
    wrtcAgent.registering = false;
}

const onRTPSession = async (event: RTCSessionEvent) => {
    console.debug('UA[onRTPSession]: ', event);

    const {request: {from, to}, session} = event || {};
    if (!from || !to || !session) {
        console.error('UA[onRTPSession] invalid request ', event);
        return;
    }

    const call = useCallStore();
    const wrtcAgent = useWebRTCAgent();

    wrtcAgent.session = session;
    call.init(session.id, from?.uri?.user, to?.uri?.user, 'remote' === event.originator);

    router.push('remote' === event.originator ? '/incoming-call' : '/outgoing-call').catch(console.error)

    session.on('accepted', onSessionAccepted);
    session.on('confirmed', onSessionConfirmed);
    session.on('failed', onSessionEnded);
    session.on('ended', onSessionEnded);


    // Outbound call trigger connection
    session.on('connecting', onSessionConnecting);
    session.on('sending', (e) => console.debug('UA[onSessionSending]: ', e));

    // Inbound call trigger progress & peerconnection
    session.on('progress', onSessionProgress);
    session.on('peerconnection', (event: any) => console.debug('UA[onSessionPeerConnection]: ', event));

    session.on('icecandidate', (event: any) => console.debug('UA[onSessionCandidate]: ', event));
}

const onSessionConnecting = (event: RTCConnectingEvent) => {
    console.log('UA[onSessionConnecting] ', event.request)
    const call = useCallStore();
    call.status = CallStatus.S_CONNECTING;
}

const onSessionAccepted = async (event: (IncomingEvent | OutgoingEvent)) => {
    const call = useCallStore();
    const audio = useAudioStore();
    const wrtcAgent = useWebRTCAgent();

    call.status = CallStatus.S_ANSWERED;
    call.answerTime = Date.now();
    const {remote} = await audio.start();
    wrtcAgent.session?.connection?.getReceivers()?.forEach(receiver => {
        if (receiver.track) remote.addTrack(receiver.track);
    })

    audio.play();

}

const onSessionProgress = (event: IncomingEvent | OutgoingEvent) => {
    console.debug('UA[onSessionProgress]: ', event);
    const call = useCallStore();
    call.status = CallStatus.S_RINGING;
}

const onSessionConfirmed = (event: IncomingAckEvent | OutgoingAckEvent) => {
    console.debug('UA[onSessionConfirmed]: ', event);
    const call = useCallStore();

    if (CallStatus.S_ANSWERED !== call.status) {
        call.status = CallStatus.S_ANSWERED;
        call.answerTime = Date.now();
    }
}

const onSessionEnded = (event: EndEvent) => {
    console.debug('UA[onSessionEnded]: ', event);
    const call = useCallStore();
    call.id = '';
    call.status = '';

    if (event.cause) {
        call.error = event.cause;
        console.log(event.cause);
        call.status = CallStatus.S_ERROR;
    }
}

const bindConnectionEvents = (ua: UA) => {
    if (!ua) return;

    ua.on('connecting', onConnecting);
    ua.on('connected', onConnected);
    ua.on('disconnected', onDisconnected);
    ua.on('registered', onRegistered);
    ua.on('unregistered', onUnregistered);
    ua.on('registrationFailed', onRegistrationFailed);

    return ua;
}

const bindSessionEvents = (ua: UA) => {
    ua.on('newRTCSession', onRTPSession);
}
