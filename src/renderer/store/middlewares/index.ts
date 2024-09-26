import { PiniaPlugin } from 'pinia';
import { ResetFn } from '@store/types';

type updateFn = (key: string, value: any) => void;

const newupdater = (store: any): updateFn => {
  const _store = store;
  const fn: updateFn = (key: string, value: any) => {
    console.log(_store);
    if (!key?.length) return;

    if (value !== _store[key]) {
      _store[key] = value;
    }
  }

  return fn;
}

const updaters: Record<string, updateFn> = {};

export const reset: PiniaPlugin = ({ store }) => {
  const resetFn = store[ResetFn];
  if ('function' === typeof (resetFn)) resetFn(store);
}

export const storage: PiniaPlugin = ({ store }) => {
  if (!updaters[store.$id]) {
    updaters[store.$id] = newupdater(store);
    console.debug('Storage updater for ', store.$id);
  }
}

window.addEventListener('storage', (event: StorageEvent) => {
  if (!event.isTrusted) {
    console.debug('Storage event', event);
    return;
  }

  const { key: eKey, newValue } = event;
  if (!eKey?.length) return;

  const [id, key] = eKey.split('_');
  const updater = updaters[id];
  if ('function' === typeof (updater)) {
    updater(key, newValue);
    console.debug('Storage updated', { id, key, newValue });
  }
});