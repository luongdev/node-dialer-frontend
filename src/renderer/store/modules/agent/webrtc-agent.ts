import {defineStore} from 'pinia';
import {Ref, ref, watch} from 'vue';
import {UA, WebSocketInterface, URI} from 'jssip';
import {useCallStore} from "@store/call/call";

import router from '@renderer/router';
import {EndEvent, IncomingEvent, OutgoingEvent} from "jssip/lib/RTCSession";
import {useAudioStore} from "@store/call/audio";

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

export const useWebRTCAgent = defineStore({
    id: 'webrtc-agent',
    state: (): WebrtcAgent => {
        const connected = ref(false);
        const connecting = ref(false);
        const registered = ref(false);

        return {connected, registered, connecting}
    },
    actions: {
        start: function () {
            if (this.connected) return _ua;

            const self = this;
            const socket = new WebSocketInterface('ws://101.99.20.58:7080');
            const contact = new URI('sip', '10000', 'voiceuat.metechvn.com', null, {transport: 'ws'});

            _ua = new UA({
                sockets: [socket],
                uri: contact.toString(),
                contact_uri: contact.toString(),
                password: 'Abcd@54321',
                register: true,
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
                    debugger
                    const call = useCallStore();
                    const {from, to} = data.request || {};
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
        call: function(number: string, dialedNumber?: string) {
            const audio = useAudioStore();
            audio.start();

            watch(() => audio.local, (stream) => {
                const session = _ua.call(`sip:${number}@voiceuat.metechvn.com`, {
                    // mediaStream: stream,
                    mediaConstraints: { video: false, audio: true },
                    extraHeaders: [
                        `X-Custom: ${number}`
                    ]
                });

                console.log(session)    
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
