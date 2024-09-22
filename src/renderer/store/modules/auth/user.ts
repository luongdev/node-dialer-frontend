import { RemovableRef, Serializer } from "@vueuse/core";
import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";

import { encrypt, decrypt } from '@renderer/utils/crypto';

export interface ICEServer {
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

export const useUserStore = defineStore({
    id: 'user',
    state: () => {
        const extension = useStorage<string>('reg_extension', null);
        const domain = useStorage<string>('reg_domain', null);
        const gateway = useStorage<string>('reg_gateway', null);
        const tls = useStorage<boolean>('reg_tls', null);
        const iceServers = useStorage<(ICEServer | string)[]>('reg_iceServers', null);
        const password = useStorage<string>('reg_password', null, localStorage, { serializer: StoredEncryptSerializer });

        return { extension, domain, gateway, tls, iceServers, password };
    },
    actions: {
        
    }
})