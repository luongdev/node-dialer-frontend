// https://electronjs.org/docs/api/menu
import { Menu } from "electron";
import type { MenuItemConstructorOptions, MenuItem } from "electron"

const menu: Array<(MenuItemConstructorOptions) | (MenuItem)> = [
    // {
    //     label: "Settings",
    //     submenu: [
    //         {
    //             label: "Refresh",
    //             accelerator: "F5",
    //             role: "reload",
    //         },
    //         {
    //             label: "Close",
    //             accelerator: "CmdOrCtrl+F4",
    //             role: "close",
    //         },
    //     ],
    // },
    // {
    //     label: "Help",
    //     submenu: [
    //         {
    //             label: "About",
    //             click: function () {
    //                 electron.dialog.showMessageBox({
    //                     title: "About",
    //                     type: "info",
    //                     message: "Desk Dialer",
    //                     detail: `Version：${version}\nNode：${process.versions.v8
    //                         }\nOS：${type()} ${arch()} ${release()}`,
    //                     noLink: true,
    //                     buttons: ["github", "close"],
    //                 });
    //             },
    //         },
    //     ],
    // },
];

export const useMenu = () => {
    const createMenu = () => {
        if (process.env.NODE_ENV === "development") {
            menu.push({
                label: "Development",
                submenu: [
                    {
                        label: "DevTools",
                        accelerator: "CmdOrCtrl+I",
                        role: "toggleDevTools",
                    },
                ],
            });
        }
        const menuTemplate = Menu.buildFromTemplate(menu);
        Menu.setApplicationMenu(menuTemplate);
    }
    return {
        createMenu
    }
}
