export const extraHelpText = `

<b>Disk images:</b> hdv, 2mg, dsk, woz, po, do, bin, bas

<b>Optional URL Parameters</b>
address=1234 (hex load address for binary files)
basic=<a href="https://www.urlencoder.org" target="_blank" rel="noopener noreferrer">urlencoded BASIC program</a>
capslock=off
color=color|nofringe|green|amber|white
debug=on
sound=off
speed=fast|warp
theme=dark
ramdisk=64|512|1024|4096|8192
#urltodiskimage

<b>Examples</b>
<a href="https://apple2ts.com/?debug=on#Replay" target="_blank">Total Replay with debugging</a>
<a href="https://apple2ts.com/?color=white&speed=fast#https://a2desktop.s3.amazonaws.com/A2DeskTop-1.4-en_800k.2mg" target="_blank">A2Desktop 2MG with fast speed and white color</a>
<a href="https://apple2ts.com/?color=green&basic=10%3F%22Welcome%20to%20Apple2TS%21%22%3AGOTO10" target="_blank">Embedded Applesoft BASIC Program</a>
<a href="https://apple2ts.com/?address=07FD#https://github.com/ct6502/apple2ts/raw/refs/heads/main/public/disks/snoggle_0x7FD.bin" target="_blank">Binary File with Hex Address</a>
`
