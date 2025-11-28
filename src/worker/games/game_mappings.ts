import { matchMemory } from "../memory"
import { setGamepad0, setGamepad1, setGamepad2, setGamepad3,
  setLeftButtonDown, setPushButton2, setRightButtonDown } from "../devices/joystick"
import { passHelptext,passEnhancedMidi } from "../worker2main"
import { aztec } from "./aztec"
import { drol } from "./drol"
import { firebug } from "./firebug"
import { injuredengine } from "./injuredengine"
import { karateka } from "./karateka"
import { noxarchaist } from "./noxarchaist"
import { one_on_one } from "./one_on_one"
import { princeofpersia } from "./princeofpersia"
import { printshop } from "./printshop"
import { robotron } from "./robotron"
import { snoggle } from "./snoggle"
import { ultima5 } from "./ultima5"
import { wizardry } from "./wizardry"
import { wolfenstein, wolfenstein_splash } from "./wolfenstein"
import { beyondwolf } from "./beyondwolf"

const gameLibrary = new Array<GameLibraryItem>()

export const AddGameLibraryItem = (item: GameLibraryItem | GameLibraryItem[]) => {
  if (Array.isArray(item)) {
    gameLibrary.push(...item)
  } else {
    gameLibrary.push(item)
  }
}

AddGameLibraryItem(aztec)
AddGameLibraryItem(drol)
AddGameLibraryItem(firebug)
AddGameLibraryItem(injuredengine)
AddGameLibraryItem(karateka)
AddGameLibraryItem(noxarchaist)
AddGameLibraryItem(one_on_one)
AddGameLibraryItem(princeofpersia)
AddGameLibraryItem(printshop)
AddGameLibraryItem(robotron)
AddGameLibraryItem(snoggle)
AddGameLibraryItem(ultima5)
AddGameLibraryItem(wizardry)
AddGameLibraryItem(wolfenstein)
AddGameLibraryItem(wolfenstein_splash)
AddGameLibraryItem(beyondwolf)


export const defaultButtons: GamePadMapping = (button: number,
  dualJoysticks: boolean, isJoystick2: boolean) => {
  if (isJoystick2) {
    switch (button) {
      case 0: setPushButton2(); break  // button #0 becomes push button 2
      case 1: break  // ignore button #1
      case 12: setGamepad3(-1); break   // D-pad U
      case 13: setGamepad3(1); break    // D-pad D
      case 14: setGamepad2(-1); break   // D-pad L
      case 15: setGamepad2(1); break    // D-pad R
      default: break
    }
  } else {
    switch (button) {
      case 0: setLeftButtonDown(); break
      case 1: if (!dualJoysticks) setRightButtonDown(); break
      case 12: setGamepad1(-1); break   // D-pad U
      case 13: setGamepad1(1); break    // D-pad D
      case 14: setGamepad0(-1); break   // D-pad L
      case 15: setGamepad0(1); break    // D-pad R
      default: break
    }
  }
}

const defaultGame: GameLibraryItem = {
  address: 0,
  data: [],
  keymap: {},
  gamepad: null,
  joystick: (axes: number[]) => axes,
  rumble: null,
  setup: null,
  helptext: ""
}

export const handleKeyMapping = (key: string) => {
  for (const game of gameLibrary) {
    if (matchMemory(game.address, game.data)) {
      return (key in game.keymap) ? game.keymap[key] : key
    }   
  }
  return key
}

export const getGameMapping = () => {
  for (const game of gameLibrary) {
    if (matchMemory(game.address, game.data)) {
      return game
    }   
  }
  return defaultGame
}

export const handleGameSetup = (reset = false) => {
  for (const game of gameLibrary) {
    if (matchMemory(game.address, game.data)) {
      passHelptext(game.helptext ? game.helptext : " ")
      if (game.setup) game.setup()
      return
    }   
  }
  if (reset) { 
    passHelptext(" ")
    passEnhancedMidi(0)
  }
}
