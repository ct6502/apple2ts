import { Step } from 'react-joyride'

export const tourSettings: Step[] = [
  {
    target: 'body',
    placement: 'center',
    content: (<div style={{textAlign: "left"}}>The Apple2TS emulator has a full set of controls.
      To learn more, press the Next button.<p/>
      Or try one of the other tours:
      <ul>
      <li><a href="/?tour=main">Main Tour</a></li>
      <li><a href="/?tour=debug">Debugging Assembly Code</a></li>
      </ul>
    </div>)
  },
  {
    target: '#tour-maincontrols',
    content: 'Here, you can boot and reset the Apple II, restore and save the state, ' +
      'copy the screen, or paste text into the emulatior.',
  },
  {
    target: '#tour-snapshot',
    content: 'At any point, you can take a snapshot of the current emulator state, ' +
      'then go back in time to an earlier state, or fast forward again. You can also ' +
      'save the emulator state with all of the current snapshots.',
  },
  {
    target: '#tour-pause-button',
    content: 'You can pause the emulator at any time, freezing the 6502 processor. ' +
      'This is useful for pausing the action in a game, or entering the debugger.',
  },
  {
    target: '#tour-debug-button',
    content: 'Click on the bug to enter debug mode, where you can see the internal ' +
      'state of the 6502 processor. Click again to go back to normal mode.',
  },
  {
    target: '#tour-configbuttons',
    content: 'The bottom row of buttons controls the state of the Apple II, ' +
      'starting with the emulator speed, the screen color, and muting the sound.',
  },
  {
    target: 'body',
    placement: 'center',
    content: (<div style={{textAlign: "left"}}>You have reached the end.<p/>
      Try one of the other tours:<p/>
      <ul>
      <li><a href="/?tour=main">Main</a></li>
      <li><a href="/?tour=debug">Debugging Assembly Code</a></li>
      </ul>
      or press Finish to start using the emulator.</div>),
  },
]
