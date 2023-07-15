pro plotgamepad
  ; IDL program to construct a diagram of the conversion from
  ; 6502 audio signals to JavaScript 44100Hz AudioWorklet signals.
  compile_opt idl2
  x = rebin((findgen(201) - 100) / 100, 201, 201)
  y = transpose(x)
  dist = sqrt(x ^ 2 + y ^ 2)
  z = (abs(x) > abs(y)) / dist
  z[where(dist eq 0)] = 1
  !null = surface(1. / z, x, y)
  ; p.save, 'plotaudio.png', resolution=300, margin=20
end