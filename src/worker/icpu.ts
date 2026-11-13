export interface ICPU {
    reset(): void;
    processInstruction(traceCallback?: ((str: string) => void) | null): number;
    irq?(): void;
    clearIrq?(): void;
}
