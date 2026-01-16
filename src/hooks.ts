import { config } from "../package.json";
import { getString, initLocale } from "./utils/locale";
import { createZToolkit } from "./utils/ztoolkit";

import {
  SearchFactory,
  openIncitefulSearch,
  getIDsFromItems,
  openIncitefulConnector,
} from "./modules/inciteful";
import { alertDialog } from "./modules/utils";

async function onStartup() {
  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise,
  ]);

  initLocale();
  // TODO: Do I need this?
  ztoolkit.ProgressWindow.setIconURI(
    "default",
    `chrome://${config.addonRef}/content/icons/favicon.png`,
  );

  // Register your hooks here
  SearchFactory.registerRightClickMenuItem();
  SearchFactory.registerRightClickCollectionMenuItem();

  await Promise.all(
    Zotero.getMainWindows().map((win) => onMainWindowLoad(win)),
  );
}

async function onMainWindowLoad(win: Window): Promise<void> {
  // Create ztoolkit for every window
  addon.data.ztoolkit = createZToolkit();

  // @ts-ignore This is a moz feature
  win.MozXULElement.insertFTLIfNeeded(`${config.addonRef}-mainWindow.ftl`);

  const popupWin = new ztoolkit.ProgressWindow(config.addonName, {
    closeOnClick: true,
    closeTime: -1,
  })
    .createLine({
      text: getString("startup-begin"),
      type: "default",
      progress: 0,
    })
    .show();

  await Zotero.Promise.delay(1000);
  popupWin.changeLine({
    progress: 30,
    text: `[30%] ${getString("startup-begin")}`,
  });

  await Zotero.Promise.delay(1000);

  popupWin.changeLine({
    progress: 100,
    text: `[100%] ${getString("startup-finish")}`,
  });
  popupWin.startCloseTimer(5000);
}

async function onMainWindowUnload(win: Window): Promise<void> {
  ztoolkit.unregisterAll();
  addon.data.dialog?.window?.close();
}

function onShutdown(): void {
  ztoolkit.unregisterAll();
  addon.data.dialog?.window?.close();
  // Remove addon object
  addon.data.alive = false;
  delete (Zotero as Record<string, unknown>)[config.addonInstance];
}

function onSearchItemEvent() {
  const zoteroPane = Zotero.getActiveZoteroPane();

  const selectedItems = zoteroPane.getSelectedItems();
  ztoolkit.log("Selected Items: ", selectedItems);

  const ids = getIDsFromItems(selectedItems);
  openIncitefulSearch(ids);
}

function onConnectItemEvent() {
  const zoteroPane = Zotero.getActiveZoteroPane();

  const selectedItems = zoteroPane.getSelectedItems();
  if (selectedItems.length > 2) {
    alertDialog(getString("error-connector-toomany"));
    return;
  }

  const ids = getIDsFromItems(selectedItems);
  if (ids.length == 0) {
    alertDialog(getString("error-noItemSelected"));
    return;
  }

  openIncitefulConnector(ids[0], ids.length > 1 ? ids[1] : null);
}

function onSearchCollectionEvent() {
  const zoteroPane = Zotero.getActiveZoteroPane();

  const selectedCollection = zoteroPane.getSelectedCollection();

  if (selectedCollection == null) return;

  ztoolkit.log("Selected Collection: ", selectedCollection);

  const selectedItems = selectedCollection.getChildItems();

  const ids = getIDsFromItems(selectedItems);

  openIncitefulSearch(ids);
}
// Add your hooks here. For element click, etc.
// Keep in mind hooks only do dispatch. Don't add code that does real jobs in hooks.
// Otherwise the code would be hard to read and maintain.

export default {
  onStartup,
  onShutdown,
  onMainWindowLoad,
  onMainWindowUnload,
  onSearchItemEvent,
  onSearchCollectionEvent,
  onConnectItemEvent,
};
