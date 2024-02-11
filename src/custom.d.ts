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

type MessagePayload = object | number | string | boolean | EmuGamepad[] | null

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
  speed: number,
  renderCount: number,
  ctrlKeyMode: number,
  openAppleKeyMode: number,
  closedAppleKeyMode: number,
  showFileOpenDialog: {show: boolean, drive: number},
  updateDisplay: (speed = 0, helptext = '') => void,
  handleCtrlDown: (mode: number) => void,
  handleOpenAppleDown: (mode: number) => void,
  handleClosedAppleDown: (mode: number) => void,
  setShowFileOpenDialog: (show: boolean, drive: number) => void,
}

type MachineState = {
  runMode: number,
  s6502: STATE6502,
  cpuSpeed: number,
  speedMode: number,
  isDebugging: boolean,
  altChar: boolean,
  noDelayMode: boolean,
  colorMode: COLOR_MODE,
  capsLock: boolean,
  textPage: Uint8Array,
  lores: Uint8Array,
  hires: Uint8Array,
  debugDump: string,
  memoryDump: Uint8Array,
  addressGetTable: number[],
  disassembly: string,
  nextInstruction: string,
  button0: boolean,
  button1: boolean,
  canGoBackward: boolean,
  canGoForward: boolean,
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
  colorMode: number,
  capsLock: boolean,
  audioEnable: boolean,
  mockingboardMode: number,
  speedMode: number,
}

type EmulatorSaveState = {
  emulator: DisplaySaveState | null,
  state6502: Apple2SaveState,
  driveState: DriveSaveState,
  thumbnail: string,
  snapshots: Array<EmulatorSaveState> | null
}

type TimeTravelThumbnail = {
  s6502: STATE6502,
  thumbnail: string
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

// This LaunchParams and LaunchQueue are part of the Web App Launch Handler API.
// Needed to add my own types to avoid using "any".
type LaunchParams = {
  files: FileSystemFileHandle[]
}
type LaunchQueue = {
  setConsumer: (consumer: (launchParams: LaunchParams) => Promise<void>) => void
}

interface MemoryBank {
  name: string;
  min: number;
  max: number;
  enabled: (addr = 0) => boolean;
}

interface MemoryBanks {
  [key: string]: MemoryBank;
}
