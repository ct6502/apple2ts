import { MCPToolName } from "./mcp_server"

/**
 * Lists all available MCP tools with their schemas
 */
export function listMCPTools(): Array<{
  name: MCPToolName
  description: string
  inputSchema: Record<string, unknown>
}> {
  return [
    {
      name: "boot",
      description: "Boots the system (power on). Clears all RAM and initializes the system.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "reset",
      description: "Performs a system reset (Control-Reset). Equivalent to pressing Ctrl+Reset on the Apple II.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "stop",
      description: "Pauses the emulation immediately",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "resume",
      description: "Continues execution from the current Program Counter (PC)",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "step",
      description: "Executes exactly N instructions and then pauses",
      inputSchema: {
        type: "object",
        properties: {
          count: {
            type: "number",
            description: "Number of instructions to execute",
            default: 1,
          },
        },
      },
    },
    {
      name: "step_over",
      description: "Executes the next instruction. If it's a JSR, runs the entire subroutine",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "step_out",
      description: "Runs until the current subroutine returns via RTS",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "set_register",
      description: "Modifies a specific CPU register",
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Register name: A, X, Y, PC, S, P",
          },
          value: {
            type: "number",
            description: "New value (0-255 for 8-bit, 0-65535 for 16-bit)",
          },
        },
        required: ["name", "value"],
      },
    },
    {
      name: "read_memory",
      description: "Returns a hex dump or byte array from a specific memory range. For reading the entire text screen, use the 'apple2ts://video/text' resource instead.",
      inputSchema: {
        type: "object",
        properties: {
          address: {
            type: "number",
            description: "Starting address (0-65535)",
          },
          length: {
            type: "number",
            description: "Number of bytes to read",
          },
        },
        required: ["address", "length"],
      },
    },
    {
      name: "write_memory",
      description: "Writes specific values to RAM",
      inputSchema: {
        type: "object",
        properties: {
          address: {
            type: "number",
            description: "Starting address (0-65535)",
          },
          data: {
            type: "array",
            items: { type: "number" },
            description: "Array of bytes to write",
          },
        },
        required: ["address", "data"],
      },
    },
    {
      name: "set_softswitches",
      description: "Sets soft switches by triggering their addresses. To read current soft switch state, use the 'apple2ts://system/softswitches' resource.",
      inputSchema: {
        type: "object",
        properties: {
          addresses: {
            type: "array",
            items: { type: "number" },
            description: "Array of addresses to trigger (e.g., [0xC050, 0xC054])",
          },
        },
        required: ["addresses"],
      },
    },
    {
      name: "set_breakpoint",
      description: "Pauses execution when the PC hits the address. To list breakpoints, use the 'apple2ts://debugger/breakpoints' resource.",
      inputSchema: {
        type: "object",
        properties: {
          address: {
            type: "number",
            description: "Address to break at (0-65535)",
          },
          condition: {
            type: "string",
            description: "Optional condition expression (not yet implemented)",
          },
        },
        required: ["address"],
      },
    },
    {
      name: "clear_breakpoint",
      description: "Removes a previously set breakpoint",
      inputSchema: {
        type: "object",
        properties: {
          address: {
            type: "number",
            description: "Address of breakpoint to remove",
          },
        },
        required: ["address"],
      },
    },
    {
      name: "set_watchpoint",
      description: "Pauses execution whenever a specific memory address is read from or written to. To list watchpoints, use the 'apple2ts://debugger/breakpoints' resource.",
      inputSchema: {
        type: "object",
        properties: {
          address: {
            type: "number",
            description: "Address to watch (0-65535)",
          },
          mode: {
            type: "string",
            enum: ["r", "w", "rw"],
            description: "Watch mode: 'r' for read, 'w' for write, 'rw' for both",
            default: "rw",
          },
        },
        required: ["address"],
      },
    },
    {
      name: "enable_trace",
      description: "Starts logging every instruction executed. To read the trace log, use the 'apple2ts://debugger/trace' resource.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "disable_trace",
      description: "Stops logging instructions",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "insert_disk",
      description: "Mounts a disk image",
      inputSchema: {
        type: "object",
        properties: {
          drive: {
            type: "number",
            description: "Drive number (1-4)",
          },
          data: {
            type: "array",
            items: { type: "number" },
            description: "Disk image data as byte array",
          },
          filename: {
            type: "string",
            description: "Filename for the disk image",
          },
        },
        required: ["drive", "data", "filename"],
      },
    },
    {
      name: "eject_disk",
      description: "Removes the disk image from a drive",
      inputSchema: {
        type: "object",
        properties: {
          drive: {
            type: "number",
            description: "Drive number (1-4)",
          },
        },
        required: ["drive"],
      },
    },
    {
      name: "load_bundled_disk",
      description: "Loads a bundled disk image from the catalog. Use the 'apple2ts://disks/catalog' resource to see available disks. This is the easiest way to load games and programs. Accepts both local filenames and URLs.",
      inputSchema: {
        type: "object",
        properties: {
          filename: {
            type: "string",
            description: "Filename or URL from the disk catalog (e.g., 'https://ct6502.org/.../TotalReplay.hdv_.zip', 'Olympic%20Decathlon.woz')",
          },
          drive: {
            type: "number",
            description: "Drive number (1-4), defaults to 1",
            default: 1,
          },
        },
        required: ["filename"],
      },
    },
    {
      name: "send_keypress",
      description: "Simulates typing on the Apple II keyboard. Can send single characters, strings, or special keys. Use code 13 for Enter/Return.",
      inputSchema: {
        type: "object",
        properties: {
          key: {
            description: "String to type (e.g., 'CATALOG'), single character, or ASCII code (13 for Enter)",
          },
        },
        required: ["key"],
      },
    },
    {
      name: "press_apple_key",
      description: "Presses an Apple command key (joystick button). Used in games and software that require button input. Button remains pressed until release_apple_key is called.",
      inputSchema: {
        type: "object",
        properties: {
          button: {
            type: "string",
            description: "Button to press: 'left', 'right', 'button 0' (left), 'button 1' (right), 'button 2' (right), or 'joystick button 0/1/2'",
            enum: ["left", "right", "button 0", "button 1", "button 2", "0", "1", "2"],
          },
        },
        required: ["button"],
      },
    },
    {
      name: "release_apple_key",
      description: "Releases an Apple command key (joystick button) that was previously pressed.",
      inputSchema: {
        type: "object",
        properties: {
          button: {
            type: "string",
            description: "Button to release: 'left', 'right', 'button 0' (left), 'button 1' (right), 'button 2' (right), or 'joystick button 0/1/2'",
            enum: ["left", "right", "button 0", "button 1", "button 2", "0", "1", "2"],
          },
        },
        required: ["button"],
      },
    },
    {
      name: "load_binary",
      description: "Loads a binary file directly into memory",
      inputSchema: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { type: "number" },
            description: "Binary data as array of bytes",
          },
          address: {
            type: "number",
            description: "Starting address (default: 0x300)",
            default: 0x300,
          },
          run: {
            type: "boolean",
            description: "Whether to execute after loading",
            default: false,
          },
        },
        required: ["data"],
      },
    },
    {
      name: "disassemble",
      description: "Returns the assembly mnemonics for a range of memory",
      inputSchema: {
        type: "object",
        properties: {
          address: {
            type: "number",
            description: "Starting address",
          },
          lines: {
            type: "number",
            description: "Number of instructions to disassemble",
            default: 10,
          },
        },
        required: ["address"],
      },
    },
    {
      name: "read_resource",
      description: "Reads a resource by URI. Resources provide high-level access to emulator state like the text screen, CPU status, disk catalog, etc. Use this instead of tool calls for reading state.",
      inputSchema: {
        type: "object",
        properties: {
          uri: {
            type: "string",
            description: "Resource URI (e.g., 'apple2ts://video/text' for text screen, 'apple2ts://cpu/status' for CPU registers and state, 'apple2ts://system/softswitches' for soft switches, 'apple2ts://debugger/breakpoints' for breakpoint list)",
            enum: [
              "apple2ts://memory/main",
              "apple2ts://video/text",
              "apple2ts://video/lores",
              "apple2ts://video/hires",
              "apple2ts://cpu/status",
              "apple2ts://system/softswitches",
              "apple2ts://debugger/stack",
              "apple2ts://debugger/breakpoints",
              "apple2ts://debugger/trace",
              "apple2ts://debugger/backtrace",
              "apple2ts://disks/catalog",
              "apple2ts://emulator/settings"
            ],
          },
        },
        required: ["uri"],
      },
    },
    {
      name: "set_speed",
      description: "Set the emulator speed. -2 = 0.1 MHz (Snail), -1 = 0.5 MHz (Slow), 0 = 1 MHz (Normal Apple II speed), 1 = 2 MHz, 2 = 3 MHz, 3 = 4 MHz (Fast), 4 = Ludicrous speed",
      inputSchema: {
        type: "object",
        properties: {
          speed: {
            type: "number",
            description: "Speed mode from -2 (slowest) to 4 (fastest)",
            enum: [-2, -1, 0, 1, 2, 3, 4],
          },
        },
        required: ["speed"],
      },
    },
    {
      name: "set_machine_type",
      description: "Set the Apple II machine type. Changes the ROM and hardware capabilities. Note: This will reset the machine.",
      inputSchema: {
        type: "object",
        properties: {
          machineType: {
            type: "string",
            description: "Machine type: APPLE2P (Apple II+), APPLE2EU (Apple IIe Unenhanced), APPLE2EE (Apple IIe Enhanced)",
            enum: ["APPLE2P", "APPLE2EU", "APPLE2EE"],
          },
        },
        required: ["machineType"],
      },
    },
    {
      name: "set_color_mode",
      description: "Set the display color mode. Simulates different monitor types and display settings.",
      inputSchema: {
        type: "object",
        properties: {
          colorMode: {
            type: "string",
            description: "Color mode: COLOR (full color), NOFRINGE (color without color fringing), GREEN (green phosphor monitor), AMBER (amber monitor), BLACKANDWHITE, INVERSEBLACKANDWHITE",
            enum: ["COLOR", "NOFRINGE", "GREEN", "AMBER", "BLACKANDWHITE", "INVERSEBLACKANDWHITE"],
          },
        },
        required: ["colorMode"],
      },
    },
    {
      name: "set_sound",
      description: "Enable or disable emulator sound (speaker and disk drive sounds)",
      inputSchema: {
        type: "object",
        properties: {
          enabled: {
            type: "boolean",
            description: "true to enable sound, false to disable",
          },
        },
        required: ["enabled"],
      },
    },
  ]
}

