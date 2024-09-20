import {defineStore} from 'pinia';
import {Ref, ref, watch} from 'vue';
import {UA, WebSocketInterface, URI} from 'jssip';

interface WebrtcAgent {
    connecting: Ref<boolean>;
    connected: Ref<boolean>;
    registered: Ref<boolean>;
}

let _ua: UA;
const _uaHandlers = {
    connecting: () => {},
    connected: () => {},
    registered: () => {},
    registrationFailed: () => {},
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
