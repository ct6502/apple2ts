import { ICPU } from "./icpu"
import { processInstruction } from "./cpu6502"
import { reset6502 } from "./instructions"

export class CPU6502Wrapper implements ICPU {
    public reset(): void {
        reset6502()
    }

    public processInstruction(traceCallback?: ((str: string) => void) | null): number {
        return processInstruction(traceCallback)
    }
}
