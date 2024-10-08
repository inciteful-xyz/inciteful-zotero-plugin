import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { alertDialog } from "./utils";

function example(
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) {
  const original = descriptor.value;
  descriptor.value = function (...args: any) {
    try {
      ztoolkit.log(`Calling example ${target.name}.${String(propertyKey)}`);
      return original.apply(this, args);
    } catch (e) {
      ztoolkit.log(`Error in example ${target.name}.${String(propertyKey)}`, e);
      throw e;
    }
  };
  return descriptor;
}

export class SearchFactory {
  @example
  static registerRightClickCollectionMenuItem() {
    const menuIcon = `chrome://${config.addonRef}/content/icons/favicon@0.5x.png`;
    // item menuitem with icon
    ztoolkit.Menu.register("collection", {
      tag: "menuseparator",
    });

    ztoolkit.Menu.register("collection", {
      tag: "menuitem",
      id: "zotero-collectionmenu-inciteful-search",
      label: getString("collectionitem-search"),

      // oncommand: 'alert("Hello World!")',
      commandListener: (ev) => addon.hooks.onSearchCollectionEvent(),
      icon: menuIcon,
    });
  }

  @example
  static registerRightClickMenuItem() {
    const menuIcon = `chrome://${config.addonRef}/content/icons/favicon@0.5x.png`;
    // item menuitem with icon
    ztoolkit.Menu.register("item", {
      tag: "menuseparator",
    });

    ztoolkit.Menu.register("item", {
      tag: "menu",
      id: "zotero-itemmenu-inciteful-main",
      label: getString("menuitem-main"),
      children: [
        {
          tag: "menuitem",
          id: "zotero-itemmenu-inciteful-search",
          label: getString("menuitem-search"),
          commandListener: (ev) => addon.hooks.onSearchItemEvent(),
        },
        {
          tag: "menuitem",
          id: "zotero-itemmenu-inciteful-connector",
          label: getString("menuitem-connector"),
          commandListener: (ev) => addon.hooks.onConnectItemEvent(),
        },
      ],
      icon: menuIcon,
    });
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

  const ids = Array<string>();

  for (const item of topLevelItems) {
    const doi = item.getField("DOI");

    if (doi != null && doi != "") {
      ids.push(doi.toString());
    } else {
      const url = item.getField("url");
      if (url != null && url != "") ids.push(url.toString());
    }
  }

  ztoolkit.log("Found IDs: ", ids);

  return ids;
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
