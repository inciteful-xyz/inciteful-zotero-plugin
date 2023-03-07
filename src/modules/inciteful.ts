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
  //   @example
  //   static registerRightClickMenuCollection () {
  //     const menuIcon = `chrome://${config.addonRef}/content/icons/favicon@0.5x.png`
  //     // item menuitem with icon
  //     ztoolkit.Menu.register('item', {
  //       tag: 'menuseparator'
  //     })
  //   }

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
      commandListener: ev => addon.hooks.onSearchEvent(),
      icon: menuIcon
    })
  }

  @example
  static registerLibraryTabPanel () {
    const tabId = ztoolkit.LibraryTabPanel.register(
      getString('tabpanel.lib.tab.label'),
      (panel: XUL.Element, win: Window) => {
        const elem = ztoolkit.UI.createElement(win.document, 'vbox', {
          children: [
            {
              tag: 'h2',
              properties: {
                innerText: 'Hello World!'
              }
            },
            {
              tag: 'div',
              properties: {
                innerText: 'This is a library tab.'
              }
            },
            {
              tag: 'button',
              namespace: 'html',
              properties: {
                innerText: 'Unregister'
              },
              listeners: [
                {
                  type: 'click',
                  listener: () => {
                    ztoolkit.LibraryTabPanel.unregister(tabId)
                  }
                }
              ]
            }
          ]
        })
        panel.append(elem)
      },
      {
        targetIndex: 1
      }
    )
  }
}
