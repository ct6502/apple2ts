import { matchMemory } from "../memory"
import { setGamepadValue,
  setLeftButtonDown, setPushButton2, setRightButtonDown } from "../devices/joystick"
import { passHelptext,passEnhancedMidi } from "../worker2main"
import { aztec } from "./aztec"
import { champ_lode_runner } from "./champ_lode_runner"
import { drol } from "./drol"
import { firebug } from "./firebug"
import { injuredengine } from "./injuredengine"
import { karateka } from "./karateka"
import { lode_runner } from "./lode_runner"
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
import { SWITCHES } from "../softswitches"
import { getSiriusJoyport } from "../motherboard"

const gameLibrary = new Array<GameLibraryItem>()

export const AddGameLibraryItem = (item: GameLibraryItem | GameLibraryItem[]) => {
  if (Array.isArray(item)) {
    gameLibrary.push(...item)
  } else {
    gameLibrary.push(item)
  }
}

AddGameLibraryItem(aztec)
AddGameLibraryItem(champ_lode_runner)
AddGameLibraryItem(drol)
AddGameLibraryItem(firebug)
AddGameLibraryItem(injuredengine)
AddGameLibraryItem(karateka)
AddGameLibraryItem(lode_runner)
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
  const isAN0 = SWITCHES.AN0.isSet
  const isAN1 = SWITCHES.AN1.isSet
  const siriusJoyport = getSiriusJoyport()

  switch (button) {
    case 0:
      // Either both true or both false
      if ((isJoystick2 && isAN0) || (!isJoystick2 && !isAN0)) setLeftButtonDown()
      break
    case 1:
      if ((isJoystick2 && isAN0) || (!isJoystick2 && !isAN0)) setRightButtonDown()
      break
    case 12:   // D-pad Up
      if (siriusJoyport) {
        if (isAN1) setRightButtonDown()
      } else {
        if (isJoystick2) {
          setGamepadValue(3, -1)
        } else {
          setGamepadValue(1, -1)
        }
      }
      break
    case 13:   // D-pad Down
      if (siriusJoyport) {
        if (isAN1) setPushButton2()
      } else {
        if (isJoystick2) {
          setGamepadValue(3, 1)
        } else {
          setGamepadValue(1, 1)
        }
      }
      break
    case 14:   // D-pad Left
      if (siriusJoyport) {
        if (!isAN1) setRightButtonDown()
      } else {
        if (isJoystick2) {
          setGamepadValue(2, -1)
        } else {
          setGamepadValue(0, -1)
        }
      }
      break
    case 15:   // D-pad Right
      if (siriusJoyport) {
        if (!isAN1) setPushButton2()
      } else {
        if (isJoystick2) {
          setGamepadValue(2, 1)
        } else {
          setGamepadValue(0, 1)
        }
      }
      break
    default: break
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
      return (key.toUpperCase() in game.keymap) ? game.keymap[key.toUpperCase()] : key
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
