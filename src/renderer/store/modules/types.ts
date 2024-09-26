import { Serializer, useStorage } from '@vueuse/core';

export const ResetFn = Symbol('reset');

export const JSONSerializer: Serializer<any> = {
  read: (raw: string) => {
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (_) {
      return raw;
    }
  },
  write: (value: any) => {
    if (!value) return null;
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