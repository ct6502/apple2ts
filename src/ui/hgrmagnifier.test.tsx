import { act, useState } from "react"
import { createRoot } from "react-dom/client"
import type { Root } from "react-dom/client"
import { GlobalContext } from "./globalcontext"
import HgrMagnifier from "./hgrmagnifier"

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true

jest.mock("./graphics", () => ({
  canvasCoordToNormScreenCoord: () => [0.5, 0.5],
  getOverrideHiresPixels: () => null,
  nColsHgrMagnifier: 2,
  nRowsHgrMagnifier: 16,
  screenBytesToCanvasPixels: () => [28, 32],
  screenCoordToCanvasCoord: () => [100, 100],
}))
jest.mock("./graphicshgr", () => ({ drawHiresTile: jest.fn() }))

const Harness = ({ mainCanvas, updateFromMemoryTable = true }: {
  mainCanvas: HTMLCanvasElement,
  updateFromMemoryTable?: boolean,
}) => {
  const [updateHgrMagnifier, setUpdateHgrMagnifier] = useState(updateFromMemoryTable)
  const [hgrMagnifierLoc, setHgrMagnifierLoc] = useState([4, 7])
  const [lockHgrMagnifier, setLockHgrMagnifier] = useState(false)

  return <GlobalContext.Provider value={{
    hgrMagnifierLoc,
    lockHgrMagnifier,
    memdumpAddress: 0,
    returnToTourHelp: false,
    runTour: "",
    setHgrMagnifierLoc,
    setLockHgrMagnifier,
    setMemdumpAddress: () => {},
    setReturnToTourHelp: () => {},
    setRunTour: () => {},
    setTourIndex: () => {},
    setTourSourceTheme: () => {},
    setUpdateBreakpoint: () => {},
    setUpdateHgrMagnifier,
    tourIndex: 0,
    tourSourceTheme: 0,
    updateBreakpoint: 0,
    updateHgrMagnifier,
  }}>
    <HgrMagnifier
      lockHgrMagnifier={lockHgrMagnifier}
      mainCanvas={mainCanvas}
      mouseLoc={[200, 100]}
    />
    <button onClick={() => setLockHgrMagnifier(true)}>Lock</button>
    <output>{hgrMagnifierLoc.join(",")}</output>
  </GlobalContext.Provider>
}

it("keeps a memory-table location when that selection locks the magnifier", () => {
  const container = document.createElement("div")
  const mainCanvas = document.createElement("canvas")
  let root: Root

  act(() => {
    root = createRoot(container)
    root.render(<Harness mainCanvas={mainCanvas} />)
  })

  expect(container.querySelector("output")?.textContent).toBe("4,7")

  act(() => root.unmount())
})

it("uses the mouse location for an ordinary canvas lock", () => {
  const container = document.createElement("div")
  const mainCanvas = document.createElement("canvas")
  let root: Root

  act(() => {
    root = createRoot(container)
    root.render(<Harness mainCanvas={mainCanvas} updateFromMemoryTable={false} />)
  })
  act(() => container.querySelector("button")?.click())

  expect(container.querySelector("output")?.textContent).toBe("20,89")

  act(() => root.unmount())
})
