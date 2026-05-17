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
      name: "get_registers",
      description: "Returns the current values of A, X, Y, PC, S (Stack Pointer), and P (Status Flags)",
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
      description: "Returns a hex dump or byte array from a specific memory range",
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
      name: "get_softswitches",
      description: "Returns the state of Apple II softswitches",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "set_softswitches",
      description: "Sets soft switches by triggering their addresses",
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
      description: "Pauses execution when the PC hits the address",
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
      description: "Pauses execution whenever a specific memory address is read from or written to",
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
      name: "list_breakpoints",
      description: "Returns a list of all active breakpoints and watchpoints",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "enable_trace",
      description: "Starts logging every instruction executed",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "disable_trace",
      description: "Stops logging instructions",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "get_trace_log",
      description: "Gets the current trace log",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "get_backtrace",
      description: "Returns the call stack (sequence of JSR addresses on the stack)",
      inputSchema: {
        type: "object",
        properties: {
          depth: {
            type: "number",
            description: "Maximum depth to return",
            default: 16,
          },
        },
      },
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
      name: "send_keypress",
      description: "Simulates a keypress on the Apple II keyboard",
      inputSchema: {
        type: "object",
        properties: {
          key: {
            description: "ASCII code or character to press",
          },
        },
        required: ["key"],
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
  ]
}

