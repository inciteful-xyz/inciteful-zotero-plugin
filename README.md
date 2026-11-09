# Inciteful Plugin for Zotero

The plugin requires Zotero 10. Older versions of Zotero are no longer supported, but their last compatible releases remain available. Download the appropriate release below:

- Zotero 10 - [latest release](https://github.com/inciteful-xyz/inciteful-zotero-plugin/releases/latest/download/inciteful-zotero-plugin.xpi)
- Zotero 8/9 - [0.3.0](https://github.com/inciteful-xyz/inciteful-zotero-plugin/releases/download/v0.3.0/inciteful-zotero-plugin.xpi)
- Zotero 7 - [0.1.1](https://github.com/inciteful-xyz/inciteful-zotero-plugin/releases/download/v0.1.1/inciteful-zotero-plugin.xpi)
- Zotero 6 - [0.0.9](https://github.com/inciteful-xyz/inciteful-zotero-plugin/releases/download/0.0.9/inciteful-zotero-plugin.xpi)

**Security note:** the releases for Zotero 9 and earlier include debugging links from an older version of zotero-plugin-toolkit (`zotero://ztoolkit-debug`, and `zotero://plugin` in 0.1.1 and 0.3.0). These can be used to run code or install a plugin from a link. Please upgrade to Zotero 10 and the latest release if you can.

If you are using Firefox, please right click the link and select "Save Link As...". Then:

- Zotero 7 and later: go to `Tools` -> `Plugins` -> :gear:`icon` -> `Install Plugin From File...` and select the downloaded file.
- Zotero 6: go to `Tools` -> `Add-ons` -> :gear:`icon` -> `Install Add-on From File...` and select the downloaded file.

## Features

The current functionality is limited to initiating searches from your collection in the following ways:

### Graph Search

- Right click one or more items and select `Inciteful Search Tools` -> `Graph Search`
- Right click a collection and select `Graph Search using Inciteful` (you can select multiple collections to search across all of them)

### Literature Connector

- Select two items, right click, then select `Inciteful Search Tools` -> `Connect Papers`

## Development

The plugin is built on [windingwind's zotero-plugin-template](https://github.com/windingwind/zotero-plugin-template) and [zotero-plugin-scaffold](https://github.com/northword/zotero-plugin-scaffold).

```bash
npm install
npm start        # launch Zotero with the plugin loaded (configure .env first, see .env.example)
npm run build    # build the .xpi into .scaffold/build/
```
