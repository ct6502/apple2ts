import { createContext, useContext } from "react"
export type GlobalContent = {
  updateHgr: boolean
  setUpdateHgr:(updateHgr: boolean) => void
  hgrview: number[]
  setHgrview:(offset: number[]) => void
  updateBreakpoint: number
  setUpdateBreakpoint:(updateBreakpoint: number) => void
}
export const GlobalContext = createContext<GlobalContent>({
  updateHgr: false,
  setUpdateHgr: () => {},
  hgrview: [-1, -1],
  setHgrview: () => {},
  updateBreakpoint: 0,
  setUpdateBreakpoint: () => {},
})

export const useGlobalContext = () => useContext(GlobalContext)
