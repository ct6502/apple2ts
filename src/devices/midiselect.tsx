import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMusic,
} from "@fortawesome/free-solid-svg-icons";
import { midiOutDevices, getMidiOutIndex, setMidiOutIndex } from "./midiinterface";

export const MidiDeviceSelect = () => {
  const [midiOpen, setMidiOpen] = React.useState<boolean>(false)
  const [position, setPosition] = React.useState<{x: number, y: number}>({x: 0, y: 0})

  const handleMidiClick = (event: React.MouseEvent) => {
    setPosition({x: event.clientX, y: event.clientY})
    setMidiOpen(true);
  }

  const handleMidiClose = (index = -1) => {
    setMidiOpen(false);
    if (index >= 0) setMidiOutIndex(index);
  }

  return (
    <span>
      <button
        id="basic-button"
        className="pushButton"
        title="Midi Device Select"
        onClick={handleMidiClick}
      >
        <FontAwesomeIcon icon={faMusic}/>
      </button>
      {midiOpen &&
        <div className="modal-overlay"
          style={{backgroundColor: 'rgba(0, 0, 0, 0)'}}
          onClick={() => handleMidiClose()}>
          <div className="floating-dialog flex-column"
            style={{backgroundColor: 'white', left: position.x, top: position.y}}>
            {[...midiOutDevices.keys()].map((i) => (
              <div style={{padding: '5px', cursor: 'pointer'}}
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
