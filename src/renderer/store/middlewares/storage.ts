import { PiniaPlugin } from 'pinia';

type updateFn = (key: string, value: any) => void;

const tryParse = (value: any) => {
  if ('string' !== typeof(value) || !value?.length) return value;

  if ('null' === value || 'undefined' === value) return null;

  if ((value[0] === '{' && value[value.length - 1] === '}')
    || (value[0] === '[' && value[value.length - 1] === ']')) {
    return JSON.parse(value);
  }

  if (value === 'true' || value === 'false') return value === 'true';

  if (!isNaN(+value)) return +value;

  return value;
}

const newupdater = (store: any): updateFn => {
  const _store = store;
  const fn: updateFn = (key: string, value: any) => {
    if (!key?.length) return;

    value = tryParse(value);
    console.log(`Will update ${store.$id}[${key}] to: `, value);

    if (value !== _store[key]) {
      _store[key] = value;
    }
  }

  return fn;
}

const updaters: Record<string, updateFn> = {};

export const storage: PiniaPlugin = ({ store }) => {
  if (!updaters[store.$id]) {
    updaters[store.$id] = newupdater(store);
    console.debug('Storage updater for ', store.$id);
  }
}

window.addEventListener('storage', (event: StorageEvent) => {
  if (!event.isTrusted) return;
  
  console.debug('Storage event', event);

  const { key: eKey, newValue } = event;
  if (!eKey?.length) return;

  const [id, key] = eKey.split('_');
  const updater = updaters[id];
  if ('function' === typeof (updater)) {
    updater(key, newValue);
    console.debug('Storage updated', { id, key, newValue });
  }
});