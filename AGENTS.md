# Repository guidance

## VERA audio timing

- At normal speed, the CPU scheduler advances 17,030 cycles per 16.6881 ms. Keep the CPU-cycle-to-time conversion used for VERA PCM FIFO status in `src/worker/devices/vera/video.ts` consistent with that rate, rather than assuming exactly 1 MHz. The AudioWorklet renders against the audio device clock independently of the worker's FIFO model.
- A mismatch can make the worker report that the FIFO is draining faster than the AudioWorklet consumes it. During continuous Freegemas PCM music, the output FIFO can fill and discard samples; a user reported intermittent pops after about 20 seconds and confirmed they disappeared after the clock correction. This is a user listening report, not a measurement of FIFO overflow.
- Run `npx jest src/worker/devices/vera/vera.test.ts --runInBand` and `npm run test:vera-audio-clock` after changing VERA audio timing. For a manual regression, run at normal speed, boot a local Freegemas VERA HDV, and listen through at least 30 seconds of gameplay music with and without sound effects. Automated tests do not replace browser listening tests.
