import { config } from "../package.json";
import { getString, initLocale } from "./modules/locale";
import { registerPrefsScripts } from "./modules/preferenceScript";
import { SearchFactory } from './modules/inciteful';

async function onStartup() {
  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise,
  ]);
  initLocale();
  ztoolkit.ProgressWindow.setIconURI(
    "default",
    `chrome://${config.addonRef}/content/icons/favicon.png`
  );

  // Register your hooks here
  SearchFactory.registerRightClickMenuItem();
  SearchFactory.registerLibraryTabPanel();
}

function onShutdown(): void {
  ztoolkit.unregisterAll();
  // Remove addon object
  addon.data.alive = false;
  delete Zotero[config.addonInstance];
}

/**
 * This function is just an example of dispatcher for Notify events.
 * Any operations should be placed in a function to keep this funcion clear.
 */
async function onNotify(
  event: string,
  type: string,
  ids: Array<string> | Array<number>,
  extraData: { [key: string]: any }
) {
  // You can add your code to the corresponding notify type
  ztoolkit.log("notify", event, type, ids, extraData);
  if (
    event == "select" &&
    type == "tab" &&
    extraData[ids[0]].type == "reader"
  ) {
    // BasicExampleFactory.exampleNotifierCallback();
  } else {
    return;
  }
}

/**
 * This function is just an example of dispatcher for Preference UI events.
 * Any operations should be placed in a function to keep this funcion clear.
 * @param type event type
 * @param data event data
 */
async function onPrefsEvent(type: string, data: { [key: string]: any }) {
  switch (type) {
    case "load":
      registerPrefsScripts(data.window);
      break;
    default:
      return;
  }
}

function onSearchEvent() {
  var zoteroPane = Zotero.getActiveZoteroPane();
  var selectedItems = zoteroPane.getSelectedItems();
  ztoolkit.log(selectedItems)

  let ids = Array<string>();

  for (let item of selectedItems) {

    let doi = item.getField('DOI');

    if (doi != null && doi != '')
      ids.push(doi.toString());

    let url = item.getField('url');
    if (url != null && url != '')
      ids.push(url.toString());

    ztoolkit.log(ids)

    window.open('https://inciteful.xyz/p?' + ids.map(id => "ids[]=" + encodeURIComponent(id)).join('&'), '_blank');
  }

}

function onDialogEvents(type: string) {
  // switch (type) {
  //   case "dialogExample":
  //     HelperExampleFactory.dialogExample();
  //     break;
  //   case "clipboardExample":
  //     HelperExampleFactory.clipboardExample();
  //     break;
  //   case "filePickerExample":
  //     HelperExampleFactory.filePickerExample();
  //     break;
  //   case "progressWindowExample":
  //     HelperExampleFactory.progressWindowExample();
  //     break;
  //   case "vtableExample":
  //     HelperExampleFactory.vtableExample();
  //     break;
  //   default:
  //     break;
  // }
}

// Add your hooks here. For element click, etc.
// Keep in mind hooks only do dispatch. Don't add code that does real jobs in hooks.
// Otherwise the code would be hard to read and maintian.

export default {
  onStartup,
  onShutdown,
  onNotify,
  onPrefsEvent,
  // onShortcuts,
  onDialogEvents,
  onSearchEvent,
};
