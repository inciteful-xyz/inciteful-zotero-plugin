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

  // Menus registered via Zotero.MenuManager are global (all windows)
  SearchFactory.registerMenus();

  await Promise.all(
    Zotero.getMainWindows().map((win) => onMainWindowLoad(win)),
  );

  // Mark initialized as true to confirm plugin loading status
  // outside of the plugin (e.g. scaffold testing process)
  addon.data.initialized = true;
}

async function onMainWindowLoad(win: _ZoteroTypes.MainWindow): Promise<void> {
  // Create ztoolkit for every window
  addon.data.ztoolkit = createZToolkit();

  win.MozXULElement.insertFTLIfNeeded(
    `${addon.data.config.addonRef}-mainWindow.ftl`,
  );
}

async function onMainWindowUnload(_win: Window): Promise<void> {
  ztoolkit.unregisterAll();
  addon.data.dialog?.window?.close();
}

function onShutdown(): void {
  SearchFactory.unregisterMenus();
  ztoolkit.unregisterAll();
  addon.data.dialog?.window?.close();
  // Remove addon object
  addon.data.alive = false;
  delete (Zotero as Record<string, unknown>)[addon.data.config.addonInstance];
}

/**
 * Zotero 10 replaced `getSelectedCollection()` (which now throws) with the
 * multi-selection-aware `getSelectedCollections()`. Older versions only have
 * the singular form.
 */
function getSelectedCollectionsCompat(
  zoteroPane: _ZoteroTypes.ZoteroPane,
): Zotero.Collection[] {
  const pane = zoteroPane as unknown as {
    getSelectedCollections?: () => Zotero.Collection[];
    getSelectedCollection?: () => Zotero.Collection | undefined;
  };
  if (typeof pane.getSelectedCollections === "function") {
    return pane.getSelectedCollections();
  }
  const collection = pane.getSelectedCollection?.();
  return collection ? [collection] : [];
}

function onSearchItemEvent() {
  const zoteroPane = Zotero.getActiveZoteroPane();
  if (!zoteroPane) return;

  const selectedItems = zoteroPane.getSelectedItems();
  ztoolkit.log("Selected Items: ", selectedItems);

  const ids = getIDsFromItems(selectedItems);
  openIncitefulSearch(ids);
}

function onConnectItemEvent() {
  const zoteroPane = Zotero.getActiveZoteroPane();
  if (!zoteroPane) return;

  const selectedItems = zoteroPane.getSelectedItems();

  // Count distinct resolved papers, not raw selection: attachments of the
  // same parent collapse to one identifier.
  const ids = getIDsFromItems(selectedItems);
  if (ids.length > 2) {
    alertDialog(getString("error-connector-toomany"));
    return;
  }
  if (ids.length == 0) {
    alertDialog(getString("error-noItemSelected"));
    return;
  }

  openIncitefulConnector(ids[0], ids.length > 1 ? ids[1] : null);
}

function onSearchCollectionEvent() {
  const zoteroPane = Zotero.getActiveZoteroPane();
  if (!zoteroPane) return;

  const selectedCollections = getSelectedCollectionsCompat(zoteroPane);

  if (selectedCollections.length == 0) return;

  ztoolkit.log("Selected Collections: ", selectedCollections);

  const selectedItems = selectedCollections.flatMap((collection) =>
    collection.getChildItems(),
  );

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
