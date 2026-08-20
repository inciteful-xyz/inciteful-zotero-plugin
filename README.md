# Inciteful Plugin for Zotero

The plugin now works with Zotero 10 and continues to support Zotero 8 and 9. Support has been dropped for Zotero 6 and 7. Download the appropriate release below:

- Zotero 8/9/10 - [latest release](https://github.com/inciteful-xyz/inciteful-zotero-plugin/releases/latest/download/inciteful-zotero-plugin.xpi)
- Zotero 7 - [0.1.1](https://github.com/inciteful-xyz/inciteful-zotero-plugin/releases/download/0.1.1/inciteful-zotero-plugin.xpi)
- Zotero 6 - [0.0.9](https://github.com/inciteful-xyz/inciteful-zotero-plugin/releases/download/0.0.9/inciteful-zotero-plugin.xpi)

If you are using Firefox, please right click the link and select "Save Link As...". Then:

- Zotero 7 and later: go to `Tools` -> `Plugins` -> :gear:`icon` -> `Install Plugin From File...` and select the downloaded file.
- Zotero 6: go to `Tools` -> `Add-ons` -> :gear:`icon` -> `Install Add-on From File...` and select the downloaded file.

## Features

The current functionality is limited to initiating searches from your collection in the following ways:

### Graph Search

- Right click one or more items and select `Inciteful.xyz Tools` -> `Graph Search`
- Right click a collection and select `Graph Search using Inciteful.xyz` (on Zotero 10 you can select multiple collections to search across all of them)

### Literature Connector

- Select two items, right click, then select `Inciteful.xyz Tools` -> `Connect Papers`

## Development

The plugin is built on [windingwind's zotero-plugin-template](https://github.com/windingwind/zotero-plugin-template) and [zotero-plugin-scaffold](https://github.com/northword/zotero-plugin-scaffold).

```bash
npm install
npm start        # launch Zotero with the plugin loaded (configure .env first, see .env.example)
npm run build    # build the .xpi into .scaffold/build/
```
