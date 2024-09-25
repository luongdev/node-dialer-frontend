import config from "@config/index";
import {BrowserWindow, dialog, globalShortcut, Menu, Tray, nativeTheme} from "electron";
import {winURL, loadingURL, getPreloadFile} from "../config/static-path";
import {useProcessException} from "@main/hooks/exception-hook";


class MainInit {
    public winURL: string = "";
    public shartURL: string = "";
    public loadWindow: BrowserWindow = null;
    public mainWindow: BrowserWindow = null;
    private readonly childProcessGone = null;

    constructor() {
        const {childProcessGone} = useProcessException();
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


        if (process.env.NODE_ENV === "development") {
            this.mainWindow.webContents.openDevTools({
                mode: "undocked",
                activate: true,
            });
        }


        globalShortcut.register('Alt+CommandOrControl+L', () => {
            this.mainWindow.webContents.openDevTools({mode: "undocked", activate: true});
        })

        if (process.env.NODE_ENV !== 'development') {
            this.mainWindow.on('close', (event: Event) => {
                const response = dialog.showMessageBoxSync(this.mainWindow, {
                    type: 'question',
                    buttons: ['Thoát', 'Không'],
                    title: 'Xác nhận thoát ứng dụng',
                    message: 'Bạn sẽ không còn nhận được cuộc gọi từ ứng dụng. Bạn vẫn muốn thoát?',
                    defaultId: 1,

                });

                if (response == 1) event.preventDefault();
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
                sandbox: false,
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

    trayWindow = () => {

        const win = new BrowserWindow({
            width: 240,
            height: 120,
            show: true,
            frame: false,
            resizable: false,
            alwaysOnTop: true,
            webPreferences: {
                sandbox: false,
                experimentalFeatures: true,
                backgroundThrottling: false,
                spellcheck: false,
                allowRunningInsecureContent: true,
                disableDialogs: true,
                devTools: true,
                preload: getPreloadFile('preload'),
            },
        });


        win.loadURL(`${this.winURL}/systray`).catch(console.error);

        win.on('ready-to-show', () => {
            win.webContents.openDevTools({mode: "undocked", activate: true});
        });

        function showWindow() {
            const trayBounds = tray.getBounds();
            const windowBounds = win.getBounds();

            const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
            const y = Math.round(trayBounds.y + trayBounds.height);

            win.setPosition(x, y, false);
            win.show();
            win.focus();
        }

        function toggleWindow() {
            if (win.isVisible()) {
                win.hide();
            } else {
                showWindow();
            }
        }


        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show/Hide Window',
                click: toggleWindow, // Hàm toggle để hiển thị hoặc ẩn cửa sổ
            },
            {
                label: 'Quit',
                click: () => {
                    // app.quit(); // Thoát ứng dụng khi chọn Quit
                },
            },
        ]);

        const tray = new Tray('./assets/tray.png');

        // Gắn menu vào tray icon
        tray.setToolTip('Your Application');
        tray.setContextMenu(contextMenu);

        // Khi click vào tray icon
        tray.on('click', toggleWindow);
    }
}

export default MainInit;
