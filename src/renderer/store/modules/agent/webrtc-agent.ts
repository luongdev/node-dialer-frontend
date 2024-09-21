import { defineStore } from 'pinia';
import { Ref, ref, watch } from 'vue';
import { UA, WebSocketInterface, URI } from 'jssip';
import { useCallStore } from "@store/call/call";

import router from '@renderer/router';
import { EndEvent, IncomingEvent, OutgoingEvent } from "jssip/lib/RTCSession";
import { useAudioStore } from "@store/call/audio";

interface WebrtcAgent {
    connecting: Ref<boolean>;
    connected: Ref<boolean>;
    registered: Ref<boolean>;
}

let _ua: UA;
const _uaHandlers = {
    connecting: () => {
    },
    connected: () => {
    },
    registered: () => {
    },
    registrationFailed: () => {
    },
}

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

            const self = this;
            const socket = new WebSocketInterface('ws://101.99.20.58:7080');
            const contact = new URI('sip', '10000', defaultDomain, null, { transport: 'ws' });

            _ua = new UA({
                sockets: [socket],
                uri: contact.toString(),
                contact_uri: contact.toString(),
                password: 'Abcd@54321',
                register: true,
                user_agent: 'NowfAgent'
            })

            _ua.on('connecting', () => {
                self.connecting = true;

                if (_uaHandlers.connecting) {
                    _uaHandlers.connecting();
                }
            })

            _ua.on('connected', () => {
                self.connected = true;

                if (_uaHandlers.connected) {
                    _uaHandlers.connected();
                }
            })

            _ua.on('registered', () => {
                self.registered = true;

                _ua.on('newRTCSession', (data: any) => {
                    const call = useCallStore();
                    const { from, to } = data.request || {};
                    if (data.originator === 'remote') {
                        console.log('INCOMING CALL', data.request)
                        call.init(data.session.id, 'inbound', from?.uri?.user, to?.uri?.user, data.session);

                        router.push('/incoming-call').catch(console.error)
                    } else {
                        console.log('OUTGOING CALL', data.request)
                        call.init(data.session.id, 'outbound', from?.uri?.user, to?.uri?.user, data.session);
                        router.push('/outgoing-call').catch(console.error)
                    }

                    if (data.session) {
                        const audio = useAudioStore();
                        data.session.on('accepted', (event: IncomingEvent | OutgoingEvent) => {
                            const remoteStream = new MediaStream()
                            data.session.connection?.getReceivers()?.forEach(receiver => {
                                if (receiver.track) {
                                    remoteStream.addTrack(receiver.track)
                                }
                            })

                            audio.play(remoteStream)
                        })

                        data.session.on('failed', (event: EndEvent) => {
                            const call = useCallStore();
                            call.$reset();
                            console.log('Session failed: ', event)
                        })

                        data.session.on('ended', (event: EndEvent) => {
                            const call = useCallStore();
                            call.$reset();
                            console.log('Session ended: ', event)
                        })
                    }
                })


                if (_uaHandlers.registered) {
                    _uaHandlers.registered();
                }
            })

            _ua.on('registrationFailed', () => {
                self.registered = false;

                if (_uaHandlers.registrationFailed) {
                    _uaHandlers.registrationFailed();
                }
            })

            _ua.start();

            return _ua;
        },
        call: async function (number: string, headers: { [k: string]: string } = {}) {
            if (!number) return;

            const stream = await useAudioStore().start();
            let target = number;
            if (!number.startsWith('sip:')) {
                target = `sip:${number}@${defaultDomain}`
            }

            const extraHeaders = Object.keys(headers).map(k => {
                return `X-${k}: ${headers[k]}`;
            })

            _ua.call(target, {
                extraHeaders,
                mediaStream: stream,
                sessionTimersExpires: 120,
                rtcOfferConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: false},
                eventHandlers: {
                    icecandidate: ({ candidate }) => {
                        console.log('Dang candicate day nay', candidate)
                    }
                }
            });


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
