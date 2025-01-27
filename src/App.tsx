import { useState } from 'react';
import './App.css';
import DisplayApple2 from "./display";
import { GlobalContext } from './globalcontext';
import RunTour from './tours/runtour';

const App = () => {
  const [updateHgr, setUpdateHgr] = useState(false)
  const [hgrMagnifier, setHgrMagnifier] = useState([-1, -1])
  const [updateBreakpoint, setUpdateBreakpoint] = useState(0)
  const [runTour, setRunTour] = useState('');

  return (
    <GlobalContext.Provider
      value={{
        runTour: runTour,
        setRunTour: setRunTour,
        updateHgr: updateHgr,
        setUpdateHgr: setUpdateHgr,
        hgrMagnifier: hgrMagnifier,
        setHgrMagnifier: setHgrMagnifier,
        updateBreakpoint: updateBreakpoint,
        setUpdateBreakpoint: setUpdateBreakpoint,
      }}>
      <RunTour/>
      <DisplayApple2 />
    </GlobalContext.Provider>
  )
}

export default App
