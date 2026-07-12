import { createContext, useContext } from "react"
type GlobalProps = {
  runTour: string
  setRunTour: (tour: string) => void
  tourIndex: number
  setTourIndex: (index: number) => void
  updateHgrMagnifier: boolean
  setUpdateHgrMagnifier: (updateHgrMagnifier: boolean) => void
  hgrMagnifierLoc: number[]
  setHgrMagnifierLoc: (offset: number[]) => void
  lockHgrMagnifier: boolean
  setLockHgrMagnifier: (lock: boolean) => void
  updateBreakpoint: number
  setUpdateBreakpoint: (updateBreakpoint: number) => void
}
export const GlobalContext = createContext<GlobalProps>({
  runTour: "",
  setRunTour: () => {},
  tourIndex: 0,
  setTourIndex: () => {},
  updateHgrMagnifier: false,
  setUpdateHgrMagnifier: () => {},
  hgrMagnifierLoc: [-1, -1],
  setHgrMagnifierLoc: () => {},
  lockHgrMagnifier: false,
  setLockHgrMagnifier: () => {},
  updateBreakpoint: 0,
  setUpdateBreakpoint: () => {},
})

export const useGlobalContext = () => useContext(GlobalContext)
