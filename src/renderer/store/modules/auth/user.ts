import { RemovableRef, Serializer } from "@vueuse/core";
import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";

import { encrypt, decrypt } from '@renderer/utils/crypto';
import { ResetFn, useLocal } from "../types";

export type ICEServer = {
    protocol: 'turn' | 'stun';
    address: string;
    user?: string;
    password?: string;
}

export interface UserState {
    extension: RemovableRef<string>;
    domain: RemovableRef<string>;
    password: RemovableRef<string>;
    gateway: RemovableRef<string>;
    tls: RemovableRef<boolean>;
    iceServers: RemovableRef<(ICEServer | string)[]>;
    currentDID: RemovableRef<string>;
    listDID: RemovableRef<string[]>;

    loggedIn: RemovableRef<boolean>;
    error?: string;
}

export const StoredEncryptSerializer: Serializer<string> = {
    read: (raw: string): string => {
        if (!raw?.length) return null;

        return decrypt(raw);
    },
    write: (value: string): string => {
        if (!value?.length) return null;

        return encrypt(value);
    },
}

export const StoredJSONSerializer: Serializer<any> = {
    read: (raw: string) => {
        if (!raw?.length) return null;

        return JSON.parse(raw);
    },
    write: (value: any): string => {
        if (!value) return null;

        return JSON.stringify(value);
    },
}

export const useUser = defineStore({
    id: 'user',
    state: () => {
        const extension = useLocal<string>('user_extension', null);
        const domain = useLocal<string>('user_domain', null);
        const gateway = useLocal<string>('user_gateway', null);
        const tls = useLocal<boolean>('user_tls', null);
        const iceServers = useLocal<(ICEServer | string)[]>('user_iceServers', []);
        const password = useStorage<string>('user_password', null, localStorage, { serializer: StoredEncryptSerializer });

        const currentDID = useLocal<string>('call_currentDID', null);
        const listDID = useLocal<string[]>('call_listDID', []);

        const loggedIn = useLocal<boolean>('user_loggedIn', null);

        return { extension, domain, gateway, tls, iceServers, password, currentDID, listDID, loggedIn, error: null };
    },
    actions: {
        register: async function () {
            return true;
        },

        signOut: function () {
            return true;
        },

        deviceCheck: function() {
            return true;
        },

        validate: function () {
            return this.extension && this.domain && this.gateway && this.password;
        },
        [ResetFn]: function () {
            this.extension = null;
            this.domain = null;
            this.gateway = null;
            this.tls = null;
            this.iceServers = null;
            this.password = null;
            this.currentDID = null;
        },
    }
})
