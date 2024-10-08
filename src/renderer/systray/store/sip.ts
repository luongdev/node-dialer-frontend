import { defineStore } from 'pinia';
import { UA, URI, WebSocketInterface } from 'jssip';
import { useAudio } from './audio';

import { useUser } from '@store/auth/user';

let _ua: UA;

interface SIP {
    connecting: boolean;
    connected: boolean;
    registering: boolean;
    registered: boolean;
    autoRegister: boolean;

    error?: string;

    mute: boolean;
    hold: boolean;
}

export const useSIP = defineStore({
    id: 'sip',
    state: (): SIP => {
        return {
            connecting: false,
            connected: false,
            registering: false,
            registered: false,
            autoRegister: true,
            mute: false,
            hold: false,
        };
    },
    actions: {
        connect: async function () {
            if (this.connected) return _ua;

            const user = useUser();
            this.clearFlags();

            const proto = !user.tls ? 'ws' : 'wss';
            const sockets = [new WebSocketInterface(`${proto}://${user.gateway}`)];
            const contact = new URI('sip', user.extension, user.domain, null, { transport: 'ws' }).toString();

            _ua = new UA({
                sockets,
                uri: contact,
                contact_uri: contact,
                password: user.password,
                user_agent: 'NowfAgent',
                register: this.autoRegister,
            });
            this.connecting = true;

            return _ua;
        },

        call: async function (number: string, did = '', headers: { [k: string]: string } = {}) {
            if (!number || !_ua) return;

            const user = useUser();
            const { local } = await useAudio().start();

            let target = number;
            if (!number.startsWith('sip:')) {
                target = `sip:${number}@${user.domain}`
            }

            if (did?.length) headers['Dialed-Number'] = did;

            const extraHeaders = Object.keys(headers).map(k => {
                return `X-${k}: ${headers[k]}`;
            })

            const session = _ua.call(target, {
                extraHeaders,
                mediaStream: local,
                sessionTimersExpires: 120,
                rtcOfferConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: false }
            });

            return session;
        },

        answer: async function () {
            return true;
        },

        terminate: async function (code?: number, cause?: string) {
            return { code, cause };
        },

        toggleMute: async function () {
            return true;
        },

        toggleHold: async function () {
            return true;
        },

        close: function () {
            if (!_ua) {
                return;
            }

            _ua.unregister();
            _ua.stop();

            _ua = null;
            this.clearFlags();
        },

        clearFlags: function () {
            this.error = null;
            this.connecting = false;
            this.connected = false;
            this.registering = false;
            this.registered = false;
        }
    }
});
