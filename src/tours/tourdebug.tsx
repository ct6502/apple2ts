import { ACTIONS, CallBackProps, Step } from 'react-joyride'

const callbackInDebugMode = (data: CallBackProps, setTourIndex: (index: number) => {}) => {
  console.log(data)
  if (data.action === ACTIONS.NEXT || data.action === ACTIONS.PREV) {
    // Update state to advance the tour
    setTourIndex(data.index + (data.action === ACTIONS.PREV ? -1 : 1))
  }

}

export const tourDebug: Step[] = [
  {
    target: 'body',
    placement: 'center',
    content: 'Apple2TS has a rich set of tools to ' +
      'analyze and debug 6502 assembly code. ' +
      'To learn more, press the Next button.'
  },
  {
    target: '#tour-debug-button',
    content: 'If you are not already in debug mode, press the bug button now to switch to that mode.',
    data: callbackInDebugMode
  },
  {
    target: 'body',
    placement: 'center',
    content: 'You have reached the end of the tour. Click on the globe ' +
      'tour button to try one of the other tours, ' +
      'or press Finish to start using the emulator.',
  },
]
