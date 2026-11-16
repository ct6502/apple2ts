// Tiny indirection so modules that are imported *by* the memory system (and
// therefore cannot import motherboard.ts without a cycle) can still ask for
// the CPU's current 24-bit program counter. motherboard.ts installs the
// getter right after it creates the CPU instance.
let pcGetter: (() => number) | null = null
export const setCpuPcGetter = (f: () => number) => { pcGetter = f }
export const getCpuPc = (): number => (pcGetter ? pcGetter() : -1)
