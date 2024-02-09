import React from "react";
// PictogrammersMaterialMidiport downloaded from: 
// https://www.iconarchive.com/show/material-icons-by-pictogrammers/midi-port-icon.html
// Apache License
import PictogrammersMaterialMidiport from "./img/PictogrammersMaterialMidiport.svg";
import { midiOutDevices, getMidiOutIndex, setMidiOutIndex } from "./midiinterface";

export const MidiDeviceSelect = () => {
  const [midiOpen, setMidiOpen] = React.useState<boolean>(false)
  const [position, setPosition] = React.useState<{ x: number, y: number }>({ x: 0, y: 0 })

  const handleMidiClick = (event: React.MouseEvent) => {
    setPosition({ x: event.clientX, y: event.clientY })
    setMidiOpen(true);
  }

  const handleMidiClose = (index = -1) => {
    setMidiOpen(false);
    if (index >= 0) setMidiOutIndex(index);
  }

  if (!navigator.requestMIDIAccess) return <></>

  return (
    <span>
      <button
        id="basic-button"
        className="pushButton"
        title="Midi Device Select"
        onClick={handleMidiClick}
      >
        <img src={PictogrammersMaterialMidiport} alt="MidiOut" width={30} height={30} />
      </button>
      {midiOpen && midiOutDevices && midiOutDevices.length > 0 &&
        <div className="modal-overlay"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          onClick={() => handleMidiClose()}>
          <div className="floating-dialog flex-column"
            style={{ backgroundColor: 'white', left: position.x, top: position.y }}>
            {[...midiOutDevices.keys()].map((i) => (
              <div style={{ padding: '5px', cursor: 'pointer' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ccc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                key={i} onClick={() => handleMidiClose(i)}>
                {i === getMidiOutIndex() ? '\u2714\u2009' : '\u2003'}{midiOutDevices[i].name}
              </div>))}
          </div>
        </div>
      }

    </span>
  )
}
