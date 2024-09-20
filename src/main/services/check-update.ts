import { autoUpdater } from "electron-updater";
import { BrowserWindow } from "electron";
import { webContentSend } from "./web-content-send";
/**
 * -1 Failed to check for updates 0 Checking for updates 1 New version detected, ready to download 2 No new version detected 3 Downloading 4 Download completed
 **/
class Update {
  public mainWindow: BrowserWindow;
  constructor() {
    autoUpdater.setFeedURL("http://127.0.0.1:25565/");


    autoUpdater.on("error", (err) => {
      console.log("An error occurred while updating", err.message);
      if (err.message.includes("sha512 checksum mismatch")) {
        this.Message(this.mainWindow, -1, "sha512 verification failed");
      } else {
        this.Message(this.mainWindow, -1, "Please see the main process console for error information.");
      }
    });

    autoUpdater.on("checking-for-update", () => {
      console.log("Start checking for updates");
      this.Message(this.mainWindow, 0);
    });

    autoUpdater.on("update-available", () => {
      this.Message(this.mainWindow, 1);
    });

    autoUpdater.on("update-not-available", () => {
      this.Message(this.mainWindow, 2);
    });

    autoUpdater.on("download-progress", (progressObj) => {
      this.Message(this.mainWindow, 3, `${progressObj}`);
    });

    autoUpdater.on("update-downloaded", () => {
      console.log("下载完成");
      this.Message(this.mainWindow, 4);
    });
  }

  Message(mainWindow: BrowserWindow, type: number, data?: string) {
    const senddata = {
      state: type,
      msg: data || "",
    };
    webContentSend(mainWindow.webContents, "UpdateMsg", senddata);
  }

  checkUpdate(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    autoUpdater.checkForUpdates().catch((err) => {
      console.log("Network connection issues", err);
    });
  }

  quitAndInstall() {
    autoUpdater.quitAndInstall();
  }
}

export default Update;
