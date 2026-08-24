import { createContext, useContext } from "react"
import type { UI_THEME } from "../common/utility"
type GlobalProps = {
  runTour: string
  setRunTour: (tour: string) => void
  tourIndex: number
  setTourIndex: (index: number) => void
  tourSourceTheme: UI_THEME
  setTourSourceTheme: (theme: UI_THEME) => void
  returnToTourHelp: boolean
  setReturnToTourHelp: (show: boolean) => void
  updateHgrMagnifier: boolean
  setUpdateHgrMagnifier: (updateHgrMagnifier: boolean) => void
  hgrMagnifierLoc: number[]
  setHgrMagnifierLoc: (offset: number[]) => void
  lockHgrMagnifier: boolean
  setLockHgrMagnifier: (lock: boolean) => void
  updateBreakpoint: number
  setUpdateBreakpoint: (updateBreakpoint: number) => void
  memdumpAddress: number
  setMemdumpAddress: (addr: number) => void
}
export const GlobalContext = createContext<GlobalProps>({
  runTour: "",
  setRunTour: () => {},
  tourIndex: 0,
  setTourIndex: () => {},
  tourSourceTheme: 0,
  setTourSourceTheme: () => {},
  returnToTourHelp: false,
  setReturnToTourHelp: () => {},
  updateHgrMagnifier: false,
  setUpdateHgrMagnifier: () => {},
  hgrMagnifierLoc: [-1, -1],
  setHgrMagnifierLoc: () => {},
  lockHgrMagnifier: false,
  setLockHgrMagnifier: () => {},
  updateBreakpoint: 0,
  setUpdateBreakpoint: () => {},
  memdumpAddress: 0,
  setMemdumpAddress: () => {},
})

export const useGlobalContext = () => useContext(GlobalContext)
