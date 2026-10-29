import process from "node:process"
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import path from "node:path"

const emsdkRoot = process.env.EMSDK || "C:\\dev\\emsdk"
const envBat = path.join(emsdkRoot, "emsdk_env.bat")
if (!existsSync(envBat)) {
  throw new Error(`Emscripten SDK not found at ${envBat}. Set EMSDK to its install directory.`)
}

const emxx = path.join(emsdkRoot, "upstream", "emscripten", "em++" + (process.platform === "win32" ? ".exe" : ""))
const env = {
  ...process.env,
  EMSDK: emsdkRoot,
  PATH: `${path.join(emsdkRoot, "upstream", "emscripten")};${emsdkRoot};${process.env.PATH}`,
}
const result = spawnSync(emxx, [
  "src/worker/devices/vera/ymfm_wrapper.cpp",
  "src/worker/devices/vera/ymfm/ymfm_opm.cpp",
  "-O3", "-std=c++17", "-Isrc/worker/devices/vera",
  "-sMODULARIZE=1", "-sEXPORT_ES6=1", "-sENVIRONMENT=web,worker",
  "-sEXPORTED_FUNCTIONS=['_malloc','_free','_ymfm_reset','_ymfm_write','_ymfm_render']",
  "-sEXPORTED_RUNTIME_METHODS=['HEAP16']", "-sALLOW_MEMORY_GROWTH=1", "-sFILESYSTEM=0",
  "-o", "public/js/vera-ym.js",
], { stdio: "inherit", env })
if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)

