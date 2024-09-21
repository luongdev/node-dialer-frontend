import { defineStore } from 'pinia';
import { Ref, ref, watch } from 'vue';
import { UA, WebSocketInterface, URI } from 'jssip';

import router from '@renderer/router';
import { EndEvent, IncomingEvent, OutgoingEvent, RTCSession } from "jssip/lib/RTCSession";
import {
    ConnectingEvent,
    ConnectedEvent,
    DisconnectEvent,
    RegisteredEvent,
    UnRegisteredEvent,
    RTCSessionEvent,
} from 'jssip/lib/UA';

import { useAudioStore } from '@store/agent/audio';
import { useCallStore } from "@store/call/call";

interface WebrtcAgent {
    connecting: Ref<boolean>;
    connected: Ref<boolean>;
    registered: Ref<boolean>;
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
        const registered = ref(false);

        return { connected, registered, connecting }
    },
    actions: {
        start: function () {
            if (this.connected) return _ua;

            const socket = new WebSocketInterface('ws://101.99.20.58:7080');
            const contact = new URI('sip', '10000', defaultDomain, null, { transport: 'ws' }).toString();

            _ua = new UA({
                sockets: [socket],
                uri: contact,
                contact_uri: contact,
                password: password,
                register: true,
                user_agent: 'NowfAgent'
            })

            bindConnectionEvents(_ua);
            bindSessionEvents(_ua);

            _ua.start();

            return _ua;
        },
        call: async function (number: string, headers: { [k: string]: string } = {}) {
            if (!number) return;

            const { local } = await useAudioStore().start();
            let target = number;
            if (!number.startsWith('sip:')) {
                target = `sip:${number}@${defaultDomain}`
            }

            const extraHeaders = Object.keys(headers).map(k => {
                return `X-${k}: ${headers[k]}`;
            })

            _ua.call(target, {
                extraHeaders,
                mediaStream: local,
                sessionTimersExpires: 120,
                rtcOfferConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: false },
                eventHandlers: {
                    icecandidate: ({ candidate }) => {
                        console.log('Dang candicate day nay', candidate)
                    }
                }
            });


        },
        answer: async function () {
            if (!this.session) return;

            const audio = useAudioStore();
            const { local } = await audio.start();

            this.session.answer({
                mediaStream: local,
                mediaConstraints: { audio: true, video: false },
                rtcAnswerConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: false },
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
}

const onDisconnected = (event: DisconnectEvent) => {
    console.debug('UA[onDisconnected]: ', event);

    const wrtcAgent = useWebRTCAgent();
    wrtcAgent.connected = false;
    wrtcAgent.connecting = false;
    wrtcAgent.registered = false;
}

const onRegistered = (event: RegisteredEvent) => {
    console.debug('UA[onRegistered]: ', event);

    const wrtcAgent = useWebRTCAgent();
    wrtcAgent.registered = true;
}

const onUnregistered = (event: UnRegisteredEvent) => {
    console.debug('UA[onUnregistered]: ', event);

    const wrtcAgent = useWebRTCAgent();
    wrtcAgent.registered = false;
}

const onRegistrationFailed = (event: UnRegisteredEvent) => {
    console.debug('UA[onRegistrationFailed]: ', event);

    const wrtcAgent = useWebRTCAgent();
    wrtcAgent.registered = false;
}

const onRTPSession = async (event: RTCSessionEvent) => {
    console.debug('UA[onRTPSession]: ', event);

    const { request: { from, to }, session } = event || {};
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
    session.on('failed', onSessionEnded);
    session.on('ended', onSessionEnded);


    session.on('peerconnection', (event: any) => {
        console.log('Day event event peerconnection', event);
    });
    session.on('connecting', (event: any) => {
        console.log('Day event event connecting', event);
    });
    session.on('sending', (event: any) => {
        console.log('Day event event sending', event);
    });
    session.on('progress', (event: any) => {
        console.log('Day event event progress', event);
    });
    session.on('confirmed', (event: any) => {
        console.log('Day event event confirmed', event);
    });
    session.on('newDTMF', (event: any) => {
        console.log('Day event event newDTMF', event);
    });
    session.on('newInfo', (event: any) => {
        console.log('Day event event newInfo', event);
    });
    session.on('hold', (event: any) => {
        console.log('Day event event hold', event);
    });
    session.on('unhold', (event: any) => {
        console.log('Day event event unhold', event);
    });
    session.on('muted', (event: any) => {
        console.log('Day event event muted', event);
    });
    session.on('unmuted', (event: any) => {
        console.log('Day event event unmuted', event);
    });
    session.on('reinvite', (event: any) => {
        console.log('Day event event reinvite', event);
    });
    session.on('update', (event: any) => {
        console.log('Day event event update', event);
    });
    session.on('refer', (event: any) => {
        console.log('Day event event refer', event);
    });
    session.on('replaces', (event: any) => {
        console.log('Day event event replaces', event);
    });
    session.on('sdp', (event: any) => {
        console.log('Day event event sdp', event);
    });
    session.on('icecandidate', (event: any) => {
        console.log('Day event event icecandidate', event);
    });
}

const onSessionAccepted = async (event: (IncomingEvent | OutgoingEvent)) => {
    const audio = useAudioStore();
    const wrtcAgent = useWebRTCAgent();


    const { remote } = await audio.start();
    wrtcAgent.session?.connection?.getReceivers()?.forEach(receiver => {
        if (receiver.track) remote.addTrack(receiver.track);
    })

    audio.play();

}

const onSessionEnded = (event: EndEvent) => {
    console.debug('UA[onSessionEnded]: ', event);
    const call = useCallStore();
    call.$reset();
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