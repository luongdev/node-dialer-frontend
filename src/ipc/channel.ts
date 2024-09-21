import type { ProgressInfo } from "electron-updater";

export interface IpcMainEventListener<Send = void, Receive = void> {
  ipcMainHandle: Send extends void
  ? (event: Electron.IpcMainInvokeEvent) => Receive | Promise<Receive>
  : (
    event: Electron.IpcMainInvokeEvent,
    args: Send
  ) => Receive | Promise<Receive>;
  ipcRendererInvoke: Send extends void
  ? () => Promise<Receive>
  : (args: Send) => Promise<Receive>;
}

export interface IpcRendererEventListener<Send = void> {
  ipcRendererOn: Send extends void
  ? (event: Electron.IpcRendererEvent) => void
  : (event: Electron.IpcRendererEvent, args: Send) => void;
  webContentSend: Send extends void
  ? (webContents: Electron.WebContents) => void
  : (webContents: Electron.WebContents, args: Send) => void;
}

export class IpcChannelMainClass {
  IsUseSysTitle: IpcMainEventListener<void, boolean> = null;
  AppClose: IpcMainEventListener = null;
  CheckUpdate: IpcMainEventListener = null;
  ConfirmUpdate: IpcMainEventListener = null;
  OpenMessagebox: IpcMainEventListener<Electron.MessageBoxOptions, Electron.MessageBoxReturnValue> = null;
  StartDownload: IpcMainEventListener<string> = null;
  OpenErrorbox: IpcMainEventListener<{ title: string; message: string }> = null;
  StartServer: IpcMainEventListener<void, string> = null;
  StopServer: IpcMainEventListener<void, string> = null;
  HotUpdate: IpcMainEventListener = null;


  OpenWin: IpcMainEventListener<{

    url: string;
    IsPay?: boolean;
    PayUrl?: string;
    sendData?: unknown;
  }> = null;
}
export class IpcChannelRendererClass {
  // ipcRenderer
  DownloadProgress: IpcRendererEventListener<number> = null;
  DownloadError: IpcRendererEventListener<Boolean> = null;
  DownloadPaused: IpcRendererEventListener<Boolean> = null;
  DownloadDone: IpcRendererEventListener<{
    filePath: string;
  }> = null;
  UpdateMsg: IpcRendererEventListener<{
    state: number;
    msg: string | ProgressInfo;
  }> = null;
  UpdateProcessStatus: IpcRendererEventListener<{
    status:
    | "init"
    | "downloading"
    | "moving"
    | "finished"
    | "failed"
    | "download";
    message: string;
  }> = null;

  SendDataTest: IpcRendererEventListener<unknown> = null;
  BrowserViewTabDataUpdate: IpcRendererEventListener<{
    bvWebContentsId: number;
    title: string;
    url: string;
    status: 1 | -1;
  }> = null;
  BrowserViewTabPositionXUpdate: IpcRendererEventListener<{
    dragTabOffsetX: number;
    positionX: number;
    bvWebContentsId: number;
  }> = null;
  BrowserTabMouseup: IpcRendererEventListener;
  HotUpdateStatus: IpcRendererEventListener<{
    status: string;
    message: string;
  }> = null;
}
