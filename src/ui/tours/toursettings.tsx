import { Step } from "react-joyride"

const isTouchDevice = "ontouchstart" in document.documentElement
const isMac = navigator.platform.startsWith("Mac")
const modKey = isMac ? "⌘" : "Alt"
const altArrowKeys = <div>The next key determines whether the {modKey} key is
  used for keyboard shortcuts or the Apple II Open Apple key.<p/>
  The final key determines whether the arrow keys can be used as the Apple II joystick.</div>

export const tourSettings: Step[] = [
  {
    target: "body",
    placement: "center",
    content: "Apple2TS has a full set of controls " +
      "for both the emulator and the Apple II. " +
      "To learn more, press the Next button."
  },
  {
    target: "#tour-maincontrols",
    content: "Here, you can boot and reset the Apple II, restore and save the state, " +
      "copy the screen, or paste text into the emulator.",
  },
  {
    target: "#tour-snapshot",
    content: "At any point, you can take a snapshot of the current emulator state, " +
      "then go back in time to an earlier state, or fast forward again. You can also " +
      "save the emulator state with all of the current snapshots.",
  },
  {
    target: "#tour-pause-button",
    content: "You can pause the emulator at any time, freezing the 6502 processor. " +
      "This is useful for pausing the action in a game, or entering the debugger.",
  },
  {
    target: "#tour-debug-button",
    content: "Click on the bug to enter debug mode, where you can see the internal " +
      "state of the 6502 processor. Click again to go back to normal mode.",
  },
  {
    target: "#tour-configbuttons",
    content: "The bottom row of buttons controls the state of the Apple II, " +
      "starting with the emulator speed, the screen color, and muting the sound.",
  },
  {
    target: "#tour-keyboardbuttons",
    content: (<div style={{textAlign: "left"}}>If the caps lock key is turned on,
    then all typed characters are UPPERCASE.<p/>
    {isTouchDevice ? "" : altArrowKeys}</div>),
  },
  {
    target: "#tour-clearcookies",
    content: "Apple2TS automatically saves the current emulator settings as " +
      "browser cookies. Press this button to reset these settings and delete the cookies.",
  },
  {
    target: "body",
    placement: "center",
    content: "You have reached the end of the tour. Click on the globe " +
      "tour button to try one of the other tours, " +
      "or press Finish to start using the emulator.",
  },
]
