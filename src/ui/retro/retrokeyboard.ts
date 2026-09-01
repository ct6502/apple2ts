const keyboardInputSelector = "input, textarea, select, button, [contenteditable]:not([contenteditable='false'])"

export const isInteractiveKeyboardTarget = (target: EventTarget | null) =>
  target instanceof Element && target.closest(keyboardInputSelector) !== null