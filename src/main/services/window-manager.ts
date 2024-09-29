import config from "@config/index";
import { BrowserWindow, dialog, globalShortcut, Menu, Tray, app } from "electron";
import { winURL, loadingURL, getPreloadFile } from "../config/static-path";
import { useProcessException } from "@main/hooks/exception-hook";


class MainInit {
    public winURL: string = "";
    public shartURL: string = "";
    public loadWindow: BrowserWindow = null;
    public mainWindow: BrowserWindow = null;
    public trayWindow: BrowserWindow = null;
    private readonly childProcessGone = null;

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
            minHeight: 640,
            maxHeight: 800,
            useContentSize: true,
            width: 640,
            minWidth: 640,
            maxWidth: 800,
            show: false,
            frame: config.IsUseSysTitle,
            webPreferences: {
                sandbox: false,
                webSecurity: false,
                devTools: true, // process.env.NODE_ENV === "development",
                scrollBounce: process.platform === "darwin",
                preload: getPreloadFile("preload"),
            },
        });

        this.mainWindow.loadURL(this.winURL).catch(console.error);
        this.mainWindow.once("ready-to-show", () => {
            this.mainWindow.show();

            this.mainWindow['name'] = 'MAIN';
            if (config.UseStartupChart) this.loadWindow.destroy();
        });


        this.mainWindow.on('show', () => {
            this.trayWindow?.hide();
        });

        this.mainWindow.on('closed', () => {
            this.trayWindow?.show();
        })

        this.mainWindow.on('minimize', () => {
            this.trayWindow?.show();
        });

        this.mainWindow.on('restore', () => this.trayWindow?.hide());

        this.mainWindow.on('hide', () => {
            this.trayWindow?.show();
        });

        if (process.env.NODE_ENV === "development") {
            this.mainWindow.webContents.openDevTools({
                mode: "undocked",
                activate: true,
            });
        }

        this.mainWindow.on('close', (event: Event) => {
            event.preventDefault();
            this.mainWindow.minimize();
        });

        globalShortcut.register('Alt+CommandOrControl+L', () => {
            this.mainWindow.webContents.openDevTools({ mode: "undocked", activate: true });
        });

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
                sandbox: false,
                experimentalFeatures: true,
                preload: getPreloadFile("preload"),
            },
        });

        this.loadWindow.loadURL(loadingURL);
        this.loadWindow.show();
        this.loadWindow.setAlwaysOnTop(true);
        setTimeout(() => {
            this.createTrayWindow();
            this.createMainWindow();
        }, 1500);
    }

    initWindow() {
        if (config.UseStartupChart) {
            return this.loadingWindow(this.shartURL);
        } else {
            this.createTrayWindow();
            return this.createMainWindow();
        }
    }

    toggleTrayWindow() {

    }

    createTrayWindow = () => {
        this.trayWindow = new BrowserWindow({
            width: 240,
            height: 120,
            show: true,
            frame: false,
            resizable: false,
            alwaysOnTop: true,
            maximizable: false,
            minimizable: false,
            fullscreenable: false,
            fullscreen: false,
            closable: false,
            skipTaskbar: true,
            webPreferences: {
                sandbox: false,
                devTools: true,
                backgroundThrottling: false,
                preload: getPreloadFile('preload'),
            },
        });

        this.trayWindow.loadURL(`${this.winURL}/systray`).catch(console.error);

        if (process.env.NODE_ENV === 'development') {
            this.trayWindow.on('ready-to-show', () => {
                this.trayWindow['name'] = 'TRAY';
                this.trayWindow.webContents.openDevTools({ mode: "undocked", activate: true });
            });
        }

        const contextMenu = Menu.buildFromTemplate([
            { label: 'Quit', click: () => app.quit() }
        ]);

        const tray = new Tray('./assets/tray.png');
        tray.setToolTip('Omicx Dialer');
        tray.setContextMenu(contextMenu);

        tray.on('click', () => {
            if (!this.trayWindow.isVisible()) {
                this.trayWindow.show();
            }

            if (!this.mainWindow) {
                this.createMainWindow();
            } else {
                this.mainWindow.show();
                this.mainWindow.focus();
            }
        });
    }
}

export default MainInit;
