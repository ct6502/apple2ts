import { createContext, useContext } from "react"
type GlobalProps = {
  runTour: string
  setRunTour: (tour: string) => void
  tourIndex: number
  setTourIndex: (index: number) => void
  updateHgr: boolean
  setUpdateHgr: (updateHgr: boolean) => void
  hgrMagnifier: number[]
  setHgrMagnifier: (offset: number[]) => void
  updateBreakpoint: number
  setUpdateBreakpoint: (updateBreakpoint: number) => void
}
export const GlobalContext = createContext<GlobalProps>({
  runTour: "",
  setRunTour: () => {},
  tourIndex: 0,
  setTourIndex: () => {},
  updateHgr: false,
  setUpdateHgr: () => {},
  hgrMagnifier: [-1, -1],
  setHgrMagnifier: () => {},
  updateBreakpoint: 0,
  setUpdateBreakpoint: () => {},
})

export const useGlobalContext = () => useContext(GlobalContext)
