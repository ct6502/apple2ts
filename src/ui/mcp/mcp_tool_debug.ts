/**
 * MCP Debugging & Tracing Tools
 * Tools for breakpoints, watchpoints, and execution tracing
 */

import { RUN_MODE } from "../../common/utility"
import {
  handleGetBreakpoints,
  handleGetIsDebugging,
  handleGetState6502,
  handleGetStackString,
  handleGetTracing,
  handleGetTracelog,
  passSetDebug,
  passBreakpoints,
  passSetTracing,
  handleGetRunMode,
  passSetRunMode,
  passStepInto,
  passStepOut,
  passStepOver,
} from "../main2worker"
import type { MCPToolResult } from "./mcp_server"
import { toolGetRegisters } from "./mcp_tool_state"
import { toolDisassemble } from "./mcp_tool_symbols"



/**
 * Boots the system (power on)
 * Waits for boot to complete before returning
 */
export async function toolBoot(): Promise<MCPToolResult> {
  try {
    passSetRunMode(RUN_MODE.NEED_BOOT)
    
    // Wait for boot to complete (Apple II boots quickly, ~1 second)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      data: { message: "System booted and ready" },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Performs a system reset (Control-Reset)
 */
export function toolReset(): MCPToolResult {
  try {
    passSetRunMode(RUN_MODE.NEED_RESET)
    return {
      success: true,
      data: { message: "System reset initiated" },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Pauses the emulation immediately
 */
export function toolStop(): MCPToolResult {
  try {
    passSetRunMode(RUN_MODE.PAUSED)
    return {
      success: true,
      data: { runMode: "PAUSED" },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Continues execution from the current Program Counter (PC)
 */
export function toolResume(): MCPToolResult {
  try {
    passSetRunMode(RUN_MODE.RUNNING)
    return {
      success: true,
      data: { runMode: "RUNNING" },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Executes exactly N instructions and then pauses
 * @param count Number of instructions to execute (default: 1)
 */
export function toolStepInto(count = 1): MCPToolResult {
  try {
    // Ensure we're in debug mode and paused
    if (!handleGetIsDebugging()) {
      passSetDebug(true)
    }
    if (handleGetRunMode() !== RUN_MODE.PAUSED) {
      passSetRunMode(RUN_MODE.PAUSED)
    }

    // Execute steps
    for (let i = 0; i < count; i++) {
      passStepInto()
    }

    const state = handleGetState6502()
    const lastInstr = toolDisassemble(state.PC, 1)

    return {
      success: true,
      data: {
        stepsExecuted: count,
        lastInstruction: lastInstr.data,
        registers: toolGetRegisters().data,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Executes the next instruction. If it's a JSR, runs the entire subroutine
 */
export function toolStepOver(): MCPToolResult {
  try {
    if (!handleGetIsDebugging()) {
      passSetDebug(true)
    }
    if (handleGetRunMode() !== RUN_MODE.PAUSED) {
      passSetRunMode(RUN_MODE.PAUSED)
    }

    passStepOver()

    const state = handleGetState6502()
    return {
      success: true,
      data: {
        registers: toolGetRegisters().data,
        PC: state.PC,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Runs until the current subroutine returns via RTS
 */
export function toolStepOut(): MCPToolResult {
  try {
    if (!handleGetIsDebugging()) {
      passSetDebug(true)
    }
    if (handleGetRunMode() !== RUN_MODE.PAUSED) {
      passSetRunMode(RUN_MODE.PAUSED)
    }

    passStepOut()

    const state = handleGetState6502()
    return {
      success: true,
      data: {
        registers: toolGetRegisters().data,
        PC: state.PC,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}


/**
 * Pauses execution when PC hits the address
 * @param address Address to break at (0-65535)
 * @param condition Optional condition expression (not yet implemented)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function toolSetBreakpoint(address: number, condition?: string): MCPToolResult {
  try {
    const breakpoints = handleGetBreakpoints()
    
    // Check if breakpoint already exists
    if (breakpoints.has(address)) {
      return {
        success: false,
        error: `Breakpoint already exists at address $${address.toString(16).toUpperCase()}`,
      }
    }

    // Create new breakpoint
    const newBreakpoint: Breakpoint = {
      address: address,
      watchpoint: false,
      memget: false,
      memset: false,
      basic: false,
      disabled: false,
      instruction: false,
      hexvalue: -1,
      hitcount: 1,
      nhits: 0,
      expression1: { register: "", address: 0, operator: "==", value: 0 },
      expression2: { register: "", address: 0, operator: "==", value: 0 },
      expressionOperator: "",
      memoryBank: "",
      action1: { action: "", register: "A", address: 0, value: 0 },
      action2: { action: "", register: "A", address: 0, value: 0 },
      halt: false,
      hidden: false,
      once: false,
    }

    breakpoints.set(address, newBreakpoint)
    passBreakpoints(breakpoints)

    // Enable debugging if not already enabled
    if (!handleGetIsDebugging()) {
      passSetDebug(true)
    }

    return {
      success: true,
      data: {
        address: address,
        message: `Breakpoint set at $${address.toString(16).padStart(4, "0").toUpperCase()}`,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Removes a previously set breakpoint
 * @param address Address of breakpoint to remove
 */
export function toolClearBreakpoint(address: number): MCPToolResult {
  try {
    const breakpoints = handleGetBreakpoints()
    
    if (!breakpoints.has(address)) {
      return {
        success: false,
        error: `No breakpoint at address $${address.toString(16).toUpperCase()}`,
      }
    }

    breakpoints.delete(address)
    passBreakpoints(breakpoints)

    return {
      success: true,
      data: {
        address: address,
        message: `Breakpoint removed from $${address.toString(16).padStart(4, "0").toUpperCase()}`,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Pauses execution whenever a specific memory address is read/written
 * @param address Address to watch (0-65535)
 * @param mode "r" for read, "w" for write, "rw" for both
 */
export function toolSetWatchpoint(address: number, mode: "r" | "w" | "rw" = "rw"): MCPToolResult {
  try {
    const breakpoints = handleGetBreakpoints()
    
    // Check if watchpoint already exists
    if (breakpoints.has(address)) {
      const existing = breakpoints.get(address)!
      if (existing.watchpoint) {
        return {
          success: false,
          error: `Watchpoint already exists at address $${address.toString(16).toUpperCase()}`,
        }
      }
    }

    // Create new watchpoint
    const watchpoint: Breakpoint = {
      address: address,
      watchpoint: true,
      memget: mode === "r" || mode === "rw",
      memset: mode === "w" || mode === "rw",
      basic: false,
      disabled: false,
      instruction: false,
      hexvalue: -1,
      hitcount: 1,
      nhits: 0,
      expression1: { register: "", address: 0, operator: "==", value: 0 },
      expression2: { register: "", address: 0, operator: "==", value: 0 },
      expressionOperator: "",
      memoryBank: "",
      action1: { action: "", register: "A", address: 0, value: 0 },
      action2: { action: "", register: "A", address: 0, value: 0 },
      halt: false,
      hidden: false,
      once: false,
    }

    breakpoints.set(address, watchpoint)
    passBreakpoints(breakpoints)

    // Enable debugging if not already enabled
    if (!handleGetIsDebugging()) {
      passSetDebug(true)
    }

    return {
      success: true,
      data: {
        address: address,
        mode: mode,
        message: `Watchpoint set at $${address.toString(16).padStart(4, "0").toUpperCase()} (${mode})`,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Returns a list of all active breakpoints and watchpoints
 */
export function toolListBreakpoints(): MCPToolResult {
  try {
    const breakpoints = handleGetBreakpoints()
    const list: Array<{
      address: number
      type: string
      mode?: string
      disabled: boolean
    }> = []

    breakpoints.forEach((bp: Breakpoint, addr: number) => {
      const item: {
        address: number
        type: string
        mode?: string
        disabled: boolean
      } = {
        address: addr,
        type: bp.watchpoint ? "watchpoint" : "breakpoint",
        disabled: bp.disabled,
      }

      if (bp.watchpoint) {
        if (bp.memget && bp.memset) {
          item.mode = "rw"
        } else if (bp.memget) {
          item.mode = "r"
        } else if (bp.memset) {
          item.mode = "w"
        }
      }

      list.push(item)
    })

    return {
      success: true,
      data: {
        breakpoints: list,
        count: list.length,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Starts logging every instruction executed
 */
export function toolEnableTrace(): MCPToolResult {
  try {
    passSetTracing(true)
    return {
      success: true,
      data: {
        tracing: true,
        message: "Instruction tracing enabled",
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Stops logging instructions
 */
export function toolDisableTrace(): MCPToolResult {
  try {
    passSetTracing(false)
    return {
      success: true,
      data: {
        tracing: false,
        message: "Instruction tracing disabled",
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Gets the current trace log
 */
export function toolGetTraceLog(): MCPToolResult {
  try {
    const traceLog = handleGetTracelog()
    const isTracing = handleGetTracing()

    return {
      success: true,
      data: {
        tracing: isTracing,
        logEntries: traceLog,
        count: traceLog.length,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Returns the call stack (sequence of JSR addresses on the stack)
 * @param depth Maximum depth to return (default: 16)
 */
export function toolGetBacktrace(depth = 16): MCPToolResult {
  try {
    const stackString = handleGetStackString()
    const state = handleGetState6502()

    return {
      success: true,
      data: {
        stackPointer: state.StackPtr,
        stackString: stackString,
        PC: state.PC,
        depth: depth,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}
