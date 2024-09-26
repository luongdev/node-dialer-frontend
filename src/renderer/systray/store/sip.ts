import { defineStore } from 'pinia';
import { UA, URI, WebSocketInterface } from 'jssip';
import {
    RTCSession
} from 'jssip/lib/RTCSession';

import { useAudio } from './audio';

import { useUserStore } from '@store/auth/user';

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

    session?: RTCSession;
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
            if (this.connecting || this.connected) {
                return;
            }

            const audio = useAudio();
            const user = useUserStore();
            try {
                await audio.start();
            } catch (e) {
                this.error = e.message;
                return;
            }

            this.connecting = true;
            this.error = undefined;

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

            return _ua;
        },

        call: async function (number: string, headers: { [k: string]: string } = {}) {
            if (!number || !_ua) return;

            const user = useUserStore();
            const {local} = await useAudio().start();

            let target = number;
            if (!number.startsWith('sip:')) {
                target = `sip:${number}@${user.domain}`
            }

            if (user.currentDID?.length) {
                headers['Dialed-Number'] = user.currentDID;
            }

            const extraHeaders = Object.keys(headers).map(k => {
                return `X-${k}: ${headers[k]}`;
            })

            const session = _ua.call(target, {
                extraHeaders,
                mediaStream: local,
                sessionTimersExpires: 120,
                rtcOfferConstraints: {offerToReceiveAudio: true, offerToReceiveVideo: false}
            });

            return session;
        },

        toggleMute: async function () {
            if (!this.session) return;

            const { audio: audioMuted } = this.session.isMuted();
            if (audioMuted) {
                this.session.unmute({ audio: true });
            } else {
                this.session.mute({ audio: true });
            }
        },

        toggleHold: async function () {
            if (!this.session) return;

            const { local: localHold } = this.session.isOnHold();
            if (localHold) {
                this.session.unhold();
            } else {
                this.session.hold();
            }
        },

    }
});

