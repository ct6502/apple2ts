import { Step } from 'react-joyride'

export const tourMain: Step[] = [
  {
    target: 'body',
    placement: 'center',
    content: 'Welcome to the Apple2TS emulator! ' +
      'To learn more, press the Next button.'
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
    content: 'You have reached the end of the tour. Click on the globe ' +
      'tour button to try one of the other tours, ' +
      'or press Finish to start using the emulator.',
  },
]
