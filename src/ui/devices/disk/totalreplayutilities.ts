// See original GAMES.CONF configuration file at:
// https://raw.githubusercontent.com/a2-4am/4cade/refs/heads/main/res/GAMES.CONF

export const parseGameList = (fileContent: string) => {
  // Split the file content into lines
  const lines = fileContent.split("\n")
  // Remove leading and trailing whitespace
  let parsedGames = lines.map((line) => line.trim())
  // Remove blank lines and comments
  parsedGames = parsedGames.filter((line) => line && !line.startsWith("#"))
  parsedGames = parsedGames.map((line) => {
    const joystick = (line.charAt(0) === "1") ? "joystick" : ""
    const cheats = (line.charAt(3) !== "0") ? `cheats=${line.charAt(3)}` : ""
    // Get everything after '='
    const index = line.indexOf("=")
    line = (index !== -1) ? line.substring(index + 1) : ""
    if (joystick || cheats) {
      line += " ("
      if (joystick) {
        line += joystick
      }
      if (cheats) {
        if (joystick) line += ", "
        line += cheats
      }
      line += ")"
    }
    return line
  })

  const key = `Total Replay
Created by 4am and qkumba
Distributed with their permission

Arrow keys to browse games
Type to find a game
Return to play
Space to preview
Esc to go back
Ctrl+C to cheat
Ctrl+P joystick
Ctrl+A credits

Cheat modes
   1 = infinite lives
   2 = infinite weapons
   3 = infinite lives & weapons
   4 = infinite lives & time
   5 = infinite time
   6 = invincibility
   7 = has in-game cheats

`
  const license = `


MIT License

Copyright (c) 2018-2025 4am

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: 

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
`

  const result = parsedGames.join("\n")

  return key + result + license
}
