import { Step } from 'react-joyride'

export const tourMain: Step[] = [
  {
    target: 'body',
    placement: 'center',
    content: (<div style={{textAlign: "left"}}>Welcome to the Apple2TS emulator!
      To learn more, press the Next button.<p/>
      Or try one of the other tours:
      <ul style={{ marginTop: '6px' }}>
      <li><a href="/?tour=settings">Emulator Settings</a></li>
      <li><a href="/?tour=debug">Debugging Assembly Code</a></li>
      </ul>
    </div>)
  },
  {
    target: '#tour-boot-button',
    content: 'Click here to start the emulator.',
  },
  {
    target: '#tour-reset-button',
    content: 'Click here to Reset the Apple II and either reboot or enter BASIC.',
  },
  {
    target: '#tour-disk-images',
    content: 'Choose one of the installed disk images.',
  },
  {
    target: '#tour-floppy-disks',
    content: 'Or click one of the floppy disk icons to load a disk image.',
  },
  {
    target: '#tour-saverestore',
    content: 'You can save and restore the complete state of the emulator using these buttons.',
  },
  {
    target: 'body',
    placement: 'center',
    content: (<div style={{textAlign: "left"}}>You have reached the end.<p/>
      Try one of the other tours:<p/>
      <ul>
      <li><a href="/?tour=settings">Emulator Settings</a></li>
      <li><a href="/?tour=debug">Debugging Assembly Code</a></li>
      </ul>
      or press Finish to start using the emulator.</div>),
  },
]
