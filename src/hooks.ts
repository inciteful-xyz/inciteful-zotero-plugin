import { config } from '../package.json'
import { getString, initLocale } from './modules/locale'
import { registerPrefsScripts } from './modules/preferenceScript'
import { openIncitefulConnector } from './modules/inciteful'
import { alertDialog } from './modules/utils'
import {
  SearchFactory,
  openIncitefulSearch,
  getIDsFromItems
} from './modules/inciteful'

async function onStartup () {
  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise
  ])
  initLocale()
  ztoolkit.ProgressWindow.setIconURI(
    'default',
    `chrome://${config.addonRef}/content/icons/favicon.png`
  )

  // Register your hooks here
  SearchFactory.registerRightClickMenuItem()
  SearchFactory.registerRightClickCollectionMenuItem()
}

function onShutdown (): void {
  ztoolkit.unregisterAll()
  // Remove addon object
  addon.data.alive = false
  delete Zotero[config.addonInstance]
}

/**
 * This function is just an example of dispatcher for Notify events.
 * Any operations should be placed in a function to keep this funcion clear.
 */
async function onNotify (
  event: string,
  type: string,
  ids: Array<string> | Array<number>,
  extraData: { [key: string]: any }
) {
  // You can add your code to the corresponding notify type
  ztoolkit.log('notify', event, type, ids, extraData)
  if (
    event == 'select' &&
    type == 'tab' &&
    extraData[ids[0]].type == 'reader'
  ) {
    // BasicExampleFactory.exampleNotifierCallback();
  } else {
    return
  }
}

/**
 * This function is just an example of dispatcher for Preference UI events.
 * Any operations should be placed in a function to keep this funcion clear.
 * @param type event type
 * @param data event data
 */
async function onPrefsEvent (type: string, data: { [key: string]: any }) {
  switch (type) {
    case 'load':
      registerPrefsScripts(data.window)
      break
    default:
      return
  }
}
function onSearchItemEvent () {
  var zoteroPane = Zotero.getActiveZoteroPane()

  var selectedItems = zoteroPane.getSelectedItems()
  ztoolkit.log('Selected Items: ', selectedItems)

  var ids = getIDsFromItems(selectedItems)
  openIncitefulSearch(ids)
}

function onConnectItemEvent () {
  var zoteroPane = Zotero.getActiveZoteroPane()

  var selectedItems = zoteroPane.getSelectedItems()
  if (selectedItems.length > 2) {
    alertDialog(getString('error.connector.toomany'))
    return
  }

  var ids = getIDsFromItems(selectedItems)
  if (ids.length == 0) {
    alertDialog(getString('error.noItemSelected'))
    return
  }

  openIncitefulConnector(ids[0], ids.length > 1 ? ids[1] : null)
}

function onSearchCollectionEvent () {
  var zoteroPane = Zotero.getActiveZoteroPane()

  var selectedCollection = zoteroPane.getSelectedCollection()

  if (selectedCollection == null) return

  ztoolkit.log('Selected Collection: ', selectedCollection)

  var selectedItems = selectedCollection.getChildItems()

  var ids = getIDsFromItems(selectedItems)

  openIncitefulSearch(ids)
}

// Add your hooks here. For element click, etc.
// Keep in mind hooks only do dispatch. Don't add code that does real jobs in hooks.
// Otherwise the code would be hard to read and maintian.

export default {
  onStartup,
  onShutdown,
  onNotify,
  onPrefsEvent,
  onSearchItemEvent,
  onSearchCollectionEvent,
  onConnectItemEvent
}
