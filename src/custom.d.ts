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
    bytes: number
    execute: PCodeFunc
}

type STATE6502 = {
  cycleCount: number,
  PStatus: number,
  PC: number,
  Accum: number,
  XReg: number,
  YReg: number,
  StackPtr: number,
  flagIRQ: number,
  flagNMI: boolean
}

type Apple2SaveState = {
  s6502: STATE6502,
  softSwitches: {[name: string]: boolean},
  memory: string
}

type DisplayProps = {
  runMode: RUN_MODE,
  speed: number,
  myCanvas: React.RefObject<HTMLCanvasElement>,
  speedCheck: boolean,
  uppercase: boolean,
  useArrowKeysAsJoystick: boolean,
  colorMode: COLOR_MODE,
  doDebug: boolean,
  handleDebugChange: (enable: boolean) => void,
  handleSpeedChange: (enable: boolean) => void,
  handleColorChange: (mode: COLOR_MODE) => void,
  handleCopyToClipboard: () => void,
  handleUpperCaseChange: (enable: boolean) => void,
  handleUseArrowKeyJoystick: (enable: boolean) => void,
  handleFileOpen: () => void,
  handleFileSave: (withSnapshots: boolean) => void,
}

type MachineState = {
  runMode: number,
  s6502: STATE6502,
  speed: number,
  altChar: boolean,
  noDelayMode: boolean,
  textPage: Uint8Array,
  lores: Uint8Array,
  hires: Uint8Array,
  debugDump: string,
  disassembly: string,
  nextInstruction: string,
  button0: boolean,
  button1: boolean,
  canGoBackward: boolean,
  canGoForward: boolean,
  maxState: number,
  iTempState: number,
  timeTravelThumbnails: Array<TimeTravelThumbnail>
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

type DisplaySaveState = {
  name: string,
  date: string,
  help: string,
  colorMode: number,
  uppercase: boolean,
  audioEnable: boolean,
  mockingboardMode: number
}

type EmulatorSaveState = {
  emulator: DisplaySaveState | null,
  state6502: Apple2SaveState,
  driveState: DriveSaveState,
  snapshots: Array<EmulatorSaveState> | null
}

type TimeTravelThumbnail = {
  s6502: STATE6502
}

type SetMemoryBlock = {
  address: number,
  data: Uint8Array,
  run: boolean
}

type AudioDevice = {
  context: AudioContext,
  element: HTMLAudioElement,
  timeout: number
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
  helptext: string
}

type GamePadMapping = (button: number, dualJoysticks: boolean, isJoystick2: boolean) => void

interface AddressCallback {
  (addr: number, value: number): number;
}

type MockingboardSound = {
  slot: number,
  chip: number,
  params: number[]
}
