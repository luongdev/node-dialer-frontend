// todo Split the code in the ipc-main.ts file into multiple files? Inherit via abstract? Or register a callback function?
import { ipcMain } from "electron";
import { IpcMainHandleClass } from "./ipc-main-handle";

export const useMainDefaultIpc = () => {
  return {
    defaultIpc: () => {
      const ipcMainHandle = new IpcMainHandleClass();
      Object.entries(ipcMainHandle).forEach(
        ([ipcChannelName, ipcListener]: [string, () => void]) => {
          console.log("ipcChannelName:", ipcChannelName);
          if (typeof ipcListener === "function") {
            ipcMain.handle(ipcChannelName, ipcListener);
          }
        }
      );
    },
  };
};
