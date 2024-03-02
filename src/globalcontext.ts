import { createContext, useContext } from "react"
export type GlobalContent = {
  hgrview: number[]
  setHgrview:(offset: number[]) => void
}
export const GlobalContext = createContext<GlobalContent>({
  hgrview: [-1, -1],
  setHgrview: () => {},
})

export const useGlobalContext = () => useContext(GlobalContext)
