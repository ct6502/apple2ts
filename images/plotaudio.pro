; IDL program to construct a diagram of the conversion from
; 6502 audio signals to JavaScript 44100Hz AudioWorklet signals.

function plotaudioOld
  compile_opt idl2
  n = 546 * 4.5
  t = findgen(n)
  y6502 = 2 * ((lindgen(n) mod (546 * 2)) ge 546) - 1
  c = 'lime green'
  w = window(dim = [1300, 800], loc=[100, 50], background_color='black')
  p = plot(t, y6502, /current, $
    fill_color='green', /fill_background, fill_level=0, fill_transparency=50, $
    color=c, $
    layout=[1, 2, 1], $
    axis_style = 4, $
    margin = [0.05, 0.35, 0.05, 0.02], $
    xtitle = 'Time (us)', yrange = [-1.5, 1.5], thick = 4)
  for i = 0, 3 do begin
    t1 = text(546 + i * 546, 1.1, `${546*i}`, /data, color=c, alignment = 0.5, $
      font_size = 14, font_style='bold')
  endfor
  t1 = text(546 * [1.5, 2.5],[-0.5, 0.25], $
    ['+1','-1'], /data, $
    target=p, color=c, font_size=24, font_style='Bold', alignment=0.5, clip=0)
  y = 0.1 * [-1, -1, 1, 1] - 1.25
  sampling = 44100/1.020484e6
  p1 = polygon(546 + [0, 47, 47, 0] / sampling, y, $
    color=c, thick=2, fill_color = [0, 0, 0], /data)
  for i = 0, 46 do begin
    p1 = polyline(546 + [i, i] / sampling, [min(y), max(y)], /data, clip = 0, $
      color=c, thick=2)
  endfor
  l = ['1 MHz 6502: 2$\times$546 cycles', $
    '44100 Hz JS: 2$\times$23.6 cycles']
  for i = 0, 1 do begin
    t1 = text(546 * 2, -1.8 - i * 0.35, l[i], /data, color=c, font_style='bold', $
      font_size = 14, clip = 0, alignment = 0.5, vertical_alignment = 1)
  endfor
  t1 = text(450, 1.1, '6502 Cycles', /data, color=c, font_style='bold', $
    font_size = 14, clip = 0, alignment = 1)
  t1 = text(490, -1.35, '44100 Hz Samples', /data, color=c, font_style='bold', $
    font_size = 14, clip = 0, alignment = 1)
  t1 = text(730, -2.05, '934 Hz beep {', /data, color=c, font_style='bold', $
    font_size = 24, clip = 0, alignment = 1, vertical_alignment = 0.5)
  p1 = polyline([min(t), max(t)], [0, 0], /data, color=c, linestyle = 2)
  return, p
end

function plotaudioNew
  compile_opt idl2
  c = 'lime green'
  sampling = 44100/1.020484e6
  n = 2800
  t = findgen(n) / 10
  y6502 = fltarr(n)
  f = n / 40.0
;  [95, 108, 111, 243]
  y6502[0:950] = 1
  y6502[951:1080] = -1
  y6502[1081:1120] = 1
  y6502[1121:2430] = -1
  y6502[2431:*] = 1
  p = plot(t, y6502, dim = [1300, 800], loc=[100, 50], current=1, $
    fill_color='green', /fill_background, fill_level=0, fill_transparency=50, $
    xrange=[80,280], color=c, $
    layout=[1, 2, 2], axis_style = 4, $
    margin = [0.05, 0.25, 0.05, 0.12], $
    xtitle = 'Time (us)', yrange = [-1.5, 1.5], thick = 4)
  xaxis = AXIS('X', LOCATION=1, target=p, color=c, TICKDIR=0, textpos=1, $
    TITLE='6502 Cycles', TICKINTERVAL=20, TICKFONT_SIZE=14, TICKFONT_STYLE='Bold', $
    MINOR=1, thick=1)
  xaxis = AXIS('X', LOCATION=-1, target=p, color=c, tickdir=1, $
    coord_transform=[0, sampling], $
    TITLE='44100 Hz Samples', TICKINTERVAL=1, TICKFONT_SIZE=14, TICKFONT_STYLE='Bold', $
    MINOR=0, thick=1)
  t1 = text([3.6,4.5,5.5,6.5,7.5,8.5,9.5,10.5,11.5] / sampling,-2.2+fltarr(9), $
    ['+1','+0.27','-1','-1','-1','-1','-1','+0.5','+1'], /data, $
    target=p, color=c, font_size=24, font_style='Bold', alignment=0.5, clip=0)
  y = 0.1 * [-1, -1, 1, 1] - 1.25
  p1 = polyline([min(t), max(t)], [0, 0], /data, target=p, linestyle = 2, color=c)
end

pro plotaudio
  p = plotaudioOld()
  !null = plotaudioNew()
  dir = file_dirname(routine_filepath('plotaudio'), /mark)
  p.save, dir + 'plotaudio.png', resolution = 300, margin = 20
end
