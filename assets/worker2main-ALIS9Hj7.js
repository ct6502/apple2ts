(function(){"use strict";const di=".2mg,.hdv,.po,.2meg";var _=(A=>(A[A.IDLE=0]="IDLE",A[A.RUNNING=-1]="RUNNING",A[A.PAUSED=-2]="PAUSED",A[A.NEED_BOOT=-3]="NEED_BOOT",A[A.NEED_RESET=-4]="NEED_RESET",A))(_||{}),cA=(A=>(A[A.MACHINE_STATE=0]="MACHINE_STATE",A[A.CLICK=1]="CLICK",A[A.DRIVE_PROPS=2]="DRIVE_PROPS",A[A.DRIVE_SOUND=3]="DRIVE_SOUND",A[A.GET_MEMORY_RESPONSE=4]="GET_MEMORY_RESPONSE",A[A.SAVE_STATE=5]="SAVE_STATE",A[A.RUMBLE=6]="RUMBLE",A[A.HELP_TEXT=7]="HELP_TEXT",A[A.SHOW_APPLE_MOUSE=8]="SHOW_APPLE_MOUSE",A[A.MBOARD_SOUND=9]="MBOARD_SOUND",A[A.COMM_DATA=10]="COMM_DATA",A[A.MIDI_DATA=11]="MIDI_DATA",A[A.ENHANCED_MIDI=12]="ENHANCED_MIDI",A[A.REQUEST_THUMBNAIL=13]="REQUEST_THUMBNAIL",A[A.SOFTSWITCH_DESCRIPTIONS=14]="SOFTSWITCH_DESCRIPTIONS",A[A.INSTRUCTIONS=15]="INSTRUCTIONS",A[A.SERIAL_CONFIG_CHANGE=16]="SERIAL_CONFIG_CHANGE",A))(cA||{}),M=(A=>(A[A.APPLE_PRESS=0]="APPLE_PRESS",A[A.APPLE_RELEASE=1]="APPLE_RELEASE",A[A.APP_MODE=2]="APP_MODE",A[A.BASIC_STEP=3]="BASIC_STEP",A[A.BREAKPOINTS=4]="BREAKPOINTS",A[A.COMM_DATA=5]="COMM_DATA",A[A.DEBUG=6]="DEBUG",A[A.DRIVE_NEW_DATA=7]="DRIVE_NEW_DATA",A[A.DRIVE_PROPS=8]="DRIVE_PROPS",A[A.EXECUTE_BASIC_COMMAND=9]="EXECUTE_BASIC_COMMAND",A[A.GAMEPAD=10]="GAMEPAD",A[A.GET_MEMORY=11]="GET_MEMORY",A[A.GET_SAVE_STATE=12]="GET_SAVE_STATE",A[A.GET_SAVE_STATE_SNAPSHOTS=13]="GET_SAVE_STATE_SNAPSHOTS",A[A.KEYPRESS=14]="KEYPRESS",A[A.KEYRELEASE=15]="KEYRELEASE",A[A.MACHINE_NAME=16]="MACHINE_NAME",A[A.MIDI_DATA=17]="MIDI_DATA",A[A.MOUSEEVENT=18]="MOUSEEVENT",A[A.PASTE_TEXT=19]="PASTE_TEXT",A[A.RAMWORKS=20]="RAMWORKS",A[A.RESTORE_STATE=21]="RESTORE_STATE",A[A.REVERSE_YAXIS=22]="REVERSE_YAXIS",A[A.RUN_MODE=23]="RUN_MODE",A[A.SET_BINARY_BLOCK=24]="SET_BINARY_BLOCK",A[A.SET_CYCLECOUNT=25]="SET_CYCLECOUNT",A[A.SET_MEMORY=26]="SET_MEMORY",A[A.SHOW_DEBUG_TAB=27]="SHOW_DEBUG_TAB",A[A.SIRIUS_JOYPORT=28]="SIRIUS_JOYPORT",A[A.SOFTSWITCHES=29]="SOFTSWITCHES",A[A.SPEED=30]="SPEED",A[A.STATE6502=31]="STATE6502",A[A.STEP_INTO=32]="STEP_INTO",A[A.STEP_OUT=33]="STEP_OUT",A[A.STEP_OVER=34]="STEP_OVER",A[A.THUMBNAIL_IMAGE=35]="THUMBNAIL_IMAGE",A[A.TIME_TRAVEL_INDEX=36]="TIME_TRAVEL_INDEX",A[A.TIME_TRAVEL_SNAPSHOT=37]="TIME_TRAVEL_SNAPSHOT",A[A.TIME_TRAVEL_STEP=38]="TIME_TRAVEL_STEP",A[A.TRACING=39]="TRACING",A[A.TRACE_SETTINGS=40]="TRACE_SETTINGS",A))(M||{}),fe=(A=>(A[A.MOTOR_OFF=0]="MOTOR_OFF",A[A.MOTOR_ON=1]="MOTOR_ON",A[A.TRACK_END=2]="TRACK_END",A[A.TRACK_SEEK=3]="TRACK_SEEK",A))(fe||{}),n=(A=>(A[A.IMPLIED=0]="IMPLIED",A[A.IMM=1]="IMM",A[A.ZP_REL=2]="ZP_REL",A[A.ZP_X=3]="ZP_X",A[A.ZP_Y=4]="ZP_Y",A[A.ABS=5]="ABS",A[A.ABS_X=6]="ABS_X",A[A.ABS_Y=7]="ABS_Y",A[A.IND_X=8]="IND_X",A[A.IND_Y=9]="IND_Y",A[A.IND=10]="IND",A))(n||{});const wi=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),Dt=A=>A.startsWith("B")&&A!=="BIT"&&A!=="BRK",W=(A,e=2)=>(A>255&&(e=4),("0000"+A.toString(16).toUpperCase()).slice(-e));new Uint8Array(256).fill(0);const je=A=>A.split("").map(e=>e.charCodeAt(0)),yi=A=>[A&255,A>>>8&255],ns=A=>[A&255,A>>>8&255,A>>>16&255,A>>>24&255],Ri=(A,e)=>{const t=A.lastIndexOf(".")+1;return A.substring(0,t)+e},br=new Uint32Array(256).fill(0),Pi=()=>{let A;for(let e=0;e<256;e++){A=e;for(let t=0;t<8;t++)A=A&1?3988292384^A>>>1:A>>>1;br[e]=A}},Qi=(A,e=0)=>{br[255]===0&&Pi();let t=-1;for(let s=e;s<A.length;s++)t=t>>>8^br[(t^A[s])&255];return(t^-1)>>>0},bi=(A,e)=>A+40*Math.trunc(e/64)+1024*(e%8)+128*(Math.trunc(e/8)&7),is=A=>{const e=A.toLowerCase();return di.split(",").some(s=>e.endsWith(s))};let as=!1;const Mr=()=>as,Lr=A=>{as=A};let Fr=!1,qr=!1,Ur=!1,Kr=!1,Or=!1,Yr=!1,Wr=!1,Nr=!1,Gr=!1,_r=!1;const Mi=A=>{const e=S.AN0.isSet,t=S.AN1.isSet;let s=!1;switch(A){case S.PB0.isSetAddr:S.PB0.isSet=!e&&Fr||e&&qr,s=S.PB0.isSet;break;case S.PB1.isSetAddr:S.PB1.isSet=!e&&t&&Or||e&&t&&Yr||!e&&!t&&Wr||e&&!t&&Nr,s=S.PB1.isSet;break;case S.PB2.isSetAddr:S.PB2.isSet=!e&&t&&Ur||e&&t&&Kr||!e&&!t&&Gr||e&&!t&&_r,s=S.PB2.isSet;break}Z(A,s?0:128)},Li=(A,e,t)=>{let s=!t;switch(e||(s=!0,t=!0),A){case-1:s&&(Fr=!1,Ur=!1,Or=!1,Wr=!1,Gr=!1),t&&(qr=!1,Kr=!1,Yr=!1,Nr=!1,_r=!1);break;case 0:s&&(Fr=!0),t&&(qr=!0);break;case 1:break;case 12:s&&(Or=!0),t&&(Yr=!0);break;case 13:s&&(Ur=!0),t&&(Kr=!0);break;case 14:s&&(Wr=!0),t&&(Nr=!0);break;case 15:s&&(Gr=!0),t&&(_r=!0);break}};let FA;const Ee=Math.trunc(.00278*1020484);let Xr=Ee/2,Zr=Ee/2,xr=Ee/2,Vr=Ee/2,cs=0,ls=!1,us=!1,Jr=!1,jr=!1,Is=!1,hs=!1,gs=!1,Hr=!1;const He=()=>{Jr=!0},vr=()=>{jr=!0},kt=(A,e=!1)=>(A=Math.min(Math.max(A,-1),1),e&&Hr&&(A=-A),(A+1)*Ee/2),Ae=(A,e)=>{switch(A){case 0:Xr=kt(e);break;case 1:Zr=kt(e,!0);break;case 2:xr=kt(e);break;case 3:Vr=kt(e);break}},zr=()=>{hs=ls||Jr,gs=us||jr,S.PB0.isSet=hs,S.PB1.isSet=gs,S.PB2.isSet=Is},ps=(A,e)=>{e?ls=A:us=A,zr()},Fi=A=>{Hr=A},qi=A=>{Z(49252,128),Z(49253,128),Z(49254,128),Z(49255,128),cs=A},Tt=(A,e)=>{const t=A-cs;Z(49252,t<Xr?e|128:e&127),Z(49253,t<Zr?e|128:e&127),Z(49254,t<xr?e|128:e&127),Z(49255,t<Vr?e|128:e&127)},$r=(A,e)=>{if(Mr())Mi(A);else{let t=!1;switch(A){case S.PB0.isSetAddr:t=S.PB0.isSet;break;case S.PB1.isSetAddr:t=S.PB1.isSet;break;case S.PB2.isSetAddr:t=S.PB2.isSet;break}Z(A,t?e|128:e&127)}};let Be,dt,Cs=!1;const Ui=A=>{FA=A,Cs=!FA.length||!FA[0].buttons.length,Be=Ia(),Be.gamepad?dt=Be.gamepad:dt=Mr()?Li:la},Ss=A=>A>-.01&&A<.01,Ki=(A,e)=>{Ss(A)&&(A=0),Ss(e)&&(e=0);const t=Math.sqrt(A*A+e*e),s=.95*(t===0?1:Math.max(Math.abs(A),Math.abs(e))/t);return A=Math.min(Math.max(-s,A),s),e=Math.min(Math.max(-s,e),s),A=(A+s)/(2*s),e=(e+s)/(2*s),[A,e]},fs=(A,e)=>([A,e]=Ki(A,e),A=Math.trunc(Ee*A),e=Math.trunc(Ee*e),[A,e]),Oi=A=>{Hr&&(A=A.map((h,l)=>l%2===1?-h:h));const[e,t]=fs(A[0],A[1]),s=A.length>=6?A[5]:A[3],[i,I]=A.length>=4?fs(A[2],s):[0,0];return[e,t,i,I]},Es=A=>{const e=Be.joystick?Be.joystick(FA[A].axes,Cs):FA[A].axes,t=Oi(e);A===0?(Xr=t[0],Zr=t[1]):(xr=t[0],Vr=t[1]);const s=FA[A].buttons;e.length>=10&&e[9]!==0&&e[9]<2&&(e[9]<-.4&&e[9]>-.5?s[15]=!0:e[9]>.7&&e[9]<.8?s[14]=!0:e[9]>.1&&e[9]<.2?s[13]=!0:e[9]<-.95&&(s[12]=!0)),dt(-1,FA.length>1,A===1),s.forEach((i,I)=>{i&&dt(I,FA.length>1,A===1)}),Be.rumble&&Be.rumble(),zr()},Yi=()=>{Jr=!1,jr=!1,Is=!1,FA&&FA.length>0&&(Es(0),FA.length>1&&Es(1))},Wi=A=>{switch(A){case 0:U("JL");break;case 1:U("G",200);break;case 2:X("M"),U("O");break;case 3:U("L");break;case 4:U("F");break;case 5:X("P"),U("T");break;case 6:break;case 7:break;case 8:U("Z");break;case 9:{const e=Bo();e.includes("'N'")?X("N"):e.includes("'S'")?X("S"):e.includes("NUMERIC KEY")?X("1"):X("N");break}case 10:break;case 11:break;case 12:U("L");break;case 13:U("M");break;case 14:U("A");break;case 15:U("D");break;case-1:return}};let me=0,De=0,ke=!1;const wt=.5,Ni={address:24835,data:[173,198,9],keymap:{},joystick:A=>A[0]<-wt?(De=0,me===0||me>2?(me=0,X("A")):me===1&&ke?U("W"):me===2&&ke&&U("R"),me++,ke=!1,A):A[0]>wt?(me=0,De===0||De>2?(De=0,X("D")):De===1&&ke?U("W"):De===2&&ke&&U("R"),De++,ke=!1,A):A[1]<-wt?(U("C"),A):A[1]>wt?(U("S"),A):(ke=!0,A),gamepad:Wi,rumble:null,setup:null,helptext:`AZTEC
Paul Stephenson, Datamost 1982

W: walk
R: run
J (A button): jump
S (Thumb down): stop
C (Thumb up): climb
A (Thumb left): turn left
D (Thumb right): turn right
G (B button): crawl (G to move)
P (RB button): place and light explosive
T (RB button): take item
O (X button): opens box or dig in trash
L (Y button): look in box
Z: inventory

F (LB button): goes to fight mode:
   S (Thumb down): spin around
   A (Dpad left): move one to left
   D (Dpad right): move one to right
   L: lunge with machete
   M (Dpad down): strike down with machete
   G (B button): draw gun
   L (A button): shoot gun

Thumbwheel
              Climb
  Walk/run left   Walk/run right
            Stop/spin

D-pad
        Lunge/shoot
  Move left    Move right
        Strike down

A:  jump/lunge/shoot
B:  crawl/switch to gun
X:  open box/dig in trash
Y:  look in box
RB: place explosive (crawling) or take item (box/trash)
LB: fight mode
Select: inventory
Start:  start the game
`},Gi={address:25200,data:[141,16,192],keymap:{A:"J",S:"K",D:"L",W:"I","\b":"U","":"O"},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Championship Lode Runner by Doug Smith
(c) 1984 Brøderbund Software
_____________________________________________
Joystick (Ctrl+J):   move
Button 0:   dig left
Button 1:   dig right

Keyboard (Ctrl+K):
   W
A     D
   S
Left arrow    dig left
Right arrow   dig right

Keyboard original controls:
   I
J     L
   K
U       dig left
O       dig right
ESC     pause game
_____________________________________________
Other Controls:
Ctrl+A        abort man
Ctrl+J        joystick mode
Ctrl+K        keyboard mode
Ctrl+R        reset game
Ctrl+S        toggle sound
Ctrl+X        flip joystick x-axis
Ctrl+Y        flip joystick y-axis
`},_i={address:24583,data:[173,0,192],keymap:{"\v":"A","\n":"Z"},joystick:null,gamepad:A=>{switch(A){case 0:X(" ");break;case 12:X("A");break;case 13:X("Z");break;case 14:X("\b");break;case 15:X("");break;case-1:return}},rumble:null,setup:null,helptext:`Drol
Benny Aik Beng Ngo, Brøderbund 1983

KEYBOARD:
Arrow keys for left/right
Arrow keys or A/Z for up/down
Spacebar: Fire

GAMEPAD:
D-pad: Up/Down/Left/Right
A button: Fire
`},Xi={address:17706,data:[173,0,192],keymap:{"\b":"A","":"D","\v":"W","\n":"X",P:"\r",M:" "},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
Silas Warner, Muse Software, 1982

KEYBOARD
W ↑    up
X ↓    down
A ←    left
D →    right
S      stop

P or Return   pick up gas can
M or Space    drop gas can

JOYSTICK
Button 0: drop gas can
Button 1: pick up gas can
`},Zi={address:1037,data:[201,206,202,213,210],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{es("APPLE2EU",!1)},helptext:`Injured Engine
(c) 1984 Imagic, Inc.
Concept: Dave Johnson
Program: Tom McWilliams
Graphics: Karen Elliott
Tech Support: Dave Boisvert

Keyboard Controls:
T         Select, look at text
I         Inspect part(s)
R         Repair/replace part(s)
P         Price list
E, <ESC>  Main screen
A, S      Scroll text back
Z, X      Scroll text forward
Y         Yes
N         No
O         Open throttle
C         Close throttle`};let Ao=14,eo=14;const xi={address:28268,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:null,gamepad:null,rumble:()=>{let A=B(182,!1);Ao<40&&A<Ao&&Pr({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),Ao=A,A=B(183,!1),eo<40&&A<eo&&Pr({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),eo=A},setup:null,helptext:`KARATEKA
Jordan Mechner, Brøderbund 1984
Press K for Keyboard control
Press J for Joystick control

KEYBOARD
Fighting stance:
Q A Z     punch high, middle, low
W S X     kick high, middle, low
M . →     advance
N , ←     retreat
Space     stand up

Standing up:
B         bow
M . →     run forward
N , ←     stop
Space     fighting stance

JOYSTICK
Push the joystick up to stand up, and release it to get into a fighting stance.

Fighting stance:
Button 1: punch
Button 0: kick
Move the joystick up and down to control the height of your punches  and kicks. Move it right to advance and left to retreat.

To run forward, start from a standing position. Then move the joystick to the upper right. Press button 1 to bow.
`},Vi={address:25078,data:[141,16,192],keymap:{A:"J",S:"K",D:"L",W:"I","\b":"U","":"O"},gamepad:null,joystick:null,rumble:null,setup:()=>{T(46793,234),T(46794,234)},helptext:`Lode Runner by Doug Smith
(c) 1983 Brøderbund Software
_____________________________________________
Joystick (Ctrl+J):   move
Button 0:   dig left
Button 1:   dig right

Keyboard (Ctrl+K):
   W
A     D
   S
Left arrow    dig left
Right arrow   dig right

Keyboard original controls:
   I
J     L
   K
U       dig left
O       dig right
ESC     pause game
_____________________________________________
Other Controls:
Ctrl+A        abort man
Ctrl+J        joystick mode
Ctrl+K        keyboard mode
Ctrl+R        reset game
Ctrl+S        toggle sound
Ctrl+X        flip joystick x-axis
Ctrl+Y        flip joystick y-axis
Ctrl+Shift+6  next level (no high score)
Ctrl+Shift+2  add life (no high score)
_____________________________________________
Editor:
From demo mode, press Ctrl+E
E        edit
P        play
I        initialize
C        clear level
M        move (copy level)
S        clear high scores
I/J/K/M  move cursor
0-9      make shapes
Ctrl+S   save level
Ctrl+Q   quit editor
`},Ji=A=>{switch(A){case 0:U("A");break;case 1:U("C",50);break;case 2:U("O");break;case 3:U("T");break;case 4:U("\x1B");break;case 5:U("\r");break;case 6:break;case 7:break;case 8:X("N"),U("'");break;case 9:X("Y"),U("1");break;case 10:break;case 11:break;case 12:break;case 13:U(" ");break;case 14:break;case 15:U("	");break;case-1:return}},ee=.5,ji={address:768,data:[141,74,3,132],keymap:{},gamepad:Ji,joystick:(A,e)=>{if(e)return A;const t=A[0]<-ee?"\b":A[0]>ee?"":"",s=A[1]<-ee?"\v":A[1]>ee?`
`:"";let i=t+s;return i||(i=A[2]<-ee?"L\b":A[2]>ee?"L":"",i||(i=A[3]<-ee?"L\v":A[3]>ee?`L
`:"")),i&&U(i,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert
6502 Workshop, 2021
_____________________________________________
Arrows (Left thumb)  movement
A (A button)         attack
C (B button)         cast spell
O (X button)         open or operate object
T (Y button)         talk
L (Right thumb)      look
SPACE (Dpad down)    pass turn
RETURN (RB button)   ready item
TAB  (Dpad right)    inventory
ESC  (LB button)     flee from battle

_____ ADVENTURING _____
B  board transport or mount
D  dig (ruins only)
G  get current location
H  hide and camp
I  ignite torch
J  jump with your horse
N  new character order
Q  quick save game
S  search
W  wait for a number of hours
X  exit transport or mount
Y  yell, go fast on horse/mount
/  quest log
V  volume/sound toggle
=  toggle character icon

_____ COMBAT _____
F  fire cannon (ships only)
SHIFT+8   toggle combat math
+/−  fast/slow scroll speed
8    pause text scroll

_____ INVENTORY & SHOPPING _____
TAB     switch to next menu (or press 1-7)
ARROWS  scroll through items or pages
SPACE   next character
RETURN  ready/unready item
I/U/D   Info/Use/Discard item
B/S  switch to buy/sell (shop)
RETURN buy or sell item (shop)
ESC    exit inventory/shop

_____ NPC DIALOG _____
Keywords NAME, JOB, JOIN
TAB  toggle voice mode
ESC  exit conversation`},Hi={address:41642,data:[67,82,79],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Julius Erving and Larry Bird Go One-on-One
Electronic Arts, Eric Hammond, 1983

To Leave Demo: Press the joystick button or the space bar.

To Choose Game Options:
1. Move the joystick up and down (or press SPACE) to move the highlight from option group to option group; press RETURN to enter the highlighted group.

2. Move the joystick right and left (or press SPACE) to move from option to option within a group after that group has been entered; press RETURN to select the highlighted option.

To Return to the Options Screen: Press CtrlR. (This command should also be used to recover if the program ever begins to behave erratically.)

T       Time Out
Ctrl+S  Turn Sound On/Off
!       Turn Slow Motion On/Off
ESC     Pause game; pressing ESC repeatedly single steps the action, any key restarts.

PLAYING DEFENSE FROM THE KEYBOARD
A     Move Up
Z     Move Down
←     Move Left
→     Move Right
SPACE Go For the Steal or the Block
Other keys (except T or ESC): Stop Moving

To change these, select CHANGE KEYBOARD and enter new choices.

Note: When defense is played from the keyboard, play will freeze after every turnover (whether caused by a score, a steal or a defensive rebound). To resume play after the offensive and defensive players have traded joystick and keyboard, press any key.
`},vi={address:55645,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Prince of Persia
Jordan Mechner, Brøderbund 1989

Running, jumping, climbing:
Run: move joystick in desired direction, release to stop
Take careful steps: hold button while moving the joystick
Jump/climb up: move joystick up
Jump forward: move joystick up diagonally
Running jump: run, then move joystick up diagonally
Hang from ledge: hold button, to drop release button, to pull up onto ledge, move joystick up
Climb down: step to edge, turn around, move joystick down
If you fall within reach of a ledge, grab onto it by pressing a button
Duck: move joystick down, release to stand up
Pick up object: stand in front of object, press button

Fighting:
Release joystick, you will automatically draw your sword
Strike: press button
Advance/retreat: move joystick
Block a strike: move joystick up as opponent strikes
Stop fighting: move joystick down, press button to draw sword again

ESC: Freeze frame, single frame advance
Ctrl+J: joystick control
Ctrl+K: keyboard control
Ctrl+R: ends game
Ctrl+A: restart level
Ctrl+S: sound on/off
Ctrl+N: music on/off
Ctrl+G: save game
Ctrl+L: load game (during title screen)
Ctrl+X: flip vertical joystick axis
Ctrl+Y: flip horizontal joystick axis
Space:  see remaining time

KEYBOARD
Movement:
U I O
J K L
Button: Option/Alt key
`},zi={address:30110,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`The Print Shop

Total Reprint is a port of The Print Shop Color (1986) to ProDOS. Some notable features:

* All Broderbund graphic libraries
* Additional openly licensed 3rd party graphics and fonts
* Unified UI for selecting 3rd party graphics and borders
* All libraries available from hard drive (no swapping floppies!)

Total Reprint is © 2025 by 4am and licensed under the MIT open source license.
All original code is available on <a href="https://github.com/a2-4am/4print" target="_blank" rel="noopener noreferrer">GitHub</a>.

Program and graphic libraries are © their respective authors.`},$i={address:16962,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:()=>{B(14799,!1)===255&&Pr({startDelay:0,duration:1e3,weakMagnitude:1,strongMagnitude:0})},setup:()=>{T(3178,99)},helptext:`Robotron: 2084
(c) 1982 Williams Electronics, Inc.
(c) 1983 Atari, Inc.
Written by Steve Hays

This "Robotron4Joy" patch by Nick Westgate

Press <Space> to start game
1) One joystick
2) Gamepad with two joysticks

ESC       Pause (Space to resume)
Ctrl+Q    Quit current game
Ctrl+R+## Jump to level ##
Ctrl+S    Turn Sound On/Off`},Bs=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,Aa=A=>{switch(A){case 1:T(109,255);break;case 12:X("A");break;case 13:X("Z");break;case 14:X("\b");break;case 15:X("");break}},yt=.75,ea=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{T(25025,173),T(25036,64)},helptext:Bs},{address:7291,data:[173,0,192],keymap:{N:"\b",M:"",",":"\b",".":""},joystick:A=>{const e=A[0]<-yt?"\b":A[0]>yt?"":A[1]<-yt?"A":A[1]>yt?"Z":"";return e&&X(e),A},gamepad:Aa,rumble:null,setup:null,helptext:Bs}],ta={address:514,data:[85,76,84,73,77,65,53],keymap:{},gamepad:null,joystick:null,rumble:null,setup:()=>{ui(1)},helptext:`Ultima V: Warriors of Destiny
by Lord British
(c) 1987 Origin Systems
_____________________________________________
Arrows    movement
A         attack
B         board transport or mount
C         cast spell
E         enter towne, castle, or structure
F         fire cannon
G         get gold, food, or items
H         hole up and camp
I         ignite torch
J         jimmy a lock
K         climb up or down
L         look
M         mix reagents
N         new character order
O         open door or chest
P         push object
Q         quit and save game
R         ready equipment
S         search
T         talk
U         use item
V         view area
X         exit transport or mount
Y         yell, go fast on ship
Z         display stats/attributes
1-6       set active character
0         clear active character
SPACE     pass turn
ESC       abort command, exit combat
Ctrl+S    toggle sound
Ctrl+T    toggle speed
Ctrl+V    set music volume 0-9
---
For MIDI Support:
1) Launch a WebMIDI supported player (such as https://signal.vercel.app/) in a separate tab, and leave it running.  Be sure to allow WebMIDI support. You may need to go into the Settings and enable "Inputs" from your system's WebMIDI driver.
2) In U5, Go to Activate Music -> Change Music Configuration, add Passport to slot 2, and hit enter. 
3) In the Midi Information screen, select Channel 1 (default), 16 voices, and then enter the numbers 1-15 for "Midi Number" in each song (where Ultima Theme is '1' and Rule Britannia is '15'). Then hit enter on each song to test.

`},ra={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
Andrew Greenberg and Robert Woodhead
Sir-Tech Software, 1981

____ Adventuring ____
W  forward
A  left
D  right
K  kick through a door
S  update status area
C  camp
T  combat message delay time (ms)
Q  quick plotting - see the LOMILWA spell
I  inspect for dead bodies

____ Combat ____
F  fight (# for group)
P  parry
S  cast spell
U  use an item
R  run!
D  dispell undead
`},ms=`<b>Castle Wolfenstein</b>
Silas Warner, Muse Software 1981

World War II is raging across Europe, and Castle Wolfenstein has been occupied by the Nazis and converted into their HQ. You have just been captured behind enemy lines and await interrogation and torture by the dreaded SS in the dungeons of Castle Wolfenstein. A dying cellmate bequeaths you your only hope - a gun and ten bullets.

Your Mission: Find the war plans and escape from Castle Wolfenstein ALIVE!

<a href="https://archive.org/details/muse-castle-wolfenstein-a2-ph/" target="_blank">Detailed instructions</a>

<b>KEYBOARD</b>
<b>Q W E</b>
<b>A S D</b>    Movement (<b>S</b> = Stop)
<b>Z X C</b>

<b>I O P</b>
<b>K L ;</b>    Aim gun (<b>L</b> = Fire)
<b>, . /</b>

<b>Space</b>  Search guards, unlock doors & chests
<b>T</b>      Throw grenade
<b>U</b>      Use contents of chest
<b>RETURN</b> Inventory

<b>JOYSTICK</b>
Left button (0):  Hold down and move joystick to aim, or press button to holster
Right button (1): Shoot
X button:  Search/unlock
Y button:  Use chest contents
RB button: Throw grenade
LB button: Inventory`,oa=A=>{switch(A){case 0:He();break;case 1:vr();break;case 2:U(" ");break;case 3:U("U");break;case 4:U("\r");break;case 5:U("T");break;case 9:{const e=Bo();e.includes("'N'")?X("N"):e.includes("'S'")?X("S"):e.includes("NUMERIC KEY")?X("1"):X("N");break}case 10:He();break}},sa=()=>{T(5128,0),T(5130,4);let A=5210;T(A,234),T(A+1,234),T(A+2,234),A=5224,T(A,234),T(A+1,234),T(A+2,234)},na=()=>{B(49178,!1)<128&&B(49181,!1)<128&&Pr({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},ia={address:3205,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:ms},aa={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:oa,rumble:na,setup:sa,helptext:ms},ca={address:2926,data:[169,0,133],keymap:{},joystick:null,gamepad:A=>{switch(A){case 0:He();break;case 1:vr();break;case 2:U(" ");break;case 3:U("U");break;case 4:U("\r");break;case 5:U(":");break;case 9:{const e=Bo();e.includes("'N'")?X("N"):e.includes("'S'")?X("S"):e.includes("NUMERIC KEY")?X("1"):X("N");break}case 10:He();break}},rumble:null,setup:null,helptext:`<b>Beyond Castle Wolfenstein</b>
Silas Warner, Muse Software 1981

<a href="https://archive.org/details/beyondcastlewolfensteinmusesoftware/" target="_blank">Detailed instructions</a>

Find the bomb, locate the private conference room, and leave the bomb, timed to detonate! Then return to the courtyard from which you entered the bunker. Good luck!

<b>KEYBOARD</b>
<b>Q W E</b>
<b>A S D</b>    Movement (<b>S</b> = Stop)
<b>Z X C</b>

<b>I O P</b>
<b>K L ;</b>    Aim gun (<b>L</b> = Fire)
<b>, . /</b>

<b>:</b>    Switch weapons (gun or dagger)
<b>B</b>    Bomb drop or pick up
<b>F</b>    Use first aid kit
<b>H</b>    Holster gun
<b>M</b>    Give money to bribe guard
<b>R</b>    Reset bomb
<b>U</b>    Use contents of open closet
<b>1-5</b>  Use pass
<b>Ctrl+T</b>  Use tool kit
<b>Ctrl+K</b>  Use key
<b>SPACE</b>   Search guards, unlock closets
<b>ESC</b>     Save game and exit
<b>RETURN</b>  Inventory

Open Closet: Aim gun and press SPACE
Unlock Closet: Aim gun then use number keys for 3-digit combo
Search Dead Guards: Stand over body and press SPACE
Drag Dead Guards: Stand next to body, aim gun at body and press SPACE

<b>JOYSTICK</b>
Left button (0):  Hold down and move joystick to aim, or press button to holster
Right button (1): Shoot
X button:  Search guards or open closet
Y button:  Use contents of open closet
RB button: Switch weapons
LB button: Inventory`},ve=new Array,lA=A=>{Array.isArray(A)?ve.push(...A):ve.push(A)};lA(Ni),lA(Gi),lA(_i),lA(Xi),lA(Zi),lA(xi),lA(Vi),lA(ji),lA(Hi),lA(vi),lA(zi),lA($i),lA(ea),lA(ta),lA(ra),lA(aa),lA(ia),lA(ca);const la=(A,e,t)=>{const s=!t;switch(A){case 0:s&&He();break;case 1:s&&vr();break;case 12:Ae(t?3:1,-1);break;case 13:Ae(t?3:1,1);break;case 14:Ae(t?2:0,-1);break;case 15:Ae(t?2:0,1);break}},ua={address:0,data:[],keymap:{},gamepad:null,joystick:A=>A,rumble:null,setup:null,helptext:""},Ds=A=>{for(const e of ve)if(ko(e.address,e.data))return A.toUpperCase()in e.keymap?e.keymap[A.toUpperCase()]:A;return A},Ia=()=>{for(const A of ve)if(ko(A.address,A.data))return A;return ua},to=(A=!1)=>{for(const e of ve)if(ko(e.address,e.data)){li(e.helptext?e.helptext:" "),e.setup&&e.setup();return}A&&(li(" "),ui(0))},ha=A=>{Z(49152,A|128,16),Z(49168,A&255|128,16)},ks=()=>{const A=pA(49152)&127;Z(49152,A,16)},ga=()=>{const A=pA(49152)&127;Z(49152,A,32)};let Te="",Ts=1e9,ds=0;const ro=()=>{const A=performance.now();if(Te!==""&&(pA(49152)<128||A-Ts>3800)){Ts=A;const e=Te.charCodeAt(0);ha(e),Te=Te.slice(1),Te.length===0&&A-ds>500&&(ds=A,ts(!0))}};let ws="";const X=A=>{A===ws&&Te.length>0||(ws=A,Te+=A)};let ys=0;const U=(A,e=300)=>{const t=performance.now();t-ys<e||(ys=t,X(A))},pa=A=>{let e=String.fromCharCode(A);e=Ds(e),X(e),ro()},Ca=A=>{A.length===1&&(A=Ds(A)),X(A)},qe=[],P=(A,e,t,s=!1,i=null)=>{const I={offAddr:A,onAddr:e,isSetAddr:t,writeOnly:s,isSet:!1,setFunc:i};return A>=49152&&(qe[A-49152]=I),e>=49152&&(qe[e-49152]=I),t>=49152&&(qe[t-49152]=I),I},DA=()=>Math.floor(180*Math.random()),Sa=()=>Math.floor(256*Math.random()),te=A=>{const e=pA(A&65527);Z(A,e&128|DA()&127)},Rs=(A,e)=>{A&=11,e?S.BSR_PREWRITE.isSet=!1:A&1?S.BSR_PREWRITE.isSet?S.BSR_WRITE.isSet=!0:S.BSR_PREWRITE.isSet=!0:(S.BSR_PREWRITE.isSet=!1,S.BSR_WRITE.isSet=!1),S.BSRBANK2.isSet=A<=3,S.BSRREADRAM.isSet=[0,3,8,11].includes(A)},S={STORE80:P(49152,49153,49176,!0),RAMRD:P(49154,49155,49171,!0),RAMWRT:P(49156,49157,49172,!0),INTCXROM:P(49158,49159,49173,!0),INTC8ROM:P(49194,0,0),ALTZP:P(49160,49161,49174,!0),SLOTC3ROM:P(49162,49163,49175,!0),COLUMN80:P(49164,49165,49183,!0),ALTCHARSET:P(49166,49167,49182,!0),KBRDSTROBE:P(49168,0,0,!1),BSRBANK2:P(0,0,49169),BSRREADRAM:P(0,0,49170),VBL:P(0,0,49177),CASSOUT:P(49184,0,0),SPEAKER:P(49200,0,0,!1,(A,e)=>{Z(49200,DA()),O0(e)}),GCSTROBE:P(49216,0,0),EMUBYTE:P(0,0,49231,!1,()=>{Z(49231,205)}),TEXT:P(49232,49233,49178),MIXED:P(49234,49235,49179),PAGE2:P(49236,49237,49180),HIRES:P(49238,49239,49181),AN0:P(49240,49241,0),AN1:P(49242,49243,0),AN2:P(49244,49245,0),DHIRES:P(49247,49246,0),CASSIN1:P(0,0,49248,!1,()=>{Z(49248,DA())}),PB0:P(0,0,49249,!1,A=>{$r(A,DA())}),PB1:P(0,0,49250,!1,A=>{$r(A,DA())}),PB2:P(0,0,49251,!1,A=>{$r(A,DA())}),JOYSTICK0:P(0,0,49252,!1,(A,e)=>{Tt(e,DA())}),JOYSTICK1:P(0,0,49253,!1,(A,e)=>{Tt(e,DA())}),JOYSTICK2:P(0,0,49254,!1,(A,e)=>{Tt(e,DA())}),JOYSTICK3:P(0,0,49255,!1,(A,e)=>{Tt(e,DA())}),CASSIN2:P(0,0,49256,!1,A=>{te(A)}),C069:P(0,0,49257,!1,A=>{te(A)}),FASTCHIP_LOCK:P(49258,0,0,!1,A=>{te(A)}),FASTCHIP_ENABLE:P(49259,0,0,!1,A=>{te(A)}),C06C:P(0,0,49260,!1,A=>{te(A)}),FASTCHIP_SPEED:P(49261,0,0,!1,A=>{te(A)}),C06E:P(0,0,49262,!1,A=>{te(A)}),C06F:P(0,0,49263,!1,A=>{te(A)}),JOYSTICKRESET:P(0,0,49264,!1,(A,e)=>{qi(e),Z(49264,DA())}),BANKSEL:P(49267,0,0),LASER128EX:P(49268,0,0),VIDEO7_160:P(49272,49273,0),VIDEO7_MONO:P(49274,49275,0),VIDEO7_MIXED:P(49276,49277,0),BSR_PREWRITE:P(49280,0,0),BSR_WRITE:P(49288,0,0)};S.TEXT.isSet=!0;let Ps=!0,Rt=0;const Qs=A=>{if(Ps!==A&&S.STORE80.isSet){if(A)switch(S.VIDEO7_160.isSet=!1,S.VIDEO7_MONO.isSet=!1,S.VIDEO7_MIXED.isSet=!1,Rt=Rt<<1&2,Rt|=S.COLUMN80.isSet?0:1,Rt){case 0:break;case 1:{S.VIDEO7_160.isSet=!0;break}case 2:{S.VIDEO7_MIXED.isSet=!0;break}case 3:{S.VIDEO7_MONO.isSet=!0;break}}Ps=A}},fa=[49152,49153,49165,49167,49168,49200,49236,49237,49183],Ea=(A,e)=>8192+1024*(A%8)+128*(Math.trunc(A/8)&7)+40*Math.trunc(A/64)+e,bs=(A,e,t)=>{if(A>1048575&&!fa.includes(A)){const i=pA(A)>128?1:0;console.log(`${t} $${W(c.PC)}: $${W(A)} [${i}] ${e?"write":""}`)}if(A<=49183&&Ha()==="APPLE2P"){!e&&A<=49167&&ro(),A===49168?ks():A!==49152&&Z(A,DA());return}if(A>=49280&&A<=49295){Rs(A&-5,e);return}const s=qe[A-49152];if(!s){console.error("Unknown softswitch "+W(A)),Z(A,DA());return}if(A<=49167?e||ro():(A===49168||A<=49183&&e)&&ks(),s.setFunc){(A===s.offAddr||A===s.onAddr)&&(s.isSet=A===s.onAddr),s.setFunc(A,t);return}if(A===S.DHIRES.offAddr?Qs(!0):A===S.DHIRES.onAddr&&Qs(!1),A===s.offAddr||A===s.onAddr){if((!s.writeOnly||e)&&(NA[s.offAddr-49152]!==void 0?NA[s.offAddr-49152]=A===s.onAddr:s.isSet=A===s.onAddr),s.isSetAddr){const i=pA(s.isSetAddr);Z(s.isSetAddr,s.isSet?i|128:i&127)}if(A>=49184){let i;if(A>=49232&&A<=49247){const I=t%17030-4550;if(I>=0){const h=Math.floor(I/65),l=t%65,m=Ea(h,l);i=B(m)}else i=Sa()}else i=DA();Z(A,i)}}else if(A===s.isSetAddr){const i=pA(A);Z(A,s.isSet?i|128:i&127)}},Ba=()=>{for(const A in S){const e=A;NA[S[e].offAddr-49152]!==void 0?NA[S[e].offAddr-49152]=!1:S[e].isSet=!1}NA[S.TEXT.offAddr-49152]!==void 0?NA[S.TEXT.offAddr-49152]=!0:S.TEXT.isSet=!0},NA=[],ma=A=>{if(A>=49280&&A<=49295){Rs(A&-5,!1);return}const e=qe[A-49152];if(!e){console.error("overrideSoftSwitch: Unknown softswitch "+W(A));return}NA[e.offAddr-49152]===void 0&&(NA[e.offAddr-49152]=e.isSet),e.isSet=A===e.onAddr},Da=()=>{NA.forEach((A,e)=>{A!==void 0&&(qe[e].isSet=A)}),NA.length=0},Ue=[],ka=()=>{if(Ue.length===0)for(const A in S){const e=S[A],t=e.onAddr>0,s=e.writeOnly?" (write)":"";if(e.offAddr>0){const i=W(e.offAddr)+" "+A;Ue[e.offAddr]=i+(t?"-OFF":"")+s}if(e.onAddr>0){const i=W(e.onAddr)+" "+A;Ue[e.onAddr]=i+"-ON"+s}if(e.isSetAddr>0){const i=W(e.isSetAddr)+" "+A;Ue[e.isSetAddr]=i+"-STATUS"+s}}return Ue[49152]="C000 KBRD/STORE80-OFF",Ue},Ta=()=>{for(const A in S){const t=S[A];if(t.isSetAddr){const s=pA(t.isSetAddr);Z(t.isSetAddr,t.isSet?s|128:s&127)}}},da=`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
LFj/cBg4kBi4UBIBgBEUFxpMFstMHMtMyslMIstIikiYSAiGNa3/z3ggWP+6aGho
aKjKmmiqjvgHmI17BooKCgoKqIz4BihMQMgIeI17BqUASKUBSCy0wK17BYUArfsF
hQGtewaiACyywDD7LLLAEPuBACy2wGiFAWiFAChgCHilAEilAUgstMCtewWFAK37
BYUBogAsssAw+yyywBD7oQCqLLbAaIUBaIUAKGAIeKUASKUBSCy0wKIArXsFhQCt
+wWFAakgLLLAMPssssAQ+4EArXsHyU+wE+57B+YA0OTmAaUBydCQ3KnI0NYstsBo
hQFohQAoYP///////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
oiCgAKIDhjyKCiQ88BAFPEn/KX6wCErQ+5idVgPI6BDlIFj/ur0AAQoKCgqFK6q9
jsC9jMC9isC9icCgUL2AwJgpAwoFK6q9gcCpViCo/IgQ64UmhT2FQakIhScYCL2M
wBD7SdXQ972MwBD7yarQ8+q9jMAQ+8mW8AkokN9JrfAl0NmgA4VAvYzAEPsqhTy9
jMAQ+yU8iNDsKMU90L6lQMVB0Liwt6BWhDy8jMAQ+1nWAqQ8iJkAA9DuhDy8jMAQ
+1nWAqQ8kSbI0O+8jMAQ+1nWAtCHoACiVsow+7EmXgADKl4AAyqRJsjQ7uYn5j2l
Pc0ACKYrkNtMAQgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAG/YZdf43JTZsdsw89jf4duP85jz5PHd8dTxJPIx8kDy
1/Ph8+j2/fZo92735vdX/CD3Jvd092zybvJy8nbyf/JO8mrZVfKF8qXyyvIX87vz
nvNh8kXaPdkR2cjZSNj0AyDZatnb2W3Y69mD58jYr9gS43rn1NqV2KTWadaf20jW
kOsj7K/rCgDe4hLUzd//4o3uru9B6Qnv6u/x7zrwnvBk59bmxeMH5+XmRuZa5obm
keZ5wOd5qed7gel7aOp9lu5QVN9GTt9/z+5/l95kZN9FTsRGT9JORVjUREFUwUlO
UFXUREXMREnNUkVBxEfSVEVY1FBSo0lOo0NBTMxQTE/USExJzlZMSc5IR1KySEfS
SENPTE9SvUhQTE/URFJB11hEUkHXSFRBwkhPTcVST1S9U0NBTEW9U0hMT0HEVFJB
Q8VOT1RSQUPFTk9STUHMSU5WRVJTxUZMQVPIQ09MT1K9UE/QVlRBwkhJTUVNukxP
TUVNuk9ORVLSUkVTVU3FUkVDQUzMU1RPUsVTUEVFRL1MRdRHT1TPUlXOScZSRVNU
T1LFpkdPU1XCUkVUVVLOUkXNU1RP0E/OV0FJ1ExPQcRTQVbFREXGUE9LxVBSSU7U
Q09O1ExJU9RDTEVB0kdF1E5F11RBQqhUz0bOU1BDqFRIRc5B1E5P1FNURdCrraqv
3kFOxE/Svr28U0fOSU7UQULTVVPSRlLFU0NSTqhQRMxQT9NTUdJSTsRMT8dFWNBD
T9NTSc5UQc5BVM5QRUXLTEXOU1RSpFZBzEFTw0NIUqRMRUZUpFJJR0hUpE1JRKQA
TkVYVCBXSVRIT1VUIEZP0lNZTlRB2FJFVFVSTiBXSVRIT1VUIEdPU1XCT1VUIE9G
IERBVMFJTExFR0FMIFFVQU5USVTZT1ZFUkZMT9dPVVQgT0YgTUVNT1LZVU5ERUYn
RCBTVEFURU1FTtRCQUQgU1VCU0NSSVDUUkVESU0nRCBBUlJB2URJVklTSU9OIEJZ
IFpFUs9JTExFR0FMIERJUkVD1FRZUEUgTUlTTUFUQ8hTVFJJTkcgVE9PIExPTsdG
T1JNVUxBIFRPTyBDT01QTEXYQ0FOJ1QgQ09OVElOVcVVTkRFRidEIEZVTkNUSU/O
IEVSUk9SBwAgSU4gAA1CUkVBSwcAuujo6Oi9AQHJgdAhpYbQCr0CAYWFvQMBhYbd
AwHQB6WF3QIB8AeKGGkSqtDYYCDj04VthG44pZblm4VeqKWX5Zyq6JjwI6WWOOVe
hZawA8aXOKWU5V6FlLAIxpWQBLGWkZSI0PmxlpGUxpfGlcrQ8mAKaTawNYVeuuRe
kC5gxHCQKNAExW+QIkiiCZhItZPKEPoghOSi92iVnegw+mioaMRwkAbQBcVvsAFg
ok0k2BADTOnyIPvaIFrbvWDSSCBc2+hoEPUgg9apUKDTIDrbpHbI8AMgGe0g+9qi
3SAu1Ya4hLlG2CCxAKrw7KL/hnaQBiBZ1UwF2KavhmmmsIZqIAzaIFnVhA8gGtaQ
RKABsZuFX6VphV6lnIVhpZuI8ZsYZWmFaYVgpWpp/4Vq5ZyqOKWb5WmosAPoxmEY
ZV6QA8ZfGLFekWDI0PnmX+ZhytDyrQAC8Dilc6R0hW+EcKVphZZlD4WUpGqEl5AB
yISVIJPTpVCkUY3+AYz/AaVtpG6FaYRqpA+5+wGIkZvQ+CBl1qVnpGiFXoRfGKAB
sV7QC6Vpha+laoWwTDzUoATIsV7Q+8iYZV6qoACRXqVfaQDIkV6GXoVfkNKigIYz
IGr94O+QAqLvqQCdAAKK8Au9/wEpf53/AcrQ9akAov+gAWAgDP0pf2CmuMqgBIQT
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
5opMi/4g+OaKTJX+IPjm4DCwE4bwqSwgwN4g+ObgMLAFhiyGLWBMmeEg7PHk8LAI
pfCFLIUthvCpxSDA3iD45uAwsOJgIOzxiqTwwCiw10wA+CAJ8oqkLMAosMqk8EwZ
+CAJ8oqowCiwvKXwTCj4IPjmikxk+CD45sqKyRiwp0xb+yD45opJ/6rohvFgOJAY
ZvJgqf/QAqk/ogCFMobzYKl/okDQ9SBn3SBS56VQxW2lUeVusANMENSlUIVzhW+l
UYV0hXBgIGfdIFLnpVDFc6VR5XSw4KVQxWmlUeVqkNalUIVppVGFakxs1qmrIMDe
pbiF9KW5hfU4ZtildYX2pXaF9yCm2UyY2YbepviG36V1hdqldoXbpXmF3KV6hd2l
9IW4pfWFuaX2hXWl94V2ILcAID7ZTNLXpdqFdaXbhXal3IW4pd2FuabfmkzS10zJ
3rD7pq+GaaawhmogDNogGtalm4VgpZyFYaksIMDeIAza5lDQAuZRIBrWpZvFYKWc
5WGwAWCgALGbkWDmm9AC5pzmYNAC5mGlacWbpWrlnLDmpmGkYNAByoiGaoRpTPLU
rVbArVPATED7rVTATDn7INn3oAOxm6qIsZvpAbAByoVQhlEgzf4gvPdMzf4g2fcg
/f6gArGbxVDIsZvlUbADTBDUILz3TP3+LFXALFLAqUDQCKkgLFTALFPAheatV8Ct
UMCpAIUcpeaFG6AAhBqlHJEaIH70yND25hulGykf0O5gheKG4IThSCnAhSZKSgUm
hSZohScKCgomJwomJwpmJqUnKR8F5oUnisAA8AWgI2kEyOkHsPuE5aq9ufSFMJhK
peSFHLAoYCAR9KUcUSYlMFEmkSZgECOlMEqwBUnAhTBgiBACoCepwIUwhOWlHArJ
wBAGpRxJf4UcYKUwCkmAMN2pgcjAKJDgoACw3Bil0SkE8CWpfyUwMSbQGebqqX8l
MBARGKXRKQTwDrEmRRwlMNAC5upRJpEmpdFl0ykDyQJqsJIwMBilJyy59dAiBiaw
GizN9PAFaR84sBJpI0ilJmmwsAJp8IUmaLACaR9mJmn8hSdgGKUnaQQsufXQ8wYm
kBhp4BgsCPXwEqUmaVBJ8PACSfCFJqXmkAJp4GYmkNFIqQCF4IXhheJoSDjl4EiK
5eGF07AKaEn/aQFIqQDl04XRhdVohdCF1GiF4IbhmBjl4pAESf9p/oXShOJm0zjl
0Kqp/+XRhR2k5bAFCiBl9Dil1GXShdSl1ekAhdWxJkUcJTBRJpEm6NAE5h3wYqXT
sNog0/QYpdRl0IXUpdVl0VDZgYKEiJCgwBz//vr07OHUxbShjXhhSTEY/6UmCqUn
KQMqBSYKCgqF4qUnSkopBwXiheKl5Qpl5QqqyqUwKX/oStD8heGKGGXlkALm4YXg
YIYahBuqSkpKSoXTiikPqry69YTQSQ+qvLv1yITSpOWiAIbqoRqF0aKAhtSG1abn
pdQ4ZdCF1JAEILP0GKXVZdKF1ZADILT0ytDlpdFKSkrQ1OYa0ALmG6Ea0MpghhqE
G6pKSkpKhdOKKQ+qvLr1hNBJD6q8u/XIhNKk5aIAhuqhGoXRooCG1IbVpuel1Dhl
0IXUkAQgnPQYpdVl0oXVkAMgnfTK0OWl0UpKStDU5hrQAuYboRrQymAgZ90gUuek
UaZQwAGQBtAd4BiwGYpImEipLCDA3iD45uDAsAmGnWioaKqlnWBMBvIg+ObgCLD2
vfb2heRgACpVf4Cq1f/JwfANILn2IFf0ILcAycHQ5iDA3iC59oSdqIqmnSA69UwI
9yD45ob5YCD45obnYCD45qXohRql6YUbiqIAwRrwArClCpAD5hsYqLEaZRqqyLEa
ZemFG4YaILcAycXQCSDA3iC59iAR9KX5YCAt90wF9iAt90xh9qkAhT2FP6BQhDzI
hD4g/f4YpXOqyoY+5VBIpXSo6NABiIQ/5VHFbpAC0ANMENSFdIVwhT2F6WiF6IVz
hW+FPCD6/KkDTAL/GKWbZVCFPqWcZVGFP6AEsZsg7+CllIU8pZWFPWCpQIUUIOPf
qQCFFEzw2CD45sqKySiQCukoSCD72mhM7PeFJGDL0tdKCCBH+CipD5ACaeCFLrEm
RTAlLlEmkSZgIAD4xCywEcggDviQ9mkBSCAA+GjFLZD1YKAv0AKgJ4QtoCepAIUw
ICj4iBD2YEhKKQMJBIUnaCkYkAJpf4UmCgoFJoUmYKUwGGkDKQ+FMAoKCgoFMIUw
YEoIIEf4sSYokARKSkpKKQ9gpjqkOyCW/SBI+aE6qEqQCWqwEMmi8Awph0qqvWL5
IHn40ASggKkAqr2m+YUuKQOFL5gpj6qYoAPgivALSpAISkoJIIjQ+siI0PJg////
IIL4SLE6INr9ogEgSvnEL8iQ8aIDwASQ8mioucD5hSy5APqFLakAoAUGLSYsKojQ
+Gm/IO39ytDsIEj5pC+iBuAD8BwGLpAOvbP5IO39vbn58AMg7f3K0OdgiDDnINr9
pS7J6LE6kPIgVvmq6NAByJgg2v2KTNr9ogOpoCDt/crQ+GA4pS+kO6oQAYhlOpAB
yGAEIFQwDYAEkAMiVDMNgASQBCBUMw2ABJAEIFQ7DYAEkAAiRDMNyEQAESJEMw3I
RKkBIkQzDYAEkAEiRDMNgASQJjGHmgAhgYIAAFlNkZKGSoWdrKmso6ik2QDYpKQA
HIocI12LG6Gdih0jnYsdoQApGa5pqBkjJFMbIyRTGaEAGltbpWkkJK6uqK0pAHwA
FZxtnKVpKVOEEzQRpWkjoNhiWkgmYpSIVETIVGhE6JQAtAiEdLQobnT0zEpy8qSK
AKqionR0dHJEaLIysgAiABoaJiZycojIxMomSEREosiFRWhICgoKMANs/gMoIEz/
aIU6aIU7bPADIIL4INr6TGX/2CCE/iAv+yCT/iCJ/q1YwK1awK1dwK1fwK3/zywQ
wNggOv+t8wNJpc30A9AXrfID0A+p4M3zA9AIoAOM8gNMAOBs8gMgYPuiBb38+p3v
A8rQ96nIhgCFAaAHxgGlAcnA8NeN+AexANkB+9DsiIgQ9WwAAOrqII79qUWFQKkA
hUGi+6mgIO39vR76IO39qb0g7f21SiDa/egw6GBZ+gDgRSD/AP8D/zzB0NDMxaDd
28TCwf/D////wdjZ0NOtcMCgAOrqvWTAEATI0PiIYKkAhUitVsCtVMCtUcCpAPAL
rVDArVPAIDb4qRSFIqkAhSCpKIUhqRiFI6kXhSVMIvwgWPygCLkI+5kOBIjQ92Ct
8wNJpY30A2DJjdAYrADAEBPAk9APLBDArADAEPvAg/ADLBDATP37OEws/Ki5SPog
l/sgDP3JzrDuycmQ6snM8ObQ6Orq6urq6urq6urq6urqSEopAwkEhSloKRiQAml/
hSgKCgUohShgyYfQEqlAIKj8oMCpDCCo/K0wwIjQ9WCkJJEo5iSlJMUhsGZgyaCw
76gQ7MmN8FrJivBayYjQycYkEOilIYUkxiSlIsUlsAvGJaUlIMH7ZSCFKGBJwPAo
af2QwPDaaf2QLPDeaf2QXNDppCSlJUggJPwgnvygAGhpAMUjkPCwyqUihSWgAIQk
8OSpAIUk5iWlJcUjkLbGJaUiSCAk/KUohSqlKYUrpCGIaGkBxSOwDUggJPyxKJEq
iBD5MOGgACCe/LCGpCSpoJEoyMQhkPlgOEjpAdD8aOkB0PZg5kLQAuZDpTzFPqU9
5T/mPNAC5j1goEsg2/zQ+Wn+sPWgISDb/MjIiND9kAWgMojQ/awgwKAsymCiCEgg
+vxoKqA6ytD1YCD9/IitYMBFLxD4RS+FL8CAYKQksShIKT8JQJEoaGw4AOZO0ALm
TywAwBD1kSitAMAsEMBgIAz9IKX7IAz9yZvw82ClMkip/4UyvQACIO39aIUyvQAC
yYjwHcmY8Arg+JADIDr/6NATqdwg7f0gjv2lMyDt/aIBivDzyiA1/cmV0AKxKMng
kAIp350AAsmN0LIgnPypjdBbpD2mPCCO/SBA+aAAqa1M7f2lPAkHhT6lPYU/pTwp
B9ADIJL9qaAg7f2xPCDa/SC6/JDoYEqQ6kpKpT6QAkn/ZTxIqb0g7f1oSEpKSkog
5f1oKQ8JsMm6kAJpBmw2AMmgkAIlMoQ1SCB4+2ikNWDGNPCfytAWybrQu4UxpT6R
QOZA0ALmQWCkNLn/AYUxYKIBtT6VQpVEyhD3YLE8kUIgtPyQ92CxPNFC8Bwgkv2x
PCDa/amgIO39qagg7f2xQiDa/ampIO39ILT8kNlgIHX+qRRIIND4IFP5hTqEO2g4
6QHQ72CK8Ae1PJU6yhD5YKA/0AKg/4QyYKkAhT6iOKAb0AipAIU+ojag8KU+KQ/w
BgnAoADwAqn9lACVAWDq6kwA4EwD4CB1/iA//2w6AEzX+mDqYOrq6urqTPgDqUAg
yfygJ6IAQTxIoTwg7f4guvygHWiQ7qAiIO3+8E2iEAog1vzQ+mAgAP5oaNBsIPr8
qRYgyfyFLiD6/KAkIP38sPkg/fygOyDs/IE8RS6FLiC6/KA1kPAg7PzFLvANqcUg
7f2p0iDt/SDt/amHTO39pUhIpUWmRqRHKGCFRYZGhEcIaIVIuoZJ2GAghP4gL/sg
k/4gif7YIDr/qaqFMyBn/SDH/yCn/4Q0oBeIMOjZzP/Q+CC+/6Q0THP/ogMKCgoK
CiY+Jj/KEPilMdAGtT+VPZVB6PDz0AaiAIY+hj+5AALISbDJCpDTaYjJ+rDNYKn+
SLnj/0ilMaAAhDFgvLK+su/Esqm7pqQGlQcCBfAA65Onxpmyyb7BNYzElq8XFysf
g39dzLX8Fxf1A/sDYvpA+g==`,wa=`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
cM5oYLEoLB/AEBmNAcCEKphFIGqwBK1VwMiYSqixKCxUwKQqLB7AEAbJILACCUBg
SCn/MBat+wRqaEiQDiwewBAJSUAsrM7wAklALB/AEB2NAcBIhCqYRSBKsAStVcDI
mEqoaJEorVTApCpoYJEoaGBImEisewUgRM6NewYpgEmrTM3OSJhIrHsFrXsGIHDO
aKhoYCBxzan/hTKt+wQpBPACRjKteweFKK37B4UprfsFhSVgLBLAED2pBs2z+/A2
ogMsEcAwAqILjbP7LIDArbP7yQbwAegsgcAsgcCgAKn4hTeENrE2kTbI0PnmN9D1
vYDAvYDAYAAAAOmBStAUpD+mPtABiMqKGOU6hT4QAciY5TvQQKQvuT0AkTqIEPgg
SPkgGvwgGvxM4/ylPSCO+Kq9APrFQtATvcD5xUPQDKVEpC7AnfCzxS7wysY90Nzm
RMY18NakNJiqTNL8IMf/rQACyaDwEsmN0AFgIKf/yZPQ5Yrw4iB4/qkDhT0gE/8K
6b7JwpDRCgqiBAomQiZDyhD4xj3w9BDkogUgyMSlRAoKBTXJILAGpjXwAgmAhUSE
NLkAAsm78ATJjdC0TGvP32/YZdf43JTZsdsw89jf4duP85jz5PHd8dTxJPIx8kDy
1/Ph8+j2/fZo92735vdX/CD3Jvd092zybvJy8nbyf/JO8mrZVfKF8qXyyvIX87vz
nvNh8kXaPdkR2cjZSNj0AyDZatnb2W3Y69mD58jYr9gS43rn1NqV2KTWadaf20jW
kOsj7K/rCgDe4hLUzd//4o3uru9B6Qnv6u/x7zrwnvBk59bmxeMH5+XmRuZa5obm
keZ5wOd5qed7gel7aOp9lu5QVN9GTt9/z+5/l95kZN9FTsRGT9JORVjUREFUwUlO
UFXUREXMREnNUkVBxEfSVEVY1FBSo0lOo0NBTMxQTE/USExJzlZMSc5IR1KySEfS
SENPTE9SvUhQTE/URFJB11hEUkHXSFRBwkhPTcVST1S9U0NBTEW9U0hMT0HEVFJB
Q8VOT1RSQUPFTk9STUHMSU5WRVJTxUZMQVPIQ09MT1K9UE/QVlRBwkhJTUVNukxP
TUVNuk9ORVLSUkVTVU3FUkVDQUzMU1RPUsVTUEVFRL1MRdRHT1TPUlXOScZSRVNU
T1LFpkdPU1XCUkVUVVLOUkXNU1RP0E/OV0FJ1ExPQcRTQVbFREXGUE9LxVBSSU7U
Q09O1ExJU9RDTEVB0kdF1E5F11RBQqhUz0bOU1BDqFRIRc5B1E5P1FNURdCrraqv
3kFOxE/Svr28U0fOSU7UQULTVVPSRlLFU0NSTqhQRMxQT9NTUdJSTsRMT8dFWNBD
T9NTSc5UQc5BVM5QRUXLTEXOU1RSpFZBzEFTw0NIUqRMRUZUpFJJR0hUpE1JRKQA
TkVYVCBXSVRIT1VUIEZP0lNZTlRB2FJFVFVSTiBXSVRIT1VUIEdPU1XCT1VUIE9G
IERBVMFJTExFR0FMIFFVQU5USVTZT1ZFUkZMT9dPVVQgT0YgTUVNT1LZVU5ERUYn
RCBTVEFURU1FTtRCQUQgU1VCU0NSSVDUUkVESU0nRCBBUlJB2URJVklTSU9OIEJZ
IFpFUs9JTExFR0FMIERJUkVD1FRZUEUgTUlTTUFUQ8hTVFJJTkcgVE9PIExPTsdG
T1JNVUxBIFRPTyBDT01QTEXYQ0FOJ1QgQ09OVElOVcVVTkRFRidEIEZVTkNUSU/O
IEVSUk9SBwAgSU4gAA1CUkVBSwcAuujo6Oi9AQHJgdAhpYbQCr0CAYWFvQMBhYbd
AwHQB6WF3QIB8AeKGGkSqtDYYCDj04VthG44pZblm4VeqKWX5Zyq6JjwI6WWOOVe
hZawA8aXOKWU5V6FlLAIxpWQBLGWkZSI0PmxlpGUxpfGlcrQ8mAKaTawNYVeuuRe
kC5gxHCQKNAExW+QIkiiCZhItZPKEPoghOSi92iVnegw+mioaMRwkAbQBcVvsAFg
ok0k2BADTOnyIPvaIFrbvWDSSCBc2+hoEPUgg9apUKDTIDrbpHbI8AMgGe0g+9qi
3SAu1Ya4hLlG2CCxAKrw7KL/hnaQBiBZ1UwF2KavhmmmsIZqIAzaIFnVhA8gGtaQ
RKABsZuFX6VphV6lnIVhpZuI8ZsYZWmFaYVgpWpp/4Vq5ZyqOKWb5WmosAPoxmEY
ZV6QA8ZfGLFekWDI0PnmX+ZhytDyrQAC8Dilc6R0hW+EcKVphZZlD4WUpGqEl5AB
yISVIJPTpVCkUY3+AYz/AaVtpG6FaYRqpA+5+wGIkZvQ+CBl1qVnpGiFXoRfGKAB
sV7QC6Vpha+laoWwTDzUoATIsV7Q+8iYZV6qoACRXqVfaQDIkV6GXoVfkNKigIYz
IGr94O+QAqLvqQCdAAKK8Au9/wEpf53/AcrQ9akAov+gAWAgDP0pf2CmuMqgBIQT
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
5opMi/4g+OaKTJX+IPjm4DCwE4bwqSwgwN4g+ObgMLAFhiyGLWBMmeEg7PHk8LAI
pfCFLIUthvCpxSDA3iD45uAwsOJgIOzxiqTwwCiw10wA+CAJ8oqkLMAosMqk8EwZ
+CAJ8oqowCiwvKXwTCj4IPjmikxk+CD45sqKyRiwp0xb+yD45opJ/6rohvFgOJAY
ZvJgqf/QAqk/ogCFMobzYKl/okDQ9SBn3SBS56VQxW2lUeVusANMENSlUIVzhW+l
UYV0hXBgIGfdIFLnpVDFc6VR5XSw4KVQxWmlUeVqkNalUIVppVGFakxs1qmrIMDe
pbiF9KW5hfU4ZtildYX2pXaF9yCm2UyY2YbepviG36V1hdqldoXbpXmF3KV6hd2l
9IW4pfWFuaX2hXWl94V2ILcAID7ZTNLXpdqFdaXbhXal3IW4pd2FuabfmkzS10zJ
3rD7pq+GaaawhmogDNogGtalm4VgpZyFYaksIMDeIAza5lDQAuZRIBrWpZvFYKWc
5WGwAWCgALGbkWDmm9AC5pzmYNAC5mGlacWbpWrlnLDmpmGkYNAByoiGaoRpTPLU
rVbArVPATED7rVTATDn7INn3oAOxm6qIsZvpAbAByoVQhlEgzf4gd/dMzf4g2fcg
/f6gArGbxVDIsZvlUbADTBDUIHf3TP3+LFXALFLAqUDQCKkgLFTALFPAheatV8Ct
UMCpAIUcpeaFG6AAhBqlHJEaIH70yND25hulGykf0O5gheKG4IThSCnAhSZKSgUm
hSZohScKCgomJwomJwpmJqUnKR8F5oUnisAA8AWgI2kEyOkHsPuE5aq9ufSFMJhK
peSFHLAoYCAR9KUcUSYlMFEmkSZgECOlMEqwBUnAhTBgiBACoCepwIUwhOWlHArJ
wBAGpRxJf4UcYKUwCkmAMN2pgcjAKJDgoACw3Bil0SkE8CWpfyUwMSbQGebqqX8l
MBARGKXRKQTwDrEmRRwlMNAC5upRJpEmpdFl0ykDyQJqsJIwMBilJyy59dAiBiaw
GizN9PAFaR84sBJpI0ilJmmwsAJp8IUmaLACaR9mJmn8hSdgGKUnaQQsufXQ8wYm
kBhp4BgsCPXwEqUmaVBJ8PACSfCFJqXmkAJp4GYmkNFIqQCF4IXhheJoSDjl4EiK
5eGF07AKaEn/aQFIqQDl04XRhdVohdCF1GiF4IbhmBjl4pAESf9p/oXShOJm0zjl
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
g39dzLX8Fxf1A/sDYvr6ww==`,ya=`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
IFTLIGPOxiowCywawDDvpSrJFLDpjQ3AaI17BWiN+wVMUcsIeKAAhCuMAcAsVMCx
KCxVwCCjzixUwLEoIKPOwCiQ7CCRzixVwCCRzixUwChgoBSpoCQyMAIpf5EoyMAo
0PlgSJhKqGiRKOYrpCtgjXsFhSSNewQsH8AQHakAhSSNewSlITjtewXJCLAMhSSp
KDjlJIUkjXsErXsFYEiYSKx7BSABz0mALADPIAbPaKhoYEgkMjACSYAsAM8gBs9o
YLggBs9ghB9IrR/AEDKlH0qocBYIeK1VwJADrVTAsSiorVTAKGiYSFAkaEgIeEit
VcCQA61UwGiRKK1UwChwDqQfcAZosShIUARoSJEoaKQfYEiYSKx7BSABz417BimA
SatMbs9ImEisewWtewYsAM8gBs9oqGhgSAh4rRHASK4SwK2BwK2BwKAAqfiFN6U2
SKkAhTaxNpE2yND55jfQ9WiFNqnDhTdoEA+KEAatgMBMxc+tgcBMxc+KEAatiMBM
xc+ticAoaGCt+wQpAdADIJvNqf+FMq37BCkE8AJGMq17B4UorfsHhSlgKEJMfJvp
/wGJ4OzM0tjpIyLmAAAAAG/YZdf43JTZsdsw89jf4duP85jz5PHd8dTxJPIx8kDy
1/Ph8+j2/fZo92735vdX/CD3Jvd092zybvJy8nbyf/JO8mrZVfKF8qXyyvIX87vz
nvNh8kXaPdkR2cjZSNj0AyDZatnb2W3Y69mD58jYr9gS43rn1NqV2KTWadaf20jW
kOsj7K/rCgDe4hLUzd//4o3uru9B6Qnv6u/x7zrwnvBk59bmxeMH5+XmRuZa5obm
keZ5wOd5qed7gel7aOp9lu5QVN9GTt9/z+5/l95kZN9FTsRGT9JORVjUREFUwUlO
UFXUREXMREnNUkVBxEfSVEVY1FBSo0lOo0NBTMxQTE/USExJzlZMSc5IR1KySEfS
SENPTE9SvUhQTE/URFJB11hEUkHXSFRBwkhPTcVST1S9U0NBTEW9U0hMT0HEVFJB
Q8VOT1RSQUPFTk9STUHMSU5WRVJTxUZMQVPIQ09MT1K9UE/QVlRBwkhJTUVNukxP
TUVNuk9ORVLSUkVTVU3FUkVDQUzMU1RPUsVTUEVFRL1MRdRHT1TPUlXOScZSRVNU
T1LFpkdPU1XCUkVUVVLOUkXNU1RP0E/OV0FJ1ExPQcRTQVbFREXGUE9LxVBSSU7U
Q09O1ExJU9RDTEVB0kdF1E5F11RBQqhUz0bOU1BDqFRIRc5B1E5P1FNURdCrraqv
3kFOxE/Svr28U0fOSU7UQULTVVPSRlLFU0NSTqhQRMxQT9NTUdJSTsRMT8dFWNBD
T9NTSc5UQc5BVM5QRUXLTEXOU1RSpFZBzEFTw0NIUqRMRUZUpFJJR0hUpE1JRKQA
TkVYVCBXSVRIT1VUIEZP0lNZTlRB2FJFVFVSTiBXSVRIT1VUIEdPU1XCT1VUIE9G
IERBVMFJTExFR0FMIFFVQU5USVTZT1ZFUkZMT9dPVVQgT0YgTUVNT1LZVU5ERUYn
RCBTVEFURU1FTtRCQUQgU1VCU0NSSVDUUkVESU0nRCBBUlJB2URJVklTSU9OIEJZ
IFpFUs9JTExFR0FMIERJUkVD1FRZUEUgTUlTTUFUQ8hTVFJJTkcgVE9PIExPTsdG
T1JNVUxBIFRPTyBDT01QTEXYQ0FOJ1QgQ09OVElOVcVVTkRFRidEIEZVTkNUSU/O
IEVSUk9SBwAgSU4gAA1CUkVBSwcAuujo6Oi9AQHJgdAhpYbQCr0CAYWFvQMBhYbd
AwHQB6WF3QIB8AeKGGkSqtDYYCDj04VthG44pZblm4VeqKWX5Zyq6JjwI6WWOOVe
hZawA8aXOKWU5V6FlLAIxpWQBLGWkZSI0PmxlpGUxpfGlcrQ8mAKaTawNYVeuuRe
kC5gxHCQKNAExW+QIkiiCZhItZPKEPoghOSi92iVnegw+mioaMRwkAbQBcVvsAFg
ok0k2BADTOnyIPvaIFrbvWDSSCBc2+hoEPUgg9apUKDTIDrbpHbI8AMgGe0g+9qi
3SAu1Ya4hLlG2CCxAKrw7KL/hnaQBiBZ1UwF2KavhmmmsIZqIAzaIFnVhA8gGtaQ
RKABsZuFX6VphV6lnIVhpZuI8ZsYZWmFaYVgpWpp/4Vq5ZyqOKWb5WmosAPoxmEY
ZV6QA8ZfGLFekWDI0PnmX+ZhytDyrQAC8Dilc6R0hW+EcKVphZZlD4WUpGqEl5AB
yISVIJPTpVCkUY3+AYz/AaVtpG6FaYRqpA+5+wGIkZvQ+CBl1qVnpGiFXoRfGKAB
sV7QC6Vpha+laoWwTDzUoATIsV7Q+8iYZV6qoACRXqVfaQDIkV6GXoVfkNKigIYz
IGr94O+QAqLvqQCdAAKK8Au9/wEpf53/AcrQ9akAov+gAWAgDP0pf2CmuMqgBIQT
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
5opMi/4g+OaKTJX+IPjm4DCwE4bwqSwgwN4g+ObgMLAFhiyGLWBMmeEg7PHk8LAI
pfCFLIUthvCpxSDA3iD45uAwsOJgIOzxiqTwwCiw10wA+CAJ8oqkLMAosMqk8EwZ
+CAJ8oqowCiwvKXwTCj4IPjmikxk+CD45sqKyRiwp0xb+yD45opJ/6rohvFgOJAY
ZvJgqf/QAqk/ogCFMobzYKl/okDQ9SBn3SBS56VQxW2lUeVusANMENSlUIVzhW+l
UYV0hXBgIGfdIFLnpVDFc6VR5XSw4KVQxWmlUeVqkNalUIVppVGFakxs1qmrIMDe
pbiF9KW5hfU4ZtildYX2pXaF9yCm2UyY2YbepviG36V1hdqldoXbpXmF3KV6hd2l
9IW4pfWFuaX2hXWl94V2ILcAID7ZTNLXpdqFdaXbhXal3IW4pd2FuabfmkzS10zJ
3rD7pq+GaaawhmogDNogGtalm4VgpZyFYaksIMDeIAza5lDQAuZRIBrWpZvFYKWc
5WGwAWCgALGbkWDmm9AC5pzmYNAC5mGlacWbpWrlnLDmpmGkYNAByoiGaoRpTPLU
rVbArVPATED7rVTATDn7INn3oAOxm6qIsZvpAbAByoVQhlEgzf4gvPdMzf4g2fcg
/f6gArGbxVDIsZvlUbADTBDUILz3TP3+LFXALFLAqUDQCKkgLFTALFPAheatV8Ct
UMCpAIUcpeaFG6AAhBqlHJEaIH70yND25hulGykf0O5gheKG4IThSCnAhSZKSgUm
hSZohScKCgomJwomJwpmJqUnKR8F5oUnisAA8AWgI2kEyOkHsPuE5aq9ufSFMJhK
peSFHLAoYCAR9KUcUSYlMFEmkSZgECOlMEqwBUnAhTBgiBACoCepwIUwhOWlHArJ
wBAGpRxJf4UcYKUwCkmAMN2pgcjAKJDgoACw3Bil0SkE8CWpfyUwMSbQGebqqX8l
MBARGKXRKQTwDrEmRRwlMNAC5upRJpEmpdFl0ykDyQJqsJIwMBilJyy59dAiBiaw
GizN9PAFaR84sBJpI0ilJmmwsAJp8IUmaLACaR9mJmn8hSdgGKUnaQQsufXQ8wYm
kBhp4BgsCPXwEqUmaVBJ8PACSfCFJqXmkAJp4GYmkNFIqQCF4IXhheJoSDjl4EiK
5eGF07AKaEn/aQFIqQDl04XRhdVohdCF1GiF4IbhmBjl4pAESf9p/oXShOJm0zjl
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
g39dzLX8Fxf1A/sDYvpA+g==`;var oo={},ze={},Ms;function Ra(){if(Ms)return ze;Ms=1,ze.byteLength=l,ze.toByteArray=D,ze.fromByteArray=F;for(var A=[],e=[],t=typeof Uint8Array<"u"?Uint8Array:Array,s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",i=0,I=s.length;i<I;++i)A[i]=s[i],e[s.charCodeAt(i)]=i;e[45]=62,e[95]=63;function h(w){var Y=w.length;if(Y%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var j=w.indexOf("=");j===-1&&(j=Y);var fA=j===Y?0:4-j%4;return[j,fA]}function l(w){var Y=h(w),j=Y[0],fA=Y[1];return(j+fA)*3/4-fA}function m(w,Y,j){return(Y+j)*3/4-j}function D(w){var Y,j=h(w),fA=j[0],BA=j[1],aA=new t(m(w,fA,BA)),mA=0,Fe=BA>0?fA-4:fA,sA;for(sA=0;sA<Fe;sA+=4)Y=e[w.charCodeAt(sA)]<<18|e[w.charCodeAt(sA+1)]<<12|e[w.charCodeAt(sA+2)]<<6|e[w.charCodeAt(sA+3)],aA[mA++]=Y>>16&255,aA[mA++]=Y>>8&255,aA[mA++]=Y&255;return BA===2&&(Y=e[w.charCodeAt(sA)]<<2|e[w.charCodeAt(sA+1)]>>4,aA[mA++]=Y&255),BA===1&&(Y=e[w.charCodeAt(sA)]<<10|e[w.charCodeAt(sA+1)]<<4|e[w.charCodeAt(sA+2)]>>2,aA[mA++]=Y>>8&255,aA[mA++]=Y&255),aA}function k(w){return A[w>>18&63]+A[w>>12&63]+A[w>>6&63]+A[w&63]}function Q(w,Y,j){for(var fA,BA=[],aA=Y;aA<j;aA+=3)fA=(w[aA]<<16&16711680)+(w[aA+1]<<8&65280)+(w[aA+2]&255),BA.push(k(fA));return BA.join("")}function F(w){for(var Y,j=w.length,fA=j%3,BA=[],aA=16383,mA=0,Fe=j-fA;mA<Fe;mA+=aA)BA.push(Q(w,mA,mA+aA>Fe?Fe:mA+aA));return fA===1?(Y=w[j-1],BA.push(A[Y>>2]+A[Y<<4&63]+"==")):fA===2&&(Y=(w[j-2]<<8)+w[j-1],BA.push(A[Y>>10]+A[Y>>4&63]+A[Y<<2&63]+"=")),BA.join("")}return ze}var Pt={};var Ls;function Pa(){return Ls||(Ls=1,Pt.read=function(A,e,t,s,i){var I,h,l=i*8-s-1,m=(1<<l)-1,D=m>>1,k=-7,Q=t?i-1:0,F=t?-1:1,w=A[e+Q];for(Q+=F,I=w&(1<<-k)-1,w>>=-k,k+=l;k>0;I=I*256+A[e+Q],Q+=F,k-=8);for(h=I&(1<<-k)-1,I>>=-k,k+=s;k>0;h=h*256+A[e+Q],Q+=F,k-=8);if(I===0)I=1-D;else{if(I===m)return h?NaN:(w?-1:1)*(1/0);h=h+Math.pow(2,s),I=I-D}return(w?-1:1)*h*Math.pow(2,I-s)},Pt.write=function(A,e,t,s,i,I){var h,l,m,D=I*8-i-1,k=(1<<D)-1,Q=k>>1,F=i===23?Math.pow(2,-24)-Math.pow(2,-77):0,w=s?0:I-1,Y=s?1:-1,j=e<0||e===0&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(l=isNaN(e)?1:0,h=k):(h=Math.floor(Math.log(e)/Math.LN2),e*(m=Math.pow(2,-h))<1&&(h--,m*=2),h+Q>=1?e+=F/m:e+=F*Math.pow(2,1-Q),e*m>=2&&(h++,m/=2),h+Q>=k?(l=0,h=k):h+Q>=1?(l=(e*m-1)*Math.pow(2,i),h=h+Q):(l=e*Math.pow(2,Q-1)*Math.pow(2,i),h=0));i>=8;A[t+w]=l&255,w+=Y,l/=256,i-=8);for(h=h<<i|l,D+=i;D>0;A[t+w]=h&255,w+=Y,h/=256,D-=8);A[t+w-Y]|=j*128}),Pt}var Fs;function Qa(){return Fs||(Fs=1,(function(A){const e=Ra(),t=Pa(),s=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;A.Buffer=l,A.SlowBuffer=aA,A.INSPECT_MAX_BYTES=50;const i=2147483647;A.kMaxLength=i,l.TYPED_ARRAY_SUPPORT=I(),!l.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function I(){try{const a=new Uint8Array(1),r={foo:function(){return 42}};return Object.setPrototypeOf(r,Uint8Array.prototype),Object.setPrototypeOf(a,r),a.foo()===42}catch{return!1}}Object.defineProperty(l.prototype,"parent",{enumerable:!0,get:function(){if(l.isBuffer(this))return this.buffer}}),Object.defineProperty(l.prototype,"offset",{enumerable:!0,get:function(){if(l.isBuffer(this))return this.byteOffset}});function h(a){if(a>i)throw new RangeError('The value "'+a+'" is invalid for option "size"');const r=new Uint8Array(a);return Object.setPrototypeOf(r,l.prototype),r}function l(a,r,o){if(typeof a=="number"){if(typeof r=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return Q(a)}return m(a,r,o)}l.poolSize=8192;function m(a,r,o){if(typeof a=="string")return F(a,r);if(ArrayBuffer.isView(a))return Y(a);if(a==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof a);if(xA(a,ArrayBuffer)||a&&xA(a.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(xA(a,SharedArrayBuffer)||a&&xA(a.buffer,SharedArrayBuffer)))return j(a,r,o);if(typeof a=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const u=a.valueOf&&a.valueOf();if(u!=null&&u!==a)return l.from(u,r,o);const p=fA(a);if(p)return p;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof a[Symbol.toPrimitive]=="function")return l.from(a[Symbol.toPrimitive]("string"),r,o);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof a)}l.from=function(a,r,o){return m(a,r,o)},Object.setPrototypeOf(l.prototype,Uint8Array.prototype),Object.setPrototypeOf(l,Uint8Array);function D(a){if(typeof a!="number")throw new TypeError('"size" argument must be of type number');if(a<0)throw new RangeError('The value "'+a+'" is invalid for option "size"')}function k(a,r,o){return D(a),a<=0?h(a):r!==void 0?typeof o=="string"?h(a).fill(r,o):h(a).fill(r):h(a)}l.alloc=function(a,r,o){return k(a,r,o)};function Q(a){return D(a),h(a<0?0:BA(a)|0)}l.allocUnsafe=function(a){return Q(a)},l.allocUnsafeSlow=function(a){return Q(a)};function F(a,r){if((typeof r!="string"||r==="")&&(r="utf8"),!l.isEncoding(r))throw new TypeError("Unknown encoding: "+r);const o=mA(a,r)|0;let u=h(o);const p=u.write(a,r);return p!==o&&(u=u.slice(0,p)),u}function w(a){const r=a.length<0?0:BA(a.length)|0,o=h(r);for(let u=0;u<r;u+=1)o[u]=a[u]&255;return o}function Y(a){if(xA(a,Uint8Array)){const r=new Uint8Array(a);return j(r.buffer,r.byteOffset,r.byteLength)}return w(a)}function j(a,r,o){if(r<0||a.byteLength<r)throw new RangeError('"offset" is outside of buffer bounds');if(a.byteLength<r+(o||0))throw new RangeError('"length" is outside of buffer bounds');let u;return r===void 0&&o===void 0?u=new Uint8Array(a):o===void 0?u=new Uint8Array(a,r):u=new Uint8Array(a,r,o),Object.setPrototypeOf(u,l.prototype),u}function fA(a){if(l.isBuffer(a)){const r=BA(a.length)|0,o=h(r);return o.length===0||a.copy(o,0,0,r),o}if(a.length!==void 0)return typeof a.length!="number"||ss(a.length)?h(0):w(a);if(a.type==="Buffer"&&Array.isArray(a.data))return w(a.data)}function BA(a){if(a>=i)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+i.toString(16)+" bytes");return a|0}function aA(a){return+a!=a&&(a=0),l.alloc(+a)}l.isBuffer=function(r){return r!=null&&r._isBuffer===!0&&r!==l.prototype},l.compare=function(r,o){if(xA(r,Uint8Array)&&(r=l.from(r,r.offset,r.byteLength)),xA(o,Uint8Array)&&(o=l.from(o,o.offset,o.byteLength)),!l.isBuffer(r)||!l.isBuffer(o))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(r===o)return 0;let u=r.length,p=o.length;for(let f=0,E=Math.min(u,p);f<E;++f)if(r[f]!==o[f]){u=r[f],p=o[f];break}return u<p?-1:p<u?1:0},l.isEncoding=function(r){switch(String(r).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},l.concat=function(r,o){if(!Array.isArray(r))throw new TypeError('"list" argument must be an Array of Buffers');if(r.length===0)return l.alloc(0);let u;if(o===void 0)for(o=0,u=0;u<r.length;++u)o+=r[u].length;const p=l.allocUnsafe(o);let f=0;for(u=0;u<r.length;++u){let E=r[u];if(xA(E,Uint8Array))f+E.length>p.length?(l.isBuffer(E)||(E=l.from(E)),E.copy(p,f)):Uint8Array.prototype.set.call(p,E,f);else if(l.isBuffer(E))E.copy(p,f);else throw new TypeError('"list" argument must be an Array of Buffers');f+=E.length}return p};function mA(a,r){if(l.isBuffer(a))return a.length;if(ArrayBuffer.isView(a)||xA(a,ArrayBuffer))return a.byteLength;if(typeof a!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof a);const o=a.length,u=arguments.length>2&&arguments[2]===!0;if(!u&&o===0)return 0;let p=!1;for(;;)switch(r){case"ascii":case"latin1":case"binary":return o;case"utf8":case"utf-8":return os(a).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o*2;case"hex":return o>>>1;case"base64":return Ti(a).length;default:if(p)return u?-1:os(a).length;r=(""+r).toLowerCase(),p=!0}}l.byteLength=mA;function Fe(a,r,o){let u=!1;if((r===void 0||r<0)&&(r=0),r>this.length||((o===void 0||o>this.length)&&(o=this.length),o<=0)||(o>>>=0,r>>>=0,o<=r))return"";for(a||(a="utf8");;)switch(a){case"hex":return r1(this,r,o);case"utf8":case"utf-8":return pi(this,r,o);case"ascii":return e1(this,r,o);case"latin1":case"binary":return t1(this,r,o);case"base64":return $0(this,r,o);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o1(this,r,o);default:if(u)throw new TypeError("Unknown encoding: "+a);a=(a+"").toLowerCase(),u=!0}}l.prototype._isBuffer=!0;function sA(a,r,o){const u=a[r];a[r]=a[o],a[o]=u}l.prototype.swap16=function(){const r=this.length;if(r%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let o=0;o<r;o+=2)sA(this,o,o+1);return this},l.prototype.swap32=function(){const r=this.length;if(r%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let o=0;o<r;o+=4)sA(this,o,o+3),sA(this,o+1,o+2);return this},l.prototype.swap64=function(){const r=this.length;if(r%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let o=0;o<r;o+=8)sA(this,o,o+7),sA(this,o+1,o+6),sA(this,o+2,o+5),sA(this,o+3,o+4);return this},l.prototype.toString=function(){const r=this.length;return r===0?"":arguments.length===0?pi(this,0,r):Fe.apply(this,arguments)},l.prototype.toLocaleString=l.prototype.toString,l.prototype.equals=function(r){if(!l.isBuffer(r))throw new TypeError("Argument must be a Buffer");return this===r?!0:l.compare(this,r)===0},l.prototype.inspect=function(){let r="";const o=A.INSPECT_MAX_BYTES;return r=this.toString("hex",0,o).replace(/(.{2})/g,"$1 ").trim(),this.length>o&&(r+=" ... "),"<Buffer "+r+">"},s&&(l.prototype[s]=l.prototype.inspect),l.prototype.compare=function(r,o,u,p,f){if(xA(r,Uint8Array)&&(r=l.from(r,r.offset,r.byteLength)),!l.isBuffer(r))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof r);if(o===void 0&&(o=0),u===void 0&&(u=r?r.length:0),p===void 0&&(p=0),f===void 0&&(f=this.length),o<0||u>r.length||p<0||f>this.length)throw new RangeError("out of range index");if(p>=f&&o>=u)return 0;if(p>=f)return-1;if(o>=u)return 1;if(o>>>=0,u>>>=0,p>>>=0,f>>>=0,this===r)return 0;let E=f-p,q=u-o;const AA=Math.min(E,q),z=this.slice(p,f),eA=r.slice(o,u);for(let H=0;H<AA;++H)if(z[H]!==eA[H]){E=z[H],q=eA[H];break}return E<q?-1:q<E?1:0};function hi(a,r,o,u,p){if(a.length===0)return-1;if(typeof o=="string"?(u=o,o=0):o>2147483647?o=2147483647:o<-2147483648&&(o=-2147483648),o=+o,ss(o)&&(o=p?0:a.length-1),o<0&&(o=a.length+o),o>=a.length){if(p)return-1;o=a.length-1}else if(o<0)if(p)o=0;else return-1;if(typeof r=="string"&&(r=l.from(r,u)),l.isBuffer(r))return r.length===0?-1:gi(a,r,o,u,p);if(typeof r=="number")return r=r&255,typeof Uint8Array.prototype.indexOf=="function"?p?Uint8Array.prototype.indexOf.call(a,r,o):Uint8Array.prototype.lastIndexOf.call(a,r,o):gi(a,[r],o,u,p);throw new TypeError("val must be string, number or Buffer")}function gi(a,r,o,u,p){let f=1,E=a.length,q=r.length;if(u!==void 0&&(u=String(u).toLowerCase(),u==="ucs2"||u==="ucs-2"||u==="utf16le"||u==="utf-16le")){if(a.length<2||r.length<2)return-1;f=2,E/=2,q/=2,o/=2}function AA(eA,H){return f===1?eA[H]:eA.readUInt16BE(H*f)}let z;if(p){let eA=-1;for(z=o;z<E;z++)if(AA(a,z)===AA(r,eA===-1?0:z-eA)){if(eA===-1&&(eA=z),z-eA+1===q)return eA*f}else eA!==-1&&(z-=z-eA),eA=-1}else for(o+q>E&&(o=E-q),z=o;z>=0;z--){let eA=!0;for(let H=0;H<q;H++)if(AA(a,z+H)!==AA(r,H)){eA=!1;break}if(eA)return z}return-1}l.prototype.includes=function(r,o,u){return this.indexOf(r,o,u)!==-1},l.prototype.indexOf=function(r,o,u){return hi(this,r,o,u,!0)},l.prototype.lastIndexOf=function(r,o,u){return hi(this,r,o,u,!1)};function J0(a,r,o,u){o=Number(o)||0;const p=a.length-o;u?(u=Number(u),u>p&&(u=p)):u=p;const f=r.length;u>f/2&&(u=f/2);let E;for(E=0;E<u;++E){const q=parseInt(r.substr(E*2,2),16);if(ss(q))return E;a[o+E]=q}return E}function j0(a,r,o,u){return Qr(os(r,a.length-o),a,o,u)}function H0(a,r,o,u){return Qr(a1(r),a,o,u)}function v0(a,r,o,u){return Qr(Ti(r),a,o,u)}function z0(a,r,o,u){return Qr(c1(r,a.length-o),a,o,u)}l.prototype.write=function(r,o,u,p){if(o===void 0)p="utf8",u=this.length,o=0;else if(u===void 0&&typeof o=="string")p=o,u=this.length,o=0;else if(isFinite(o))o=o>>>0,isFinite(u)?(u=u>>>0,p===void 0&&(p="utf8")):(p=u,u=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const f=this.length-o;if((u===void 0||u>f)&&(u=f),r.length>0&&(u<0||o<0)||o>this.length)throw new RangeError("Attempt to write outside buffer bounds");p||(p="utf8");let E=!1;for(;;)switch(p){case"hex":return J0(this,r,o,u);case"utf8":case"utf-8":return j0(this,r,o,u);case"ascii":case"latin1":case"binary":return H0(this,r,o,u);case"base64":return v0(this,r,o,u);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return z0(this,r,o,u);default:if(E)throw new TypeError("Unknown encoding: "+p);p=(""+p).toLowerCase(),E=!0}},l.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function $0(a,r,o){return r===0&&o===a.length?e.fromByteArray(a):e.fromByteArray(a.slice(r,o))}function pi(a,r,o){o=Math.min(a.length,o);const u=[];let p=r;for(;p<o;){const f=a[p];let E=null,q=f>239?4:f>223?3:f>191?2:1;if(p+q<=o){let AA,z,eA,H;switch(q){case 1:f<128&&(E=f);break;case 2:AA=a[p+1],(AA&192)===128&&(H=(f&31)<<6|AA&63,H>127&&(E=H));break;case 3:AA=a[p+1],z=a[p+2],(AA&192)===128&&(z&192)===128&&(H=(f&15)<<12|(AA&63)<<6|z&63,H>2047&&(H<55296||H>57343)&&(E=H));break;case 4:AA=a[p+1],z=a[p+2],eA=a[p+3],(AA&192)===128&&(z&192)===128&&(eA&192)===128&&(H=(f&15)<<18|(AA&63)<<12|(z&63)<<6|eA&63,H>65535&&H<1114112&&(E=H))}}E===null?(E=65533,q=1):E>65535&&(E-=65536,u.push(E>>>10&1023|55296),E=56320|E&1023),u.push(E),p+=q}return A1(u)}const Ci=4096;function A1(a){const r=a.length;if(r<=Ci)return String.fromCharCode.apply(String,a);let o="",u=0;for(;u<r;)o+=String.fromCharCode.apply(String,a.slice(u,u+=Ci));return o}function e1(a,r,o){let u="";o=Math.min(a.length,o);for(let p=r;p<o;++p)u+=String.fromCharCode(a[p]&127);return u}function t1(a,r,o){let u="";o=Math.min(a.length,o);for(let p=r;p<o;++p)u+=String.fromCharCode(a[p]);return u}function r1(a,r,o){const u=a.length;(!r||r<0)&&(r=0),(!o||o<0||o>u)&&(o=u);let p="";for(let f=r;f<o;++f)p+=l1[a[f]];return p}function o1(a,r,o){const u=a.slice(r,o);let p="";for(let f=0;f<u.length-1;f+=2)p+=String.fromCharCode(u[f]+u[f+1]*256);return p}l.prototype.slice=function(r,o){const u=this.length;r=~~r,o=o===void 0?u:~~o,r<0?(r+=u,r<0&&(r=0)):r>u&&(r=u),o<0?(o+=u,o<0&&(o=0)):o>u&&(o=u),o<r&&(o=r);const p=this.subarray(r,o);return Object.setPrototypeOf(p,l.prototype),p};function gA(a,r,o){if(a%1!==0||a<0)throw new RangeError("offset is not uint");if(a+r>o)throw new RangeError("Trying to access beyond buffer length")}l.prototype.readUintLE=l.prototype.readUIntLE=function(r,o,u){r=r>>>0,o=o>>>0,u||gA(r,o,this.length);let p=this[r],f=1,E=0;for(;++E<o&&(f*=256);)p+=this[r+E]*f;return p},l.prototype.readUintBE=l.prototype.readUIntBE=function(r,o,u){r=r>>>0,o=o>>>0,u||gA(r,o,this.length);let p=this[r+--o],f=1;for(;o>0&&(f*=256);)p+=this[r+--o]*f;return p},l.prototype.readUint8=l.prototype.readUInt8=function(r,o){return r=r>>>0,o||gA(r,1,this.length),this[r]},l.prototype.readUint16LE=l.prototype.readUInt16LE=function(r,o){return r=r>>>0,o||gA(r,2,this.length),this[r]|this[r+1]<<8},l.prototype.readUint16BE=l.prototype.readUInt16BE=function(r,o){return r=r>>>0,o||gA(r,2,this.length),this[r]<<8|this[r+1]},l.prototype.readUint32LE=l.prototype.readUInt32LE=function(r,o){return r=r>>>0,o||gA(r,4,this.length),(this[r]|this[r+1]<<8|this[r+2]<<16)+this[r+3]*16777216},l.prototype.readUint32BE=l.prototype.readUInt32BE=function(r,o){return r=r>>>0,o||gA(r,4,this.length),this[r]*16777216+(this[r+1]<<16|this[r+2]<<8|this[r+3])},l.prototype.readBigUInt64LE=Se(function(r){r=r>>>0,Je(r,"offset");const o=this[r],u=this[r+7];(o===void 0||u===void 0)&&mt(r,this.length-8);const p=o+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24,f=this[++r]+this[++r]*2**8+this[++r]*2**16+u*2**24;return BigInt(p)+(BigInt(f)<<BigInt(32))}),l.prototype.readBigUInt64BE=Se(function(r){r=r>>>0,Je(r,"offset");const o=this[r],u=this[r+7];(o===void 0||u===void 0)&&mt(r,this.length-8);const p=o*2**24+this[++r]*2**16+this[++r]*2**8+this[++r],f=this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+u;return(BigInt(p)<<BigInt(32))+BigInt(f)}),l.prototype.readIntLE=function(r,o,u){r=r>>>0,o=o>>>0,u||gA(r,o,this.length);let p=this[r],f=1,E=0;for(;++E<o&&(f*=256);)p+=this[r+E]*f;return f*=128,p>=f&&(p-=Math.pow(2,8*o)),p},l.prototype.readIntBE=function(r,o,u){r=r>>>0,o=o>>>0,u||gA(r,o,this.length);let p=o,f=1,E=this[r+--p];for(;p>0&&(f*=256);)E+=this[r+--p]*f;return f*=128,E>=f&&(E-=Math.pow(2,8*o)),E},l.prototype.readInt8=function(r,o){return r=r>>>0,o||gA(r,1,this.length),this[r]&128?(255-this[r]+1)*-1:this[r]},l.prototype.readInt16LE=function(r,o){r=r>>>0,o||gA(r,2,this.length);const u=this[r]|this[r+1]<<8;return u&32768?u|4294901760:u},l.prototype.readInt16BE=function(r,o){r=r>>>0,o||gA(r,2,this.length);const u=this[r+1]|this[r]<<8;return u&32768?u|4294901760:u},l.prototype.readInt32LE=function(r,o){return r=r>>>0,o||gA(r,4,this.length),this[r]|this[r+1]<<8|this[r+2]<<16|this[r+3]<<24},l.prototype.readInt32BE=function(r,o){return r=r>>>0,o||gA(r,4,this.length),this[r]<<24|this[r+1]<<16|this[r+2]<<8|this[r+3]},l.prototype.readBigInt64LE=Se(function(r){r=r>>>0,Je(r,"offset");const o=this[r],u=this[r+7];(o===void 0||u===void 0)&&mt(r,this.length-8);const p=this[r+4]+this[r+5]*2**8+this[r+6]*2**16+(u<<24);return(BigInt(p)<<BigInt(32))+BigInt(o+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24)}),l.prototype.readBigInt64BE=Se(function(r){r=r>>>0,Je(r,"offset");const o=this[r],u=this[r+7];(o===void 0||u===void 0)&&mt(r,this.length-8);const p=(o<<24)+this[++r]*2**16+this[++r]*2**8+this[++r];return(BigInt(p)<<BigInt(32))+BigInt(this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+u)}),l.prototype.readFloatLE=function(r,o){return r=r>>>0,o||gA(r,4,this.length),t.read(this,r,!0,23,4)},l.prototype.readFloatBE=function(r,o){return r=r>>>0,o||gA(r,4,this.length),t.read(this,r,!1,23,4)},l.prototype.readDoubleLE=function(r,o){return r=r>>>0,o||gA(r,8,this.length),t.read(this,r,!0,52,8)},l.prototype.readDoubleBE=function(r,o){return r=r>>>0,o||gA(r,8,this.length),t.read(this,r,!1,52,8)};function RA(a,r,o,u,p,f){if(!l.isBuffer(a))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>p||r<f)throw new RangeError('"value" argument is out of bounds');if(o+u>a.length)throw new RangeError("Index out of range")}l.prototype.writeUintLE=l.prototype.writeUIntLE=function(r,o,u,p){if(r=+r,o=o>>>0,u=u>>>0,!p){const q=Math.pow(2,8*u)-1;RA(this,r,o,u,q,0)}let f=1,E=0;for(this[o]=r&255;++E<u&&(f*=256);)this[o+E]=r/f&255;return o+u},l.prototype.writeUintBE=l.prototype.writeUIntBE=function(r,o,u,p){if(r=+r,o=o>>>0,u=u>>>0,!p){const q=Math.pow(2,8*u)-1;RA(this,r,o,u,q,0)}let f=u-1,E=1;for(this[o+f]=r&255;--f>=0&&(E*=256);)this[o+f]=r/E&255;return o+u},l.prototype.writeUint8=l.prototype.writeUInt8=function(r,o,u){return r=+r,o=o>>>0,u||RA(this,r,o,1,255,0),this[o]=r&255,o+1},l.prototype.writeUint16LE=l.prototype.writeUInt16LE=function(r,o,u){return r=+r,o=o>>>0,u||RA(this,r,o,2,65535,0),this[o]=r&255,this[o+1]=r>>>8,o+2},l.prototype.writeUint16BE=l.prototype.writeUInt16BE=function(r,o,u){return r=+r,o=o>>>0,u||RA(this,r,o,2,65535,0),this[o]=r>>>8,this[o+1]=r&255,o+2},l.prototype.writeUint32LE=l.prototype.writeUInt32LE=function(r,o,u){return r=+r,o=o>>>0,u||RA(this,r,o,4,4294967295,0),this[o+3]=r>>>24,this[o+2]=r>>>16,this[o+1]=r>>>8,this[o]=r&255,o+4},l.prototype.writeUint32BE=l.prototype.writeUInt32BE=function(r,o,u){return r=+r,o=o>>>0,u||RA(this,r,o,4,4294967295,0),this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255,o+4};function Si(a,r,o,u,p){ki(r,u,p,a,o,7);let f=Number(r&BigInt(4294967295));a[o++]=f,f=f>>8,a[o++]=f,f=f>>8,a[o++]=f,f=f>>8,a[o++]=f;let E=Number(r>>BigInt(32)&BigInt(4294967295));return a[o++]=E,E=E>>8,a[o++]=E,E=E>>8,a[o++]=E,E=E>>8,a[o++]=E,o}function fi(a,r,o,u,p){ki(r,u,p,a,o,7);let f=Number(r&BigInt(4294967295));a[o+7]=f,f=f>>8,a[o+6]=f,f=f>>8,a[o+5]=f,f=f>>8,a[o+4]=f;let E=Number(r>>BigInt(32)&BigInt(4294967295));return a[o+3]=E,E=E>>8,a[o+2]=E,E=E>>8,a[o+1]=E,E=E>>8,a[o]=E,o+8}l.prototype.writeBigUInt64LE=Se(function(r,o=0){return Si(this,r,o,BigInt(0),BigInt("0xffffffffffffffff"))}),l.prototype.writeBigUInt64BE=Se(function(r,o=0){return fi(this,r,o,BigInt(0),BigInt("0xffffffffffffffff"))}),l.prototype.writeIntLE=function(r,o,u,p){if(r=+r,o=o>>>0,!p){const AA=Math.pow(2,8*u-1);RA(this,r,o,u,AA-1,-AA)}let f=0,E=1,q=0;for(this[o]=r&255;++f<u&&(E*=256);)r<0&&q===0&&this[o+f-1]!==0&&(q=1),this[o+f]=(r/E>>0)-q&255;return o+u},l.prototype.writeIntBE=function(r,o,u,p){if(r=+r,o=o>>>0,!p){const AA=Math.pow(2,8*u-1);RA(this,r,o,u,AA-1,-AA)}let f=u-1,E=1,q=0;for(this[o+f]=r&255;--f>=0&&(E*=256);)r<0&&q===0&&this[o+f+1]!==0&&(q=1),this[o+f]=(r/E>>0)-q&255;return o+u},l.prototype.writeInt8=function(r,o,u){return r=+r,o=o>>>0,u||RA(this,r,o,1,127,-128),r<0&&(r=255+r+1),this[o]=r&255,o+1},l.prototype.writeInt16LE=function(r,o,u){return r=+r,o=o>>>0,u||RA(this,r,o,2,32767,-32768),this[o]=r&255,this[o+1]=r>>>8,o+2},l.prototype.writeInt16BE=function(r,o,u){return r=+r,o=o>>>0,u||RA(this,r,o,2,32767,-32768),this[o]=r>>>8,this[o+1]=r&255,o+2},l.prototype.writeInt32LE=function(r,o,u){return r=+r,o=o>>>0,u||RA(this,r,o,4,2147483647,-2147483648),this[o]=r&255,this[o+1]=r>>>8,this[o+2]=r>>>16,this[o+3]=r>>>24,o+4},l.prototype.writeInt32BE=function(r,o,u){return r=+r,o=o>>>0,u||RA(this,r,o,4,2147483647,-2147483648),r<0&&(r=4294967295+r+1),this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255,o+4},l.prototype.writeBigInt64LE=Se(function(r,o=0){return Si(this,r,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),l.prototype.writeBigInt64BE=Se(function(r,o=0){return fi(this,r,o,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function Ei(a,r,o,u,p,f){if(o+u>a.length)throw new RangeError("Index out of range");if(o<0)throw new RangeError("Index out of range")}function Bi(a,r,o,u,p){return r=+r,o=o>>>0,p||Ei(a,r,o,4),t.write(a,r,o,u,23,4),o+4}l.prototype.writeFloatLE=function(r,o,u){return Bi(this,r,o,!0,u)},l.prototype.writeFloatBE=function(r,o,u){return Bi(this,r,o,!1,u)};function mi(a,r,o,u,p){return r=+r,o=o>>>0,p||Ei(a,r,o,8),t.write(a,r,o,u,52,8),o+8}l.prototype.writeDoubleLE=function(r,o,u){return mi(this,r,o,!0,u)},l.prototype.writeDoubleBE=function(r,o,u){return mi(this,r,o,!1,u)},l.prototype.copy=function(r,o,u,p){if(!l.isBuffer(r))throw new TypeError("argument should be a Buffer");if(u||(u=0),!p&&p!==0&&(p=this.length),o>=r.length&&(o=r.length),o||(o=0),p>0&&p<u&&(p=u),p===u||r.length===0||this.length===0)return 0;if(o<0)throw new RangeError("targetStart out of bounds");if(u<0||u>=this.length)throw new RangeError("Index out of range");if(p<0)throw new RangeError("sourceEnd out of bounds");p>this.length&&(p=this.length),r.length-o<p-u&&(p=r.length-o+u);const f=p-u;return this===r&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(o,u,p):Uint8Array.prototype.set.call(r,this.subarray(u,p),o),f},l.prototype.fill=function(r,o,u,p){if(typeof r=="string"){if(typeof o=="string"?(p=o,o=0,u=this.length):typeof u=="string"&&(p=u,u=this.length),p!==void 0&&typeof p!="string")throw new TypeError("encoding must be a string");if(typeof p=="string"&&!l.isEncoding(p))throw new TypeError("Unknown encoding: "+p);if(r.length===1){const E=r.charCodeAt(0);(p==="utf8"&&E<128||p==="latin1")&&(r=E)}}else typeof r=="number"?r=r&255:typeof r=="boolean"&&(r=Number(r));if(o<0||this.length<o||this.length<u)throw new RangeError("Out of range index");if(u<=o)return this;o=o>>>0,u=u===void 0?this.length:u>>>0,r||(r=0);let f;if(typeof r=="number")for(f=o;f<u;++f)this[f]=r;else{const E=l.isBuffer(r)?r:l.from(r,p),q=E.length;if(q===0)throw new TypeError('The value "'+r+'" is invalid for argument "value"');for(f=0;f<u-o;++f)this[f+o]=E[f%q]}return this};const Ve={};function rs(a,r,o){Ve[a]=class extends o{constructor(){super(),Object.defineProperty(this,"message",{value:r.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${a}]`,this.stack,delete this.name}get code(){return a}set code(p){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:p,writable:!0})}toString(){return`${this.name} [${a}]: ${this.message}`}}}rs("ERR_BUFFER_OUT_OF_BOUNDS",function(a){return a?`${a} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),rs("ERR_INVALID_ARG_TYPE",function(a,r){return`The "${a}" argument must be of type number. Received type ${typeof r}`},TypeError),rs("ERR_OUT_OF_RANGE",function(a,r,o){let u=`The value of "${a}" is out of range.`,p=o;return Number.isInteger(o)&&Math.abs(o)>2**32?p=Di(String(o)):typeof o=="bigint"&&(p=String(o),(o>BigInt(2)**BigInt(32)||o<-(BigInt(2)**BigInt(32)))&&(p=Di(p)),p+="n"),u+=` It must be ${r}. Received ${p}`,u},RangeError);function Di(a){let r="",o=a.length;const u=a[0]==="-"?1:0;for(;o>=u+4;o-=3)r=`_${a.slice(o-3,o)}${r}`;return`${a.slice(0,o)}${r}`}function s1(a,r,o){Je(r,"offset"),(a[r]===void 0||a[r+o]===void 0)&&mt(r,a.length-(o+1))}function ki(a,r,o,u,p,f){if(a>o||a<r){const E=typeof r=="bigint"?"n":"";let q;throw r===0||r===BigInt(0)?q=`>= 0${E} and < 2${E} ** ${(f+1)*8}${E}`:q=`>= -(2${E} ** ${(f+1)*8-1}${E}) and < 2 ** ${(f+1)*8-1}${E}`,new Ve.ERR_OUT_OF_RANGE("value",q,a)}s1(u,p,f)}function Je(a,r){if(typeof a!="number")throw new Ve.ERR_INVALID_ARG_TYPE(r,"number",a)}function mt(a,r,o){throw Math.floor(a)!==a?(Je(a,o),new Ve.ERR_OUT_OF_RANGE("offset","an integer",a)):r<0?new Ve.ERR_BUFFER_OUT_OF_BOUNDS:new Ve.ERR_OUT_OF_RANGE("offset",`>= 0 and <= ${r}`,a)}const n1=/[^+/0-9A-Za-z-_]/g;function i1(a){if(a=a.split("=")[0],a=a.trim().replace(n1,""),a.length<2)return"";for(;a.length%4!==0;)a=a+"=";return a}function os(a,r){r=r||1/0;let o;const u=a.length;let p=null;const f=[];for(let E=0;E<u;++E){if(o=a.charCodeAt(E),o>55295&&o<57344){if(!p){if(o>56319){(r-=3)>-1&&f.push(239,191,189);continue}else if(E+1===u){(r-=3)>-1&&f.push(239,191,189);continue}p=o;continue}if(o<56320){(r-=3)>-1&&f.push(239,191,189),p=o;continue}o=(p-55296<<10|o-56320)+65536}else p&&(r-=3)>-1&&f.push(239,191,189);if(p=null,o<128){if((r-=1)<0)break;f.push(o)}else if(o<2048){if((r-=2)<0)break;f.push(o>>6|192,o&63|128)}else if(o<65536){if((r-=3)<0)break;f.push(o>>12|224,o>>6&63|128,o&63|128)}else if(o<1114112){if((r-=4)<0)break;f.push(o>>18|240,o>>12&63|128,o>>6&63|128,o&63|128)}else throw new Error("Invalid code point")}return f}function a1(a){const r=[];for(let o=0;o<a.length;++o)r.push(a.charCodeAt(o)&255);return r}function c1(a,r){let o,u,p;const f=[];for(let E=0;E<a.length&&!((r-=2)<0);++E)o=a.charCodeAt(E),u=o>>8,p=o%256,f.push(p),f.push(u);return f}function Ti(a){return e.toByteArray(i1(a))}function Qr(a,r,o,u){let p;for(p=0;p<u&&!(p+o>=r.length||p>=a.length);++p)r[p+o]=a[p];return p}function xA(a,r){return a instanceof r||a!=null&&a.constructor!=null&&a.constructor.name!=null&&a.constructor.name===r.name}function ss(a){return a!==a}const l1=(function(){const a="0123456789abcdef",r=new Array(256);for(let o=0;o<16;++o){const u=o*16;for(let p=0;p<16;++p)r[u+p]=a[o]+a[p]}return r})();function Se(a){return typeof BigInt>"u"?u1:a}function u1(){throw new Error("BigInt not supported")}})(oo)),oo}var re=Qa();const qs=new Array(256),so={},C=(A,e,t,s)=>{console.assert(!qs[t],"Duplicate instruction: "+A+" mode="+e),qs[t]={name:A,mode:e,bytes:s},so[A]||(so[A]=[]),so[A][e]=t};C("ADC",n.IMM,105,2),C("ADC",n.ZP_REL,101,2),C("ADC",n.ZP_X,117,2),C("ADC",n.ABS,109,3),C("ADC",n.ABS_X,125,3),C("ADC",n.ABS_Y,121,3),C("ADC",n.IND_X,97,2),C("ADC",n.IND_Y,113,2),C("ADC",n.IND,114,2),C("AND",n.IMM,41,2),C("AND",n.ZP_REL,37,2),C("AND",n.ZP_X,53,2),C("AND",n.ABS,45,3),C("AND",n.ABS_X,61,3),C("AND",n.ABS_Y,57,3),C("AND",n.IND_X,33,2),C("AND",n.IND_Y,49,2),C("AND",n.IND,50,2),C("ASL",n.IMPLIED,10,1),C("ASL",n.ZP_REL,6,2),C("ASL",n.ZP_X,22,2),C("ASL",n.ABS,14,3),C("ASL",n.ABS_X,30,3),C("BCC",n.ZP_REL,144,2),C("BCS",n.ZP_REL,176,2),C("BEQ",n.ZP_REL,240,2),C("BIT",n.ZP_REL,36,2),C("BIT",n.ABS,44,3),C("BIT",n.IMM,137,2),C("BIT",n.ZP_X,52,2),C("BIT",n.ABS_X,60,3),C("BMI",n.ZP_REL,48,2),C("BNE",n.ZP_REL,208,2),C("BPL",n.ZP_REL,16,2),C("BVC",n.ZP_REL,80,2),C("BVS",n.ZP_REL,112,2),C("BRA",n.ZP_REL,128,2),C("BRK",n.IMPLIED,0,1),C("CLC",n.IMPLIED,24,1),C("CLD",n.IMPLIED,216,1),C("CLI",n.IMPLIED,88,1),C("CLV",n.IMPLIED,184,1),C("CMP",n.IMM,201,2),C("CMP",n.ZP_REL,197,2),C("CMP",n.ZP_X,213,2),C("CMP",n.ABS,205,3),C("CMP",n.ABS_X,221,3),C("CMP",n.ABS_Y,217,3),C("CMP",n.IND_X,193,2),C("CMP",n.IND_Y,209,2),C("CMP",n.IND,210,2),C("CPX",n.IMM,224,2),C("CPX",n.ZP_REL,228,2),C("CPX",n.ABS,236,3),C("CPY",n.IMM,192,2),C("CPY",n.ZP_REL,196,2),C("CPY",n.ABS,204,3),C("DEC",n.IMPLIED,58,1),C("DEC",n.ZP_REL,198,2),C("DEC",n.ZP_X,214,2),C("DEC",n.ABS,206,3),C("DEC",n.ABS_X,222,3),C("DEX",n.IMPLIED,202,1),C("DEY",n.IMPLIED,136,1),C("EOR",n.IMM,73,2),C("EOR",n.ZP_REL,69,2),C("EOR",n.ZP_X,85,2),C("EOR",n.ABS,77,3),C("EOR",n.ABS_X,93,3),C("EOR",n.ABS_Y,89,3),C("EOR",n.IND_X,65,2),C("EOR",n.IND_Y,81,2),C("EOR",n.IND,82,2),C("INC",n.IMPLIED,26,1),C("INC",n.ZP_REL,230,2),C("INC",n.ZP_X,246,2),C("INC",n.ABS,238,3),C("INC",n.ABS_X,254,3),C("INX",n.IMPLIED,232,1),C("INY",n.IMPLIED,200,1),C("JMP",n.ABS,76,3),C("JMP",n.IND,108,3),C("JMP",n.IND_X,124,3),C("JSR",n.ABS,32,3),C("LDA",n.IMM,169,2),C("LDA",n.ZP_REL,165,2),C("LDA",n.ZP_X,181,2),C("LDA",n.ABS,173,3),C("LDA",n.ABS_X,189,3),C("LDA",n.ABS_Y,185,3),C("LDA",n.IND_X,161,2),C("LDA",n.IND_Y,177,2),C("LDA",n.IND,178,2),C("LDX",n.IMM,162,2),C("LDX",n.ZP_REL,166,2),C("LDX",n.ZP_Y,182,2),C("LDX",n.ABS,174,3),C("LDX",n.ABS_Y,190,3),C("LDY",n.IMM,160,2),C("LDY",n.ZP_REL,164,2),C("LDY",n.ZP_X,180,2),C("LDY",n.ABS,172,3),C("LDY",n.ABS_X,188,3),C("LSR",n.IMPLIED,74,1),C("LSR",n.ZP_REL,70,2),C("LSR",n.ZP_X,86,2),C("LSR",n.ABS,78,3),C("LSR",n.ABS_X,94,3),C("NOP",n.IMPLIED,234,1),C("ORA",n.IMM,9,2),C("ORA",n.ZP_REL,5,2),C("ORA",n.ZP_X,21,2),C("ORA",n.ABS,13,3),C("ORA",n.ABS_X,29,3),C("ORA",n.ABS_Y,25,3),C("ORA",n.IND_X,1,2),C("ORA",n.IND_Y,17,2),C("ORA",n.IND,18,2),C("PHA",n.IMPLIED,72,1),C("PHP",n.IMPLIED,8,1),C("PHX",n.IMPLIED,218,1),C("PHY",n.IMPLIED,90,1),C("PLA",n.IMPLIED,104,1),C("PLP",n.IMPLIED,40,1),C("PLX",n.IMPLIED,250,1),C("PLY",n.IMPLIED,122,1),C("ROL",n.IMPLIED,42,1),C("ROL",n.ZP_REL,38,2),C("ROL",n.ZP_X,54,2),C("ROL",n.ABS,46,3),C("ROL",n.ABS_X,62,3),C("ROR",n.IMPLIED,106,1),C("ROR",n.ZP_REL,102,2),C("ROR",n.ZP_X,118,2),C("ROR",n.ABS,110,3),C("ROR",n.ABS_X,126,3),C("RTI",n.IMPLIED,64,1),C("RTS",n.IMPLIED,96,1),C("SBC",n.IMM,233,2),C("SBC",n.ZP_REL,229,2),C("SBC",n.ZP_X,245,2),C("SBC",n.ABS,237,3),C("SBC",n.ABS_X,253,3),C("SBC",n.ABS_Y,249,3),C("SBC",n.IND_X,225,2),C("SBC",n.IND_Y,241,2),C("SBC",n.IND,242,2),C("SEC",n.IMPLIED,56,1),C("SED",n.IMPLIED,248,1),C("SEI",n.IMPLIED,120,1),C("STA",n.ZP_REL,133,2),C("STA",n.ZP_X,149,2),C("STA",n.ABS,141,3),C("STA",n.ABS_X,157,3),C("STA",n.ABS_Y,153,3),C("STA",n.IND_X,129,2),C("STA",n.IND_Y,145,2),C("STA",n.IND,146,2),C("STX",n.ZP_REL,134,2),C("STX",n.ZP_Y,150,2),C("STX",n.ABS,142,3),C("STY",n.ZP_REL,132,2),C("STY",n.ZP_X,148,2),C("STY",n.ABS,140,3),C("STZ",n.ZP_REL,100,2),C("STZ",n.ZP_X,116,2),C("STZ",n.ABS,156,3),C("STZ",n.ABS_X,158,3),C("TAX",n.IMPLIED,170,1),C("TAY",n.IMPLIED,168,1),C("TSX",n.IMPLIED,186,1),C("TXA",n.IMPLIED,138,1),C("TXS",n.IMPLIED,154,1),C("TYA",n.IMPLIED,152,1),C("TRB",n.ZP_REL,20,2),C("TRB",n.ABS,28,3),C("TSB",n.ZP_REL,4,2),C("TSB",n.ABS,12,3);const ba=65536,Us=65792,Ks=66048,Os=()=>{const A={register:"",address:768,operator:"==",value:128},e={action:"",register:"A",address:768,value:0};return{address:-1,watchpoint:!1,instruction:!1,disabled:!1,hidden:!1,once:!1,memget:!1,memset:!0,expression1:{...A},expression2:{...A},expressionOperator:"",hexvalue:-1,hitcount:1,nhits:0,memoryBank:"",action1:{...e},action2:{...e},halt:!1,basic:!1}};class no extends Map{set(e,t){const s=[...this.entries()];s.push([e,t]),s.sort((i,I)=>i[0]-I[0]),super.clear();for(const[i,I]of s)super.set(i,I);return this}}const tA={};tA[""]={name:"Any",min:0,max:65535},tA.MAIN={name:"Main RAM ($0 - $FFFF)",min:0,max:65535},tA.AUX={name:"Auxiliary RAM ($0 - $FFFF)",min:0,max:65535},tA.ROM={name:"ROM ($D000 - $FFFF)",min:53248,max:65535},tA["MAIN-DXXX-1"]={name:"Main D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343},tA["MAIN-DXXX-2"]={name:"Main D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343},tA["AUX-DXXX-1"]={name:"Aux D000 Bank 1 ($D000 - $DFFF)",min:53248,max:57343},tA["AUX-DXXX-2"]={name:"Aux D000 Bank 2 ($D000 - $DFFF)",min:53248,max:57343},tA["CXXX-ROM"]={name:"Internal ROM ($C100 - $CFFF)",min:49408,max:53247},tA["CXXX-CARD"]={name:"Peripheral Card ROM ($C100 - $CFFF)",min:49408,max:53247},Object.values(tA).map(A=>A.name);const Ma=(A,e)=>A+2+(e>127?e-256:e),La=(A,e)=>{if(e<0)return!1;let t=!1;switch(A){case"BCS":t=(e&1)!==0;break;case"BCC":t=(e&1)===0;break;case"BEQ":t=(e&2)!==0;break;case"BNE":t=(e&2)===0;break;case"BMI":t=(e&128)!==0;break;case"BPL":t=(e&128)===0;break;case"BVS":t=(e&64)!==0;break;case"BVC":t=(e&64)===0;break;case"BRA":t=!0;break}return t},Ys=(A,e,t,s,i)=>{if(A>>8===192){let Q="---";return A>=49168&&A<=49183&&(Q=e.pcode>=128?"ON":"OFF"),`${W(A,4)}: ${W(e.pcode)}        ${Q}`}let I="",h=`${W(e.pcode)}`,l="",m="";switch(e.bytes){case 1:h+="      ";break;case 2:l=W(t),h+=` ${l}   `;break;case 3:l=W(t),m=W(s),h+=` ${l} ${m}`;break}let D="";i>=0&&Dt(e.name)&&(D=La(e.name,i)?"  ✓":"  ✗");const k=Dt(e.name)?W(Ma(A,t),4):l;switch(e.mode){case n.IMPLIED:break;case n.IMM:I=` #$${l}`;break;case n.ZP_REL:I=` $${k}`;break;case n.ZP_X:I=` $${l},X`;break;case n.ZP_Y:I=` $${l},Y`;break;case n.ABS:I=` $${m}${l}`;break;case n.ABS_X:I=` $${m}${l},X`;break;case n.ABS_Y:I=` $${m}${l},Y`;break;case n.IND_X:I=` ($${m.trim()}${l},X)`;break;case n.IND_Y:I=` ($${l}),Y`;break;case n.IND:I=` ($${m.trim()}${l})`;break}return`${W(A,4)}: ${h}  ${e.name}${I}${D}`},io={numLines:1e4,collapseLoops:!0,ignoreRegisters:!1};let Qt=!1,ao=!1,uA=new no;const bt=()=>{Qt=!0},Fa=()=>{new no(uA).forEach((s,i)=>{s.once&&uA.delete(i)});const e=hc();if(e<0||uA.get(e))return;const t=Os();t.address=e,t.once=!0,t.hidden=!0,uA.set(e,t)},qa=()=>{new no(uA).forEach((s,i)=>{s.once&&uA.delete(i)});const e=55301,t=Os();t.address=e,t.once=!0,t.hidden=!0,uA.set(e,t)},Ua=A=>{uA=A};let Ws=!1;const Ka=()=>{Ws=!0,tA.MAIN.enabled=(A=0)=>A>=53248?!S.ALTZP.isSet&&S.BSRREADRAM.isSet:A>=512?!S.RAMRD.isSet:!S.ALTZP.isSet,tA.AUX.enabled=(A=0)=>A>=53248?S.ALTZP.isSet&&S.BSRREADRAM.isSet:A>=512?S.RAMRD.isSet:S.ALTZP.isSet,tA.ROM.enabled=()=>!S.BSRREADRAM.isSet,tA["MAIN-DXXX-1"].enabled=()=>!S.ALTZP.isSet&&S.BSRREADRAM.isSet&&!S.BSRBANK2.isSet,tA["MAIN-DXXX-2"].enabled=()=>!S.ALTZP.isSet&&S.BSRREADRAM.isSet&&S.BSRBANK2.isSet,tA["AUX-DXXX-1"].enabled=()=>S.ALTZP.isSet&&S.BSRREADRAM.isSet&&!S.BSRBANK2.isSet,tA["AUX-DXXX-2"].enabled=()=>S.ALTZP.isSet&&S.BSRREADRAM.isSet&&S.BSRBANK2.isSet,tA["CXXX-ROM"].enabled=(A=0)=>A>=49920&&A<=50175?S.INTCXROM.isSet||!S.SLOTC3ROM.isSet:A>=51200?S.INTCXROM.isSet||S.INTC8ROM.isSet:S.INTCXROM.isSet,tA["CXXX-CARD"].enabled=(A=0)=>A>=49920&&A<=50175?S.INTCXROM.isSet?!1:S.SLOTC3ROM.isSet:A>=51200?!S.INTCXROM.isSet&&!S.INTC8ROM.isSet:!S.INTCXROM.isSet},Ns=(A,e)=>{Ws||Ka();const t=tA[A];return!(e<t.min||e>t.max||t.enabled&&!t?.enabled(e))},Gs=(A,e,t)=>{const s=uA.get(A);return!s||!s.watchpoint||s.disabled||s.hexvalue>=0&&s.hexvalue!==e||s.memoryBank&&!Ns(s.memoryBank,A)?!1:t?s.memset:s.memget},$e=(A=0,e=!0)=>{e?c.flagIRQ|=1<<A:c.flagIRQ&=~(1<<A),c.flagIRQ&=255},Oa=(A=!0)=>{c.flagNMI=A===!0},Ya=()=>{c.flagIRQ=0,c.flagNMI=!1},co=[],_s=[],Xs=(A,e)=>{co.push(A),_s.push(e)},Wa=()=>{for(let A=0;A<co.length;A++)co[A](_s[A])},Zs=A=>{let e=0;switch(A.register){case"$":e=rc(A.address);break;case"A":e=c.Accum;break;case"X":e=c.XReg;break;case"Y":e=c.YReg;break;case"S":e=c.StackPtr;break;case"P":e=c.PStatus;break;case"C":e=c.PC;break}switch(A.operator){case"==":return e===A.value;case"!=":return e!==A.value;case"<":return e<A.value;case"<=":return e<=A.value;case">":return e>A.value;case">=":return e>=A.value}},Na=A=>{const e=Zs(A.expression1);return A.expressionOperator===""?e:A.expressionOperator==="&&"&&!e?!1:A.expressionOperator==="||"&&e?!0:Zs(A.expression2)},xs=()=>{ao=!0},Ga=(A,e,t)=>{const s=Ys(c.PC,{...t},A,e,c.PStatus)+"          ",I=`${("0000000000"+c.cycleCount.toString()).slice(-10)}  ${s.slice(0,29)}  ${cn()}`;console.log(I)},Vs=(A,e,t,s)=>{if(A.action==="")return!1;const i=A.value&255,I=A.address&65535;switch(A.action){case"set":switch(A.register){case"A":c.Accum=i;break;case"X":c.XReg=i;break;case"Y":c.YReg=i;break;case"S":c.StackPtr=i;break;case"P":c.PStatus=i;break;case"C":c.PC=A.value&65535;break}break;case"jump":c.PC=I;break;case"print":Ga(e,t,s);break;case"snapshot":ts();break}return!0},_a=(A,e,t,s)=>{const i=Vs(A.action1,e,t,s),I=Vs(A.action2,e,t,s);return i||I?A.halt?1:2:A.hidden?3:1},Xa=(A=-1,e=0,t=0,s=null)=>{if(ao)return ao=!1,1;if(uA.size===0||Qt)return 0;if(c.PC===55301){const I=B(117)+(B(118)<<8),h=uA.get(I);if(h&&!h.disabled)return 3}const i=uA.get(c.PC)||uA.get(-1)||uA.get(A|ba)||A>=0&&uA.get(Us)||A>=0&&uA.get(Ks);if(!i||i.disabled||i.watchpoint)return 0;if(i.instruction){const I=(t<<8)+e;if(i.address===Us){if(v[A].name!=="???")return 0}else if(i.address===Ks){if(v[A].is6502)return 0}else if(I>=0&&i.hexvalue>=0&&i.hexvalue!==I)return 0}if(i.expression1.register!==""&&!Na(i))return 0;if(i.hitcount>1){if(i.nhits++,i.nhits<i.hitcount)return 0;i.nhits=0}return i.memoryBank&&!Ns(i.memoryBank,c.PC)?0:(i.once&&uA.delete(c.PC),_a(i,e,t,s))},lo=(A=null)=>{let e=0;const t=c.PC,s=B(c.PC,!1),i=v[s],I=i.bytes>1?B(c.PC+1,!1):-1,h=i.bytes>2?B(c.PC+2,!1):0;if(!T0()){const m=Xa(s,I,h,i);if(m===1||m===3)return YA(_.PAUSED,m!==3),-1;if(m===2)return c.PC===t&&(Qt=!0),0;Qt=!1}const l=$s.get(t);if(l&&(!S.INTCXROM.isSet||(t&61440)!==49152)&&l(),e=i.execute(I,h),A&&(t<64680||t>64691)){const m=Ys(t,i,I,h,c.PStatus)+"          ";let k=`${("00000000"+c.cycleCount.toString()).slice(-8)}  ${m.slice(0,29)}  ${cn()}`,Q=k.indexOf("JMP");if(Q===-1&&(Q=k.indexOf("RTS")),Q!==-1){let F=k.slice(Q,Q+15);F=F.replaceAll(" ","_"),k=k.slice(0,Q)+F+k.slice(Q+15)}A(k)}if(nn(i.bytes),ot(c.cycleCount+e),Wa(),c.flagNMI&&(c.flagNMI=!1,e=Cc(),ot(c.cycleCount+e)),c.flagIRQ){const m=pc();m>0&&(ot(c.cycleCount+m),e=m)}return e},Za=[197,58,163,92,197,58,163,92],xa=1,Js=4;class Va{bits=[];pattern=new Array(64);patternIdx=0;constructor(){}reset=()=>{this.patternIdx=0};checkPattern=e=>{const s=Za[Math.floor(this.patternIdx/8)]>>this.patternIdx%8&1;return e===s};calcBits=()=>{const e=F=>{this.bits.push(F&8?1:0),this.bits.push(F&4?1:0),this.bits.push(F&2?1:0),this.bits.push(F&1?1:0)},t=F=>{e(Math.floor(F/10)),e(Math.floor(F%10))},s=new Date,i=s.getFullYear()%100,I=s.getDate(),h=s.getDay()+1,l=s.getMonth()+1,m=s.getHours(),D=s.getMinutes(),k=s.getSeconds(),Q=s.getMilliseconds()/10;this.bits=[],t(i),t(l),t(I),t(h),t(m),t(D),t(k),t(Q)};access=e=>{e&Js?this.reset():this.checkPattern(e&xa)?(this.patternIdx++,this.patternIdx===64&&this.calcBits()):this.reset()};read=e=>{let t=-1;return this.bits.length>0?e&Js&&(t=this.bits.pop()):this.access(e),t}}const Ja=new Va,js=320,Hs=327,Mt=256*js,ja=256*Hs;let QA=0;const uo=98048;let y=new Uint8Array(uo+(QA+1)*65536).fill(0);const Io=new Uint8Array(8).fill(0),ho=()=>pA(49194),Lt=A=>{Z(49194,A)},de=()=>pA(49267),go=A=>{Z(49267,A)},rA=new Array(257).fill(0),bA=new Array(257).fill(0);let vs="APPLE2EE";const Ha=()=>vs,zs=A=>{vs=A;let e="";switch(A){case"APPLE2P":e=da;break;case"APPLE2EU":e=ya;break;case"APPLE2EE":e=wa;break}const t=e.replace(/\n/g,""),s=new Uint8Array(re.Buffer.from(t,"base64"));s[15035]=5,y.set(s,65536)},po=A=>{A=Math.max(64,Math.min(8192,A));const e=QA;if(QA=Math.floor(A/64)-1,QA===e)return;de()>QA&&(go(0),VA());const t=uo+(QA+1)*65536;if(QA<e)y=y.slice(0,t);else{const s=y;y=new Uint8Array(t).fill(255),y.set(s)}},va=()=>{const A=S.RAMRD.isSet?383+de()*256:0,e=S.RAMWRT.isSet?383+de()*256:0,t=S.PAGE2.isSet?383+de()*256:0,s=S.STORE80.isSet?t:A,i=S.STORE80.isSet?t:e,I=S.STORE80.isSet&&S.HIRES.isSet?t:A,h=S.STORE80.isSet&&S.HIRES.isSet?t:e;for(let l=2;l<256;l++)rA[l]=l+A,bA[l]=l+e;for(let l=4;l<=7;l++)rA[l]=l+s,bA[l]=l+i;for(let l=32;l<=63;l++)rA[l]=l+I,bA[l]=l+h},za=()=>{const A=S.ALTZP.isSet?383+de()*256:0;if(rA[0]=A,rA[1]=1+A,bA[0]=A,bA[1]=1+A,S.BSRREADRAM.isSet){for(let e=208;e<=255;e++)rA[e]=e+A;if(!S.BSRBANK2.isSet)for(let e=208;e<=223;e++)rA[e]=e-16+A}else for(let e=208;e<=255;e++)rA[e]=256+e-192},$a=()=>{const A=S.ALTZP.isSet?383+de()*256:0,e=S.BSR_WRITE.isSet;for(let t=192;t<=255;t++)bA[t]=-1;if(e){for(let t=208;t<=255;t++)bA[t]=t+A;if(!S.BSRBANK2.isSet)for(let t=208;t<=223;t++)bA[t]=t-16+A}},Co=A=>S.INTCXROM.isSet?!1:A!==3?!0:S.SLOTC3ROM.isSet,Ac=()=>!!(S.INTCXROM.isSet||S.INTC8ROM.isSet),So=A=>{if(A<=7){if(S.INTCXROM.isSet)return;A===3&&!S.SLOTC3ROM.isSet&&(S.INTC8ROM.isSet||(S.INTC8ROM.isSet=!0,Lt(255),VA())),ho()===0&&en[A]&&(Lt(A),VA())}else S.INTC8ROM.isSet=!1,Lt(0),VA()},ec=()=>{rA[192]=64;for(let A=1;A<=7;A++){const e=192+A;rA[e]=A+(Co(A)?js-1:256)}if(Ac())for(let A=200;A<=207;A++)rA[A]=256+A-192;else{const A=Hs+8*(ho()-1);for(let e=0;e<=7;e++){const t=200+e;rA[t]=A+e}}},VA=()=>{va(),za(),$a(),ec();for(let A=0;A<256;A++)rA[A]=256*rA[A],bA[A]=256*bA[A]},$s=new Map,An=new Array(8),en=new Uint8Array(8),Ft=(A,e=-1)=>{const t=A>>8===192?A-49280>>4:(A>>8)-192;if(A>=49408&&(So(t),!Co(t)))return;const s=An[t];if(s!==void 0){const i=s(A,e);if(i>=0){const I=A>=49408?Mt-256:65536;y[A-49152+I]=i}}},At=(A,e)=>{Io[A]=1,An[A]=e},Ke=(A,e,t=0,s=()=>{})=>{if(y.set(e.slice(0,256),Mt+(A-1)*256),Io[A]=e.some(i=>i!==0)?1:0,e.length>256){const i=e.length>2304?2304:e.length,I=ja+(A-1)*2048;y.set(e.slice(256,i),I),en[A]=255}t&&$s.set(t,s)},tn=()=>{y.fill(255,0,65536),y.fill(255,uo),Lt(0),go(0),VA()},tc=A=>(A>=49296?Ft(A):bs(A,!1,c.cycleCount),A>=49232&&VA(),y[65536+A-49152]),V=(A,e)=>{const t=Mt+(A-1)*256+(e&255);return y[t]},N=(A,e,t)=>{if(t>=0){const s=Mt+(A-1)*256+(e&255);y[s]=t&255}},B=(A,e=!0)=>{let t=0;const s=A>>>8;if(s===192)t=tc(A);else if(t=-1,s>=193&&s<=199?(s==195&&(S.INTCXROM.isSet||!S.SLOTC3ROM.isSet)?t=Ja.read(A):Co(s-192)&&!Io[s-192]&&(t=Math.floor(256*Math.random())),Ft(A)):A===53247&&So(255),t<0){const i=rA[s];t=y[i+(A&255)]}return e&&Gs(A,t,!1)&&xs(),t},rc=A=>{const e=A>>>8,t=rA[e];return y[t+(A&255)]},oc=(A,e)=>{if(A===49265||A===49267){if(e>QA)return;go(e)}else A>=49296?Ft(A,e):bs(A,!0,c.cycleCount);(A<=49167||A>=49232)&&VA()},T=(A,e)=>{const t=A>>>8;if(t===192)oc(A,e);else{t>=193&&t<=199?Ft(A,e):A===53247&&So(255);const s=bA[t];if(s<0)return;y[s+(A&255)]=e}Gs(A,e,!0)&&xs()},pA=A=>y[65536+A-49152],Z=(A,e,t=1)=>{const s=65536+A-49152;y.fill(e,s,s+t)},fo=1024,rn=2048,qt=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],Eo=(A=!1)=>{let e=0,t=24,s=!1;if(A){if(S.TEXT.isSet||S.HIRES.isSet)return new Uint8Array;t=S.MIXED.isSet?20:24,s=S.COLUMN80.isSet&&S.DHIRES.isSet}else{if(!S.TEXT.isSet&&!S.MIXED.isSet)return new Uint8Array;!S.TEXT.isSet&&S.MIXED.isSet&&(e=20),s=S.COLUMN80.isSet}if(s){const l=S.PAGE2.isSet&&!S.STORE80.isSet?rn:fo,m=new Uint8Array(80*(t-e)).fill(160);for(let D=e;D<t;D++){const k=80*(D-e);for(let Q=0;Q<40;Q++)m[k+2*Q+1]=y[l+qt[D]+Q],m[k+2*Q]=y[98048+l+qt[D]+Q]}return m}if(S.DHIRES.isSet&&!S.COLUMN80.isSet&&S.STORE80.isSet){const l=new Uint8Array(80*(t-e));for(let m=e;m<t;m++){const D=80*(m-e);let k=fo+qt[m];l.set(y.slice(k,k+40),D),k+=98048,l.set(y.slice(k,k+40),D+40)}return l}const I=S.PAGE2.isSet&&!S.STORE80.isSet?rn:fo,h=new Uint8Array(40*(t-e));for(let l=e;l<t;l++){const m=40*(l-e),D=I+qt[l];h.set(y.slice(D,D+40),m)}return h},Bo=()=>re.Buffer.from(Eo().map(A=>A&=127)).toString(),mo=new Uint8Array(7680),Do=new Uint8Array(15360);let Ut=mo,Kt=192;const sc=A=>{const e=S.DHIRES.isSet&&S.COLUMN80.isSet,t=S.DHIRES.isSet&&!S.COLUMN80.isSet&&S.STORE80.isSet;if(e||S.VIDEO7_MONO.isSet||S.VIDEO7_160.isSet||t){A===0&&(Ut=Do,Kt=S.MIXED.isSet?160:192);const s=S.PAGE2.isSet&&!S.STORE80.isSet?16384:8192,i=bi(s,A);for(let I=0;I<40;I++)Do[A*80+2*I+1]=y[i+I],Do[A*80+2*I]=y[98048+i+I]}else{A===0&&(Ut=mo,Kt=S.MIXED.isSet?160:192);const i=(S.PAGE2.isSet?16384:8192)+40*Math.trunc(A/64)+1024*(A%8)+128*(Math.trunc(A/8)&7);mo.set(y.slice(i,i+40),A*40)}},nc=()=>S.TEXT.isSet||!S.HIRES.isSet?new Uint8Array:Kt===192?Ut:Ut.slice(0,40*Kt),Ot=A=>{const e=rA[A>>>8]+(A&255);return y.slice(e,e+512)},Yt=(A,e)=>{const t=bA[A>>>8]+(A&255);y.set(e,t)},ko=(A,e)=>{for(let t=0;t<e.length;t++)if(B(A+t,!1)!==e[t])return!1;return!0},on=()=>{const A=rA[0];return y.slice(A,A+256)},ic=()=>y.slice(0,163584),ac=()=>{const A=new Uint8Array(65536);for(let e=0;e<256;e++){const t=rA[e];A.set(y.slice(t,t+256),e*256)}return A},c=wi(),et=A=>{c.Accum=A},tt=A=>{c.XReg=A},rt=A=>{c.YReg=A},ot=A=>{c.cycleCount=A},To=A=>{sn(),Object.assign(c,A)},sn=()=>{c.Accum=0,c.XReg=0,c.YReg=0,c.PStatus=36,c.StackPtr=255,GA(B(65533,!1)*256+B(65532,!1)),c.flagIRQ=0,c.flagNMI=!1},nn=A=>{GA((c.PC+A+65536)%65536)},GA=A=>{c.PC=A},an=A=>{c.PStatus=A|48},cc=A=>(A&128?"N":".")+(A&64?"V":".")+(A&16?"B":".")+(A&8?"D":".")+(A&4?"I":".")+(A&2?"Z":".")+(A&1?"C":"."),cn=()=>`${W(c.Accum)}  ${W(c.XReg)}  ${W(c.YReg)}  ${W(c.StackPtr)}  ${W(c.PStatus)}  ${cc(c.PStatus)}`,qA=new Array(256).fill(""),lc=()=>{let A=0;for(;A<256&&qA[A]==="";)A++;return qA.slice(A,256)},uc=A=>{qA.splice(256-A.length,A.length,...A)},Ic=()=>{const A=Ot(256).slice(0,256),e=new Array;for(let t=255;t>c.StackPtr;t--){let s="$"+W(A[t]),i=qA[t];qA[t].length>3&&t-1>c.StackPtr&&(qA[t-1]==="JSR"||qA[t-1]==="BRK"||qA[t-1]==="IRQ"?(t--,s+=W(A[t])):i=""),s=(s+"   ").substring(0,6),e.push(W(256+t,4)+": "+s+i)}return e.join(`
`)},hc=()=>{const A=Ot(256).slice(0,256);for(let e=c.StackPtr-2;e<=255;e++){const t=A[e];if(qA[e].startsWith("JSR")&&e-1>c.StackPtr&&qA[e-1]==="JSR"){const s=A[e-1]+1;return(t<<8)+s}}return-1},JA=(A,e)=>{qA[c.StackPtr]=A,T(256+c.StackPtr,e),c.StackPtr=(c.StackPtr+255)%256},jA=()=>{c.StackPtr=(c.StackPtr+1)%256;const A=B(256+c.StackPtr);if(isNaN(A))throw new Error("illegal stack value");return A},MA=()=>(c.PStatus&1)!==0,O=(A=!0)=>c.PStatus=A?c.PStatus|1:c.PStatus&254,ln=()=>(c.PStatus&2)!==0,st=(A=!0)=>c.PStatus=A?c.PStatus|2:c.PStatus&253,gc=()=>(c.PStatus&4)!==0,wo=(A=!0)=>c.PStatus=A?c.PStatus|4:c.PStatus&251,un=()=>(c.PStatus&8)!==0,nA=()=>un()?1:0,yo=(A=!0)=>c.PStatus=A?c.PStatus|8:c.PStatus&247,Ro=(A=!0)=>c.PStatus=A?c.PStatus|16:c.PStatus&239,In=()=>(c.PStatus&64)!==0,nt=(A=!0)=>c.PStatus=A?c.PStatus|64:c.PStatus&191,hn=()=>(c.PStatus&128)!==0,gn=(A=!0)=>c.PStatus=A?c.PStatus|128:c.PStatus&127,b=A=>{st(A===0),gn(A>=128)},K=(A,e)=>(A+e+256)%256,d=(A,e)=>e*256+A,G=(A,e,t)=>(e*256+A+t+65536)%65536,$=(A,e)=>A>>8!==e>>8?1:0,HA=(A,e)=>{if(A){const t=c.PC;return nn(e>127?e-256:e),3+$(t+2,c.PC+2)}return 2},v=new Array(256),g=(A,e,t,s,i,I=!1)=>{console.assert(!v[t],"Duplicate instruction: "+A+" mode="+e),v[t]={name:A,pcode:t,mode:e,bytes:s,execute:i,is6502:!I}},J=!0,oe=(A,e,t)=>{const s=B(A),i=B((A+1)%256),I=G(s,i,c.YReg);e(I);let h=5+$(I,d(s,i));return t&&(h+=nA()),h},se=(A,e,t)=>{const s=B(A),i=B((A+1)%256),I=d(s,i);e(I);let h=5;return t&&(h+=nA()),h},pn=A=>{let e=(c.Accum&15)+(A&15)+(MA()?1:0);e>=10&&(e+=6);let t=(c.Accum&240)+(A&240)+e;const s=c.Accum<=127&&A<=127,i=c.Accum>=128&&A>=128;nt((t&255)>=128?s:i),O(t>=160),MA()&&(t+=96),c.Accum=t&255,b(c.Accum)},Wt=A=>{let e=c.Accum+A+(MA()?1:0);O(e>=256),e=e%256;const t=c.Accum<=127&&A<=127,s=c.Accum>=128&&A>=128;nt(e>=128?t:s),c.Accum=e,b(c.Accum)},ne=A=>{un()?pn(B(A)):Wt(B(A))};g("ADC",n.IMM,105,2,A=>(nA()?pn(A):Wt(A),2+nA())),g("ADC",n.ZP_REL,101,2,A=>(ne(A),3+nA())),g("ADC",n.ZP_X,117,2,A=>(ne(K(A,c.XReg)),4+nA())),g("ADC",n.ABS,109,3,(A,e)=>(ne(d(A,e)),4+nA())),g("ADC",n.ABS_X,125,3,(A,e)=>{const t=G(A,e,c.XReg);return ne(t),4+nA()+$(t,d(A,e))}),g("ADC",n.ABS_Y,121,3,(A,e)=>{const t=G(A,e,c.YReg);return ne(t),4+nA()+$(t,d(A,e))}),g("ADC",n.IND_X,97,2,A=>{const e=K(A,c.XReg);return ne(d(B(e),B(e+1))),6+nA()}),g("ADC",n.IND_Y,113,2,A=>oe(A,ne,!0)),g("ADC",n.IND,114,2,A=>se(A,ne,!0),J);const ie=A=>{c.Accum&=B(A),b(c.Accum)};g("AND",n.IMM,41,2,A=>(c.Accum&=A,b(c.Accum),2)),g("AND",n.ZP_REL,37,2,A=>(ie(A),3)),g("AND",n.ZP_X,53,2,A=>(ie(K(A,c.XReg)),4)),g("AND",n.ABS,45,3,(A,e)=>(ie(d(A,e)),4)),g("AND",n.ABS_X,61,3,(A,e)=>{const t=G(A,e,c.XReg);return ie(t),4+$(t,d(A,e))}),g("AND",n.ABS_Y,57,3,(A,e)=>{const t=G(A,e,c.YReg);return ie(t),4+$(t,d(A,e))}),g("AND",n.IND_X,33,2,A=>{const e=K(A,c.XReg);return ie(d(B(e),B(e+1))),6}),g("AND",n.IND_Y,49,2,A=>oe(A,ie,!1)),g("AND",n.IND,50,2,A=>se(A,ie,!1),J);const Nt=A=>{let e=B(A);B(A),O((e&128)===128),e=(e<<1)%256,T(A,e),b(e)};g("ASL",n.IMPLIED,10,1,()=>(O((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256,b(c.Accum),2)),g("ASL",n.ZP_REL,6,2,A=>(Nt(A),5)),g("ASL",n.ZP_X,22,2,A=>(Nt(K(A,c.XReg)),6)),g("ASL",n.ABS,14,3,(A,e)=>(Nt(d(A,e)),6)),g("ASL",n.ABS_X,30,3,(A,e)=>{const t=G(A,e,c.XReg);return Nt(t),6+$(t,d(A,e))}),g("BCC",n.ZP_REL,144,2,A=>HA(!MA(),A)),g("BCS",n.ZP_REL,176,2,A=>HA(MA(),A)),g("BEQ",n.ZP_REL,240,2,A=>HA(ln(),A)),g("BMI",n.ZP_REL,48,2,A=>HA(hn(),A)),g("BNE",n.ZP_REL,208,2,A=>HA(!ln(),A)),g("BPL",n.ZP_REL,16,2,A=>HA(!hn(),A)),g("BVC",n.ZP_REL,80,2,A=>HA(!In(),A)),g("BVS",n.ZP_REL,112,2,A=>HA(In(),A)),g("BRA",n.ZP_REL,128,2,A=>HA(!0,A),J);const Gt=A=>{st((c.Accum&A)===0),gn((A&128)!==0),nt((A&64)!==0)};g("BIT",n.ZP_REL,36,2,A=>(Gt(B(A)),3)),g("BIT",n.ABS,44,3,(A,e)=>(Gt(B(d(A,e))),4)),g("BIT",n.IMM,137,2,A=>(st((c.Accum&A)===0),2),J),g("BIT",n.ZP_X,52,2,A=>(Gt(B(K(A,c.XReg))),4),J),g("BIT",n.ABS_X,60,3,(A,e)=>{const t=G(A,e,c.XReg);return Gt(B(t)),4+$(t,d(A,e))},J);const Po=(A,e,t=0)=>{const s=(c.PC+t)%65536,i=B(e),I=B(e+1);JA(`${A} $`+W(I)+W(i),Math.trunc(s/256)),JA(A,s%256),JA("P",c.PStatus),yo(!1),wo();const h=G(i,I,A==="BRK"?-1:0);GA(h)},Cn=()=>(Ro(),Po("BRK",65534,2),7);g("BRK",n.IMPLIED,0,1,Cn);const pc=()=>gc()?0:(Ro(!1),Po("IRQ",65534),7),Cc=()=>(Po("NMI",65530),7);g("CLC",n.IMPLIED,24,1,()=>(O(!1),2)),g("CLD",n.IMPLIED,216,1,()=>(yo(!1),2)),g("CLI",n.IMPLIED,88,1,()=>(wo(!1),2)),g("CLV",n.IMPLIED,184,1,()=>(nt(!1),2));const we=A=>{const e=B(A);O(c.Accum>=e),b((c.Accum-e+256)%256)},Sc=A=>{const e=B(A);O(c.Accum>=e),b((c.Accum-e+256)%256)};g("CMP",n.IMM,201,2,A=>(O(c.Accum>=A),b((c.Accum-A+256)%256),2)),g("CMP",n.ZP_REL,197,2,A=>(we(A),3)),g("CMP",n.ZP_X,213,2,A=>(we(K(A,c.XReg)),4)),g("CMP",n.ABS,205,3,(A,e)=>(we(d(A,e)),4)),g("CMP",n.ABS_X,221,3,(A,e)=>{const t=G(A,e,c.XReg);return Sc(t),4+$(t,d(A,e))}),g("CMP",n.ABS_Y,217,3,(A,e)=>{const t=G(A,e,c.YReg);return we(t),4+$(t,d(A,e))}),g("CMP",n.IND_X,193,2,A=>{const e=K(A,c.XReg);return we(d(B(e),B(e+1))),6}),g("CMP",n.IND_Y,209,2,A=>oe(A,we,!1)),g("CMP",n.IND,210,2,A=>se(A,we,!1),J);const Sn=A=>{const e=B(A);O(c.XReg>=e),b((c.XReg-e+256)%256)};g("CPX",n.IMM,224,2,A=>(O(c.XReg>=A),b((c.XReg-A+256)%256),2)),g("CPX",n.ZP_REL,228,2,A=>(Sn(A),3)),g("CPX",n.ABS,236,3,(A,e)=>(Sn(d(A,e)),4));const fn=A=>{const e=B(A);O(c.YReg>=e),b((c.YReg-e+256)%256)};g("CPY",n.IMM,192,2,A=>(O(c.YReg>=A),b((c.YReg-A+256)%256),2)),g("CPY",n.ZP_REL,196,2,A=>(fn(A),3)),g("CPY",n.ABS,204,3,(A,e)=>(fn(d(A,e)),4));const _t=A=>{const e=K(B(A),-1);T(A,e),b(e)};g("DEC",n.IMPLIED,58,1,()=>(c.Accum=K(c.Accum,-1),b(c.Accum),2),J),g("DEC",n.ZP_REL,198,2,A=>(_t(A),5)),g("DEC",n.ZP_X,214,2,A=>(_t(K(A,c.XReg)),6)),g("DEC",n.ABS,206,3,(A,e)=>(_t(d(A,e)),6)),g("DEC",n.ABS_X,222,3,(A,e)=>{const t=G(A,e,c.XReg);return B(t),_t(t),7}),g("DEX",n.IMPLIED,202,1,()=>(c.XReg=K(c.XReg,-1),b(c.XReg),2)),g("DEY",n.IMPLIED,136,1,()=>(c.YReg=K(c.YReg,-1),b(c.YReg),2));const ae=A=>{c.Accum^=B(A),b(c.Accum)};g("EOR",n.IMM,73,2,A=>(c.Accum^=A,b(c.Accum),2)),g("EOR",n.ZP_REL,69,2,A=>(ae(A),3)),g("EOR",n.ZP_X,85,2,A=>(ae(K(A,c.XReg)),4)),g("EOR",n.ABS,77,3,(A,e)=>(ae(d(A,e)),4)),g("EOR",n.ABS_X,93,3,(A,e)=>{const t=G(A,e,c.XReg);return ae(t),4+$(t,d(A,e))}),g("EOR",n.ABS_Y,89,3,(A,e)=>{const t=G(A,e,c.YReg);return ae(t),4+$(t,d(A,e))}),g("EOR",n.IND_X,65,2,A=>{const e=K(A,c.XReg);return ae(d(B(e),B(e+1))),6}),g("EOR",n.IND_Y,81,2,A=>oe(A,ae,!1)),g("EOR",n.IND,82,2,A=>se(A,ae,!1),J);const Xt=A=>{const e=K(B(A),1);T(A,e),b(e)};g("INC",n.IMPLIED,26,1,()=>(c.Accum=K(c.Accum,1),b(c.Accum),2),J),g("INC",n.ZP_REL,230,2,A=>(Xt(A),5)),g("INC",n.ZP_X,246,2,A=>(Xt(K(A,c.XReg)),6)),g("INC",n.ABS,238,3,(A,e)=>(Xt(d(A,e)),6)),g("INC",n.ABS_X,254,3,(A,e)=>{const t=G(A,e,c.XReg);return B(t),Xt(t),7}),g("INX",n.IMPLIED,232,1,()=>(c.XReg=K(c.XReg,1),b(c.XReg),2)),g("INY",n.IMPLIED,200,1,()=>(c.YReg=K(c.YReg,1),b(c.YReg),2)),g("JMP",n.ABS,76,3,(A,e)=>(GA(G(A,e,-3)),3)),g("JMP",n.IND,108,3,(A,e)=>{const t=d(A,e);return A=B(t),e=B((t+1)%65536),GA(G(A,e,-3)),6}),g("JMP",n.IND_X,124,3,(A,e)=>{const t=G(A,e,c.XReg);return A=B(t),e=B((t+1)%65536),GA(G(A,e,-3)),6},J),g("JSR",n.ABS,32,3,(A,e)=>{const t=(c.PC+2)%65536;return JA("JSR $"+W(e)+W(A),Math.trunc(t/256)),JA("JSR",t%256),GA(G(A,e,-3)),6});const ce=A=>{c.Accum=B(A),b(c.Accum)};g("LDA",n.IMM,169,2,A=>(c.Accum=A,b(c.Accum),2)),g("LDA",n.ZP_REL,165,2,A=>(ce(A),3)),g("LDA",n.ZP_X,181,2,A=>(ce(K(A,c.XReg)),4)),g("LDA",n.ABS,173,3,(A,e)=>(ce(d(A,e)),4)),g("LDA",n.ABS_X,189,3,(A,e)=>{const t=G(A,e,c.XReg);return ce(t),4+$(t,d(A,e))}),g("LDA",n.ABS_Y,185,3,(A,e)=>{const t=G(A,e,c.YReg);return ce(t),4+$(t,d(A,e))}),g("LDA",n.IND_X,161,2,A=>{const e=K(A,c.XReg);return ce(d(B(e),B((e+1)%256))),6}),g("LDA",n.IND_Y,177,2,A=>oe(A,ce,!1)),g("LDA",n.IND,178,2,A=>se(A,ce,!1),J);const Zt=A=>{c.XReg=B(A),b(c.XReg)};g("LDX",n.IMM,162,2,A=>(c.XReg=A,b(c.XReg),2)),g("LDX",n.ZP_REL,166,2,A=>(Zt(A),3)),g("LDX",n.ZP_Y,182,2,A=>(Zt(K(A,c.YReg)),4)),g("LDX",n.ABS,174,3,(A,e)=>(Zt(d(A,e)),4)),g("LDX",n.ABS_Y,190,3,(A,e)=>{const t=G(A,e,c.YReg);return Zt(t),4+$(t,d(A,e))});const xt=A=>{c.YReg=B(A),b(c.YReg)};g("LDY",n.IMM,160,2,A=>(c.YReg=A,b(c.YReg),2)),g("LDY",n.ZP_REL,164,2,A=>(xt(A),3)),g("LDY",n.ZP_X,180,2,A=>(xt(K(A,c.XReg)),4)),g("LDY",n.ABS,172,3,(A,e)=>(xt(d(A,e)),4)),g("LDY",n.ABS_X,188,3,(A,e)=>{const t=G(A,e,c.XReg);return xt(t),4+$(t,d(A,e))});const Vt=A=>{let e=B(A);B(A),O((e&1)===1),e>>=1,T(A,e),b(e)};g("LSR",n.IMPLIED,74,1,()=>(O((c.Accum&1)===1),c.Accum>>=1,b(c.Accum),2)),g("LSR",n.ZP_REL,70,2,A=>(Vt(A),5)),g("LSR",n.ZP_X,86,2,A=>(Vt(K(A,c.XReg)),6)),g("LSR",n.ABS,78,3,(A,e)=>(Vt(d(A,e)),6)),g("LSR",n.ABS_X,94,3,(A,e)=>{const t=G(A,e,c.XReg);return Vt(t),6+$(t,d(A,e))}),g("NOP",n.IMPLIED,234,1,()=>2);const le=A=>{c.Accum|=B(A),b(c.Accum)};g("ORA",n.IMM,9,2,A=>(c.Accum|=A,b(c.Accum),2)),g("ORA",n.ZP_REL,5,2,A=>(le(A),3)),g("ORA",n.ZP_X,21,2,A=>(le(K(A,c.XReg)),4)),g("ORA",n.ABS,13,3,(A,e)=>(le(d(A,e)),4)),g("ORA",n.ABS_X,29,3,(A,e)=>{const t=G(A,e,c.XReg);return le(t),4+$(t,d(A,e))}),g("ORA",n.ABS_Y,25,3,(A,e)=>{const t=G(A,e,c.YReg);return le(t),4+$(t,d(A,e))}),g("ORA",n.IND_X,1,2,A=>{const e=K(A,c.XReg);return le(d(B(e),B(e+1))),6}),g("ORA",n.IND_Y,17,2,A=>oe(A,le,!1)),g("ORA",n.IND,18,2,A=>se(A,le,!1),J),g("PHA",n.IMPLIED,72,1,()=>(JA("PHA",c.Accum),3)),g("PHP",n.IMPLIED,8,1,()=>(JA("PHP",c.PStatus|16),3)),g("PHX",n.IMPLIED,218,1,()=>(JA("PHX",c.XReg),3),J),g("PHY",n.IMPLIED,90,1,()=>(JA("PHY",c.YReg),3),J),g("PLA",n.IMPLIED,104,1,()=>(c.Accum=jA(),b(c.Accum),4)),g("PLP",n.IMPLIED,40,1,()=>(an(jA()),4)),g("PLX",n.IMPLIED,250,1,()=>(c.XReg=jA(),b(c.XReg),4),J),g("PLY",n.IMPLIED,122,1,()=>(c.YReg=jA(),b(c.YReg),4),J);const Jt=A=>{let e=B(A);B(A);const t=MA()?1:0;O((e&128)===128),e=(e<<1)%256|t,T(A,e),b(e)};g("ROL",n.IMPLIED,42,1,()=>{const A=MA()?1:0;return O((c.Accum&128)===128),c.Accum=(c.Accum<<1)%256|A,b(c.Accum),2}),g("ROL",n.ZP_REL,38,2,A=>(Jt(A),5)),g("ROL",n.ZP_X,54,2,A=>(Jt(K(A,c.XReg)),6)),g("ROL",n.ABS,46,3,(A,e)=>(Jt(d(A,e)),6)),g("ROL",n.ABS_X,62,3,(A,e)=>{const t=G(A,e,c.XReg);return Jt(t),6+$(t,d(A,e))});const jt=A=>{let e=B(A);B(A);const t=MA()?128:0;O((e&1)===1),e=e>>1|t,T(A,e),b(e)};g("ROR",n.IMPLIED,106,1,()=>{const A=MA()?128:0;return O((c.Accum&1)===1),c.Accum=c.Accum>>1|A,b(c.Accum),2}),g("ROR",n.ZP_REL,102,2,A=>(jt(A),5)),g("ROR",n.ZP_X,118,2,A=>(jt(K(A,c.XReg)),6)),g("ROR",n.ABS,110,3,(A,e)=>(jt(d(A,e)),6)),g("ROR",n.ABS_X,126,3,(A,e)=>{const t=G(A,e,c.XReg);return jt(t),6+$(t,d(A,e))}),g("RTI",n.IMPLIED,64,1,()=>(an(jA()),Ro(!1),GA(d(jA(),jA())-1),6)),g("RTS",n.IMPLIED,96,1,()=>(GA(d(jA(),jA())),6));const En=A=>{const e=255-A;let t=c.Accum+e+(MA()?1:0);const s=t>=256,i=c.Accum<=127&&e<=127,I=c.Accum>=128&&e>=128;nt(t%256>=128?i:I);const h=(c.Accum&15)-(A&15)+(MA()?0:-1);t=c.Accum-A+(MA()?0:-1),t<0&&(t-=96),h<0&&(t-=6),c.Accum=t&255,b(c.Accum),O(s)},ue=A=>{nA()?En(B(A)):Wt(255-B(A))};g("SBC",n.IMM,233,2,A=>(nA()?En(A):Wt(255-A),2+nA())),g("SBC",n.ZP_REL,229,2,A=>(ue(A),3+nA())),g("SBC",n.ZP_X,245,2,A=>(ue(K(A,c.XReg)),4+nA())),g("SBC",n.ABS,237,3,(A,e)=>(ue(d(A,e)),4+nA())),g("SBC",n.ABS_X,253,3,(A,e)=>{const t=G(A,e,c.XReg);return ue(t),4+nA()+$(t,d(A,e))}),g("SBC",n.ABS_Y,249,3,(A,e)=>{const t=G(A,e,c.YReg);return ue(t),4+nA()+$(t,d(A,e))}),g("SBC",n.IND_X,225,2,A=>{const e=K(A,c.XReg);return ue(d(B(e),B(e+1))),6+nA()}),g("SBC",n.IND_Y,241,2,A=>oe(A,ue,!0)),g("SBC",n.IND,242,2,A=>se(A,ue,!0),J),g("SEC",n.IMPLIED,56,1,()=>(O(),2)),g("SED",n.IMPLIED,248,1,()=>(yo(),2)),g("SEI",n.IMPLIED,120,1,()=>(wo(),2)),g("STA",n.ZP_REL,133,2,A=>(T(A,c.Accum),3)),g("STA",n.ZP_X,149,2,A=>(T(K(A,c.XReg),c.Accum),4)),g("STA",n.ABS,141,3,(A,e)=>(T(d(A,e),c.Accum),4)),g("STA",n.ABS_X,157,3,(A,e)=>{const t=G(A,e,c.XReg);return B(t),T(t,c.Accum),5}),g("STA",n.ABS_Y,153,3,(A,e)=>(T(G(A,e,c.YReg),c.Accum),5)),g("STA",n.IND_X,129,2,A=>{const e=K(A,c.XReg);return T(d(B(e),B(e+1)),c.Accum),6});const Bn=A=>{T(A,c.Accum)};g("STA",n.IND_Y,145,2,A=>(oe(A,Bn,!1),6)),g("STA",n.IND,146,2,A=>se(A,Bn,!1),J),g("STX",n.ZP_REL,134,2,A=>(T(A,c.XReg),3)),g("STX",n.ZP_Y,150,2,A=>(T(K(A,c.YReg),c.XReg),4)),g("STX",n.ABS,142,3,(A,e)=>(T(d(A,e),c.XReg),4)),g("STY",n.ZP_REL,132,2,A=>(T(A,c.YReg),3)),g("STY",n.ZP_X,148,2,A=>(T(K(A,c.XReg),c.YReg),4)),g("STY",n.ABS,140,3,(A,e)=>(T(d(A,e),c.YReg),4)),g("STZ",n.ZP_REL,100,2,A=>(T(A,0),3),J),g("STZ",n.ZP_X,116,2,A=>(T(K(A,c.XReg),0),4),J),g("STZ",n.ABS,156,3,(A,e)=>(T(d(A,e),0),4),J),g("STZ",n.ABS_X,158,3,(A,e)=>{const t=G(A,e,c.XReg);return B(t),T(t,0),5},J),g("TAX",n.IMPLIED,170,1,()=>(c.XReg=c.Accum,b(c.XReg),2)),g("TAY",n.IMPLIED,168,1,()=>(c.YReg=c.Accum,b(c.YReg),2)),g("TSX",n.IMPLIED,186,1,()=>(c.XReg=c.StackPtr,b(c.XReg),2)),g("TXA",n.IMPLIED,138,1,()=>(c.Accum=c.XReg,b(c.Accum),2)),g("TXS",n.IMPLIED,154,1,()=>(c.StackPtr=c.XReg,2)),g("TYA",n.IMPLIED,152,1,()=>(c.Accum=c.YReg,b(c.Accum),2));const mn=A=>{const e=B(A);st((c.Accum&e)===0),T(A,e&~c.Accum)};g("TRB",n.ZP_REL,20,2,A=>(mn(A),5),J),g("TRB",n.ABS,28,3,(A,e)=>(mn(d(A,e)),6),J);const Dn=A=>{const e=B(A);st((c.Accum&e)===0),T(A,e|c.Accum)};g("TSB",n.ZP_REL,4,2,A=>(Dn(A),5),J),g("TSB",n.ABS,12,3,(A,e)=>(Dn(d(A,e)),6),J);const fc=[2,34,66,98,130,194,226],LA="???";fc.forEach(A=>{g(LA,n.IMPLIED,A,2,()=>2),v[A].is6502=!1});for(let A=0;A<=15;A++)g(LA,n.IMPLIED,3+16*A,1,()=>1),v[3+16*A].is6502=!1,g(LA,n.IMPLIED,7+16*A,1,()=>1),v[7+16*A].is6502=!1,g(LA,n.IMPLIED,11+16*A,1,()=>1),v[11+16*A].is6502=!1,g(LA,n.IMPLIED,15+16*A,1,()=>1),v[15+16*A].is6502=!1;g(LA,n.IMPLIED,68,2,()=>3),v[68].is6502=!1,g(LA,n.IMPLIED,84,2,()=>4),v[84].is6502=!1,g(LA,n.IMPLIED,212,2,()=>4),v[212].is6502=!1,g(LA,n.IMPLIED,244,2,()=>4),v[244].is6502=!1,g(LA,n.IMPLIED,92,3,()=>8),v[92].is6502=!1,g(LA,n.IMPLIED,220,3,()=>4),v[220].is6502=!1,g(LA,n.IMPLIED,252,3,()=>4),v[252].is6502=!1;for(let A=0;A<256;A++)v[A]||(console.error("ERROR: OPCODE "+A.toString(16)+" should be implemented"),g("BRK",n.IMPLIED,A,1,Cn));const Ec=()=>{const A=new Array(256);for(let e=0;e<256;e++)A[e]={name:v[e].name,mode:v[e].mode,pcode:v[e].pcode,bytes:v[e].bytes,is6502:v[e].is6502};x0(A)},EA=(A,e,t)=>{const s=e&7,i=e>>>3;return A[i]|=t>>>s,s&&(A[i+1]|=t<<8-s),e+8},Ht=(A,e,t)=>(e=EA(A,e,t>>>1|170),e=EA(A,e,t|170),e),Qo=(A,e)=>(e=EA(A,e,255),e+2),Bc=A=>{const e=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],t=new Uint8Array(343),s=[0,2,1,3];for(let I=0;I<84;I++)t[I]=s[A[I]&3]|s[A[I+86]&3]<<2|s[A[I+172]&3]<<4;t[84]=s[A[84]&3]<<0|s[A[170]&3]<<2,t[85]=s[A[85]&3]<<0|s[A[171]&3]<<2;for(let I=0;I<256;I++)t[86+I]=A[I]>>>2;t[342]=t[341];let i=342;for(;i>1;)i--,t[i]^=t[i-1];for(let I=0;I<343;I++)t[I]=e[t[I]];return t},mc=(A,e,t)=>{let s=0;const i=new Uint8Array(6646).fill(0);for(let I=0;I<16;I++)s=Qo(i,s);for(let I=0;I<16;I++){s=EA(i,s,213),s=EA(i,s,170),s=EA(i,s,150),s=Ht(i,s,254),s=Ht(i,s,e),s=Ht(i,s,I),s=Ht(i,s,254^e^I),s=EA(i,s,222),s=EA(i,s,170),s=EA(i,s,235);for(let m=0;m<7;m++)s=Qo(i,s);s=EA(i,s,213),s=EA(i,s,170),s=EA(i,s,173);const h=I===15?15:I*(t?8:7)%15,l=Bc(A.slice(h*256,h*256+256));for(let m=0;m<l.length;m++)s=EA(i,s,l[m]);s=EA(i,s,222),s=EA(i,s,170),s=EA(i,s,235);for(let m=0;m<16;m++)s=Qo(i,s)}return i},Dc=(A,e)=>{const t=A.length/4096;if(t<34||t>40)return new Uint8Array;const s=new Uint8Array(1536+t*13*512).fill(0);s.set(je(`WOZ2ÿ
\r
`),0),s.set(je("INFO"),12),s[16]=60,s[20]=2,s[21]=1,s[22]=0,s[23]=0,s[24]=1,s.fill(32,25,57),s.set(je("Apple2TS (CT6502)"),25),s[57]=1,s[58]=0,s[59]=32,s[60]=0,s[62]=0,s[64]=13,s.set(je("TMAP"),80),s[84]=160,s.fill(255,88,248);let i=0;for(let I=0;I<t;I++)i=88+(I<<2),I>0&&(s[i-1]=I),s[i]=s[i+1]=I;s.set(je("TRKS"),248),s.set(ns(1280+t*13*512),252);for(let I=0;I<t;I++){i=256+(I<<3),s.set(yi(3+I*13),i),s[i+2]=13,s.set(ns(50304),i+4);const h=A.slice(I*16*256,(I+1)*16*256),l=mc(h,I,e);i=1536+I*13*512,s.set(l,i)}return s},kc=(A,e)=>{if(!([87,79,90,50,255,10,13,10].find((l,m)=>l!==e[m])===void 0))return!1;A.isWriteProtected=e[22]===1,A.isSynchronized=e[23]===1,A.optimalTiming=e[59]>0?e[59]:32;const i=e.slice(8,12),I=i[0]+(i[1]<<8)+(i[2]<<16)+i[3]*2**24,h=Qi(e,12);if(I!==0&&I!==h)return alert("CRC checksum error: "+A.filename),!1;for(let l=0;l<160;l++){const m=e[88+l];if(m<255){const D=256+8*m,k=e.slice(D,D+8);A.trackStart[l]=512*((k[1]<<8)+k[0]),A.trackNbits[l]=k[4]+(k[5]<<8)+(k[6]<<16)+k[7]*2**24,A.maxQuarterTrack=l}}return!0},Tc=(A,e)=>{if(!([87,79,90,49,255,10,13,10].find((i,I)=>i!==e[I])===void 0))return!1;A.isWriteProtected=e[22]===1;for(let i=0;i<160;i++){const I=e[88+i];if(I<255){A.trackStart[i]=256+I*6656;const h=e.slice(A.trackStart[i]+6646,A.trackStart[i]+6656);A.trackNbits[i]=h[2]+(h[3]<<8),A.maxQuarterTrack=i}}return!0},dc=A=>{const e=A.toLowerCase(),t=e.endsWith(".dsk")||e.endsWith(".do"),s=e.endsWith(".po");return t||s},wc=(A,e)=>{const s=A.filename.toLowerCase().endsWith(".po"),i=Dc(e,s);return i.length===0?new Uint8Array:(A.filename=Ri(A.filename,"woz"),A.diskHasChanges=!0,A.lastAppleWriteTime=Date.now(),i)},yc=(A,e)=>{A.diskHasChanges=!1;const t=A.filename.toLowerCase();return e.length>1e4&&(is(t)&&(A.hardDrive=!0,A.status="",t.endsWith(".hdv")||t.endsWith(".po")||t.endsWith(".2meg")||t.endsWith(".2mg"))||((dc(A.filename)||e.length===143360)&&(e=wc(A,e)),kc(A,e))||Tc(A,e))?e:(t!==""&&console.error(`Unknown disk format or unable to decode: ${A.filename} (${e.length} bytes).`),new Uint8Array)},Rc=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0];let Oe=0,kA=0,bo=!1,TA=0,vt=!1,Mo=!1;const Pc=[-1,0,2,1,4,-1,3,-1,6,7,-1,-1,5,-1,-1,-1],Qc=[[0,1,2,3,0,-3,-2,-1],[-1,0,1,2,3,0,-3,-2],[-2,-1,0,1,2,3,0,-3],[-3,-2,-1,0,1,2,3,0],[0,-3,-2,-1,0,1,2,3],[3,0,-3,-2,-1,0,1,2],[2,3,0,-3,-2,-1,0,1],[1,2,3,0,-3,-2,-1,0]],bc=A=>{vt=!1,Rn(A),A.quarterTrack=A.maxQuarterTrack,A.prevQuarterTrack=A.maxQuarterTrack},Mc=(A=!1)=>{if(A){const e=er();e.motorRunning&&Pn(e)}else xe(fe.MOTOR_OFF)};let zt=0;const Lc=(A,e,t)=>{zt=0,A.prevQuarterTrack=A.quarterTrack,A.quarterTrack+=e,A.quarterTrack<0||A.quarterTrack>A.maxQuarterTrack?(xe(fe.TRACK_END),A.quarterTrack=Math.max(0,Math.min(A.quarterTrack,A.maxQuarterTrack))):xe(fe.TRACK_SEEK),A.status=` Trk ${A.quarterTrack/4}`,dA(),TA+=t,A.trackLocation+=Math.floor(TA/4),TA=TA%4,A.quarterTrack!=A.prevQuarterTrack&&(A.trackLocation=Math.floor(A.trackLocation*(A.trackNbits[A.quarterTrack]/A.trackNbits[A.prevQuarterTrack])))};let kn=0;const Fc=[0,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],Tn=()=>(kn++,Fc[kn&31]);let $t=0;const qc=A=>($t<<=1,$t|=A,$t&=15,$t===0?Tn():A),dn=[128,64,32,16,8,4,2,1],Uc=[127,191,223,239,247,251,253,254],Kc=(A,e)=>{const t=A.trackLocation;A.trackLocation=A.trackLocation%A.trackNbits[A.quarterTrack],t!==A.trackLocation&&(zt>=9?(zt=0,A.trackLocation+=4):zt++);let s;if(A.trackStart[A.quarterTrack]>0){const i=A.trackStart[A.quarterTrack]+(A.trackLocation>>3),I=e[i],h=A.trackLocation&7;s=(I&dn[h])>>7-h,s=qc(s)}else s=Tn();return A.trackLocation++,s},Oc=()=>Math.floor(256*Math.random()),wn=(A,e,t)=>{if(e.length===0)return Oc();let s=0;for(TA+=t;TA>=A.optimalTiming/8;){const i=Kc(A,e);bo?bo=!i:kA&128?kA=2|i:(kA=kA<<1|i,kA&128&&(bo=!0)),TA-=A.optimalTiming/8}return TA<0&&(TA=0),kA&=255,s=kA,s};let Ie=0;const Lo=(A,e,t)=>{if(A.trackLocation=A.trackLocation%A.trackNbits[A.quarterTrack],A.trackStart[A.quarterTrack]>0){const s=A.trackStart[A.quarterTrack]+(A.trackLocation>>3);let i=e[s];const I=A.trackLocation&7;t?i|=dn[I]:i&=Uc[I],e[s]=i}A.trackLocation++},yn=(A,e,t)=>{if(!(e.length===0||A.trackStart[A.quarterTrack]===0)&&kA>0){if(t>=16)for(let s=7;s>=0;s--)Lo(A,e,kA&2**s?1:0);t>=36&&Lo(A,e,0),t>=40&&Lo(A,e,0),Fo.push(t>=40?2:t>=36?1:kA),A.diskHasChanges=!0,A.lastAppleWriteTime=Date.now(),kA=0}},Rn=A=>{Oe=0,vt||(A.motorRunning=!1),dA(),xe(fe.MOTOR_OFF)},Pn=A=>{Oe?(clearTimeout(Oe),Oe=0):TA=0,A.motorRunning=!0,dA(),xe(fe.MOTOR_ON)},Yc=A=>{Oe===0&&(Oe=setTimeout(()=>Rn(A),1e3))};let Fo=[];const Ar=A=>{Fo.length>0&&A.quarterTrack===0&&(Fo=[])},Wc=(A,e)=>{if(A>=49408)return-1;let t=er();const s=_c();if(t.hardDrive)return 0;let i=0;const I=c.cycleCount-Ie;switch(A=A&15,A){case 9:vt=!0,Pn(t),Ar(t);break;case 8:t.motorRunning&&!t.writeMode&&(i=wn(t,s,I),Ie=c.cycleCount),vt=!1,Yc(t),Ar(t);break;case 10:case 11:{const h=A===10?2:3,l=er();Gc(h),t=er(),t!==l&&l.motorRunning&&(l.motorRunning=!1,t.motorRunning=!0,dA());break}case 12:Mo=!1,t.motorRunning&&!t.writeMode&&(i=wn(t,s,I),Ie=c.cycleCount);break;case 13:Mo=!0,t.motorRunning&&(t.writeMode?(yn(t,s,I),Ie=c.cycleCount,e>=0&&(kA=e)):(kA=0,TA+=I,t.trackLocation+=Math.floor(TA/4),TA=TA%4,Ie=c.cycleCount));break;case 14:t.motorRunning&&t.writeMode&&(yn(t,s,I),t.lastAppleWriteTime=Date.now(),Ie=c.cycleCount),t.writeMode=!1,Mo&&(i=t.isWriteProtected?255:0),Ar(t);break;case 15:t.writeMode=!0,Ie=c.cycleCount,e>=0&&(kA=e);break;default:{if(A<0||A>7)break;const h=A/2;A%2?t.currentPhase|=1<<h:t.currentPhase&=~(1<<h);const m=Pc[t.currentPhase];if(t.motorRunning&&m>=0){const D=t.quarterTrack&7,k=Qc[D][m];Lc(t,k,I),Ie=c.cycleCount}Ar(t);break}}return i},Nc=()=>{Ke(6,Uint8Array.from(Rc)),At(6,Wc)},it=(A,e,t)=>({index:A,hardDrive:t,drive:e,status:"",filename:"",diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,isSynchronized:!1,quarterTrack:0,prevQuarterTrack:0,writeMode:!1,currentPhase:0,trackStart:t?Array():Array(160).fill(0),trackNbits:t?Array():Array(160).fill(51024),trackLocation:0,maxQuarterTrack:0,lastLocalFileWriteTime:-1,cloudData:null,writableFileHandle:null,lastAppleWriteTime:-1,optimalTiming:32}),Qn=()=>{R[0]=it(0,1,!0),R[1]=it(1,2,!0),R[2]=it(2,1,!1),R[3]=it(3,2,!1);for(let A=0;A<R.length;A++)vA[A]=new Uint8Array},R=[],vA=[];Qn();let ye=2;const Gc=A=>{ye=A},er=()=>R[ye],_c=()=>vA[ye],qo=A=>R[A==2?1:0],tr=A=>{const e=vA[A==2?1:0];let t="";for(let i=0;i<4;i++)t+=String.fromCharCode(e[i]);const s=t==="2IMG"?64:0;return[e,s,e.length-s]},at=[],dA=()=>{for(let A=0;A<R.length;A++){if(R[A].filename===""&&!R[A].cloudData&&at[A]&&at[A].diskHasChanges===R[A].diskHasChanges&&at[A].motorRunning===R[A].motorRunning&&at[A].status===R[A].status)continue;const e={index:A,hardDrive:R[A].hardDrive,drive:R[A].drive,filename:R[A].filename,status:R[A].status,motorRunning:R[A].motorRunning,diskHasChanges:R[A].diskHasChanges,isWriteProtected:R[A].isWriteProtected,diskData:R[A].diskHasChanges&&!R[A].motorRunning?vA[A]:new Uint8Array,lastAppleWriteTime:R[A].lastAppleWriteTime,lastLocalFileWriteTime:R[A].lastLocalFileWriteTime,cloudData:R[A].cloudData,writableFileHandle:R[A].writableFileHandle};Y0(e),at[A]={diskHasChanges:e.diskHasChanges,motorRunning:e.motorRunning,status:e.status}}},Xc=A=>{const e=new Array(R.length).fill("");for(let s=0;s<R.length;s++)(A||vA[s].length<32e6)&&(e[s]=re.Buffer.from(vA[s]).toString("base64"));const t={currentDrive:ye,driveState:[],driveData:e};for(let s=0;s<R.length;s++)t.driveState[s]=R[s].filename!==""?{...R[s]}:{};return t},Zc=A=>{xe(fe.MOTOR_OFF),ye=A.currentDrive,A.driveState.length===3&&ye>0&&ye++,Qn();let e=0;for(let t=0;t<A.driveState.length;t++)Object.keys(A.driveState[t]).length>0&&(R[e]={...A.driveState[t]},A.driveData[t]!==""&&(vA[e]=new Uint8Array(re.Buffer.from(A.driveData[t],"base64")))),A.driveState.length===3&&t===0&&(e=1),e++;dA()},xc=()=>{for(let A=0;A<R.length;A++)R[A].hardDrive||bc(R[A]);dA()},bn=(A=!1)=>{Mc(A),dA()},Vc=(A,e=!1)=>{let t=A.index,s=A.drive,i=A.hardDrive;if(e||A.filename!==""&&(is(A.filename)?(i=!0,t=A.drive<=1?0:1,s=t+1):(i=!1,t=A.drive<=1?2:3,s=t-1)),R[t]=it(t,s,i),R[t].filename=A.filename,vA[t]=yc(R[t],A.diskData),vA[t].length===0){R[t].filename="",dA();return}R[t].motorRunning=A.motorRunning,R[t].cloudData=A.cloudData,R[t].writableFileHandle=A.writableFileHandle,R[t].lastLocalFileWriteTime=A.lastLocalFileWriteTime,dA()},Jc=A=>{const e=A.index;R[e].filename=A.filename,R[e].motorRunning=A.motorRunning,R[e].isWriteProtected=A.isWriteProtected,R[e].diskHasChanges=A.diskHasChanges,R[e].lastAppleWriteTime=A.lastAppleWriteTime,R[e].lastLocalFileWriteTime=A.lastLocalFileWriteTime,R[e].cloudData=A.cloudData,R[e].writableFileHandle=A.writableFileHandle,dA()},Re={OVRN:4,RX_FULL:8,IRQ:128,HW_RESET:16},ct={BAUD_RATE:15,WORD_LENGTH:96,STOP_BITS:128,HW_RESET:0},Pe={RX_INT_DIS:2,TX_INT_EN:4,PARITY_EN:32,PARITY_CNF:192,HW_RESET:0};class jc{_control;_status;_command;_lastRead;_lastConfig;_receiveBuffer;_extFuncs;buffer(e){for(let s=0;s<e.length;s++)this._receiveBuffer.push(e[s]);let t=this._receiveBuffer.length-16;t=t<0?0:t;for(let s=0;s<t;s++)this._receiveBuffer.shift(),this._status|=Re.OVRN;this._status|=Re.RX_FULL,(this._control&Pe.RX_INT_DIS)==0&&this.irq(!0)}set data(e){const t=new Uint8Array(1).fill(e);this._extFuncs.sendData(t),this._command&Pe.TX_INT_EN&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=-8,this._receiveBuffer.length?(this._status|=Re.RX_FULL,(this._control&Pe.RX_INT_DIS)==0&&this.irq(!0)):this._status&=-9,this._lastRead}set control(e){this._control=e,this.serialConfigChange(this.buildConfigChange())}get control(){return this._control}set command(e){this._command=e,this.serialConfigChange(this.buildConfigChange())}get command(){return this._command}get status(){const e=this._status;return this._status&Re.IRQ&&this.irq(!1),this._status&=-129,e}set status(e){this.reset()}irq(e){e?this._status|=Re.IRQ:this._status&=-129,this._extFuncs.interrupt(e)}buildConfigChange(){const e={};switch(this._control&ct.BAUD_RATE){case 0:e.baud=0;break;case 1:e.baud=50;break;case 2:e.baud=75;break;case 3:e.baud=109;break;case 4:e.baud=134;break;case 5:e.baud=150;break;case 6:e.baud=300;break;case 7:e.baud=600;break;case 8:e.baud=1200;break;case 9:e.baud=1800;break;case 10:e.baud=2400;break;case 11:e.baud=3600;break;case 12:e.baud=4800;break;case 13:e.baud=7200;break;case 14:e.baud=9600;break;case 15:e.baud=19200;break}switch(this._control&ct.WORD_LENGTH){case 0:e.bits=8;break;case 32:e.bits=7;break;case 64:e.bits=6;break;case 96:e.bits=5;break}if(this._control&ct.STOP_BITS?e.stop=2:e.stop=1,e.parity="none",this._command&Pe.PARITY_EN)switch(this._command&Pe.PARITY_CNF){case 0:e.parity="odd";break;case 64:e.parity="even";break;case 128:e.parity="mark";break;case 192:e.parity="space";break}return e}serialConfigChange(e){let t=!1;(e.baud!=this._lastConfig.baud||e.baud>0)&&(t=!0),e.bits!=this._lastConfig.bits&&(t=!0),e.stop!=this._lastConfig.stop&&(t=!0),e.parity!=this._lastConfig.parity&&(t=!0),t&&(this._lastConfig=e,this._extFuncs.serialConfig(this._lastConfig))}reset(){this._control=ct.HW_RESET,this._command=Pe.HW_RESET,this._status=Re.HW_RESET,this.irq(!1),this._receiveBuffer=[]}constructor(e){this._extFuncs=e,this._control=ct.HW_RESET,this._command=Pe.HW_RESET,this._status=Re.HW_RESET,this._lastConfig=this.buildConfigChange(),this._lastRead=0,this._receiveBuffer=[],this.reset()}}const Uo=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]);let rr=1,PA;const Hc=A=>{$e(rr,A)},vc=A=>{console.log("SerialConfig: ",A),V0(A)},zc=A=>{PA&&PA.buffer(A)},$c=()=>{PA&&PA.reset()},Al=(A=!0,e=1)=>{if(!A)return;rr=e;const t={sendData:G0,interrupt:Hc,serialConfig:vc};PA=new jc(t);const s=new Uint8Array(Uo.length+256);s.set(Uo.slice(1792,2048)),s.set(Uo,256),Ke(rr,s),At(rr,el)},el=(A,e=-1)=>{if(A>=49408)return-1;const t={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(A&15){case t.DIPSW1:return 226;case t.DIPSW2:return 40;case t.IOREG:if(e>=0)PA.data=e;else return PA.data;break;case t.STATUS:if(e>=0)PA.status=e;else return PA.status;break;case t.COMMAND:if(e>=0)PA.command=e;else return PA.command;break;case t.CONTROL:if(e>=0)PA.control=e;else return PA.control;break;default:console.log("SSC unknown softswitch",(A&15).toString(16));break}return-1},lt=(A,e)=>String(A).padStart(e,"0");(()=>{const A=new Uint8Array(256).fill(96);return A[0]=8,A[2]=40,A[4]=88,A[6]=112,A})();const tl=()=>{const A=new Date,e=lt(A.getMonth()+1,2)+","+lt(A.getDay(),2)+","+lt(A.getDate(),2)+","+lt(A.getHours(),2)+","+lt(A.getMinutes(),2);for(let t=0;t<e.length;t++)T(512+t,e.charCodeAt(t)|128)};let or=!1;const Mn=A=>{const e=A.split(","),t=e[0].split(/([+-])/);return{label:t[0]?t[0]:"",operation:t[1]?t[1]:"",value:t[2]?parseInt(t[2].replace("#","").replace("$","0x")):0,idx:e[1]?e[1]:""}},Ln=A=>{let e=n.IMPLIED,t=-1;if(A.length>0){A.startsWith("#")?(e=n.IMM,A=A.substring(1)):A.startsWith("(")?(A.endsWith(",Y")?e=n.IND_Y:A.endsWith(",X)")?e=n.IND_X:e=n.IND,A=A.substring(1)):A.endsWith(",X")?e=A.length>5?n.ABS_X:n.ZP_X:A.endsWith(",Y")?e=A.length>5?n.ABS_Y:n.ZP_Y:e=A.length>3?n.ABS:n.ZP_REL,A.startsWith("$")&&(A="0x"+A.substring(1)),t=parseInt(A);const s=Mn(A);if(s.operation&&s.value){switch(s.operation){case"+":t+=s.value;break;case"-":t-=s.value;break;default:console.error("Unknown operation in operand: "+A)}t=(t%65536+65536)%65536}}return[e,t]};let Qe={};const Fn=(A,e,t,s)=>{let i=n.IMPLIED,I=-1;if(t.match(/^[#]?[$0-9()]+/))return Object.entries(Qe).forEach(([l,m])=>{t=t.replace(new RegExp(`\\b${l}\\b`,"g"),"$"+W(m))}),Ln(t);const h=Mn(t);if(h.label){const l=h.label.startsWith("<"),m=h.label.startsWith(">"),D=h.label.startsWith("#")||m||l;if(D&&(h.label=h.label.substring(1)),h.label in Qe?(I=Qe[h.label],m?I=I>>8&255:l&&(I=I&255)):s===2&&console.error("Missing label: "+h.label),h.operation&&h.value){switch(h.operation){case"+":I+=h.value;break;case"-":I-=h.value;break;default:console.error("Unknown operation in operand: "+t)}I=(I%65536+65536)%65536}Dt(e)?(i=n.ZP_REL,I=I-A+254,I>255&&(I-=256)):D?i=n.IMM:(i=I>=0&&I<=255?n.ZP_REL:n.ABS,i=h.idx==="X"?i===n.ABS?n.ABS_X:n.ZP_X:i,i=h.idx==="Y"?i===n.ABS?n.ABS_Y:n.ZP_Y:i)}return[i,I]},rl=(A,e)=>{A=A.replace(/\s+/g," ");const t=A.split(" ");return{label:t[0]?t[0]:e,instr:t[1]?t[1]:"",operand:t[2]?t[2]:""}},ol=(A,e)=>{if(A.label in Qe&&console.error("Redefined label: "+A.label),A.instr==="EQU"){const[t,s]=Fn(e,A.instr,A.operand,2);t!==n.ABS&&t!==n.ZP_REL&&console.error("Illegal EQU value: "+A.operand),Qe[A.label]=s}else Qe[A.label]=e},sl=A=>{const e=[];switch(A.instr){case"ASC":case"DA":{let t=A.operand,s=0;t.startsWith('"')&&t.endsWith('"')?s=128:t.startsWith("'")&&t.endsWith("'")?s=0:console.error("Invalid string: "+t),t=t.substring(1,t.length-1);for(let i=0;i<t.length;i++)e.push(t.charCodeAt(i)|s);e.push(0);break}case"HEX":{(A.operand.replace(/,/g,"").match(/.{1,2}/g)||[]).forEach(i=>{const I=parseInt(i,16);isNaN(I)&&console.error(`Invalid HEX value: ${i} in ${A.operand}`),e.push(I)});break}default:console.error("Unknown pseudo ops: "+A.instr);break}return e},nl=(A,e)=>{const t=[],s=v[A];return t.push(A),e>=0&&(t.push(e%256),s.bytes===3&&t.push(Math.trunc(e/256))),t};let Ko=0;const qn=(A,e)=>{let t=Ko;const s=[];let i="";if(A.forEach(I=>{if(I=I.split(";")[0].trimEnd().toUpperCase(),!I)return;let h=(I+"                   ").slice(0,30)+W(t,4)+"- ";const l=rl(I,i);if(i="",!l.instr){i=l.label;return}if(l.instr==="ORG"){if(e===1){const[F,w]=Ln(l.operand);F===n.ABS&&(Ko=w,t=w)}or&&e===2&&console.log(h);return}if(e===1&&l.label&&ol(l,t),l.instr==="EQU")return;let m=[],D,k;if(["ASC","DA","HEX"].includes(l.instr))m=sl(l),t+=m.length;else if([D,k]=Fn(t,l.instr,l.operand,e),e===2&&isNaN(k)&&console.error(`Unknown/illegal value: ${I}`),l.instr==="DB")m.push(k&255),t++;else if(l.instr==="DW")m.push(k&255),m.push(k>>8&255),t+=2;else if(l.instr==="DS")for(let F=0;F<k;F++)m.push(0),t++;else{e===2&&Dt(l.instr)&&(k<0||k>255)&&console.error(`Branch instruction out of range: ${I} value: ${k} pass: ${e}`);const F=v.findIndex(w=>w&&w.name===l.instr&&w.mode===D);F<0&&console.error(`Unknown instruction: "${I}" mode=${D} pass=${e}`),m=nl(F,k),t+=v[F].bytes}or&&e===2&&(m.forEach(F=>{h+=` ${W(F)}`}),console.log(h)),s.push(...m)}),or&&e===2){let I="";s.forEach(h=>{I+=` ${W(h)}`}),console.log(I)}return s},ut=(A,e,t=!1)=>{Qe={},or=t;try{return Ko=A,qn(e,1),qn(e,2)}catch(s){return console.error(s),[]}},il=`
Cx00	php	        ; BASIC entry (handled in JS)  This will only work for mouse
Cx01	sei         ; Clock bytes required as above.
Cx02	plp
Cx03	rts
Cx04	db $00      ; $58 = Clock, disabled because it breaks A2osX https://github.com/ct6502/apple2ts/issues/67
Cx05	db $38      ; Pascal ID Byte
Cx06	db $70      ; Clock
Cx07	db $18      ; Pascal ID Byte
Cx08	rts         ; Clock Read Method - handled by JS
Cx09	db $00
Cx0a	db $00
Cx0b	db $01      ; Pascal Generic Signature  / Clock Write (method & value ignored)
Cx0c	db $20      ; $2x = Pascal XY Pointing Device, ID=x0 apple mouse
Cx0d	rts         ; init pascal (for clock need an RTS here)  could move methods to offset 60
Cx0e	db <PASCAL  ; read
Cx0f	db <PASCAL  ; write
Cx10	db <PASCAL  ; status
Cx11	db $00      ; Pascal optional routines follow
;
Cx12    db <SETMOUSE          ; $39
Cx13    db <SERVEMOUSE        ; $47
Cx14    db <READMOUSE         ; $C7
Cx15    db <CLEARMOUSE        ; $D7
Cx16    db <POSMOUSE          ; $BB
Cx17    db <CLAMPMOUSE        ; $A3
Cx18    db <HOMEMOUSE         ; $DF
Cx19    db <INITMOUSE         ; $E6
Cx1a    db <GETCLAMP          ; $26
Cx1b    db <UNDOCUMENTED      ; $22 applemouse has methods here
Cx1c    db <TIMEDATA          ; $24
Cx1d    db <UNDOCUMENTED      ; $22 not sure if some will call them 
Cx1e    db <UNDOCUMENTED      ; $22
Cx1f    db <UNDOCUMENTED      ; $22
;
; All methods (except SERVEMOUSE) entered with X = Cn, Y = n0
; 
; The interrupt status byte is defined as follows:
; 
; Bit 7 6 5 4 3 2 1 0
;     | | | | | | | |
;     | | | | | | | +---  Previously, button 1 was up (0) or down (1)
;     | | | | | | +-----  Movement interrupt
;     | | | | | +-------  Button 0/1 interrupt
;     | | | | +---------  VBL interrupt
;     | | | +-----------  Currently, button 1 is up (0) or down (1)
;     | | +-------------  X/Y moved since last READMOUSE
;     | +---------------  Previously, button 0 was up (0) or down (1)
;     +-----------------  Currently, button 0 is up (0) or down (1)
; 
; (Button 1 is not physically present on the mouse, and is probably only
; supported for an ADB mouse on the IIgs.)
; 
; The mode byte is defined as follows.
; 
; Bit 7 6 5 4 3 2 1 0
;     | | | | | | | |
;     | | | | | | | +---  Mouse off (0) or on (1)
;     | | | | | | +-----  Interrupt if mouse is moved
;     | | | | | +-------  Interrupt if button is pressed
;     | | | | +---------  Interrupt on VBL
;     | | | +-----------  Reserved
;     | | +-------------  Reserved
;     | +---------------  Reserved
;     +-----------------  Reserved
; 

SLOWX   EQU $0478-$c0 ; + Cs        Low byte of absolute X position
SLOWY   EQU $04F8-$c0 ; + Cs        Low byte of absolute Y position
SHIGHX  EQU $0578-$c0 ; + Cs        High byte of absolute X position
SHIGHY  EQU $05F8-$c0 ; + Cs        High byte of absolute Y position
STEMPA  EQU $0678-$c0 ; + Cs        Reserved and used by the firmware
STEMPB  EQU $06F8-$c0 ; + Cs        Reserved and used by the firmware
SBUTTON EQU $0778-$c0 ; + Cs        Button 0/1 interrupt status byte
SMODE   EQU $07F8-$c0 ; + Cs        Mode byte

LOWX   EQU $C081 ; + $s0        Low byte of absolute X position
HIGHX  EQU $C082 ; + $s0        High byte of absolute X position
LOWY   EQU $C083 ; + $s0        Low byte of absolute Y position
HIGHY  EQU $C084 ; + $s0        High byte of absolute Y position
BUTTON EQU $C085 ; + $s0        Button 0/1 interrupt status byte
MODE   EQU $C086 ; + $s0        Mode byte
CLAMP  EQU $C087 ; + $s0        Clamp value

CMD    EQU $C08A ; + $s0         Command reg
INIT   EQU $0    ;               initialize
READ   EQU $1    ;               read mouse and update regs, clear ints
CLEAR  EQU $2    ;               clear mouse and update regs, clear ints
GCLAMP EQU $3    ;               get mouse clamping
SERVE  EQU $4    ;               check/serve mouse int
HOME   EQU $5    ;               set to clamping window upper left
CLAMPX EQU $6    ;               clamp x values to x -> y
CLAMPY EQU $7    ;               clamp y values to x -> y
POS    EQU $8    ;               set positions
UNDOC  EQU $9    ;               calling an undocumented entry

PASCAL
    ldx #$03        ; return error for pascal

UNDOCUMENTED        ; $Cn22
    sec
    rts
                    ; Technote #2
TIMEDATA            ; $Cn24, A bit 0: 1 - 50hz, 0 = 60hz VBL
    clc
    rts
                    ; Technote #7
                    ; Return 8 clamping bytes one at a time to $578
GETCLAMP            ; $Cn26
    lda $478        ; index byte, starting at $4E according to technote
    sta CLAMP,y     ; indicates which byte in the order we want
    lda #GCLAMP
    sta CMD,y
    lda CLAMP,y
    sta $578
    clc             ; In this order: minXH, minYH, minXL, minYL
    rts             ;                maxXH, maxYH, maxXL, maxYL

SETMOUSE            ; $C039
    cmp #$10
    bcs return      ; invalid
    sta MODE,y      ; set mode
    lda MODE,y      ; reread to ensure valid
    sta SMODE,x
return 
    rts

SERVEMOUSE          ; $Cn47
    ldy $06
    lda #$60
    sta $06
    jsr $0006       ; start by finding our slot - not entered with X,Y set
    sty $06
    tsx
    lda $100,x
    tax             ; X = Cs
    asl
    asl
    asl
    asl
    tay             ; Y = s0

    lda #SERVE
    sta CMD,y

    lda BUTTON,y 
    and #$0e
    sec
    beq return      ; exit without changing anything

    ora SBUTTON,x
    sta SBUTTON,x
    clc             ; claim it
    rts

copyin 
    lda SLOWX,x
    sta LOWX,y
    lda SLOWY,x
    sta LOWY,y
    lda SHIGHX,x
    sta HIGHX,y
    lda SHIGHY,x
    sta HIGHY,y
    rts

copyout 
    lda LOWX,y
    sta SLOWX,x
    lda LOWY,y
    sta SLOWY,x
    lda HIGHX,y
    sta SHIGHX,x
    lda HIGHY,y
    sta SHIGHY,x
    rts

CLAMPMOUSE          ; $CnA3
    and #$1
    sta STEMPA,x
    phx
    phx
    ldx #$c0        ; note load from screen hole 0, not slot

    lda <cmcont-1
    pha
    bra copyin

cmcont 
    plx
    lda #CLAMPX     ; A = 1 for Y
    ora STEMPA,x
    sta CMD,y
    rts

POSMOUSE            ; $CnBB
    phx
    lda <pmcont-1
    pha
    bra copyin

pmcont 
    lda #POS
    sta CMD,y
    rts

READMOUSE           ; $CnC7
    lda #READ
    sta CMD,y

    lda BUTTON,y
    and #$F1        ; mask off interrupts
    sta SBUTTON,x
    clc
    bra copyout

CLEARMOUSE          ; $CnD7
    lda #CLEAR
    sta CMD,y
    clc
    bra copyout

HOMEMOUSE           ; $CnDF
    lda #HOME
    sta CMD,y
    clc
    rts

INITMOUSE           ; $CnE6
    lda #INIT
    sta CMD,y
    lda MODE,y
    sta SMODE,x
    bra READMOUSE   ; Ends at $CnF2

    ; should leave about 13 bytes
`;let be=49286,sr=49289,nr=49291,ir=49292,ar=49293,cr=49294,lr=49295;const Un=(A,e,t,s,i)=>{const I=A&255,h=A>>8&3,l=e&255,m=e>>8&3;Z(t,I),Z(s,h<<4|m),Z(i,l)},Kn=(A,e,t)=>{const s=pA(A),i=pA(e),I=pA(t),h=i>>4&3,l=i&3;return[s|h<<8,I|l<<8]},ur=()=>Kn(sr,nr,ir),Oo=()=>Kn(ar,cr,lr),Ir=(A,e)=>{Un(A,e,sr,nr,ir)},hr=(A,e)=>{Un(A,e,ar,cr,lr)},gr=A=>{Z(be,A),Ii(!!A)},al=()=>{UA=0,KA=0,Ir(0,1023),hr(0,1023),gr(0),IA=0,he=0,Ye=0,It=0,ht=0,wA=0,_A=0,We=0,pr=0};let UA=0,KA=0,pr=0,IA=0,he=0,Ye=0,It=0,ht=0,wA=0,_A=0,We=0,On=0,CA=5;const Cr=54,Sr=55,cl=56,ll=57,Yn=()=>{const A=new Uint8Array(256).fill(0),e=ut(0,il.split(`
`));return A.set(e,0),A[251]=214,A[255]=1,A},ul=(A=!0,e=5)=>{if(!A)return;CA=e;const t=49152+CA*256,s=49152+CA*256+8;Ke(CA,Yn(),t,gl),Ke(CA,Yn(),s,tl),At(CA,Sl),be=49280+(be&15)+CA*16,sr=49280+(sr&15)+CA*16,nr=49280+(nr&15)+CA*16,ir=49280+(ir&15)+CA*16,ar=49280+(ar&15)+CA*16,cr=49280+(cr&15)+CA*16,lr=49280+(lr&15)+CA*16;const[i,I]=ur();i===0&&I===0&&(Ir(0,1023),hr(0,1023)),pA(be)!==0&&Ii(!0)},Il=()=>{const A=pA(be);if(A&1){let e=!1;A&8&&(We|=8,e=!0),A&he&4&&(We|=4,e=!0),A&he&2&&(We|=2,e=!0),e&&$e(CA,!0)}},hl=A=>{if(pA(be)&1)if(A.buttons>=0){switch(A.buttons){case 0:IA&=-129;break;case 16:IA|=128;break;case 1:IA&=-17;break;case 17:IA|=16;break}he|=IA&128?4:0}else{if(A.x>=0&&A.x<=1){const[t,s]=ur();UA=Math.round((s-t)*A.x+t),he|=2}if(A.y>=0&&A.y<=1){const[t,s]=Oo();KA=Math.round((s-t)*A.y+t),he|=2}}};let gt=0,Yo="",Wn=0,Nn=0;const gl=()=>{const A=192+CA;B(Sr)===A&&B(Cr)===0?Cl():B(ll)===A&&B(cl)===0&&pl()},pl=()=>{if(gt===0){const A=192+CA;Wn=B(Sr),Nn=B(Cr),T(Sr,A),T(Cr,3);const e=(IA&128)!==(Ye&128);let t=0;IA&128?t=e?2:1:t=e?3:4,B(49152)&128&&(t=-t),Ye=IA,Yo=UA.toString()+","+KA.toString()+","+t.toString()}gt>=Yo.length?(c.Accum=141,gt=0,T(Sr,Wn),T(Cr,Nn)):(c.Accum=Yo.charCodeAt(gt)|128,gt++)},Cl=()=>{switch(c.Accum){case 128:console.log("mouse off"),gr(0);break;case 129:console.log("mouse on"),gr(1);break}},Sl=(A,e)=>{if(A>=49408)return-1;const t=e<0,s={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},i={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(A&15){case s.LOWX:if(t)return UA&255;wA=wA&65280|e,wA&=65535;break;case s.HIGHX:if(t)return UA>>8&255;wA=e<<8|wA&255,wA&=65535;break;case s.LOWY:if(t)return KA&255;_A=_A&65280|e,_A&=65535;break;case s.HIGHY:if(t)return KA>>8&255;_A=e<<8|_A&255,_A&=65535;break;case s.STATUS:return IA;case s.MODE:if(t)return pA(be);gr(e);break;case s.CLAMP:if(t){const[I,h]=ur(),[l,m]=Oo();switch(pr){case 0:return I>>8&255;case 1:return l>>8&255;case 2:return I&255;case 3:return l&255;case 4:return h>>8&255;case 5:return m>>8&255;case 6:return h&255;case 7:return m&255;default:return console.log("AppleMouse: invalid clamp index: "+pr),0}}pr=78-e;break;case s.CLOCK:case s.CLOCKMAGIC:return console.log("clock registers not implemented: C080, C088"),0;case s.COMMAND:if(t)return On;switch(On=e,e){case i.INIT:UA=0,KA=0,It=0,ht=0,Ir(0,1023),hr(0,1023),IA=0,he=0;break;case i.READ:he=0,IA&=-112,IA|=Ye>>1&64,IA|=Ye>>4&1,Ye=IA,(It!==UA||ht!==KA)&&(IA|=32,It=UA,ht=KA);break;case i.CLEAR:console.log("cmd.clear"),UA=0,KA=0,It=0,ht=0;break;case i.SERVE:IA&=-15,IA|=We,We=0,$e(CA,!1);break;case i.HOME:{const[I]=ur(),[h]=Oo();UA=I,KA=h}break;case i.CLAMPX:{const I=wA>32767?wA-65536:wA,h=_A;Ir(I,h),console.log(I+" -> "+h)}break;case i.CLAMPY:{const I=wA>32767?wA-65536:wA,h=_A;hr(I,h),console.log(I+" -> "+h)}break;case i.GCLAMP:console.log("cmd.getclamp");break;case i.POS:UA=wA,KA=_A;break}break;default:console.log("AppleMouse unknown IO addr",A.toString(16));break}return e},XA={RX_FULL:1,TX_EMPTY:2,DCD:4,OVRN:32,IRQ:128},Ne={COUNTER_DIV:3,TX_RTS:96,RX_INT_ENABLE:128},fl={RESET:3},Gn={RTS_TX_INT:32},El=320;class Bl{_control;_status;_lastRead;_receiveBuffer;_extFuncs;_outCount;_outDelay;update(e){(this._status&XA.TX_EMPTY)===0&&(this._outDelay+=e,this._outDelay>El&&(this._outDelay=0,this._status|=XA.TX_EMPTY,(this._control&Ne.TX_RTS)===Gn.RTS_TX_INT&&this.irq(!0)))}buffer(e){for(let s=0;s<e.length;s++)this._receiveBuffer.push(e[s]);let t=this._receiveBuffer.length-16;t=t<0?0:t;for(let s=0;s<t;s++)this._receiveBuffer.shift(),this._status|=XA.OVRN;this._status|=XA.RX_FULL,this._control&Ne.RX_INT_ENABLE&&this.irq(!0)}set data(e){const t=new Uint8Array(1).fill(e);this._extFuncs.sendData(t),this._status&=-3,this._outCount++}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=-117,this._receiveBuffer.length?(this._status|=XA.RX_FULL,this._control&Ne.RX_INT_ENABLE&&this.irq(!0)):(this._status&=-2,this.irq(!1)),this._lastRead}set control(e){this._control,this._control=e,(this._control&Ne.COUNTER_DIV)===fl.RESET?this.reset():(this._control&Ne.TX_RTS)==Gn.RTS_TX_INT&&(this._status&=-3),this._status&XA.RX_FULL&&this._control&Ne.RX_INT_ENABLE&&this.irq(!0)}get status(){const e=this._status;return this._status&XA.IRQ&&this.irq(!1),e}irq(e){e?this._status|=XA.IRQ:this._status&=-129,this._extFuncs.interrupt(e)}reset(){this._control=0,this._status=XA.TX_EMPTY|XA.DCD,this.irq(!1),this._receiveBuffer=[],this._outCount=0,this._outDelay=0}constructor(e){this._extFuncs=e,this._lastRead=0,this._control=0,this._status=0,this._receiveBuffer=[],this._outCount=0,this._outDelay=0,this.reset()}}const hA={OUTPUT_ENABLE:128,IRQ_ENABLE:64,COUNTER_MODE:56,BIT8_MODE:4,INTERNAL_CLOCK:2,SPECIAL:1},ml={ANY_IRQ:128},Dl=(A,e)=>{let t="";if(e&hA.OUTPUT_ENABLE?t+="OE   ":t+="/OE  ",e&hA.IRQ_ENABLE?t+="IRQ  ":t+="/IRQ ",e&hA.BIT8_MODE?t+="D8BIT ":t+="16BIT ",e&hA.INTERNAL_CLOCK?t+="ICLK ":t+="ECLK ",e&hA.SPECIAL)switch(A){case 0:t+="RST  ";break;case 1:t+="WR0  ";break;case 2:t+="DIV8 ";break}else switch(A){case 0:t+="RUN  ";break;case 1:t+="WR2  ";break;case 2:t+="DIV1 ";break}switch(t+="-> ",e&hA.COUNTER_MODE){case 0:t+="CONTINUOUS0";break;case 8:t+="FREQUENCY_CMP0";break;case 16:t+="CONTINUOUS1";break;case 24:t+="PULSE_WIDTH_CMP0";break;case 32:t+="SINGLE_SHOT0";break;case 40:t+="FREQUENCY_CMP1";break;case 48:t+="SINGLE_SHOT1";break;case 56:t+="PULSE_WIDTH_CMP1";break}return t};class Wo{_latch;_count;_control;_enabled;decrement(e){return this._enabled?(this._count-=e,this._count<0?(this._count=65535,this._enabled=!1,!0):!1):!1}get count(){return this._count}set control(e){this._control=e}get control(){return this._control}set latch(e){switch(this._latch=e,this._control&hA.COUNTER_MODE){case 0:case 32:this.reload();break}}get latch(){return this._latch}reload(){this._count=this._latch,this._enabled=!0}reset(){this._latch=65535,this._control=0,this._enabled=!0,this.reload()}constructor(){this._latch=65535,this._count=65535,this._control=0,this._enabled=!0}}class kl{_timer;_status;_irqMask;_debugStatus;_debugStatusCount;_statusRead;_msb;_lsb;_div8;_interrupt;status(){return this._statusRead=this._status&7,this._status}timerControl(e,t){e===0&&(e=this._timer[1].control&hA.SPECIAL?0:2);let s=this._timer[e].control;if(this._timer[e].control=t,s!=t&&(t&hA.IRQ_ENABLE?this._irqMask|=1<<e:this._irqMask&=~(1<<e),e==0))switch((s&hA.SPECIAL)<<1|t&hA.SPECIAL){case 0:case 3:break;case 1:case 2:this._timer[0].reload(),this._timer[1].reload(),this._timer[2].reload(),this.irq(0,!1),this.irq(1,!1),this.irq(2,!1);break}}timerLSBw(e,t){const s=this._timer[0].control&hA.SPECIAL;let i=!1;switch(this._timer[e].control&hA.COUNTER_MODE){case 16:case 48:i=!0;break}const I=this._msb*256+t;this._timer[e].latch=I,(s||i)&&this._timer[e].reload(),this.irq(e,!1)}timerLSBr(e){return this._lsb}timerMSBw(e,t){this._msb=t}timerMSBr(e){const s=this._timer[0].control&hA.SPECIAL?this._timer[e].latch:this._timer[e].count;return this._lsb=s&255,this._statusRead&1<<e&&(this._statusRead&=~(1<<e),this.irq(e,!1)),s>>8&255}update(e){const t=this._timer[0].control&hA.SPECIAL;if(this._debugStatus&&(this._debugStatusCount++,this._debugStatusCount>1020300&&(this._debugStatusCount=0,this.printStatus())),!t){this._div8+=e;let s=!1;for(let i=0;i<3;i++){let I=e;if(i==2&&this._timer[2].control&hA.SPECIAL)if(this._div8>8)I=Math.floor(this._div8/8),this._div8%=8;else continue;if(s=this._timer[i].decrement(I),s)switch(this.irq(i,!0),this._timer[i].control&hA.COUNTER_MODE){case 0:case 16:this._timer[i].reload();break}}}}irq(e,t){const s=1<<e;t?this._status|=s:this._status&=~s,this._status&this._irqMask?(this._status|=ml.ANY_IRQ,this._statusRead&=~s,this._interrupt(!0)):(this._status&=-129,this._interrupt(!1))}printStatus(){console.log("Status : "+this._status.toString(16)),console.log("IRQMask: "+this._irqMask.toString(16));for(let e=0;e<3;e++)console.log("["+e+"]: "+Dl(e,this._timer[e].control)+" : "+this._timer[e].latch+" : "+this._timer[e].count)}reset(){this._timer.forEach(e=>{e.reset()}),this._status=0,this._irqMask=0,this.irq(0,!1),this.irq(1,!1),this.irq(2,!1),this._timer[0].control=hA.SPECIAL}constructor(e){this._interrupt=e,this._status=0,this._irqMask=0,this._statusRead=0,this._timer=[new Wo,new Wo,new Wo],this._msb=this._lsb=0,this._div8=0,this._debugStatus=!1,this._debugStatusCount=0,this.reset()}}let fr=2,iA,zA,No=0;const Tl=A=>{if(No){const e=c.cycleCount-No;iA.update(e),zA.update(e)}No=c.cycleCount},_n=A=>{$e(fr,A)},dl=A=>{zA&&zA.buffer(A)},wl=(A=!0,e=2)=>{if(!A)return;fr=e,iA=new kl(_n);const t={sendData:_0,interrupt:_n};zA=new Bl(t),At(fr,Rl),Xs(Tl,fr)},yl=()=>{iA&&(iA.reset(),zA.reset())},Rl=(A,e=-1)=>{if(A>=49408)return-1;const t={TCONTROL1:0,TCONTROL2:1,T1MSB:2,T1LSB:3,T2MSB:4,T2LSB:5,T3MSB:6,T3LSB:7,ACIASTATCTRL:8,ACIADATA:9,SDMIDICTRL:12,SDMIDIDATA:13,DRUMSET:14,DRUMCLEAR:15};let s=-1;switch(A&15){case t.SDMIDIDATA:case t.ACIADATA:e>=0?zA.data=e:s=zA.data;break;case t.SDMIDICTRL:case t.ACIASTATCTRL:e>=0?zA.control=e:s=zA.status;break;case t.TCONTROL1:e>=0?iA.timerControl(0,e):s=0;break;case t.TCONTROL2:e>=0?iA.timerControl(1,e):s=iA.status();break;case t.T1MSB:e>=0?iA.timerMSBw(0,e):s=iA.timerMSBr(0);break;case t.T1LSB:e>=0?iA.timerLSBw(0,e):s=iA.timerLSBr(0);break;case t.T2MSB:e>=0?iA.timerMSBw(1,e):s=iA.timerMSBr(1);break;case t.T2LSB:e>=0?iA.timerLSBw(1,e):s=iA.timerLSBr(1);break;case t.T3MSB:e>=0?iA.timerMSBw(2,e):s=iA.timerMSBr(2);break;case t.T3LSB:e>=0?iA.timerLSBw(2,e):s=iA.timerLSBr(2);break;case t.DRUMSET:case t.DRUMCLEAR:break;default:console.log("PASSPORT unknown IO",(A&15).toString(16));break}return s},Pl=(A=!0,e=4)=>{A&&(At(e,xl),Xs(Nl,e))},Go=[0,128],_o=[1,129],Ql=[2,130],bl=[3,131],Ge=[4,132],_e=[5,133],Er=[6,134],Xo=[7,135],pt=[8,136],Ct=[9,137],Ml=[10,138],Zo=[11,139],Ll=[12,140],Me=[13,141],St=[14,142],Xn=[16,145],Zn=[17,145],ZA=[18,146],xo=[32,160],$A=64,ge=32,Fl=(A=4)=>{for(let e=0;e<=255;e++)N(A,e,0);for(let e=0;e<=1;e++)Vo(A,e)},ql=(A,e)=>(V(A,St[e])&$A)!==0,Ul=(A,e)=>(V(A,ZA[e])&$A)!==0,xn=(A,e)=>(V(A,Zo[e])&$A)!==0,Kl=(A,e,t)=>{let s=V(A,Ge[e])-t;if(N(A,Ge[e],s),s<0){s=s%256+256,N(A,Ge[e],s);let i=V(A,_e[e]);if(i--,N(A,_e[e],i),i<0&&(i+=256,N(A,_e[e],i),ql(A,e)&&(!Ul(A,e)||xn(A,e)))){const I=V(A,ZA[e]);N(A,ZA[e],I|$A);const h=V(A,Me[e]);if(N(A,Me[e],h|$A),pe(A,e,-1),xn(A,e)){const l=V(A,Xo[e]),m=V(A,Er[e]);N(A,Ge[e],m),N(A,_e[e],l)}}}},Ol=(A,e)=>(V(A,St[e])&ge)!==0,Yl=(A,e)=>(V(A,ZA[e])&ge)!==0,Wl=(A,e,t)=>{if((V(A,Zo[e])&ge)!==0)return;let s=V(A,pt[e])-t;if(N(A,pt[e],s),s<0){s=s%256+256,N(A,pt[e],s);let i=V(A,Ct[e]);if(i--,N(A,Ct[e],i),i<0&&(i+=256,N(A,Ct[e],i),Ol(A,e)&&!Yl(A,e))){const I=V(A,ZA[e]);N(A,ZA[e],I|ge);const h=V(A,Me[e]);N(A,Me[e],h|ge),pe(A,e,-1)}}},Vn=new Array(8).fill(0),Nl=A=>{const e=c.cycleCount-Vn[A];for(let t=0;t<=1;t++)Kl(A,t,e),Wl(A,t,e);Vn[A]=c.cycleCount},Gl=(A,e)=>{const t=[];for(let s=0;s<=15;s++)t[s]=V(A,xo[e]+s);return t},_l=(A,e)=>A.length===e.length&&A.every((t,s)=>t===e[s]),Xe={slot:-1,chip:-1,params:[-1]};let Vo=(A,e)=>{const t=Gl(A,e);A===Xe.slot&&e===Xe.chip&&_l(t,Xe.params)||(Xe.slot=A,Xe.chip=e,Xe.params=t,N0({slot:A,chip:e,params:t}))};const Xl=(A,e)=>{switch(V(A,Go[e])&7){case 0:for(let s=0;s<=15;s++)N(A,xo[e]+s,0);Vo(A,e);break;case 7:N(A,Zn[e],V(A,_o[e]));break;case 6:{const s=V(A,Zn[e]),i=V(A,_o[e]);s>=0&&s<=15&&(N(A,xo[e]+s,i),Vo(A,e));break}}},pe=(A,e,t)=>{let s=V(A,Me[e]);switch(t>=0&&(s&=127-(t&127),N(A,Me[e],s)),e){case 0:$e(A,s!==0);break;case 1:Oa(s!==0);break}},Zl=(A,e,t)=>{let s=V(A,St[e]);t>=0&&(t=t&255,t&128?s|=t:s&=255-t),s|=128,N(A,St[e],s)},xl=(A,e=-1)=>{if(A<49408)return-1;const t=(A&3840)>>8,s=A&255,i=s&128?1:0;switch(s){case Go[i]:e>=0&&(N(t,Go[i],e),Xl(t,i));break;case _o[i]:case Ql[i]:case bl[i]:case Ml[i]:case Zo[i]:case Ll[i]:N(t,s,e);break;case Ge[i]:e>=0&&N(t,Er[i],e),pe(t,i,$A);break;case _e[i]:if(e>=0){N(t,Xo[i],e),N(t,Ge[i],V(t,Er[i])),N(t,_e[i],e);const I=V(t,ZA[i]);N(t,ZA[i],I&~$A),pe(t,i,$A)}break;case Er[i]:e>=0&&(N(t,s,e),pe(t,i,$A));break;case Xo[i]:e>=0&&N(t,s,e);break;case pt[i]:e>=0&&N(t,Xn[i],e),pe(t,i,ge);break;case Ct[i]:if(e>=0){N(t,Ct[i],e),N(t,pt[i],V(t,Xn[i]));const I=V(t,ZA[i]);N(t,ZA[i],I&~ge),pe(t,i,ge)}break;case Me[i]:e>=0&&pe(t,i,e);break;case St[i]:Zl(t,i,e);break}return-1};let Ze=0;const Br=192,Vl=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${W(Br)}   ; jump address
         STA   $07FE
         LDA   #$60    ; Fake RTS to determine our slot
         STA   $07FF
         JSR   $07FF
         TSX
         LDA   $100,X  ; High byte of slot adddress
         STA   $07FF   ; Store this for the high byte of our JMP command
         ASL           ; Shift $Cs up to $s0 (e.g. $C7 -> $70)
         ASL           ; We need this for the ProDOS unit number (below).
         ASL           ; Format = bits DSSS0000
         ASL           ; D = drive number (0), SSS = slot number (1-7)
         STA   $43     ; Store ProDOS unit number here
         LDA   #$08    ; Store block (512 bytes) at address $0800
         STA   $45     ; Address high byte
         LDA   #$00
         STA   $44     ; Address low byte
         STA   $46     ; Block 0 low byte
         STA   $47     ; Block 0 high byte
         JSR   $07FD   ; Read the block (will JMP to our driver and trigger it)
         BCS   ERROR
         LDA   #$0A    ; Store block (512 bytes) at address $0A00
         STA   $45     ; Address high byte
         LDA   #$01
         STA   $46     ; Block 1 low byte
         JSR   $07FD   ; Read
         BCS   ERROR
         LDA   $0801   ; Should be nonzero
         BEQ   ERROR
         LDA   #$01    ; Should always be 1
         CMP   $0800
         BNE   ERROR
         LDX   $43     ; ProDOS block 0 code wants ProDOS unit number in X
         JMP   $801    ; Continue reading the disk
ERROR    JMP   $E000   ; Out to BASIC on error
`,Jl=`
         NOP           ; Hard drive driver address
         BRA   DONE
         TSX           ; SmartPort driver address
         INX
         INC   $100,X
         INC   $100,X
         INC   $100,X
DONE     BCS   ERR
         LDA   #$00
         RTS
ERR      LDA   #$27
         RTS
`,jl=()=>{const A=new Uint8Array(256).fill(0),e=ut(0,Vl.split(`
`));A.set(e,0);const t=ut(0,Jl.split(`
`));return A.set(t,Br),A[254]=23,A[255]=Br,A};let ft=new Uint8Array;const Jo=(A=!0)=>{ft.length===0&&(ft=jl()),ft[1]=A?32:0;const t=49152+Br+7*256;Ke(7,ft,t,A0),Ke(7,ft,t+3,$l)},Hl=(A,e)=>{if(A===0)T(e,2);else if(A<=2){T(e,240);const[,,t]=tr(A),s=t/512;T(e+1,s&255),T(e+2,s>>>8),T(e+3,0),tt(4),rt(0)}else et(40),tt(0),rt(0),O()},vl=(A,e)=>{const[,,t]=tr(A),s=t/512,i=s>1600?2:1,I=i==2?32:64;T(e,240),T(e+1,s&255),T(e+2,s>>>8),T(e+3,0);const h="Apple2TS SP";T(e+4,h.length);let l=0;for(;l<h.length;l++)T(e+5+l,h.charCodeAt(l));for(;l<16;l++)T(e+5+l,h.charCodeAt(8));T(e+21,i),T(e+22,I),T(e+23,1),T(e+24,0),tt(25),rt(0)},zl=(A,e,t)=>{if(B(A)!==3){console.error(`Incorrect SmartPort parameter count at address ${A}`),et(4),O();return}const s=B(A+4);switch(s){case 0:Hl(e,t);break;case 1:case 2:et(33),O();break;case 3:case 4:vl(e,t);break;default:console.error(`SmartPort statusCode ${s} not implemented`);break}},$l=()=>{et(0),O(!1);const A=256+c.StackPtr,e=B(A+1)+256*B(A+2),t=B(e+1),s=B(e+2)+256*B(e+3),i=B(s+1),I=B(s+2)+256*B(s+3);switch(t){case 0:{zl(s,i,I);return}case 1:{if(B(s)!==3){console.error(`Incorrect SmartPort parameter count at address ${s}`),O();return}const m=512*(B(s+4)+256*B(s+5)+65536*B(s+6)),[D,k]=tr(i),Q=D.slice(m+k,m+512+k);Yt(I,Q);break}default:console.error(`SmartPort command ${t} not implemented`),O();return}const h=qo(i);h.motorRunning=!0,Ze||(Ze=setTimeout(()=>{Ze=0,h&&(h.motorRunning=!1),dA()},500)),dA()},A0=()=>{et(0),O(!1);const A=B(66),e=Math.max(Math.min(B(67)>>6,2),0),t=qo(e);if(!t.hardDrive)return;const[s,i,I]=tr(e),h=B(70)+256*B(71),l=512*h,m=B(68)+256*B(69);switch(t.status=` ${W(h,4)}`,A){case 0:{if(t.filename.length===0||I===0){tt(0),rt(0),O();return}const D=I/512;tt(D&255),rt(D>>>8);break}case 1:{if(l+512>I){O();return}const D=s.slice(l+i,l+512+i);Yt(m,D);break}case 2:{if(l+512>I){O();return}if(t.isWriteProtected){O();return}const D=Ot(m);s.set(D,l+i),t.diskHasChanges=!0,t.lastAppleWriteTime=Date.now();break}case 3:console.error("Hard drive format not implemented yet"),O();return;default:console.error("unknown hard drive command"),O();return}O(!1),t.motorRunning=!0,Ze||(Ze=setTimeout(()=>{Ze=0,t&&(t.motorRunning=!1),dA()},500)),dA()},Jn=`
        ORG   $300
OVER    LDA   #$00
LOOPA   LDX   #$00
LOOPX   LDY   #$00
LOOPY   INY
        BNE   LOOPY
        INX
        BNE   LOOPX  ; do inner Y loop again, 256 times
        INC
        BNE   LOOPA  ; do inner X loop again, 256 times
        JMP   OVER   ; do outer loop forever
        RTS
`,Ce={numLines:io.numLines,collapseLoops:io.collapseLoops,ignoreRegisters:io.ignoreRegisters},e0=A=>{Ce.numLines=A.numLines,Ce.collapseLoops=A.collapseLoops,Ce.ignoreRegisters=A.ignoreRegisters};let L=[];const t0=()=>{if(L.length<50)return;const A=10,e=Ce.ignoreRegisters?24:99,t=L[L.length-1].slice(A,e);let s=L.length-2;const i=Math.max(L.length-20,0);let I=-1;for(;s>=i;){if(L[s].slice(A,e)===t){I=s;break}s--}const h=L.length-I-1;if(I===-1||L.length-2*h<0)return;for(let D=I-1;D>=I-h+1;D--)if(L[D].slice(A,e)!==L[D+h].slice(A,e))return;const l=L[I-h].indexOf("repeated"),m=`******** ${h===1?"1 line repeated":`${h} lines repeated`}`;if(Ce.ignoreRegisters)for(let D=I-h+1;D<I;D++){const k=L[D],Q=L[D+h];L[D+h]=Q.slice(0,e)+Q.slice(e).split("").map((F,w)=>F!==k[e+w]?"*":F).join("")}if(I>=h&&l>0){L.splice(I-h+1,h);const D=parseInt(L[I-h].slice(l+9))+1;L[I-h]=`${m} ${D} times`}else L[I]=`${m} 1 time`,L.splice(I-h+1,h-1);for(let D=I-h+1;D<L.length;D++)L[D].startsWith("    ")?L[D]="      .."+L[D].slice(8):L[D].startsWith("  ")?L[D]="    ...."+L[D].slice(8):L[D].startsWith("..")?L[D]="  ......"+L[D].slice(8):L[D]="........"+L[D].slice(8)},jo=A=>{L.length>Ce.numLines&&(L=L.slice(L.length-Ce.numLines)),L.push(A),Ce.collapseLoops&&t0()},Ho=()=>{L=[]},r0=()=>L;let yA=0;const x=[],o0=()=>yA,s0=()=>{const A=JSON.parse(JSON.stringify(c));let e=0;const t=new Array(256+256*(QA+1)).fill(0);for(let h=0;h<256;h++){const l=h*256;y.subarray(l,l+256).some(m=>m!==255)&&(t[h]=1,e++)}for(let h=0;h<256*(QA+1);h++){const l=98048+h*256;y.subarray(l,l+256).some(m=>m!==255)&&(t[256+h]=1,e++)}const s=new Uint8Array(e*256);e=0;let i=0;t.forEach((h,l)=>{if(h){const D=(l<256?0:32512)+l*256,k=y.subarray(D,D+256);s.set(k,256*e),e++,i=l}});const I=y.subarray(65536,65792);return{s6502:A,extraRamSize:64*(QA+1),machineName:S0(),softSwitches:ei(),stackDump:lc(),memvalid:t.slice(0,i+1).join(""),memC000:re.Buffer.from(I).toString("base64"),memory:re.Buffer.from(s).toString("base64")}},n0=(A,e)=>{const t=JSON.parse(JSON.stringify(A.s6502));tn();const s=A.machineName||"APPLE2EE";es(s,!1),As(),To(t);const i=A.softSwitches;for(const h in i){const l=h;try{S[l].isSet=i[h]}catch{}}"WRITEBSR1"in i&&(S.BSR_PREWRITE.isSet=!1,S.BSR_WRITE.isSet=i.WRITEBSR1||i.WRITEBSR2||i.RDWRBSR1||i.RDWRBSR2);const I=re.Buffer.from(A.memory,"base64");if(e<1){y.set(I.slice(0,65536)),y.set(I.slice(131072,163584),65536),y.set(I.slice(65536,131072),98048);const h=(I.length-163584)/1024;h>0&&(po(h+64),y.set(I.slice(163584),163584))}else if(e<2)po(A.extraRamSize),y.set(I);else{let h=0;(typeof A.memvalid=="string"?A.memvalid.split("").map(m=>m==="1"?1:0):A.memvalid).forEach((m,D)=>{if(m){const k=I.subarray(h*256,h*256+256);D<256?y.set(k,D*256):y.set(k,98048+(D-256)*256),h++}}),y.set(re.Buffer.from(A.memC000,"base64"),65536)}A.stackDump&&uc(A.stackDump),VA(),to(!0)},vo=A=>({emulator:null,state6502:s0(),driveState:Xc(A),thumbnail:"",snapshots:null}),i0=()=>{const A=vo(!0);return A.snapshots=x,A},mr=(A,e=!1)=>{yr();const t=A.emulator?.version?A.emulator.version:.9;n0(A.state6502,t),Zc(A.driveState),e&&(x.length=0,yA=0),A.snapshots&&(x.length=0,x.push(...A.snapshots),yA=x.length),WA()},jn=()=>{const A=yA-1;return A<0||!x[A]?-1:A},Hn=()=>{const A=yA+1;return A>=x.length||!x[A]?-1:A},vn=()=>{x.length===30&&x.shift(),x.push(vo(!1)),yA=x.length,X0(x[x.length-1].state6502.s6502.PC)},a0=()=>{let A=jn();A<0||(YA(_.PAUSED),setTimeout(()=>{yA===x.length&&(vn(),A=Math.max(yA-2,0)),yA=A,mr(x[yA])},50))},c0=()=>{const A=Hn();A<0||(YA(_.PAUSED),setTimeout(()=>{yA=A,mr(x[A])},50))},l0=A=>{A<0||A>=x.length||(YA(_.PAUSED),setTimeout(()=>{yA=A,mr(x[A])},50))},u0=()=>{for(;x.length>0&&yA<x.length-1;)x.pop();yA=x.length},I0=()=>{const A=[];for(let e=0;e<x.length;e++)A[e]={s6502:x[e].state6502.s6502,thumbnail:x[e].thumbnail};return A},h0=A=>{x.length>0&&(x[x.length-1].thumbnail=A)};let Dr=0,kr=0,zn=!1,zo="default",$o=!1,$n=16.6881,Ai=17030,oA=_.IDLE,Tr=0,Et="APPLE2EE",dr=!1,Bt=0,Le=!1,OA=[];const g0=A=>{Le=A},p0=()=>{S.VBL.isSet=!0,Il()},C0=()=>{S.VBL.isSet=!1},ei=()=>{const A={};for(const e in S)A[e]=S[e].isSet;return A},S0=()=>Et,f0=A=>{To(A),WA()},E0=A=>{ot(A),WA()},B0=A=>{$o=A,WA()};let ti=!1;const As=()=>{ti||(ti=!0,Al(),wl(!0,2),Pl(!0,4),ul(!0,5),Nc(),Jo(),Ec())},m0=()=>{xc(),zr(),al(),yl(),$c(),Fl(4)},wr=()=>{if(ot(0),tn(),zs(Et),As(),Jn.length>0){const e=ut(768,Jn.split(`
`));y.set(e,768)}yr(),to(!0),qo(1).filename===""&&(Jo(!1),setTimeout(()=>{Jo()},200))},yr=()=>{if(Ya(),Ba(),B(49282),sn(),m0(),Mr()){Lr(!1);const A=c.cycleCount,e=setInterval(()=>{c.cycleCount-A>1e3&&(Lr(!0),clearInterval(e))},50)}},D0=A=>{Dr=A,$n=Dr===4?0:16.6881,Ai=17030*[.1,.5,1,2,3,4,24][Dr+2],si()},k0=A=>{zo=A},T0=()=>zo==="game"||zo==="embed",d0=A=>{zn=A,WA()},w0=(A,e)=>{A>>8===192?T(A,e):y[A]=e,WA()},es=(A,e=!0)=>{Et=A,zs(Et),e&&yr(),WA()},y0=A=>{const e={...c},t=Ot(256),s=`
       JSR   $D82A
LOOP   JMP   LOOP
`,i=256,I=ut(i,s.split(`
`));for(let h=0;h<A.length;h++)y[512+h]=A.charCodeAt(h);y[512+A.length]=0,y.set(I,i),y[184]=0,y[185]=2,c.Accum=A.charCodeAt(0),c.PC=i,setTimeout(()=>{Yt(256,t),To(e)},30)},R0=A=>{po(A),WA()};let Rr=null;const ts=(A=!1)=>{Rr&&clearTimeout(Rr),A?Rr=setTimeout(()=>{dr=!0,Rr=null},100):dr=!0},ri=()=>{bt(),oA===_.IDLE&&(wr(),oA=_.PAUSED),Le||Ho(),lo(Le?jo:null),YA(_.PAUSED)},P0=()=>{bt(),oA===_.IDLE&&(wr(),oA=_.PAUSED),B(c.PC,!1)===32?(Le||Ho(),lo(Le?jo:null),oi()):ri()},oi=()=>{bt(),oA===_.IDLE&&(wr(),oA=_.PAUSED),Fa(),YA(_.RUNNING)},si=()=>{OA=[{time:performance.now(),cycles:c.cycleCount}],Tr=performance.now()},YA=(A,e=!0)=>{As(),e&&oA===_.RUNNING&&A===_.PAUSED&&($o=!0),oA=A,oA===_.PAUSED?(Ta(),Bt&&(clearInterval(Bt),Bt=0),bn()):oA===_.RUNNING&&(bn(!0),bt(),u0(),Bt||(Bt=setInterval(to,1e3))),Le||Ho(),WA(),si(),kr===0&&(kr=1,ai())},ni=A=>{oA===_.IDLE?(YA(_.NEED_BOOT),setTimeout(()=>{YA(_.NEED_RESET),setTimeout(()=>{A()},200)},200)):A()},Q0=(A,e,t)=>{ni(()=>{Yt(A,e),t&&GA(A)})},b0=A=>{ni(()=>{Ca(A)})},M0=()=>oA===_.PAUSED?ic():new Uint8Array,L0=()=>{const A=on(),e=A[105]|A[106]<<8,t=A[107]|A[108]<<8;let s=y.slice(e,t+1);const i=s.length-1;s[i]=0;for(let I=0;I<i;I+=7){const h=s.slice(I,I+7),l=h[0];if(l===0)break;const m=h[1];if((l&128)===0&&m&128){const k=h[3]|h[4]<<8,Q=h[2],F=y.slice(k,k+Q);s[I+3]=s.length&255,s[I+4]=s.length>>8&255,s=new Uint8Array([...s,...F])}}return s},F0=()=>oA!==_.IDLE?Ic():"";let ii=!1;const WA=()=>{B(S.PB0.isSetAddr),B(S.PB1.isSetAddr);const A={addressGetTable:rA,altChar:S.ALTCHARSET.isSet,basicMemory:L0(),breakpoints:uA,button0:S.PB0.isSet,button1:S.PB1.isSet,canGoBackward:jn()>=0,canGoForward:Hn()>=0,c800Slot:ho(),cout:B(57)<<8|B(56),cpuSpeed:kr,extraRamSize:64*(QA+1),hires:nc(),iTempState:o0(),isDebugging:zn,isTracing:!1,lores:Eo(!0),machineName:Et,memoryDump:M0(),noDelayMode:!S.COLUMN80.isSet&&S.DHIRES.isSet,ramWorksBank:de(),runMode:oA,s6502:c,showDebugTab:$o,softSwitches:ei(),speedMode:Dr,stackString:F0(),textPage:Eo(),timeTravelThumbnails:I0(),tracelog:oA===_.PAUSED?r0():[],zeroPage:on()};K0(A),ii||(ii=!0,Z0(ka()))},q0=A=>{if(A)for(let e=0;e<A.length;e++)ma(A[e]);else Da();A&&(A[0]<=49167||A[0]>=49232)&&VA(),WA()},U0=()=>{if(oA===_.IDLE||oA===_.PAUSED)return;oA===_.NEED_BOOT?(wr(),YA(_.RUNNING)):oA===_.NEED_RESET&&(yr(),YA(_.RUNNING));let A=0,e=-1;for(;;){const s=lo(Le?jo:null);if(s<0)break;if(A+=s,A<4550)S.VBL.isSet||p0();else{C0();const i=Math.floor((A-4550)/65);i!==e&&i<192&&(e=i,sc(i))}if(A>=Ai)break}OA.length>120&&OA.shift(),OA.push({time:performance.now(),cycles:c.cycleCount});const t=OA.length>1?(OA[OA.length-1].cycles-OA[0].cycles)/(OA[OA.length-1].time-OA[0].time):0;kr=t<1e4?Math.round(t/10)/100:Math.round(t/100)/10,Yi(),WA(),dr&&(dr=!1,vn())},ai=()=>{U0(),Tr+=$n;const A=performance.now();let e=Tr-A;e<0&&(Tr=A,e=0),e=oA===_.PAUSED?20:Math.max(1,e),setTimeout(ai,e)},SA=(A,e)=>{try{self.postMessage({msg:A,payload:e})}catch(t){console.error(`worker2main: doPostMessage error: ${t}`)}},K0=A=>{SA(cA.MACHINE_STATE,A)},O0=A=>{SA(cA.CLICK,A)},Y0=A=>{SA(cA.DRIVE_PROPS,A)},xe=A=>{SA(cA.DRIVE_SOUND,A)},W0=A=>{SA(cA.GET_MEMORY_RESPONSE,A)},ci=A=>{SA(cA.SAVE_STATE,A)},Pr=A=>{SA(cA.RUMBLE,A)},li=A=>{SA(cA.HELP_TEXT,A)},ui=A=>{SA(cA.ENHANCED_MIDI,A)},Ii=A=>{SA(cA.SHOW_APPLE_MOUSE,A)},N0=A=>{SA(cA.MBOARD_SOUND,A)},G0=A=>{SA(cA.COMM_DATA,A)},_0=A=>{SA(cA.MIDI_DATA,A)},X0=A=>{SA(cA.REQUEST_THUMBNAIL,A)},Z0=A=>{SA(cA.SOFTSWITCH_DESCRIPTIONS,A)},x0=A=>{SA(cA.INSTRUCTIONS,A)},V0=A=>{SA(cA.SERIAL_CONFIG_CHANGE,A)};typeof self<"u"&&(self.onmessage=A=>{if(!(!A.data||typeof A.data!="object")&&"msg"in A.data)switch(A.data.msg){case M.RUN_MODE:YA(A.data.payload);break;case M.STATE6502:f0(A.data.payload);break;case M.DEBUG:d0(A.data.payload);break;case M.APP_MODE:k0(A.data.payload);break;case M.SHOW_DEBUG_TAB:B0(A.data.payload);break;case M.BREAKPOINTS:Ua(A.data.payload);break;case M.STEP_INTO:ri();break;case M.STEP_OVER:P0();break;case M.STEP_OUT:oi();break;case M.BASIC_STEP:qa();break;case M.SPEED:D0(A.data.payload);break;case M.TIME_TRAVEL_STEP:A.data.payload==="FORWARD"?c0():a0();break;case M.TIME_TRAVEL_INDEX:l0(A.data.payload);break;case M.TIME_TRAVEL_SNAPSHOT:ts();break;case M.THUMBNAIL_IMAGE:h0(A.data.payload);break;case M.RESTORE_STATE:mr(A.data.payload,!0);break;case M.KEYPRESS:pa(A.data.payload);break;case M.KEYRELEASE:ga();break;case M.MOUSEEVENT:hl(A.data.payload);break;case M.PASTE_TEXT:b0(A.data.payload);break;case M.APPLE_PRESS:ps(!0,A.data.payload);break;case M.APPLE_RELEASE:ps(!1,A.data.payload);break;case M.GET_MEMORY:W0(ac());break;case M.GET_SAVE_STATE:ci(vo(!0));break;case M.GET_SAVE_STATE_SNAPSHOTS:ci(i0());break;case M.DRIVE_PROPS:{const e=A.data.payload;Jc(e);break}case M.DRIVE_NEW_DATA:{const e=A.data.payload;Vc(e);break}case M.GAMEPAD:Ui(A.data.payload);break;case M.SET_BINARY_BLOCK:{const e=A.data.payload;Q0(e.address,e.data,e.run);break}case M.SET_CYCLECOUNT:E0(A.data.payload);break;case M.SET_MEMORY:{const e=A.data.payload;w0(e.address,e.value);break}case M.COMM_DATA:zc(A.data.payload);break;case M.MIDI_DATA:dl(A.data.payload);break;case M.RAMWORKS:R0(A.data.payload);break;case M.MACHINE_NAME:es(A.data.payload);break;case M.REVERSE_YAXIS:Fi(A.data.payload);break;case M.SOFTSWITCHES:q0(A.data.payload);break;case M.SIRIUS_JOYPORT:Lr(A.data.payload);break;case M.EXECUTE_BASIC_COMMAND:{const e=A.data.payload;y0(e);break}case M.TRACING:g0(A.data.payload);break;case M.TRACE_SETTINGS:e0(A.data.payload);break;default:console.error(`worker2main: unhandled msg: ${JSON.stringify(A.data)}`);break}})})();
//# sourceMappingURL=worker2main-ALIS9Hj7.js.map
