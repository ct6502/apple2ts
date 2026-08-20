export const isDefaultHelp = (helpText: string) => (
  !helpText
  || helpText === " "
  || helpText === "<Default>"
)
