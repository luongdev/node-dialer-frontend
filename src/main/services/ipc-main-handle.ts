import { app, dialog, webContents, BrowserWindow, IpcMainInvokeEvent, MessageBoxReturnValue, MessageBoxOptions } from "electron";
import { getPreloadFile, winURL } from "../config/static-path";
import { updater } from "../services/hot-updater";
import DownloadFile from "../services/download-file";
import Update from "../services/check-update";
import config from "@config/index";
import { IIpcMainHandle } from "../../ipc";
import { webContentSend } from "./web-content-send";

export class IpcMainHandleClass implements IIpcMainHandle {
  private allUpdater: Update;
  constructor() {
    this.allUpdater = new Update();
  }


  StartDownload = (event: IpcMainInvokeEvent, downloadUrl: string): void | Promise<void> => {
    new DownloadFile(BrowserWindow.fromWebContents(event.sender), downloadUrl).start();
  }

  HotUpdate = (event: IpcMainInvokeEvent) => {
    updater(BrowserWindow.fromWebContents(event.sender));
  }


  OpenWin = (_: IpcMainInvokeEvent, arg: { url: string; IsPay?: boolean; PayUrl?: string; sendData?: unknown }) => {
    const childWin = new BrowserWindow({
      titleBarStyle: config.IsUseSysTitle ? "default" : "hidden",
      height: 595,
      useContentSize: true,
      width: 1140,
      autoHideMenuBar: true,
      minWidth: 842,
      frame: config.IsUseSysTitle,
      show: false,
      webPreferences: {
        sandbox: false,
        webSecurity: false,
        devTools: true, //process.env.NODE_ENV === "development",
        scrollBounce: process.platform === "darwin",
        preload: getPreloadFile("preload"),
      },
    });

    if (process.env.NODE_ENV === "development") {
      childWin.webContents.openDevTools({ mode: "undocked", activate: true });
    }

    childWin.loadURL(winURL + `#${arg.url}`);
    childWin.once("ready-to-show", () => {

      childWin.show();
      if (arg.IsPay) {
        const testUrl = setInterval(() => {
          const Url = childWin.webContents.getURL();
          if (Url.includes(arg.PayUrl)) {
            childWin.close();
          }
        }, 1200);

        childWin.on("close", () => {
          clearInterval(testUrl);
        });

      }

    });

    childWin.once("show", () => {
      webContentSend.SendDataTest(childWin.webContents, arg.sendData);
    });

  }


  IsUseSysTitle = (event: IpcMainInvokeEvent): boolean | Promise<boolean> => {
    return config.IsUseSysTitle;
  }


  AppClose = (_: IpcMainInvokeEvent) => {
    app.quit();
  }


  CheckUpdate = (event: IpcMainInvokeEvent) => {
    this.allUpdater.checkUpdate(BrowserWindow.fromWebContents(event.sender));
  }


  ConfirmUpdate = (_: IpcMainInvokeEvent) => {
    this.allUpdater.quitAndInstall();
  }


  OpenMessagebox = async (event: IpcMainInvokeEvent, arg: MessageBoxOptions): Promise<MessageBoxReturnValue> => {
    const res = await dialog.showMessageBox(
      BrowserWindow.fromWebContents(event.sender),
      {
        type: arg.type || "info",
        title: arg.title || "",
        buttons: arg.buttons || [],
        message: arg.message || "",
        noLink: arg.noLink || true,
      }
    );

    return res;

  }

  OpenErrorbox = (_: IpcMainInvokeEvent, arg: { title: string; message: string }) => {
    dialog.showErrorBox(arg.title, arg.message);
  }


  FocusMainWindow = (_: IpcMainInvokeEvent, url: string) => {
    let mainWindow = BrowserWindow.getAllWindows()?.find(w => 'MAIN' === w['name']);
    if (!mainWindow) {

      // TODO: if tray worked, show window to user view

      // const init = new MainInit();
      // init.createMainWindow();

      // mainWindow = init.mainWindow;

      // mainWindow.once("ready-to-show", () => {
      //   mainWindow.show();
      //   mainWindow.focus();
      // });

      return;
    } else {
      mainWindow.show();
      mainWindow.focus();
    }

    // mainWindow.loadURL(winURL + `#${url}`);
  }


  ReloadTrayWindow = (event: IpcMainInvokeEvent, args: string) => {
    let trayWindow = BrowserWindow.getAllWindows()?.find(w => 'TRAY' === w['name']);
    if (!trayWindow) {
      trayWindow.reload();
    }
  }

  Broadcast = (event: IpcMainInvokeEvent, { type, body }) => {
    webContents.getAllWebContents().forEach(wc => {
      if (wc.id === event.sender.id) return;
      debugger
      const trigger = webContentSend[`Broadcast${type}`];
        if (trigger) {
          trigger(wc, body);
        }
    });
  }
}
