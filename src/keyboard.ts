import {KeyboardEvent} from "react";

export const convertAppleKey = (e: KeyboardEvent) => {
  let key = 0
  if (e.key.length === 1) {
    key = e.key.charCodeAt(0)
    if (e.ctrlKey) {
      if (key >= 0x40 && key <= 0x7E) {
        key &= 0b00011111
      } else {
        return 0
      }
    }
    if (e.metaKey || e.altKey) {
      return 0
    }
  } else {
    const keymap: { [key: string]: number } = {
      Enter: 13,
      ArrowRight: 21,
      ArrowLeft: 8,
      Backspace: 8,
      ArrowUp: 11,
      ArrowDown: 10,
      Escape: 27,
      Shift: -1,
      Control: -1
    };
    if (e.key in keymap) {
      key = keymap[e.key]
    }
  }
  return key
};
