import { Step } from 'react-joyride'

export const tourDebug: Step[] = [
  {
    target: 'body',
    placement: 'center',
    content: (<div style={{textAlign: "left"}}>The Apple2TS emulator has a rich set of debugging tools.
    To learn more, press the Next button.<p/>
      Or try one of the other tours:
      <ul>
      <li><a href="/?tour=main">Main Tour</a></li>
      <li><a href="/?tour=settings">Emulator Settings</a></li>
      </ul>
    </div>)
  },
  {
    target: '#tour-debug-button',
    content: 'If you are not already in debug mode, press the bug button now to switch to that mode.',
  },
  {
    target: 'body',
    placement: 'center',
    content: (<div style={{textAlign: "left"}}>You have reached the end.<p/>
      Try one of the other tours:<p/>
      <ul>
      <li><a href="/?tour=main">Main</a></li>
      <li><a href="/?tour=settings">Emulator Settings</a></li>
      </ul>
      or press Finish to start using the emulator.</div>),
  },
]
