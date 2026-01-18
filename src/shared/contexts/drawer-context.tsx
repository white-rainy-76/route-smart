import { createContext, useContext } from 'react'

export interface DrawerController {
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
}

const DrawerContext = createContext<DrawerController | null>(null)

export function DrawerProvider({
  value,
  children,
}: {
  value: DrawerController
  children: React.ReactNode
}) {
  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
}

export function useDrawer(): DrawerController {
  const ctx = useContext(DrawerContext)
  if (!ctx) {
    throw new Error('useDrawer must be used within <DrawerProvider>')
  }
  return ctx
}


