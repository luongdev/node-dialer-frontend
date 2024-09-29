import { PiniaPlugin } from "pinia";
import { ResetFn } from "../modules/types";

export const reset: PiniaPlugin = ({ store }) => {

  if (store.$id === 'user') {
    return;
  }

  const resetFn = store[ResetFn];
  if ('function' === typeof (resetFn)) {
    resetFn.bind(store)();
  }
}