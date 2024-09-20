import config from "@config/index";
import { BrowserWindow, dialog } from "electron";
import { winURL, loadingURL, getPreloadFile } from "../config/static-path";
import { useProcessException } from "@main/hooks/exception-hook";


class MainInit {
  public winURL: string = "";
  public shartURL: string = "";
  public loadWindow: BrowserWindow = null;
  public mainWindow: BrowserWindow = null;
  private childProcessGone = null;

  constructor() {
    const { childProcessGone } = useProcessException();
    this.winURL = winURL;
    this.shartURL = loadingURL;
    this.childProcessGone = childProcessGone;
  }
  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      titleBarOverlay: {
        color: "#fff",
      },
      titleBarStyle: config.IsUseSysTitle ? "default" : "hidden",
      height: 800,
      useContentSize: true,
      width: 1700,
      minWidth: 1366,
      show: false,
      frame: config.IsUseSysTitle,
      webPreferences: {
        sandbox: false,
        webSecurity: false,
        devTools: process.env.NODE_ENV === "development",
        scrollBounce: process.platform === "darwin",
        preload: getPreloadFile("preload"),
      },
    });

    this.mainWindow.loadURL(this.winURL);
    this.mainWindow.once("ready-to-show", () => {
      this.mainWindow.show();
      if (config.UseStartupChart) this.loadWindow.destroy();
    });
    if (process.env.NODE_ENV === "development") {
      this.mainWindow.webContents.openDevTools({
        mode: "undocked",
        activate: true,
      });
    }
    this.mainWindow.on("unresponsive", () => {
      dialog
        .showMessageBox(this.mainWindow, {
          type: "warning",
          title: "warn",
          buttons: ["Overload", "quit"],
          message: "Graphical process becomes unresponsive，Whether to wait for it to recover？",
          noLink: true,
        })
        .then((res) => {
          if (res.response === 0) this.mainWindow.reload();
          else this.mainWindow.close();
        });
    });

    this.childProcessGone(this.mainWindow);
    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });
  }

  loadingWindow(loadingURL: string) {
    this.loadWindow = new BrowserWindow({
      width: 400,
      height: 600,
      frame: false,
      skipTaskbar: true,
      transparent: true,
      resizable: false,
      webPreferences: {
        experimentalFeatures: true,
        preload: getPreloadFile("preload"),
      },
    });

    this.loadWindow.loadURL(loadingURL);
    this.loadWindow.show();
    this.loadWindow.setAlwaysOnTop(true);
    setTimeout(() => {
      this.createMainWindow();
    }, 1500);
  }
  initWindow() {
    if (config.UseStartupChart) {
      return this.loadingWindow(this.shartURL);
    } else {
      return this.createMainWindow();
    }
  }
}
export default MainInit;
