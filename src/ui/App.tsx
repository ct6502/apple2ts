import { useState } from 'react';
import './App.css';
import DisplayApple2 from "./display";
import { GlobalContext } from './globalcontext';

const App = () => {
  const [updateHgr, setUpdateHgr] = useState(false)
  const [hgrMagnifier, setHgrMagnifier] = useState([-1, -1])
  const [updateBreakpoint, setUpdateBreakpoint] = useState(0)
  const [runTour, setRunTour] = useState('');
  const [tourIndex, setTourIndex] = useState(0);

  return (
    <GlobalContext.Provider
      value={{
        runTour: runTour,
        setRunTour: setRunTour,
        tourIndex: tourIndex,
        setTourIndex: setTourIndex,
        updateHgr: updateHgr,
        setUpdateHgr: setUpdateHgr,
        hgrMagnifier: hgrMagnifier,
        setHgrMagnifier: setHgrMagnifier,
        updateBreakpoint: updateBreakpoint,
        setUpdateBreakpoint: setUpdateBreakpoint,
      }}>
      <DisplayApple2 />
    </GlobalContext.Provider>
  )
}

export default App
