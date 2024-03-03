import { useState } from 'react';
import './App.css';
import DisplayApple2 from "./display";
import { GlobalContext } from './globalcontext';

const App = () => {
  const [updateHgr, setUpdateHgr] = useState(false)
  const [hgrview, setHgrview] = useState([-1, -1])
  const [updateBreakpoint, setUpdateBreakpoint] = useState(0)
  return (
    <GlobalContext.Provider
      value={{
        updateHgr: updateHgr, setUpdateHgr: setUpdateHgr,
        hgrview: hgrview, setHgrview: setHgrview,
        updateBreakpoint: updateBreakpoint, setUpdateBreakpoint: setUpdateBreakpoint,
      }}>
      <DisplayApple2 />
    </GlobalContext.Provider>
  )
}

export default App
