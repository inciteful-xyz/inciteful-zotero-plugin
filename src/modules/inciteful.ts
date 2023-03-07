import { config } from '../../package.json'
import { getString } from './locale'

function example (
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value
  descriptor.value = function (...args: any) {
    try {
      ztoolkit.log(`Calling example ${target.name}.${String(propertyKey)}`)
      return original.apply(this, args)
    } catch (e) {
      ztoolkit.log(`Error in example ${target.name}.${String(propertyKey)}`, e)
      throw e
    }
  }
  return descriptor
}

export class SearchFactory {
  @example
  static registerRightClickCollectionMenuItem () {
    const menuIcon = `chrome://${config.addonRef}/content/icons/favicon@0.5x.png`
    // item menuitem with icon
    ztoolkit.Menu.register('collection', {
      tag: 'menuseparator'
    })

    ztoolkit.Menu.register('collection', {
      tag: 'menuitem',
      id: 'zotero-collectionmenu-inciteful-search',
      label: getString('menuitem.search'),

      // oncommand: 'alert("Hello World!")',
      commandListener: ev => addon.hooks.onSearchCollectionEvent(ev),
      icon: menuIcon
    })
  }

  @example
  static registerRightClickMenuItem () {
    const menuIcon = `chrome://${config.addonRef}/content/icons/favicon@0.5x.png`
    // item menuitem with icon
    ztoolkit.Menu.register('item', {
      tag: 'menuseparator'
    })

    ztoolkit.Menu.register('item', {
      tag: 'menuitem',
      id: 'zotero-itemmenu-inciteful-search',
      label: getString('menuitem.search'),

      // oncommand: 'alert("Hello World!")',
      commandListener: ev => addon.hooks.onSearchItemEvent(ev),
      icon: menuIcon
    })
  }
}

export function openInciteful (ids: Array<string>) {
  ztoolkit.log('Opening Inciteful: ', ids)
  Zotero.launchURL(
    'https://inciteful.xyz/p?' +
      ids.map(id => 'ids[]=' + encodeURIComponent(id)).join('&')
  )
}

export function getIDsFromItems (items: Array<Zotero.Item>): Array<string> {
  let topLevelItems = ensureTopLevelItems(items)

  let ids = Array<string>()

  for (let item of topLevelItems) {
    let doi = item.getField('DOI')

    if (doi != null && doi != '') ids.push(doi.toString())

    let url = item.getField('url')
    if (url != null && url != '') ids.push(url.toString())
  }

  ztoolkit.log('Found IDs: ', ids)

  return ids
}

export function ensureTopLevelItems (
  items: Array<Zotero.Item>
): Array<Zotero.Item> {
  let topLevelItems = Array<Zotero.Item>()

  for (let item of items) {
    if (item.isTopLevelItem()) {
      topLevelItems.push(item)
    } else {
      let parent = item.topLevelItem
      if (parent != null) topLevelItems.push(parent)
    }
  }

  return topLevelItems
}
