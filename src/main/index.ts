"use strict";

import { useMainDefaultIpc } from "./services/ipc-main";
import { app, session, Tray } from "electron";
import InitWindow from "./services/window-manager";
import { useDisableButton } from "./hooks/disable-button-hook";
import { useProcessException } from "@main/hooks/exception-hook";
import { useMenu } from "@main/hooks/menu-hook"

if (!process.env.DISPLAY) {
  process.env.DISPLAY = ':0';
}

function onAppReady() {

  const { disableF12 } = useDisableButton();
  const { renderProcessGone } = useProcessException();
  const { defaultIpc } = useMainDefaultIpc();
  const { createMenu } = useMenu();

  app.dock?.setIcon("./assets/icon.png");

  disableF12();
  renderProcessGone();
  defaultIpc();
  createMenu()

  new InitWindow().initWindow();



  if (process.env.NODE_ENV === "development") {
    const { VUEJS_DEVTOOLS } = require("electron-devtools-vendor");
    session.defaultSession.loadExtension(VUEJS_DEVTOOLS, {
      allowFileAccess: true,
    });
  }
}

app.whenReady().then(onAppReady);
app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");
app.commandLine.appendSwitch('no-sandbox');

app.on("window-all-closed", () => {
  app.quit();
});
app.on("browser-window-created", () => {
  console.log("window-created");
});

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.removeAsDefaultProtocolClient("Desk Dialer");
  }
} else {
  app.setAsDefaultProtocolClient("Desk Dialer");
}
