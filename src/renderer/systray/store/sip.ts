import {defineStore} from 'pinia';
import {UA, URI, WebSocketInterface} from 'jssip';
import {
    RTCSession
} from 'jssip/lib/RTCSession';

import {useAudio} from './audio';

import {useUserStore} from '@store/auth/user';

interface SIP {
    connecting: boolean;
    connected: boolean;
    registering: boolean;
    registered: boolean;
    autoRegister: boolean;

    error?: string;

    mute: boolean;
    hold: boolean;

    ua?: UA;
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
        async connect() {
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
            const contact = new URI('sip', user.extension, user.domain, null, {transport: 'ws'}).toString();

            this.ua = new UA({
                sockets,
                uri: contact,
                contact_uri: contact,
                password: user.password,
                user_agent: 'NowfAgent',
                register: this.autoRegister,
            });
        },
    }
});

