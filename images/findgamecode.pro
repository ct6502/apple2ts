; IDL program to construct a diagram of the conversion from
; 6502 audio signals to JavaScript 44100Hz AudioWorklet signals.

  compile_opt idl2
  x = read_binary('~/Desktop/replaymain.dat')
  y = read_binary('~/Desktop/wolf1.dat')
  z = read_binary('~/Desktop/wolf2.dat')
  addr = lindgen(65536)
  gaddr = (addr ge 0x0A00 and addr lt 0x2000) or (addr ge 0x8000)
  good = where(gaddr and (x ne y) and (y eq z) and (y ne 255))
  for i = 0, 200 do begin
    if (good[i + 1] eq (good[i] + 1) && good[i + 2] eq (good[i] + 2)) then begin
      print, good[i], y[good[i]], y[good[i + 1]], y[good[i + 2]], format='(Z4.4, ":", 3Z3.2)'
    endif
  endfor
end
