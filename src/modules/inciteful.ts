import { config } from "../../package.json";
import { getLocaleID, getString } from "../utils/locale";
import { alertDialog } from "./utils";

const ITEM_MENU_ID = `${config.addonRef}-item-menu`;
const COLLECTION_MENU_ID = `${config.addonRef}-collection-menu`;

export class SearchFactory {
  /**
   * Register the Inciteful entries in the item and collection context menus
   * via the native `Zotero.MenuManager` plugin API (Zotero 8+).
   */
  static registerMenus() {
    const menuIcon = `chrome://${config.addonRef}/content/icons/favicon@0.5x.png`;

    Zotero.MenuManager.registerMenu({
      menuID: ITEM_MENU_ID,
      pluginID: config.addonID,
      target: "main/library/item",
      menus: [
        {
          menuType: "submenu",
          l10nID: getLocaleID("menuitem-main"),
          icon: menuIcon,
          menus: [
            {
              menuType: "menuitem",
              l10nID: getLocaleID("menuitem-search"),
              onCommand: () => addon.hooks.onSearchItemEvent(),
            },
            {
              menuType: "menuitem",
              l10nID: getLocaleID("menuitem-connector"),
              onCommand: () => addon.hooks.onConnectItemEvent(),
            },
          ],
        },
      ],
    });

    Zotero.MenuManager.registerMenu({
      menuID: COLLECTION_MENU_ID,
      pluginID: config.addonID,
      target: "main/library/collection",
      menus: [
        {
          menuType: "menuitem",
          l10nID: getLocaleID("collectionitem-search"),
          icon: menuIcon,
          onCommand: () => addon.hooks.onSearchCollectionEvent(),
        },
      ],
    });
  }

  static unregisterMenus() {
    Zotero.MenuManager.unregisterMenu(ITEM_MENU_ID);
    Zotero.MenuManager.unregisterMenu(COLLECTION_MENU_ID);
  }
}

interface QueryParam {
  param: string;
  value: string;
}

class QueryParams {
  params: Array<QueryParam>;

  constructor() {
    this.params = [];
  }

  append(param: string, value: string) {
    this.params.push({ param, value });
  }

  toString(): string {
    const params = this.params.map(
      (p) => `${p.param}=${encodeURIComponent(p.value)}`,
    );
    return params.join("&");
  }
}

export function openIncitefulSearch(ids: Array<string>) {
  if (ids.length == 0) {
    alertDialog(getString("error-noItemSelected"));
    return;
  }

  const params = new QueryParams();
  ids.forEach((id) => params.append("ids[]", id));

  launchURL("https://inciteful.xyz/p", params);
}

export function openIncitefulConnector(from: string, to: string | null) {
  const params = new QueryParams();

  params.append("from", from);
  if (to != null) params.append("to", to);

  params.append("extendedGraph", "true");

  launchURL("https://inciteful.xyz/c", params);
}

export function launchURL(url: string, params: QueryParams) {
  params = addTrackingParams(params);

  if (params.params.length > 0) {
    url = `${url}?${params.toString()}`;
  }

  Zotero.launchURL(url);
}

function addTrackingParams(params: QueryParams): QueryParams {
  params.append("utm_source", "zotero");
  params.append("utm_medium", "addon");
  params.append("utm_campaign", "inciteful-zotero");
  params.append("utm_content", "zotero-addon");
  return params;
}

export function getIDsFromItems(items: Array<Zotero.Item>): Array<string> {
  const topLevelItems = ensureTopLevelItems(items);

  // Deduplicate: attachments of the same parent or overlapping collection
  // selections can resolve to the same item/identifier more than once.
  const ids = new Set<string>();

  for (const item of topLevelItems) {
    const doi = item.getField("DOI");

    if (doi != null && doi != "") {
      ids.add(doi.toString());
    } else {
      const url = item.getField("url");
      if (url != null && url != "") ids.add(url.toString());
    }
  }

  ztoolkit.log("Found IDs: ", ids);

  return [...ids];
}

export function ensureTopLevelItems(
  items: Array<Zotero.Item>,
): Array<Zotero.Item> {
  const topLevelItems = Array<Zotero.Item>();

  for (const item of items) {
    if (item.isTopLevelItem()) {
      topLevelItems.push(item);
    } else {
      const parent = item.topLevelItem;
      if (parent != null) topLevelItems.push(parent);
    }
  }

  return topLevelItems;
}
