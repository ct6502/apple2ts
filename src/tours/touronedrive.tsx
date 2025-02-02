import { Step } from 'react-joyride'

export const tourOneDrive: Step[] = [
  {
    target: 'body',
    placement: 'center',
    content: 'Apple2TS supports loading and saving disk images ' +
      'via Microsoft OneDrive. To learn more, press the Next button.'
  },
  {
    target: '#tour-onedrive-cloudicon',
    content: 'To load a disk image from the cloud, click the OneDrive icon ' +
      'and select a supported disk image file. ' +
      'The disk image will be downloaded directly to the emulated disk drive.',
  },
  {
    target: '#tour-onedrive-cloudicon',
    content: 'Changes made to the disk will be automatically synchronized ' +
      'to your OneDrive account every five minutes (this interval is configurable). ' +
      'You can also sync the disk image at any time by select "Sync Now" from the menu.',
  },
  {
    target: '#tour-floppy-disks',
    content: 'You can also upload a mounted disk image by cicking the OneDrive icon ' +
      'and select a target save folder in OneDrive. The uploaded disk image ' +
      'will be synchronized automatically.'
  },
  {
    target: 'body',
    placement: 'center',
    content: 'You have reached the end of the tour. Click on the globe ' +
      'tour button to try one of the other tours, ' +
      'or press Finish to start using the emulator.',
  },
]
