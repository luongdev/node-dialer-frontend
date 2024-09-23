// https://electronjs.org/docs/api/menu
import {Menu} from "electron";
import type {MenuItemConstructorOptions, MenuItem} from "electron"

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
    {
        label: 'Dialer',
        submenu: [
            {label: 'About', role: 'about'},
        ],
    },
    {
        label: 'Edit',
        submenu: [
            {label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy'},
            {label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste'},
            {label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut'},
            {label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll'},
            {label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo'},
            {label: 'Redo', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo'},
        ],
    },

];

export const useMenu = () => {
    const createMenu = () => {
        // if (process.env.NODE_ENV === "development") {
        // menu.push({
        //     label: "Development",
        //     submenu: [
        //         {
        //             label: "DevTools",
        //             accelerator: "CmdOrCtrl+I",
        //             role: "toggleDevTools",
        //         },
        //     ],
        // });
        // }
        const menuTemplate = Menu.buildFromTemplate(menu);
        Menu.setApplicationMenu(menuTemplate);
    }
    return {
        createMenu
    }
}
