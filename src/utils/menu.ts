import { dpi, menu } from '@tauri-apps/api'

type MenuConfig = {
  x: number
  y: number
  items: {
    text: string
    action: () => void
  }[]
}

const showMenu = async (config: MenuConfig) => {
  const menuItems = await Promise.all(
    config.items.map(({ text, action }) =>
      menu.MenuItem.new({
        text,
        action,
      }),
    ),
  )

  const contextMenu = await menu.Menu.new({
    items: menuItems,
  })

  await contextMenu.popup(new dpi.LogicalPosition(config.x, config.y))
}
export default showMenu
