import { PiniaPlugin } from "pinia";
import { statusWatcherStart } from "../modules/call/call";

export const callStoreMiddleware: PiniaPlugin = () => {
    statusWatcherStart();
}