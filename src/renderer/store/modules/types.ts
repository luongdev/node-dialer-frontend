import { Serializer, useStorage } from '@vueuse/core';
import { tryParse } from '../middlewares/storage';

export const ResetFn = Symbol('reset');

export const JSONSerializer: Serializer<any> = {
  read: (raw: string) => {
    const val = tryParse(raw);

    return val;
  },
  write: (value: any) => {
    if (!value) return value;
    if ('string' === typeof (value)) return value;

    return JSON.stringify(value);
  }
}

export function useLocal<T>(key: string, defaultValue?: T) {
  return useStorage<T>(key, defaultValue, localStorage, { serializer: JSONSerializer });
}

export function useSession<T>(key: string, defaultValue?: T) {
  return useStorage<T>(key, defaultValue, sessionStorage, { serializer: JSONSerializer });
}