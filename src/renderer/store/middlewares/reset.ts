import { PiniaPlugin } from "pinia";
import { ResetFn } from "../modules/types";

export const reset: PiniaPlugin = ({ store }) => {
  const resetFn = store[ResetFn];
  if ('function' === typeof (resetFn)) {
    resetFn.bind(store)();
  }
}