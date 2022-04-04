;pro plotaudio
; IDL program to construct a diagram of the conversion from
; 6502 audio signals to JavaScript 44100Hz AudioWorklet signals.

  y6502 = 2*((lindgen(1000) mod 300) ge 150) - 1
  t = findgen(1000)
  p = Plot(t, y6502, dim=[1300,400], axis_style=4, $
    margin=[0.05, 0.35, 0.05, 0.02], $
    xtitle='Time (us)', yrange=[-1.5,1.5], thick=3)
  y = 0.1 * [-1,-1,1,1] - 1.25
  p1 = polygon([0,128,128,0] * (300./47) + 25, y, $
    fill_color=[200,200,200], /data)
  for i=1, 127 do begin
    p1 = polyline([i,i] * (300./47) + 25, [min(y), max(y)], /data, clip=0)
  endfor
  t1 = text(800, -1.5, '128 samples', /data, clip=0, $
    alignment=0.5, vertical_alignment=0.5, $
    font_size=14, font_style='italic')
  l = ['1 MHz 6502: 2$\times$546 cycles', $
    '44100 Hz JS: 2$\times$23.6 cycles']
  for i=0,1 do begin
    t1 = text(300, -1.8 - i*0.35, l[i], /data, $
      font_size=16, clip=0, alignment=0.5, vertical_alignment=1)
  endfor
  t1 = text(170, -2.05, '934 Hz beep {', /data, $
    font_size=24, clip=0, alignment=1, vertical_alignment=0.5)
  p1 = polyline([min(t), max(t)], [0, 0], /data, linestyle=2)
  p1 = polyline([150, 450], -1.6*[1, 1], /data, clip=0, thick=2)
  y = [-1.45, -1.75]
  p1 = polyline([150, 150], y, /data, clip=0, thick=2)
  p1 = polyline([450, 450], y, /data, clip=0, thick=2)
  for i=0, 5 do begin
    t1 = text(150 + i*150, 1.1, '$C030', /data, alignment=0.5, font_size=14)
  endfor
  p.save, 'plotaudio.png', resolution=300, margin=20

end
