declare module 'list-react-files'

declare module "*.png" {
   const value: string;
   export = value;
}
declare module "*.mp3" {
   const value: string;
   export = value;
}
declare module "*.woz" {
   const value: string;
   export = value;
}
declare module "*.po" {
  const value: string;
  export = value;
}
declare module "*.hdv" {
  const value: string;
  export = value;
}

interface PCodeFunc {
  (valueLo: number, valueHi: number): number;
}

interface PCodeInstr {
    name: string
    pcode: number,
    mode: MODE
    PC: number
    execute: PCodeFunc
}

type STATE6502 = {
  PStatus: number,
  PC: number,
  Accum: number,
  XReg: number,
  YReg: number,
  StackPtr: number
}

type Apple2SaveState = {
  s6502: STATE6502,
  softSwitches: {[name: string]: boolean},
  memory: string
}

type DisplayProps = {
  machineState: STATE,
  speed: number,
  myCanvas: React.RefObject<HTMLCanvasElement>,
  hiddenCanvas: React.RefObject<HTMLCanvasElement>,
  speedCheck: boolean,
  handleSpeedChange: () => void,
  canGoBackward: boolean,
  canGoForward: boolean,
  uppercase: boolean,
  useArrowKeysAsJoystick: boolean,
  colorMode: COLOR_MODE,
  handleColorChange: (mode: COLOR_MODE) => void,
  handleCopyToClipboard: () => void,
  handleUpperCaseChange: () => void,
  handleUseArrowKeyJoystick: () => void,
  handleFileOpen: () => void,
  handleFileSave: () => void,
  updateDisplay: (speed?: number, helptext?: string) => void,
  button0: boolean,
  button1: boolean,
}

type DebugProps = {
  doDebug: boolean,
  breakpoint: string,
  handleDebugChange: () => void,
  handleBreakpoint: (bp: string) => void,
  handleStepInto: () => void,
  handleStepOver: () => void,
  handleStepOut: () => void,
}

type MachineState = {
  state: STATE,
  speed: number,
  altChar: boolean,
  textPage: Uint8Array,
  lores: Uint8Array,
  hires: Uint8Array,
  zeroPageStack: string,
  button0: boolean,
  button1: boolean,
  canGoBackward: boolean,
  canGoForward: boolean
}

type DriveState = {
  hardDrive: boolean,
  status: string,
  filename: string,
  diskHasChanges: boolean,
  motorRunning: boolean,
  isWriteProtected: boolean,
  halftrack: number,
  prevHalfTrack: number,
  writeMode: boolean,
  currentPhase: number,
  trackStart: Array<number>,
  trackNbits: Array<number>,
  trackLocation: number,
}

type DriveProps = {
  hardDrive: boolean,
  drive: number,
  filename: string,
  status: string,
  motorRunning: boolean,
  diskHasChanges: boolean,
  diskData: Uint8Array
}

type DriveSaveState = {
  currentDrive: number,
  driveState: DriveState[],
  driveData: string[]
}

type EmulatorSaveState = {
  emulator: any,
  state6502: Apple2SaveState,
  driveState: DriveSaveState
}

type SetMemoryBlock = {
  address: number,
  data: Uint8Array,
  run: boolean
}

type AudioDevice = {
  context: AudioContext,
  element: HTMLAudioElement
}

type EmuGamepad = {
  axes: Array<number>,
  buttons: Array<boolean>
}

type diskImage = {
  file: string
  url: string
};

type GamePadActuatorEffect = {
  startDelay: number,
  duration: number,
  weakMagnitude: number,
  strongMagnitude: number,
}

type KeyMap = {
  [key: string]: string;
};

type GameLibraryItem = {
  address: number,
  data: number[],
  keymap: KeyMap,
  joystick: null | ((axes: number[], isKeyboardJoystick: boolean) => number[]),
  gamepad: null | ((button: number, dualJoysticks: boolean, isJoystick2: boolean) => void),
  rumble: null | (() => void),
  setup: null | (() => void),
  helptext: string}

type GamePadMapping = (button: number, dualJoysticks: boolean, isJoystick2: boolean) => void

interface AddressCallback {
  (addr: number, value: number): number;
}

type MockingboardSound = {
  chip: number,
  params: Array<number>,
}