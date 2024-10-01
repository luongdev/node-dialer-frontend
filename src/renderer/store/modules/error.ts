import { RemovableRef } from "@vueuse/core";
import { defineStore } from "pinia";
import { ResetFn, useLocal } from "./types";

export enum ErrorType {
  E_MICROPHONE = 'MICROPHONE',
  E_FORBIDDEN = 'FORBIDDEN',
  E_NETWORK = 'NETWORK',
  E_INTERNAL_SERVER = 'INTERNAL_SERVER',
  E_CALL = 'CALL',
}

export interface ErrorState {
  eType: RemovableRef<ErrorType>;
  eMsg: RemovableRef<string>;
}

export const useError = defineStore({
  id: 'error',
  state: () => {
    const eType = useLocal<string>('error_type', '');
    const eMsg = useLocal<string>('error_msg', '');

    return { eType, eMsg };
  },
  actions: {
    set: function (typ: ErrorType, msg: string) {
      this.eType = typ;
      this.eMsg = msg;
    },

    clear: function () {
      this[ResetFn]();
    },

    [ResetFn]: function () {
      this.eType = '';
      this.eMsg = '';
    },
  }
})
