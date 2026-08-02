(function(){var e=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports);let t=256*256,n=256*383,r=function(e){return e[e.IDLE=0]=`IDLE`,e[e.RUNNING=-1]=`RUNNING`,e[e.PAUSED=-2]=`PAUSED`,e[e.NEED_BOOT=-3]=`NEED_BOOT`,e[e.NEED_RESET=-4]=`NEED_RESET`,e}({}),i=function(e){return e[e.MACHINE_STATE=0]=`MACHINE_STATE`,e[e.CLICK=1]=`CLICK`,e[e.DRIVE_PROPS=2]=`DRIVE_PROPS`,e[e.DRIVE_SOUND=3]=`DRIVE_SOUND`,e[e.GET_MEMORY_RESPONSE=4]=`GET_MEMORY_RESPONSE`,e[e.SAVE_STATE=5]=`SAVE_STATE`,e[e.RUMBLE=6]=`RUMBLE`,e[e.HELP_TEXT=7]=`HELP_TEXT`,e[e.SHOW_APPLE_MOUSE=8]=`SHOW_APPLE_MOUSE`,e[e.MBOARD_SOUND=9]=`MBOARD_SOUND`,e[e.COMM_DATA=10]=`COMM_DATA`,e[e.MIDI_DATA=11]=`MIDI_DATA`,e[e.ENHANCED_MIDI=12]=`ENHANCED_MIDI`,e[e.REQUEST_THUMBNAIL=13]=`REQUEST_THUMBNAIL`,e[e.SOFTSWITCH_DESCRIPTIONS=14]=`SOFTSWITCH_DESCRIPTIONS`,e[e.INSTRUCTIONS=15]=`INSTRUCTIONS`,e[e.SERIAL_CONFIG_CHANGE=16]=`SERIAL_CONFIG_CHANGE`,e[e.VERA_FRAME=17]=`VERA_FRAME`,e[e.VERA_PCM_WRITE=18]=`VERA_PCM_WRITE`,e[e.VERA_PSG_WRITE=19]=`VERA_PSG_WRITE`,e}({}),a=function(e){return e[e.APPLE_PRESS=0]=`APPLE_PRESS`,e[e.APPLE_RELEASE=1]=`APPLE_RELEASE`,e[e.APP_MODE=2]=`APP_MODE`,e[e.BASIC_STEP=3]=`BASIC_STEP`,e[e.BREAKPOINTS=4]=`BREAKPOINTS`,e[e.COMM_DATA=5]=`COMM_DATA`,e[e.CYCLES_TO_RUN=6]=`CYCLES_TO_RUN`,e[e.DEBUG=7]=`DEBUG`,e[e.DRIVE_NEW_DATA=8]=`DRIVE_NEW_DATA`,e[e.DRIVE_PROPS=9]=`DRIVE_PROPS`,e[e.EXECUTE_BASIC_COMMAND=10]=`EXECUTE_BASIC_COMMAND`,e[e.GAMEPAD=11]=`GAMEPAD`,e[e.GET_MEMORY=12]=`GET_MEMORY`,e[e.GET_SAVE_STATE=13]=`GET_SAVE_STATE`,e[e.GET_SAVE_STATE_SNAPSHOTS=14]=`GET_SAVE_STATE_SNAPSHOTS`,e[e.KEYBOARD_STATE=15]=`KEYBOARD_STATE`,e[e.KEYPRESS=16]=`KEYPRESS`,e[e.KEYRELEASE=17]=`KEYRELEASE`,e[e.MACHINE_NAME=18]=`MACHINE_NAME`,e[e.MIDI_DATA=19]=`MIDI_DATA`,e[e.MOUSEEVENT=20]=`MOUSEEVENT`,e[e.PASTE_TEXT=21]=`PASTE_TEXT`,e[e.RAMWORKS=22]=`RAMWORKS`,e[e.RESTORE_STATE=23]=`RESTORE_STATE`,e[e.REVERSE_YAXIS=24]=`REVERSE_YAXIS`,e[e.RUN_MODE=25]=`RUN_MODE`,e[e.SET_BINARY_BLOCK=26]=`SET_BINARY_BLOCK`,e[e.SET_CYCLECOUNT=27]=`SET_CYCLECOUNT`,e[e.SET_MEMORY=28]=`SET_MEMORY`,e[e.SHOW_DEBUG_TAB=29]=`SHOW_DEBUG_TAB`,e[e.SIRIUS_JOYPORT=30]=`SIRIUS_JOYPORT`,e[e.SOFTSWITCHES=31]=`SOFTSWITCHES`,e[e.SPEED=32]=`SPEED`,e[e.STATE6502=33]=`STATE6502`,e[e.STEP_INTO=34]=`STEP_INTO`,e[e.STEP_OUT=35]=`STEP_OUT`,e[e.STEP_OVER=36]=`STEP_OVER`,e[e.THUMBNAIL_IMAGE=37]=`THUMBNAIL_IMAGE`,e[e.TIME_TRAVEL_INDEX=38]=`TIME_TRAVEL_INDEX`,e[e.TIME_TRAVEL_SNAPSHOT=39]=`TIME_TRAVEL_SNAPSHOT`,e[e.TIME_TRAVEL_STEP=40]=`TIME_TRAVEL_STEP`,e[e.TRACING=41]=`TRACING`,e[e.TRACE_SETTINGS=42]=`TRACE_SETTINGS`,e[e.VERA_SLOT=43]=`VERA_SLOT`,e}({}),o=function(e){return e[e.MOTOR_OFF=0]=`MOTOR_OFF`,e[e.MOTOR_ON=1]=`MOTOR_ON`,e[e.TRACK_END=2]=`TRACK_END`,e[e.TRACK_SEEK=3]=`TRACK_SEEK`,e}({}),s=function(e){return e[e.IMPLIED=0]=`IMPLIED`,e[e.IMM=1]=`IMM`,e[e.ZP_REL=2]=`ZP_REL`,e[e.ZP_X=3]=`ZP_X`,e[e.ZP_Y=4]=`ZP_Y`,e[e.ABS=5]=`ABS`,e[e.ABS_X=6]=`ABS_X`,e[e.ABS_Y=7]=`ABS_Y`,e[e.IND_X=8]=`IND_X`,e[e.IND_Y=9]=`IND_Y`,e[e.IND=10]=`IND`,e}({}),c=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),l=e=>e.startsWith(`B`)&&e!==`BIT`&&e!==`BRK`,u=(e,t=2)=>(e>255&&(t=4),(`0000`+e.toString(16).toUpperCase()).slice(-t));new Uint8Array(256).fill(0);let d=e=>e.split(``).map(e=>e.charCodeAt(0)),f=e=>[e&255,e>>>8&255],p=e=>[e&255,e>>>8&255,e>>>16&255,e>>>24&255],ee=(e,t)=>{let n=e.lastIndexOf(`.`)+1;return e.substring(0,n)+t},te=new Uint32Array(256).fill(0),ne=()=>{let e;for(let t=0;t<256;t++){e=t;for(let t=0;t<8;t++)e=e&1?3988292384^e>>>1:e>>>1;te[t]=e}},re=(e,t=0)=>{te[255]===0&&ne();let n=-1;for(let r=t;r<e.length;r++)n=n>>>8^te[(n^e[r])&255];return(n^-1)>>>0},ie=(e,t)=>e+40*Math.trunc(t/64)+t%8*1024+128*(Math.trunc(t/8)&7),ae=e=>{let t=e&8191,n=Math.trunc(Math.min(t&127,119)/40),r=Math.trunc((t&1023)/128),i=Math.trunc(t/1024);return 64*n+8*r+i},oe=e=>{let t=e.toLowerCase();return`.2mg,.hdv,.po,.2meg`.split(`,`).some(e=>t.endsWith(e))},se=!1,ce=()=>se,le=e=>{se=e},ue=!1,de=!1,fe=!1,pe=!1,me=!1,he=!1,ge=!1,_e=!1,ve=!1,ye=!1,be=e=>{let t=y.AN0.isSet,n=y.AN1.isSet,r=!1;switch(e){case y.PB0.isSetAddr:y.PB0.isSet=!t&&ue||t&&de,r=y.PB0.isSet;break;case y.PB1.isSetAddr:y.PB1.isSet=!t&&n&&me||t&&n&&he||!t&&!n&&ge||t&&!n&&_e,r=y.PB1.isSet;break;case y.PB2.isSetAddr:y.PB2.isSet=!t&&n&&fe||t&&n&&pe||!t&&!n&&ve||t&&!n&&ye,r=y.PB2.isSet;break}O(e,r?0:128)},xe=(e,t,n)=>{let r=!n;switch(t||(r=!0,n=!0),e){case-1:r&&(ue=!1,fe=!1,me=!1,ge=!1,ve=!1),n&&(de=!1,pe=!1,he=!1,_e=!1,ye=!1);break;case 0:r&&(ue=!0),n&&(de=!0);break;case 1:break;case 12:r&&(me=!0),n&&(he=!0);break;case 13:r&&(fe=!0),n&&(pe=!0);break;case 14:r&&(ge=!0),n&&(_e=!0);break;case 15:r&&(ve=!0),n&&(ye=!0);break;default:break}},Se,m=2836,Ce=m/2,we=m/2,Te=m/2,Ee=m/2,De=0,Oe=!1,ke=!1,Ae=!1,je=!1,Me=!1,Ne=!1,Pe=!1,Fe=!1,Ie=()=>{Ae=!0},Le=()=>{je=!0},Re=(e,t=!1)=>(e=Math.min(Math.max(e,-1),1),t&&Fe&&(e=-e),(e+1)*m/2),ze=(e,t)=>{switch(e){case 0:Ce=Re(t);break;case 1:we=Re(t,!0);break;case 2:Te=Re(t);break;case 3:Ee=Re(t);break}},Be=()=>{Ne=Oe||Ae,Pe=ke||je,y.PB0.isSet=Ne,y.PB1.isSet=Pe,y.PB2.isSet=Me},Ve=(e,t)=>{t?Oe=e:ke=e,Be()},He=e=>{Fe=e},Ue=e=>{O(49252,128),O(49253,128),O(49254,128),O(49255,128),De=e},We=(e,t)=>{let n=e-De;O(49252,n<Ce?t|128:t&127),O(49253,n<we?t|128:t&127),O(49254,n<Te?t|128:t&127),O(49255,n<Ee?t|128:t&127)},Ge=(e,t)=>{if(ce())be(e);else{let n=!1;switch(e){case y.PB0.isSetAddr:n=y.PB0.isSet;break;case y.PB1.isSetAddr:n=y.PB1.isSet;break;case y.PB2.isSetAddr:n=y.PB2.isSet;break}O(e,n?t|128:t&127)}},Ke,qe,Je=!1,Ye=e=>{Se=e,Je=!Se.length||!Se[0].buttons.length,Ke=Ht(),qe=Ke.gamepad?Ke.gamepad:ce()?xe:zt},Xe=e=>e>-.01&&e<.01,Ze=(e,t)=>{Xe(e)&&(e=0),Xe(t)&&(t=0);let n=Math.sqrt(e*e+t*t),r=.95*(n===0?1:Math.max(Math.abs(e),Math.abs(t))/n);return e=Math.min(Math.max(-r,e),r),t=Math.min(Math.max(-r,t),r),e=(e+r)/(2*r),t=(t+r)/(2*r),[e,t]},Qe=(e,t)=>([e,t]=Ze(e,t),e=Math.trunc(m*e),t=Math.trunc(m*t),[e,t]),$e=e=>{Fe&&(e=e.map((e,t)=>t%2==1?-e:e));let[t,n]=Qe(e[0],e[1]),r=e.length>=6?e[5]:e[3],[i,a]=e.length>=4?Qe(e[2],r):[0,0];return[t,n,i,a]},et=e=>{let t=Ke.joystick?Ke.joystick(Se[e].axes,Je):Se[e].axes,n=$e(t);e===0?(Ce=n[0],we=n[1]):(Te=n[0],Ee=n[1]);let r=Se[e].buttons;t.length>=10&&t[9]!==0&&t[9]<2&&(t[9]<-.4&&t[9]>-.5?r[15]=!0:t[9]>.7&&t[9]<.8?r[14]=!0:t[9]>.1&&t[9]<.2?r[13]=!0:t[9]<-.95&&(r[12]=!0)),qe(-1,Se.length>1,e===1),r.forEach((t,n)=>{t&&qe(n,Se.length>1,e===1)}),Ke.rumble&&Ke.rumble(),Be()},tt=()=>{Ae=!1,je=!1,Me=!1,Se&&Se.length>0&&(et(0),Se.length>1&&et(1))},nt=e=>{switch(e){case 0:_(`JL`);break;case 1:_(`G`,200);break;case 2:g(`M`),_(`O`);break;case 3:_(`L`);break;case 4:_(`F`);break;case 5:g(`P`),_(`T`);break;case 6:break;case 7:break;case 8:_(`Z`);break;case 9:{let e=Zr();e.includes(`'N'`)?g(`N`):e.includes(`'S'`)?g(`S`):e.includes(`NUMERIC KEY`)?g(`1`):g(`N`);break}case 10:break;case 11:break;case 12:_(`L`);break;case 13:_(`M`);break;case 14:_(`A`);break;case 15:_(`D`);break;case-1:return;default:break}},rt=0,it=0,at=!1,ot=.5,st={address:24835,data:[173,198,9],keymap:{},joystick:e=>e[0]<-.5?(it=0,rt===0||rt>2?(rt=0,g(`A`)):rt===1&&at?_(`W`):rt===2&&at&&_(`R`),rt++,at=!1,e):e[0]>ot?(rt=0,it===0||it>2?(it=0,g(`D`)):it===1&&at?_(`W`):it===2&&at&&_(`R`),it++,at=!1,e):e[1]<-.5?(_(`C`),e):e[1]>ot?(_(`S`),e):(at=!0,e),gamepad:nt,rumble:null,setup:null,helptext:`AZTEC
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
`},ct={address:25200,data:[141,16,192],keymap:{A:`J`,S:`K`,D:`L`,W:`I`,"\b":`U`,"":`O`},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Championship Lode Runner by Doug Smith
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
`},lt={address:24583,data:[173,0,192],keymap:{"\v":`A`,"\n":`Z`},joystick:null,gamepad:e=>{switch(e){case 0:g(` `);break;case 12:g(`A`);break;case 13:g(`Z`);break;case 14:g(`\b`);break;case 15:g(``);break;case-1:return;default:break}},rumble:null,setup:null,helptext:`Drol
Benny Aik Beng Ngo, Brøderbund 1983

KEYBOARD:
Arrow keys for left/right
Arrow keys or A/Z for up/down
Spacebar: Fire

GAMEPAD:
D-pad: Up/Down/Left/Right
A button: Fire
`},ut={address:17706,data:[173,0,192],keymap:{"\b":`A`,"":`D`,"\v":`W`,"\n":`X`,P:`\r`,M:` `},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
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
`},dt={address:1037,data:[201,206,202,213,210],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{Yf(`APPLE2EU`,!1)},helptext:`Injured Engine
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
C         Close throttle`},ft=14,pt=14,mt={address:28268,data:[173,0,192],keymap:{N:`\b`,M:``,",":`\b`,".":``},joystick:null,gamepad:null,rumble:()=>{let e=E(182,!1);ft<40&&e<ft&&kp({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),ft=e,e=E(183,!1),pt<40&&e<pt&&kp({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),pt=e},setup:null,helptext:`KARATEKA
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
`},ht={address:25078,data:[141,16,192],keymap:{A:`J`,S:`K`,D:`L`,W:`I`,"\b":`U`,"":`O`},gamepad:null,joystick:null,rumble:null,setup:()=>{D(46793,234),D(46794,234)},helptext:`Lode Runner by Doug Smith
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
`},gt=e=>{switch(e){case 0:_(`A`);break;case 1:_(`C`,50);break;case 2:_(`O`);break;case 3:_(`T`);break;case 4:_(`\x1B`);break;case 5:_(`\r`);break;case 6:break;case 7:break;case 8:g(`N`),_(`'`);break;case 9:g(`Y`),_(`1`);break;case 10:break;case 11:break;case 12:break;case 13:_(` `);break;case 14:break;case 15:_(`	`);break;case-1:return;default:break}},_t=.5,vt={address:768,data:[141,74,3,132],keymap:{},gamepad:gt,joystick:(e,t)=>{if(t)return e;let n=(e[0]<-.5?`\b`:e[0]>_t?``:``)+(e[1]<-.5?`\v`:e[1]>_t?`
`:``);return n||(n=e[2]<-.5?`L\b`:e[2]>_t?`L`:``,n||=e[3]<-.5?`L\v`:e[3]>_t?`L
`:``),n&&_(n,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert
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
ESC  exit conversation`},yt={address:41642,data:[67,82,79],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Julius Erving and Larry Bird Go One-on-One
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
`},bt={address:55645,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Prince of Persia
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
`},xt={address:30110,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`The Print Shop

Total Reprint is a port of The Print Shop Color (1986) to ProDOS. Some notable features:

* All Broderbund graphic libraries
* Additional openly licensed 3rd party graphics and fonts
* Unified UI for selecting 3rd party graphics and borders
* All libraries available from hard drive (no swapping floppies!)

Total Reprint is © 2025 by 4am and licensed under the MIT open source license.
All original code is available on <a href="https://github.com/a2-4am/4print" target="_blank" rel="noopener noreferrer">GitHub</a>.

Program and graphic libraries are © their respective authors.`},St={address:16962,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:()=>{E(14799,!1)===255&&kp({startDelay:0,duration:1e3,weakMagnitude:1,strongMagnitude:0})},setup:()=>{D(3178,99)},helptext:`Robotron: 2084
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
Ctrl+S    Turn Sound On/Off`},Ct=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,wt=e=>{switch(e){case 1:D(109,255);break;case 12:g(`A`);break;case 13:g(`Z`);break;case 14:g(`\b`);break;case 15:g(``);break;default:break}},Tt=.75,Et=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{D(25025,173),D(25036,64)},helptext:Ct},{address:7291,data:[173,0,192],keymap:{N:`\b`,M:``,",":`\b`,".":``},joystick:e=>{let t=e[0]<-.75?`\b`:e[0]>Tt?``:e[1]<-.75?`A`:e[1]>Tt?`Z`:``;return t&&g(t),e},gamepad:wt,rumble:null,setup:null,helptext:Ct}],Dt={address:24907,data:[44,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`<b>Tass Times in Tonetown</b>
Activision 1986
Designed by Michael Berlyn and Muffy McClung Berlyn
Apple ][ version by B. Heineman, Interplay Productions
Artwork by Todd Camasta
Advent code by Brian Fargo and Steve Neilsen

In Tass Times in Tonetown, you explore a bizarre city filled with eccentric characters and strange locations. Your goal is to solve puzzles, interact with the townspeople, and ultimately uncover the secrets of Tonetown.

<img src="disks/tasstimes_cover.jpg"/>

<a href="https://archive.org/details/Tass_Times_in_Tonetown_Manual_HQ/" target="_blank">Full Manual</a>

<a href="https://archive.org/details/Tass_Times-Newspaper/" target="_blank">Game Newspaper</a>

<a href="https://archive.org/details/tass-times-in-tone-town-source-code" target="_blank">Source Code</a>
`},Ot={address:28948,data:[213,204,212],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Ultima IV: Quest of the Avatar
by Lord British
(c) 1985 Origin Systems
_____________________________________________
Arrows movement
A      attack, plus direction
B      board transport or mount horse
C      cast spell, plus player and spell first letter
D      down ladder to next level
E      enter towne, castle, or structure
F      fire cannon, plus direction
G      get chest
H      hole up and camp
I      ignite torch
J      jimmy a lock, plus direction
K      climb up
L      locate position (requires special item)
M      mix reagents
N      new character order
O      open door, plus direction
P      peer at gem
Q      quit and save game
R      ready weapon
S      search
T      talk, plus direction
U      use item
V      volume, toggle sound
W      wear armour
X      exit transport or mount
Y      yell, speed up or slow down horse
Z      display stats/attributes
---
* Special Note: Talking with the people found in the game is one of the most important features of Ultima IV to master. It is virtually impossible to solve thy quests without talking to virtually all people in each towne. Each person with whom thou dost Talk is capable of a full conversation. They can be asked about their “Name,” “Job,” and “Health.” You may “Look” again at their visual description. From this information thou shouldst be able to discern what else they might know, hinted at directly by use of the precise words in the conversation. E.g., if thou were to ask Dupré about his “Job” and he were to respond “I am hunting Gremlins,” thou might think to ask him about “Hunting” or “Gremlins” - about either of which he might offer some insight.

Each of these people might ask of thee a question as well; be sure to answer the question honestly, for dishonesty will be remembered and not reflect well upon thee for the rest of the game. Often thou shalt not know what to ask a townsperson until thou hast been told by another: E.g., Iolo the Bard might tell thee to ask Shamino the Ranger about swords. Even if thou hadst met Shamino earlier thou wouldst not have known to ask him about swords, and thus thou wouldst have to seek him out again if thou dost wish that knowledge.

Some of the people that thou shalt meet may be willing to become thy travelling companions. If thou dost wish for a character to become a player in thy party, thou must ask them to “Join” thee. Tis most wise to strengthen thy party as rapidly as possible, up to the seven companions thou shalt need to complete the game. When thou art through with a conversation, then speak the word “Bye” as an accepted means of politely ending thy conversation.

Be sure to keep a journal of thy travels! Many of the clues to solving the quests of Ultima IV are contained in the various and diverse conversations thou might have with the various townsfolk. It would be next to impossible to solve this game without some means of referring back to prior conversa- tions held during play.

Be sure to thoroughly explore the cities and townes! Many of the quests within Ultima IV are contained entirely within individual cities. Tis wisest to spend a great deal of time seeking out the answers that lie hidden in each one of the various townes of Britannia, before moving on to another.

NOTE: During thy conversations with people in Ultima IV, thou may feel the impulse to show thy generosity to less fortunate fellows. Thou may do so by saying: “Give”.
`},kt={address:514,data:[85,76,84,73,77,65,53],keymap:{},gamepad:null,joystick:null,rumble:null,setup:()=>{jp(1)},helptext:`Ultima V: Warriors of Destiny
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

`},At={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},jt=`<b>Castle Wolfenstein</b>
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
LB button: Inventory`,Mt=e=>{switch(e){case 0:Ie();break;case 1:Le();break;case 2:_(` `);break;case 3:_(`U`);break;case 4:_(`\r`);break;case 5:_(`T`);break;case 9:{let e=Zr();e.includes(`'N'`)?g(`N`):e.includes(`'S'`)?g(`S`):e.includes(`NUMERIC KEY`)?g(`1`):g(`N`);break}case 10:Ie();break;case-1:break;default:break}},Nt=()=>{D(5128,0),D(5130,4);let e=5210;D(e,234),D(e+1,234),D(e+2,234),e=5224,D(e,234),D(e+1,234),D(e+2,234)},Pt=()=>{E(49178,!1)<128&&E(49181,!1)<128&&kp({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},Ft={address:3205,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:jt},It={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:Mt,rumble:Pt,setup:Nt,helptext:jt},Lt={address:2926,data:[169,0,133],keymap:{},joystick:null,gamepad:e=>{switch(e){case 0:Ie();break;case 1:Le();break;case 2:_(` `);break;case 3:_(`U`);break;case 4:_(`\r`);break;case 5:_(`:`);break;case 9:{let e=Zr();e.includes(`'N'`)?g(`N`):e.includes(`'S'`)?g(`S`):e.includes(`NUMERIC KEY`)?g(`1`):g(`N`);break}case 10:Ie();break;case-1:break;default:break}},rumble:null,setup:null,helptext:`<b>Beyond Castle Wolfenstein</b>
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
LB button: Inventory`},Rt=[],h=e=>{Array.isArray(e)?Rt.push(...e):Rt.push(e)};h(st),h(ct),h(lt),h(ut),h(dt),h(mt),h(ht),h(vt),h(yt),h(bt),h(xt),h(St),h(Et),h(Dt),h(Ot),h(kt),h(At),h(It),h(Ft),h(Lt);let zt=(e,t,n)=>{let r=!n;switch(e){case 0:r&&Ie();break;case 1:r&&Le();break;case 12:ze(n?3:1,-1);break;case 13:ze(n?3:1,1);break;case 14:ze(n?2:0,-1);break;case 15:ze(n?2:0,1);break;default:break}},Bt={address:0,data:[],keymap:{},gamepad:null,joystick:e=>e,rumble:null,setup:null,helptext:``},Vt=e=>{for(let t of Rt)if(oi(t.address,t.data))return e.toUpperCase()in t.keymap?t.keymap[e.toUpperCase()]:e;return e},Ht=()=>{for(let e of Rt)if(oi(e.address,e.data))return e;return Bt},Ut=(e=!1)=>{for(let e of Rt)if(oi(e.address,e.data)){Ap(e.helptext?e.helptext:` `),e.setup&&e.setup();return}e&&(Ap(` `),jp(0))},Wt=e=>{O(49152,e|128,16),O(49168,e&255|128,16)},Gt=0,Kt=0,qt=e=>{if(!e.isDown||e.key<=0){Gt=0,Xt();return}if(Gt=Vt(String.fromCharCode(e.key)).charCodeAt(0),Wt(Gt),!e.repeat){Gt=0;return}Kt=performance.now()+600},Jt=()=>{if(!Gt)return;let e=performance.now();e<Kt||(Wt(Gt),Kt=e+75)},Yt=()=>{O(49152,Kr(49152)&127,16)},Xt=()=>{O(49152,Kr(49152)&127,32)},Zt=``,Qt=1e9,$t=0,en=0,tn=()=>{let e=performance.now();if(en++,Zt!==``&&en>2&&(Kr(49152)<128||e-Qt>3800)){en=0,Qt=e;let t=Zt.charCodeAt(0);Wt(t),Zt=Zt.slice(1),Zt.length===0&&e-$t>500&&($t=e,ep(!0))}},nn=``,g=e=>{e===nn&&Zt.length>0||(nn=e,Zt+=e)},rn=0,_=(e,t=300)=>{let n=performance.now();n-rn<t||(rn=n,g(e))},an=e=>{let t=String.fromCharCode(e);t=Vt(t),g(t),tn()},on=e=>{e.length===1&&(e=Vt(e)),g(e)},sn=[],v=(e,t,n,r=!1,i=null)=>{let a={offAddr:e,onAddr:t,isSetAddr:n,writeOnly:r,isSet:!1,setFunc:i};return e>=49152&&(sn[e-49152]=a),t>=49152&&(sn[t-49152]=a),n>=49152&&(sn[n-49152]=a),a},cn=()=>Math.floor(180*Math.random()),ln=()=>Math.floor(256*Math.random()),un=e=>{O(e,Kr(e&65527)&128|cn()&127)},dn=(e,t)=>{e&=11,t?y.BSR_PREWRITE.isSet=!1:e&1?y.BSR_PREWRITE.isSet?y.BSR_WRITE.isSet=!0:y.BSR_PREWRITE.isSet=!0:(y.BSR_PREWRITE.isSet=!1,y.BSR_WRITE.isSet=!1),y.BSRBANK2.isSet=e<=3,y.BSRREADRAM.isSet=[0,3,8,11].includes(e)},y={STORE80:v(49152,49153,49176,!0),RAMRD:v(49154,49155,49171,!0),RAMWRT:v(49156,49157,49172,!0),INTCXROM:v(49158,49159,49173,!0),INTC8ROM:v(49194,0,0),ALTZP:v(49160,49161,49174,!0),SLOTC3ROM:v(49162,49163,49175,!0),COLUMN80:v(49164,49165,49183,!0),ALTCHARSET:v(49166,49167,49182,!0),KBRDSTROBE:v(49168,0,0,!1),BSRBANK2:v(0,0,49169),BSRREADRAM:v(0,0,49170),VBL:v(0,0,49177),CASSOUT:v(49184,0,0),SPEAKER:v(49200,0,0,!1,(e,t)=>{O(49200,cn()),wp(t)}),GCSTROBE:v(49216,0,0),EMUBYTE:v(0,0,49231,!1,()=>{O(49231,205)}),TEXT:v(49232,49233,49178),MIXED:v(49234,49235,49179),PAGE2:v(49236,49237,49180),HIRES:v(49238,49239,49181),AN0:v(49240,49241,0),AN1:v(49242,49243,0),AN2:v(49244,49245,0),DHIRES:v(49247,49246,0),CASSIN1:v(0,0,49248,!1,()=>{O(49248,cn())}),PB0:v(0,0,49249,!1,e=>{Ge(e,cn())}),PB1:v(0,0,49250,!1,e=>{Ge(e,cn())}),PB2:v(0,0,49251,!1,e=>{Ge(e,cn())}),JOYSTICK0:v(0,0,49252,!1,(e,t)=>{We(t,cn())}),JOYSTICK1:v(0,0,49253,!1,(e,t)=>{We(t,cn())}),JOYSTICK2:v(0,0,49254,!1,(e,t)=>{We(t,cn())}),JOYSTICK3:v(0,0,49255,!1,(e,t)=>{We(t,cn())}),CASSIN2:v(0,0,49256,!1,e=>{un(e)}),C069:v(0,0,49257,!1,e=>{un(e)}),FASTCHIP_LOCK:v(49258,0,0,!1,e=>{un(e)}),FASTCHIP_ENABLE:v(49259,0,0,!1,e=>{un(e)}),C06C:v(0,0,49260,!1,e=>{un(e)}),FASTCHIP_SPEED:v(49261,0,0,!1,e=>{un(e)}),C06E:v(0,0,49262,!1,e=>{un(e)}),C06F:v(0,0,49263,!1,e=>{un(e)}),JOYSTICKRESET:v(0,0,49264,!1,(e,t)=>{Ue(t),O(49264,cn())}),BANKSEL:v(49267,0,0),LASER128EX:v(49268,0,0),VIDEO7_160:v(49272,49273,0),VIDEO7_MONO:v(49274,49275,0),VIDEO7_MIXED:v(49276,49277,0),BSR_PREWRITE:v(49280,0,0),BSR_WRITE:v(49288,0,0)};y.TEXT.isSet=!0;let fn=!0,pn=0,mn=e=>{if(fn!==e&&y.STORE80.isSet){if(e)switch(y.VIDEO7_160.isSet=!1,y.VIDEO7_MONO.isSet=!1,y.VIDEO7_MIXED.isSet=!1,pn=pn<<1&2,pn|=+!y.COLUMN80.isSet,pn){case 0:break;case 1:y.VIDEO7_160.isSet=!0;break;case 2:y.VIDEO7_MIXED.isSet=!0;break;case 3:y.VIDEO7_MONO.isSet=!0;break}fn=e}},hn=[49152,49153,49165,49167,49168,49200,49236,49237,49183],gn=(e,t)=>8192+e%8*1024+128*(Math.trunc(e/8)&7)+40*Math.trunc(e/64)+t,_n=(e,t,n)=>{if(e>1048575&&!hn.includes(e)){let r=+(Kr(e)>128);console.log(`${n} $${u(k.PC)}: $${u(e)} [${r}] ${t?`write`:``}`)}if(e<=49183&&Cr()===`APPLE2P`){!t&&e<=49167&&tn(),e>=49168&&Yt(),e!==49152&&e!==49168&&O(e,cn());return}if(e>=49280&&e<=49295){dn(e&-5,t);return}let r=sn[e-49152];if(!r){console.error(`Unknown softswitch `+u(e)),O(e,cn());return}if(e<=49167?t||tn():(e===49168||e<=49183&&t)&&Yt(),r.setFunc){(e===r.offAddr||e===r.onAddr)&&(r.isSet=e===r.onAddr),r.setFunc(e,n);return}if(e===y.DHIRES.offAddr?mn(!0):e===y.DHIRES.onAddr&&mn(!1),e===r.offAddr||e===r.onAddr){if((!r.writeOnly||t)&&(yn[r.offAddr-49152]===void 0?r.isSet=e===r.onAddr:yn[r.offAddr-49152]=e===r.onAddr),r.isSetAddr){let e=Kr(r.isSetAddr);O(r.isSetAddr,r.isSet?e|128:e&127)}if(e>=49184){let t;if(e>=49232&&e<=49247){let e=n%17030-4550;if(e>=0){let r=Math.floor(e/65),i=n%65;t=E(gn(r,i))}else t=ln()}else t=cn();O(e,t)}}else if(e===r.isSetAddr){let t=Kr(e);O(e,r.isSet?t|128:t&127)}},vn=()=>{for(let e in y){let t=e;yn[y[t].offAddr-49152]===void 0?y[t].isSet=!1:yn[y[t].offAddr-49152]=!1}yn[y.TEXT.offAddr-49152]===void 0?y.TEXT.isSet=!0:yn[y.TEXT.offAddr-49152]=!0},yn=[],bn=e=>{if(e>=49280&&e<=49295){dn(e&-5,!1);return}let t=sn[e-49152];if(!t){console.error(`overrideSoftSwitch: Unknown softswitch `+u(e));return}yn[t.offAddr-49152]===void 0&&(yn[t.offAddr-49152]=t.isSet),t.isSet=e===t.onAddr},xn=()=>{yn.forEach((e,t)=>{e!==void 0&&(sn[t].isSet=e)}),yn.length=0},Sn=[],Cn=()=>{if(Sn.length===0)for(let e in y){let t=y[e],n=t.onAddr>0,r=t.writeOnly?` (write)`:``;if(t.offAddr>0){let i=u(t.offAddr)+` `+e;Sn[t.offAddr]=i+(n?`-OFF`:``)+r}if(t.onAddr>0){let n=u(t.onAddr)+` `+e;Sn[t.onAddr]=n+`-ON`+r}if(t.isSetAddr>0){let n=u(t.isSetAddr)+` `+e;Sn[t.isSetAddr]=n+`-STATUS`+r}}return Sn[49152]=`C000 KBRD/STORE80-OFF`,Sn},wn=()=>{for(let e in y){let t=y[e];if(t.isSetAddr){let e=Kr(t.isSetAddr);O(t.isSetAddr,t.isSet?e|128:e&127)}}};var Tn=e((e=>{e.byteLength=c,e.toByteArray=u,e.fromByteArray=p;for(var t=[],n=[],r=typeof Uint8Array<`u`?Uint8Array:Array,i=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`,a=0,o=i.length;a<o;++a)t[a]=i[a],n[i.charCodeAt(a)]=a;n[45]=62,n[95]=63;function s(e){var t=e.length;if(t%4>0)throw Error(`Invalid string. Length must be a multiple of 4`);var n=e.indexOf(`=`);n===-1&&(n=t);var r=n===t?0:4-n%4;return[n,r]}function c(e){var t=s(e),n=t[0],r=t[1];return(n+r)*3/4-r}function l(e,t,n){return(t+n)*3/4-n}function u(e){var t,i=s(e),a=i[0],o=i[1],c=new r(l(e,a,o)),u=0,d=o>0?a-4:a,f;for(f=0;f<d;f+=4)t=n[e.charCodeAt(f)]<<18|n[e.charCodeAt(f+1)]<<12|n[e.charCodeAt(f+2)]<<6|n[e.charCodeAt(f+3)],c[u++]=t>>16&255,c[u++]=t>>8&255,c[u++]=t&255;return o===2&&(t=n[e.charCodeAt(f)]<<2|n[e.charCodeAt(f+1)]>>4,c[u++]=t&255),o===1&&(t=n[e.charCodeAt(f)]<<10|n[e.charCodeAt(f+1)]<<4|n[e.charCodeAt(f+2)]>>2,c[u++]=t>>8&255,c[u++]=t&255),c}function d(e){return t[e>>18&63]+t[e>>12&63]+t[e>>6&63]+t[e&63]}function f(e,t,n){for(var r,i=[],a=t;a<n;a+=3)r=(e[a]<<16&16711680)+(e[a+1]<<8&65280)+(e[a+2]&255),i.push(d(r));return i.join(``)}function p(e){for(var n,r=e.length,i=r%3,a=[],o=16383,s=0,c=r-i;s<c;s+=o)a.push(f(e,s,s+o>c?c:s+o));return i===1?(n=e[r-1],a.push(t[n>>2]+t[n<<4&63]+`==`)):i===2&&(n=(e[r-2]<<8)+e[r-1],a.push(t[n>>10]+t[n>>4&63]+t[n<<2&63]+`=`)),a.join(``)}})),En=e((e=>{
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
e.read=function(e,t,n,r,i){var a,o,s=i*8-r-1,c=(1<<s)-1,l=c>>1,u=-7,d=n?i-1:0,f=n?-1:1,p=e[t+d];for(d+=f,a=p&(1<<-u)-1,p>>=-u,u+=s;u>0;a=a*256+e[t+d],d+=f,u-=8);for(o=a&(1<<-u)-1,a>>=-u,u+=r;u>0;o=o*256+e[t+d],d+=f,u-=8);if(a===0)a=1-l;else if(a===c)return o?NaN:(p?-1:1)*(1/0);else o+=2**r,a-=l;return(p?-1:1)*o*2**(a-r)},e.write=function(e,t,n,r,i,a){var o,s,c,l=a*8-i-1,u=(1<<l)-1,d=u>>1,f=i===23?2**-24-2**-77:0,p=r?0:a-1,ee=r?1:-1,te=+(t<0||t===0&&1/t<0);for(t=Math.abs(t),isNaN(t)||t===1/0?(s=+!!isNaN(t),o=u):(o=Math.floor(Math.log(t)/Math.LN2),t*(c=2**-o)<1&&(o--,c*=2),o+d>=1?t+=f/c:t+=f*2**(1-d),t*c>=2&&(o++,c/=2),o+d>=u?(s=0,o=u):o+d>=1?(s=(t*c-1)*2**i,o+=d):(s=t*2**(d-1)*2**i,o=0));i>=8;e[n+p]=s&255,p+=ee,s/=256,i-=8);for(o=o<<i|s,l+=i;l>0;e[n+p]=o&255,p+=ee,o/=256,l-=8);e[n+p-ee]|=te*128}})),Dn=e((e=>{
/*!
* The buffer module from node.js, for the browser.
*
* @author   Feross Aboukhadijeh <https://feross.org>
* @license  MIT
*/
let t=Tn(),n=En(),r=typeof Symbol==`function`&&typeof Symbol.for==`function`?Symbol.for(`nodejs.util.inspect.custom`):null;e.Buffer=s,e.SlowBuffer=ie,e.INSPECT_MAX_BYTES=50;let i=2147483647;e.kMaxLength=i,s.TYPED_ARRAY_SUPPORT=a(),!s.TYPED_ARRAY_SUPPORT&&typeof console<`u`&&typeof console.error==`function`&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function a(){try{let e=new Uint8Array(1),t={foo:function(){return 42}};return Object.setPrototypeOf(t,Uint8Array.prototype),Object.setPrototypeOf(e,t),e.foo()===42}catch{return!1}}Object.defineProperty(s.prototype,"parent",{enumerable:!0,get:function(){if(s.isBuffer(this))return this.buffer}}),Object.defineProperty(s.prototype,"offset",{enumerable:!0,get:function(){if(s.isBuffer(this))return this.byteOffset}});function o(e){if(e>i)throw RangeError(`The value "`+e+`" is invalid for option "size"`);let t=new Uint8Array(e);return Object.setPrototypeOf(t,s.prototype),t}function s(e,t,n){if(typeof e==`number`){if(typeof t==`string`)throw TypeError(`The "string" argument must be of type string. Received type number`);return d(e)}return c(e,t,n)}s.poolSize=8192;function c(e,t,n){if(typeof e==`string`)return f(e,t);if(ArrayBuffer.isView(e))return ee(e);if(e==null)throw TypeError(`The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type `+typeof e);if(Ue(e,ArrayBuffer)||e&&Ue(e.buffer,ArrayBuffer)||typeof SharedArrayBuffer<`u`&&(Ue(e,SharedArrayBuffer)||e&&Ue(e.buffer,SharedArrayBuffer)))return te(e,t,n);if(typeof e==`number`)throw TypeError(`The "value" argument must not be of type number. Received type number`);let r=e.valueOf&&e.valueOf();if(r!=null&&r!==e)return s.from(r,t,n);let i=ne(e);if(i)return i;if(typeof Symbol<`u`&&Symbol.toPrimitive!=null&&typeof e[Symbol.toPrimitive]==`function`)return s.from(e[Symbol.toPrimitive](`string`),t,n);throw TypeError(`The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type `+typeof e)}s.from=function(e,t,n){return c(e,t,n)},Object.setPrototypeOf(s.prototype,Uint8Array.prototype),Object.setPrototypeOf(s,Uint8Array);function l(e){if(typeof e!=`number`)throw TypeError(`"size" argument must be of type number`);if(e<0)throw RangeError(`The value "`+e+`" is invalid for option "size"`)}function u(e,t,n){return l(e),e<=0||t===void 0?o(e):typeof n==`string`?o(e).fill(t,n):o(e).fill(t)}s.alloc=function(e,t,n){return u(e,t,n)};function d(e){return l(e),o(e<0?0:re(e)|0)}s.allocUnsafe=function(e){return d(e)},s.allocUnsafeSlow=function(e){return d(e)};function f(e,t){if((typeof t!=`string`||t===``)&&(t=`utf8`),!s.isEncoding(t))throw TypeError(`Unknown encoding: `+t);let n=ae(e,t)|0,r=o(n),i=r.write(e,t);return i!==n&&(r=r.slice(0,i)),r}function p(e){let t=e.length<0?0:re(e.length)|0,n=o(t);for(let r=0;r<t;r+=1)n[r]=e[r]&255;return n}function ee(e){if(Ue(e,Uint8Array)){let t=new Uint8Array(e);return te(t.buffer,t.byteOffset,t.byteLength)}return p(e)}function te(e,t,n){if(t<0||e.byteLength<t)throw RangeError(`"offset" is outside of buffer bounds`);if(e.byteLength<t+(n||0))throw RangeError(`"length" is outside of buffer bounds`);let r;return r=t===void 0&&n===void 0?new Uint8Array(e):n===void 0?new Uint8Array(e,t):new Uint8Array(e,t,n),Object.setPrototypeOf(r,s.prototype),r}function ne(e){if(s.isBuffer(e)){let t=re(e.length)|0,n=o(t);return n.length===0||e.copy(n,0,0,t),n}if(e.length!==void 0)return typeof e.length!=`number`||We(e.length)?o(0):p(e);if(e.type===`Buffer`&&Array.isArray(e.data))return p(e.data)}function re(e){if(e>=i)throw RangeError(`Attempt to allocate Buffer larger than maximum size: 0x`+i.toString(16)+` bytes`);return e|0}function ie(e){return+e!=e&&(e=0),s.alloc(+e)}s.isBuffer=function(e){return e!=null&&e._isBuffer===!0&&e!==s.prototype},s.compare=function(e,t){if(Ue(e,Uint8Array)&&(e=s.from(e,e.offset,e.byteLength)),Ue(t,Uint8Array)&&(t=s.from(t,t.offset,t.byteLength)),!s.isBuffer(e)||!s.isBuffer(t))throw TypeError(`The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array`);if(e===t)return 0;let n=e.length,r=t.length;for(let i=0,a=Math.min(n,r);i<a;++i)if(e[i]!==t[i]){n=e[i],r=t[i];break}return n<r?-1:+(r<n)},s.isEncoding=function(e){switch(String(e).toLowerCase()){case`hex`:case`utf8`:case`utf-8`:case`ascii`:case`latin1`:case`binary`:case`base64`:case`ucs2`:case`ucs-2`:case`utf16le`:case`utf-16le`:return!0;default:return!1}},s.concat=function(e,t){if(!Array.isArray(e))throw TypeError(`"list" argument must be an Array of Buffers`);if(e.length===0)return s.alloc(0);let n;if(t===void 0)for(t=0,n=0;n<e.length;++n)t+=e[n].length;let r=s.allocUnsafe(t),i=0;for(n=0;n<e.length;++n){let t=e[n];if(Ue(t,Uint8Array))i+t.length>r.length?(s.isBuffer(t)||(t=s.from(t)),t.copy(r,i)):Uint8Array.prototype.set.call(r,t,i);else if(s.isBuffer(t))t.copy(r,i);else throw TypeError(`"list" argument must be an Array of Buffers`);i+=t.length}return r};function ae(e,t){if(s.isBuffer(e))return e.length;if(ArrayBuffer.isView(e)||Ue(e,ArrayBuffer))return e.byteLength;if(typeof e!=`string`)throw TypeError(`The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type `+typeof e);let n=e.length,r=arguments.length>2&&arguments[2]===!0;if(!r&&n===0)return 0;let i=!1;for(;;)switch(t){case`ascii`:case`latin1`:case`binary`:return n;case`utf8`:case`utf-8`:return Re(e).length;case`ucs2`:case`ucs-2`:case`utf16le`:case`utf-16le`:return n*2;case`hex`:return n>>>1;case`base64`:return Ve(e).length;default:if(i)return r?-1:Re(e).length;t=(``+t).toLowerCase(),i=!0}}s.byteLength=ae;function oe(e,t,n){let r=!1;if((t===void 0||t<0)&&(t=0),t>this.length||((n===void 0||n>this.length)&&(n=this.length),n<=0)||(n>>>=0,t>>>=0,n<=t))return``;for(e||=`utf8`;;)switch(e){case`hex`:return xe(this,t,n);case`utf8`:case`utf-8`:return ge(this,t,n);case`ascii`:return ye(this,t,n);case`latin1`:case`binary`:return be(this,t,n);case`base64`:return he(this,t,n);case`ucs2`:case`ucs-2`:case`utf16le`:case`utf-16le`:return Se(this,t,n);default:if(r)throw TypeError(`Unknown encoding: `+e);e=(e+``).toLowerCase(),r=!0}}s.prototype._isBuffer=!0;function se(e,t,n){let r=e[t];e[t]=e[n],e[n]=r}s.prototype.swap16=function(){let e=this.length;if(e%2!=0)throw RangeError(`Buffer size must be a multiple of 16-bits`);for(let t=0;t<e;t+=2)se(this,t,t+1);return this},s.prototype.swap32=function(){let e=this.length;if(e%4!=0)throw RangeError(`Buffer size must be a multiple of 32-bits`);for(let t=0;t<e;t+=4)se(this,t,t+3),se(this,t+1,t+2);return this},s.prototype.swap64=function(){let e=this.length;if(e%8!=0)throw RangeError(`Buffer size must be a multiple of 64-bits`);for(let t=0;t<e;t+=8)se(this,t,t+7),se(this,t+1,t+6),se(this,t+2,t+5),se(this,t+3,t+4);return this},s.prototype.toString=function(){let e=this.length;return e===0?``:arguments.length===0?ge(this,0,e):oe.apply(this,arguments)},s.prototype.toLocaleString=s.prototype.toString,s.prototype.equals=function(e){if(!s.isBuffer(e))throw TypeError(`Argument must be a Buffer`);return this===e||s.compare(this,e)===0},s.prototype.inspect=function(){let t=``,n=e.INSPECT_MAX_BYTES;return t=this.toString(`hex`,0,n).replace(/(.{2})/g,`$1 `).trim(),this.length>n&&(t+=` ... `),`<Buffer `+t+`>`},r&&(s.prototype[r]=s.prototype.inspect),s.prototype.compare=function(e,t,n,r,i){if(Ue(e,Uint8Array)&&(e=s.from(e,e.offset,e.byteLength)),!s.isBuffer(e))throw TypeError(`The "target" argument must be one of type Buffer or Uint8Array. Received type `+typeof e);if(t===void 0&&(t=0),n===void 0&&(n=e?e.length:0),r===void 0&&(r=0),i===void 0&&(i=this.length),t<0||n>e.length||r<0||i>this.length)throw RangeError(`out of range index`);if(r>=i&&t>=n)return 0;if(r>=i)return-1;if(t>=n)return 1;if(t>>>=0,n>>>=0,r>>>=0,i>>>=0,this===e)return 0;let a=i-r,o=n-t,c=Math.min(a,o),l=this.slice(r,i),u=e.slice(t,n);for(let e=0;e<c;++e)if(l[e]!==u[e]){a=l[e],o=u[e];break}return a<o?-1:+(o<a)};function ce(e,t,n,r,i){if(e.length===0)return-1;if(typeof n==`string`?(r=n,n=0):n>2147483647?n=2147483647:n<-2147483648&&(n=-2147483648),n=+n,We(n)&&(n=i?0:e.length-1),n<0&&(n=e.length+n),n>=e.length){if(i)return-1;n=e.length-1}else if(n<0)if(i)n=0;else return-1;if(typeof t==`string`&&(t=s.from(t,r)),s.isBuffer(t))return t.length===0?-1:le(e,t,n,r,i);if(typeof t==`number`)return t&=255,typeof Uint8Array.prototype.indexOf==`function`?i?Uint8Array.prototype.indexOf.call(e,t,n):Uint8Array.prototype.lastIndexOf.call(e,t,n):le(e,[t],n,r,i);throw TypeError(`val must be string, number or Buffer`)}function le(e,t,n,r,i){let a=1,o=e.length,s=t.length;if(r!==void 0&&(r=String(r).toLowerCase(),r===`ucs2`||r===`ucs-2`||r===`utf16le`||r===`utf-16le`)){if(e.length<2||t.length<2)return-1;a=2,o/=2,s/=2,n/=2}function c(e,t){return a===1?e[t]:e.readUInt16BE(t*a)}let l;if(i){let r=-1;for(l=n;l<o;l++)if(c(e,l)===c(t,r===-1?0:l-r)){if(r===-1&&(r=l),l-r+1===s)return r*a}else r!==-1&&(l-=l-r),r=-1}else for(n+s>o&&(n=o-s),l=n;l>=0;l--){let n=!0;for(let r=0;r<s;r++)if(c(e,l+r)!==c(t,r)){n=!1;break}if(n)return l}return-1}s.prototype.includes=function(e,t,n){return this.indexOf(e,t,n)!==-1},s.prototype.indexOf=function(e,t,n){return ce(this,e,t,n,!0)},s.prototype.lastIndexOf=function(e,t,n){return ce(this,e,t,n,!1)};function ue(e,t,n,r){n=Number(n)||0;let i=e.length-n;r?(r=Number(r),r>i&&(r=i)):r=i;let a=t.length;r>a/2&&(r=a/2);let o;for(o=0;o<r;++o){let r=parseInt(t.substr(o*2,2),16);if(We(r))return o;e[n+o]=r}return o}function de(e,t,n,r){return He(Re(t,e.length-n),e,n,r)}function fe(e,t,n,r){return He(ze(t),e,n,r)}function pe(e,t,n,r){return He(Ve(t),e,n,r)}function me(e,t,n,r){return He(Be(t,e.length-n),e,n,r)}s.prototype.write=function(e,t,n,r){if(t===void 0)r=`utf8`,n=this.length,t=0;else if(n===void 0&&typeof t==`string`)r=t,n=this.length,t=0;else if(isFinite(t))t>>>=0,isFinite(n)?(n>>>=0,r===void 0&&(r=`utf8`)):(r=n,n=void 0);else throw Error(`Buffer.write(string, encoding, offset[, length]) is no longer supported`);let i=this.length-t;if((n===void 0||n>i)&&(n=i),e.length>0&&(n<0||t<0)||t>this.length)throw RangeError(`Attempt to write outside buffer bounds`);r||=`utf8`;let a=!1;for(;;)switch(r){case`hex`:return ue(this,e,t,n);case`utf8`:case`utf-8`:return de(this,e,t,n);case`ascii`:case`latin1`:case`binary`:return fe(this,e,t,n);case`base64`:return pe(this,e,t,n);case`ucs2`:case`ucs-2`:case`utf16le`:case`utf-16le`:return me(this,e,t,n);default:if(a)throw TypeError(`Unknown encoding: `+r);r=(``+r).toLowerCase(),a=!0}},s.prototype.toJSON=function(){return{type:`Buffer`,data:Array.prototype.slice.call(this._arr||this,0)}};function he(e,n,r){return n===0&&r===e.length?t.fromByteArray(e):t.fromByteArray(e.slice(n,r))}function ge(e,t,n){n=Math.min(e.length,n);let r=[],i=t;for(;i<n;){let t=e[i],a=null,o=t>239?4:t>223?3:t>191?2:1;if(i+o<=n){let n,r,s,c;switch(o){case 1:t<128&&(a=t);break;case 2:n=e[i+1],(n&192)==128&&(c=(t&31)<<6|n&63,c>127&&(a=c));break;case 3:n=e[i+1],r=e[i+2],(n&192)==128&&(r&192)==128&&(c=(t&15)<<12|(n&63)<<6|r&63,c>2047&&(c<55296||c>57343)&&(a=c));break;case 4:n=e[i+1],r=e[i+2],s=e[i+3],(n&192)==128&&(r&192)==128&&(s&192)==128&&(c=(t&15)<<18|(n&63)<<12|(r&63)<<6|s&63,c>65535&&c<1114112&&(a=c))}}a===null?(a=65533,o=1):a>65535&&(a-=65536,r.push(a>>>10&1023|55296),a=56320|a&1023),r.push(a),i+=o}return ve(r)}let _e=4096;function ve(e){let t=e.length;if(t<=_e)return String.fromCharCode.apply(String,e);let n=``,r=0;for(;r<t;)n+=String.fromCharCode.apply(String,e.slice(r,r+=_e));return n}function ye(e,t,n){let r=``;n=Math.min(e.length,n);for(let i=t;i<n;++i)r+=String.fromCharCode(e[i]&127);return r}function be(e,t,n){let r=``;n=Math.min(e.length,n);for(let i=t;i<n;++i)r+=String.fromCharCode(e[i]);return r}function xe(e,t,n){let r=e.length;(!t||t<0)&&(t=0),(!n||n<0||n>r)&&(n=r);let i=``;for(let r=t;r<n;++r)i+=Ge[e[r]];return i}function Se(e,t,n){let r=e.slice(t,n),i=``;for(let e=0;e<r.length-1;e+=2)i+=String.fromCharCode(r[e]+r[e+1]*256);return i}s.prototype.slice=function(e,t){let n=this.length;e=~~e,t=t===void 0?n:~~t,e<0?(e+=n,e<0&&(e=0)):e>n&&(e=n),t<0?(t+=n,t<0&&(t=0)):t>n&&(t=n),t<e&&(t=e);let r=this.subarray(e,t);return Object.setPrototypeOf(r,s.prototype),r};function m(e,t,n){if(e%1!=0||e<0)throw RangeError(`offset is not uint`);if(e+t>n)throw RangeError(`Trying to access beyond buffer length`)}s.prototype.readUintLE=s.prototype.readUIntLE=function(e,t,n){e>>>=0,t>>>=0,n||m(e,t,this.length);let r=this[e],i=1,a=0;for(;++a<t&&(i*=256);)r+=this[e+a]*i;return r},s.prototype.readUintBE=s.prototype.readUIntBE=function(e,t,n){e>>>=0,t>>>=0,n||m(e,t,this.length);let r=this[e+--t],i=1;for(;t>0&&(i*=256);)r+=this[e+--t]*i;return r},s.prototype.readUint8=s.prototype.readUInt8=function(e,t){return e>>>=0,t||m(e,1,this.length),this[e]},s.prototype.readUint16LE=s.prototype.readUInt16LE=function(e,t){return e>>>=0,t||m(e,2,this.length),this[e]|this[e+1]<<8},s.prototype.readUint16BE=s.prototype.readUInt16BE=function(e,t){return e>>>=0,t||m(e,2,this.length),this[e]<<8|this[e+1]},s.prototype.readUint32LE=s.prototype.readUInt32LE=function(e,t){return e>>>=0,t||m(e,4,this.length),(this[e]|this[e+1]<<8|this[e+2]<<16)+this[e+3]*16777216},s.prototype.readUint32BE=s.prototype.readUInt32BE=function(e,t){return e>>>=0,t||m(e,4,this.length),this[e]*16777216+(this[e+1]<<16|this[e+2]<<8|this[e+3])},s.prototype.readBigUInt64LE=Ke(function(e){e>>>=0,Pe(e,`offset`);let t=this[e],n=this[e+7];(t===void 0||n===void 0)&&Fe(e,this.length-8);let r=t+this[++e]*2**8+this[++e]*2**16+this[++e]*2**24,i=this[++e]+this[++e]*2**8+this[++e]*2**16+n*2**24;return BigInt(r)+(BigInt(i)<<BigInt(32))}),s.prototype.readBigUInt64BE=Ke(function(e){e>>>=0,Pe(e,`offset`);let t=this[e],n=this[e+7];(t===void 0||n===void 0)&&Fe(e,this.length-8);let r=t*2**24+this[++e]*2**16+this[++e]*2**8+this[++e],i=this[++e]*2**24+this[++e]*2**16+this[++e]*2**8+n;return(BigInt(r)<<BigInt(32))+BigInt(i)}),s.prototype.readIntLE=function(e,t,n){e>>>=0,t>>>=0,n||m(e,t,this.length);let r=this[e],i=1,a=0;for(;++a<t&&(i*=256);)r+=this[e+a]*i;return i*=128,r>=i&&(r-=2**(8*t)),r},s.prototype.readIntBE=function(e,t,n){e>>>=0,t>>>=0,n||m(e,t,this.length);let r=t,i=1,a=this[e+--r];for(;r>0&&(i*=256);)a+=this[e+--r]*i;return i*=128,a>=i&&(a-=2**(8*t)),a},s.prototype.readInt8=function(e,t){return e>>>=0,t||m(e,1,this.length),this[e]&128?(255-this[e]+1)*-1:this[e]},s.prototype.readInt16LE=function(e,t){e>>>=0,t||m(e,2,this.length);let n=this[e]|this[e+1]<<8;return n&32768?n|4294901760:n},s.prototype.readInt16BE=function(e,t){e>>>=0,t||m(e,2,this.length);let n=this[e+1]|this[e]<<8;return n&32768?n|4294901760:n},s.prototype.readInt32LE=function(e,t){return e>>>=0,t||m(e,4,this.length),this[e]|this[e+1]<<8|this[e+2]<<16|this[e+3]<<24},s.prototype.readInt32BE=function(e,t){return e>>>=0,t||m(e,4,this.length),this[e]<<24|this[e+1]<<16|this[e+2]<<8|this[e+3]},s.prototype.readBigInt64LE=Ke(function(e){e>>>=0,Pe(e,`offset`);let t=this[e],n=this[e+7];(t===void 0||n===void 0)&&Fe(e,this.length-8);let r=this[e+4]+this[e+5]*2**8+this[e+6]*2**16+(n<<24);return(BigInt(r)<<BigInt(32))+BigInt(t+this[++e]*2**8+this[++e]*2**16+this[++e]*2**24)}),s.prototype.readBigInt64BE=Ke(function(e){e>>>=0,Pe(e,`offset`);let t=this[e],n=this[e+7];(t===void 0||n===void 0)&&Fe(e,this.length-8);let r=(t<<24)+this[++e]*2**16+this[++e]*2**8+this[++e];return(BigInt(r)<<BigInt(32))+BigInt(this[++e]*2**24+this[++e]*2**16+this[++e]*2**8+n)}),s.prototype.readFloatLE=function(e,t){return e>>>=0,t||m(e,4,this.length),n.read(this,e,!0,23,4)},s.prototype.readFloatBE=function(e,t){return e>>>=0,t||m(e,4,this.length),n.read(this,e,!1,23,4)},s.prototype.readDoubleLE=function(e,t){return e>>>=0,t||m(e,8,this.length),n.read(this,e,!0,52,8)},s.prototype.readDoubleBE=function(e,t){return e>>>=0,t||m(e,8,this.length),n.read(this,e,!1,52,8)};function Ce(e,t,n,r,i,a){if(!s.isBuffer(e))throw TypeError(`"buffer" argument must be a Buffer instance`);if(t>i||t<a)throw RangeError(`"value" argument is out of bounds`);if(n+r>e.length)throw RangeError(`Index out of range`)}s.prototype.writeUintLE=s.prototype.writeUIntLE=function(e,t,n,r){if(e=+e,t>>>=0,n>>>=0,!r){let r=2**(8*n)-1;Ce(this,e,t,n,r,0)}let i=1,a=0;for(this[t]=e&255;++a<n&&(i*=256);)this[t+a]=e/i&255;return t+n},s.prototype.writeUintBE=s.prototype.writeUIntBE=function(e,t,n,r){if(e=+e,t>>>=0,n>>>=0,!r){let r=2**(8*n)-1;Ce(this,e,t,n,r,0)}let i=n-1,a=1;for(this[t+i]=e&255;--i>=0&&(a*=256);)this[t+i]=e/a&255;return t+n},s.prototype.writeUint8=s.prototype.writeUInt8=function(e,t,n){return e=+e,t>>>=0,n||Ce(this,e,t,1,255,0),this[t]=e&255,t+1},s.prototype.writeUint16LE=s.prototype.writeUInt16LE=function(e,t,n){return e=+e,t>>>=0,n||Ce(this,e,t,2,65535,0),this[t]=e&255,this[t+1]=e>>>8,t+2},s.prototype.writeUint16BE=s.prototype.writeUInt16BE=function(e,t,n){return e=+e,t>>>=0,n||Ce(this,e,t,2,65535,0),this[t]=e>>>8,this[t+1]=e&255,t+2},s.prototype.writeUint32LE=s.prototype.writeUInt32LE=function(e,t,n){return e=+e,t>>>=0,n||Ce(this,e,t,4,4294967295,0),this[t+3]=e>>>24,this[t+2]=e>>>16,this[t+1]=e>>>8,this[t]=e&255,t+4},s.prototype.writeUint32BE=s.prototype.writeUInt32BE=function(e,t,n){return e=+e,t>>>=0,n||Ce(this,e,t,4,4294967295,0),this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=e&255,t+4};function we(e,t,n,r,i){Ne(t,r,i,e,n,7);let a=Number(t&BigInt(4294967295));e[n++]=a,a>>=8,e[n++]=a,a>>=8,e[n++]=a,a>>=8,e[n++]=a;let o=Number(t>>BigInt(32)&BigInt(4294967295));return e[n++]=o,o>>=8,e[n++]=o,o>>=8,e[n++]=o,o>>=8,e[n++]=o,n}function Te(e,t,n,r,i){Ne(t,r,i,e,n,7);let a=Number(t&BigInt(4294967295));e[n+7]=a,a>>=8,e[n+6]=a,a>>=8,e[n+5]=a,a>>=8,e[n+4]=a;let o=Number(t>>BigInt(32)&BigInt(4294967295));return e[n+3]=o,o>>=8,e[n+2]=o,o>>=8,e[n+1]=o,o>>=8,e[n]=o,n+8}s.prototype.writeBigUInt64LE=Ke(function(e,t=0){return we(this,e,t,BigInt(0),BigInt(`0xffffffffffffffff`))}),s.prototype.writeBigUInt64BE=Ke(function(e,t=0){return Te(this,e,t,BigInt(0),BigInt(`0xffffffffffffffff`))}),s.prototype.writeIntLE=function(e,t,n,r){if(e=+e,t>>>=0,!r){let r=2**(8*n-1);Ce(this,e,t,n,r-1,-r)}let i=0,a=1,o=0;for(this[t]=e&255;++i<n&&(a*=256);)e<0&&o===0&&this[t+i-1]!==0&&(o=1),this[t+i]=(e/a>>0)-o&255;return t+n},s.prototype.writeIntBE=function(e,t,n,r){if(e=+e,t>>>=0,!r){let r=2**(8*n-1);Ce(this,e,t,n,r-1,-r)}let i=n-1,a=1,o=0;for(this[t+i]=e&255;--i>=0&&(a*=256);)e<0&&o===0&&this[t+i+1]!==0&&(o=1),this[t+i]=(e/a>>0)-o&255;return t+n},s.prototype.writeInt8=function(e,t,n){return e=+e,t>>>=0,n||Ce(this,e,t,1,127,-128),e<0&&(e=255+e+1),this[t]=e&255,t+1},s.prototype.writeInt16LE=function(e,t,n){return e=+e,t>>>=0,n||Ce(this,e,t,2,32767,-32768),this[t]=e&255,this[t+1]=e>>>8,t+2},s.prototype.writeInt16BE=function(e,t,n){return e=+e,t>>>=0,n||Ce(this,e,t,2,32767,-32768),this[t]=e>>>8,this[t+1]=e&255,t+2},s.prototype.writeInt32LE=function(e,t,n){return e=+e,t>>>=0,n||Ce(this,e,t,4,2147483647,-2147483648),this[t]=e&255,this[t+1]=e>>>8,this[t+2]=e>>>16,this[t+3]=e>>>24,t+4},s.prototype.writeInt32BE=function(e,t,n){return e=+e,t>>>=0,n||Ce(this,e,t,4,2147483647,-2147483648),e<0&&(e=4294967295+e+1),this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=e&255,t+4},s.prototype.writeBigInt64LE=Ke(function(e,t=0){return we(this,e,t,-BigInt(`0x8000000000000000`),BigInt(`0x7fffffffffffffff`))}),s.prototype.writeBigInt64BE=Ke(function(e,t=0){return Te(this,e,t,-BigInt(`0x8000000000000000`),BigInt(`0x7fffffffffffffff`))});function Ee(e,t,n,r,i,a){if(n+r>e.length||n<0)throw RangeError(`Index out of range`)}function De(e,t,r,i,a){return t=+t,r>>>=0,a||Ee(e,t,r,4,34028234663852886e22,-34028234663852886e22),n.write(e,t,r,i,23,4),r+4}s.prototype.writeFloatLE=function(e,t,n){return De(this,e,t,!0,n)},s.prototype.writeFloatBE=function(e,t,n){return De(this,e,t,!1,n)};function Oe(e,t,r,i,a){return t=+t,r>>>=0,a||Ee(e,t,r,8,17976931348623157e292,-17976931348623157e292),n.write(e,t,r,i,52,8),r+8}s.prototype.writeDoubleLE=function(e,t,n){return Oe(this,e,t,!0,n)},s.prototype.writeDoubleBE=function(e,t,n){return Oe(this,e,t,!1,n)},s.prototype.copy=function(e,t,n,r){if(!s.isBuffer(e))throw TypeError(`argument should be a Buffer`);if(n||=0,!r&&r!==0&&(r=this.length),t>=e.length&&(t=e.length),t||=0,r>0&&r<n&&(r=n),r===n||e.length===0||this.length===0)return 0;if(t<0)throw RangeError(`targetStart out of bounds`);if(n<0||n>=this.length)throw RangeError(`Index out of range`);if(r<0)throw RangeError(`sourceEnd out of bounds`);r>this.length&&(r=this.length),e.length-t<r-n&&(r=e.length-t+n);let i=r-n;return this===e&&typeof Uint8Array.prototype.copyWithin==`function`?this.copyWithin(t,n,r):Uint8Array.prototype.set.call(e,this.subarray(n,r),t),i},s.prototype.fill=function(e,t,n,r){if(typeof e==`string`){if(typeof t==`string`?(r=t,t=0,n=this.length):typeof n==`string`&&(r=n,n=this.length),r!==void 0&&typeof r!=`string`)throw TypeError(`encoding must be a string`);if(typeof r==`string`&&!s.isEncoding(r))throw TypeError(`Unknown encoding: `+r);if(e.length===1){let t=e.charCodeAt(0);(r===`utf8`&&t<128||r===`latin1`)&&(e=t)}}else typeof e==`number`?e&=255:typeof e==`boolean`&&(e=Number(e));if(t<0||this.length<t||this.length<n)throw RangeError(`Out of range index`);if(n<=t)return this;t>>>=0,n=n===void 0?this.length:n>>>0,e||=0;let i;if(typeof e==`number`)for(i=t;i<n;++i)this[i]=e;else{let a=s.isBuffer(e)?e:s.from(e,r),o=a.length;if(o===0)throw TypeError(`The value "`+e+`" is invalid for argument "value"`);for(i=0;i<n-t;++i)this[i+t]=a[i%o]}return this};let ke={};function Ae(e,t,n){ke[e]=class extends n{constructor(){super(),Object.defineProperty(this,"message",{value:t.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${e}]`,this.stack,delete this.name}get code(){return e}set code(e){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:e,writable:!0})}toString(){return`${this.name} [${e}]: ${this.message}`}}}Ae(`ERR_BUFFER_OUT_OF_BOUNDS`,function(e){return e?`${e} is outside of buffer bounds`:`Attempt to access memory outside buffer bounds`},RangeError),Ae(`ERR_INVALID_ARG_TYPE`,function(e,t){return`The "${e}" argument must be of type number. Received type ${typeof t}`},TypeError),Ae(`ERR_OUT_OF_RANGE`,function(e,t,n){let r=`The value of "${e}" is out of range.`,i=n;return Number.isInteger(n)&&Math.abs(n)>2**32?i=je(String(n)):typeof n==`bigint`&&(i=String(n),(n>BigInt(2)**BigInt(32)||n<-(BigInt(2)**BigInt(32)))&&(i=je(i)),i+=`n`),r+=` It must be ${t}. Received ${i}`,r},RangeError);function je(e){let t=``,n=e.length,r=+(e[0]===`-`);for(;n>=r+4;n-=3)t=`_${e.slice(n-3,n)}${t}`;return`${e.slice(0,n)}${t}`}function Me(e,t,n){Pe(t,`offset`),(e[t]===void 0||e[t+n]===void 0)&&Fe(t,e.length-(n+1))}function Ne(e,t,n,r,i,a){if(e>n||e<t){let r=typeof t==`bigint`?`n`:``,i;throw i=a>3?t===0||t===BigInt(0)?`>= 0${r} and < 2${r} ** ${(a+1)*8}${r}`:`>= -(2${r} ** ${(a+1)*8-1}${r}) and < 2 ** ${(a+1)*8-1}${r}`:`>= ${t}${r} and <= ${n}${r}`,new ke.ERR_OUT_OF_RANGE(`value`,i,e)}Me(r,i,a)}function Pe(e,t){if(typeof e!=`number`)throw new ke.ERR_INVALID_ARG_TYPE(t,`number`,e)}function Fe(e,t,n){throw Math.floor(e)===e?t<0?new ke.ERR_BUFFER_OUT_OF_BOUNDS:new ke.ERR_OUT_OF_RANGE(n||`offset`,`>= ${+!!n} and <= ${t}`,e):(Pe(e,n),new ke.ERR_OUT_OF_RANGE(n||`offset`,`an integer`,e))}let Ie=/[^+/0-9A-Za-z-_]/g;function Le(e){if(e=e.split(`=`)[0],e=e.trim().replace(Ie,``),e.length<2)return``;for(;e.length%4!=0;)e+=`=`;return e}function Re(e,t){t||=1/0;let n,r=e.length,i=null,a=[];for(let o=0;o<r;++o){if(n=e.charCodeAt(o),n>55295&&n<57344){if(!i){if(n>56319){(t-=3)>-1&&a.push(239,191,189);continue}else if(o+1===r){(t-=3)>-1&&a.push(239,191,189);continue}i=n;continue}if(n<56320){(t-=3)>-1&&a.push(239,191,189),i=n;continue}n=(i-55296<<10|n-56320)+65536}else i&&(t-=3)>-1&&a.push(239,191,189);if(i=null,n<128){if(--t<0)break;a.push(n)}else if(n<2048){if((t-=2)<0)break;a.push(n>>6|192,n&63|128)}else if(n<65536){if((t-=3)<0)break;a.push(n>>12|224,n>>6&63|128,n&63|128)}else if(n<1114112){if((t-=4)<0)break;a.push(n>>18|240,n>>12&63|128,n>>6&63|128,n&63|128)}else throw Error(`Invalid code point`)}return a}function ze(e){let t=[];for(let n=0;n<e.length;++n)t.push(e.charCodeAt(n)&255);return t}function Be(e,t){let n,r,i,a=[];for(let o=0;o<e.length&&!((t-=2)<0);++o)n=e.charCodeAt(o),r=n>>8,i=n%256,a.push(i),a.push(r);return a}function Ve(e){return t.toByteArray(Le(e))}function He(e,t,n,r){let i;for(i=0;i<r&&!(i+n>=t.length||i>=e.length);++i)t[i+n]=e[i];return i}function Ue(e,t){return e instanceof t||e!=null&&e.constructor!=null&&e.constructor.name!=null&&e.constructor.name===t.name}function We(e){return e!==e}let Ge=(function(){let e=`0123456789abcdef`,t=Array(256);for(let n=0;n<16;++n){let r=n*16;for(let i=0;i<16;++i)t[r+i]=e[n]+e[i]}return t})();function Ke(e){return typeof BigInt>`u`?qe:e}function qe(){throw Error(`BigInt not supported`)}}))();let On=Array(256),kn={},b=(e,t,n,r)=>{console.assert(!On[n],`Duplicate instruction: `+e+` mode=`+t),On[n]={name:e,mode:t,bytes:r},kn[e]||(kn[e]=[]),kn[e][t]=n};b(`ADC`,s.IMM,105,2),b(`ADC`,s.ZP_REL,101,2),b(`ADC`,s.ZP_X,117,2),b(`ADC`,s.ABS,109,3),b(`ADC`,s.ABS_X,125,3),b(`ADC`,s.ABS_Y,121,3),b(`ADC`,s.IND_X,97,2),b(`ADC`,s.IND_Y,113,2),b(`ADC`,s.IND,114,2),b(`AND`,s.IMM,41,2),b(`AND`,s.ZP_REL,37,2),b(`AND`,s.ZP_X,53,2),b(`AND`,s.ABS,45,3),b(`AND`,s.ABS_X,61,3),b(`AND`,s.ABS_Y,57,3),b(`AND`,s.IND_X,33,2),b(`AND`,s.IND_Y,49,2),b(`AND`,s.IND,50,2),b(`ASL`,s.IMPLIED,10,1),b(`ASL`,s.ZP_REL,6,2),b(`ASL`,s.ZP_X,22,2),b(`ASL`,s.ABS,14,3),b(`ASL`,s.ABS_X,30,3),b(`BCC`,s.ZP_REL,144,2),b(`BCS`,s.ZP_REL,176,2),b(`BEQ`,s.ZP_REL,240,2),b(`BIT`,s.ZP_REL,36,2),b(`BIT`,s.ABS,44,3),b(`BIT`,s.IMM,137,2),b(`BIT`,s.ZP_X,52,2),b(`BIT`,s.ABS_X,60,3),b(`BMI`,s.ZP_REL,48,2),b(`BNE`,s.ZP_REL,208,2),b(`BPL`,s.ZP_REL,16,2),b(`BVC`,s.ZP_REL,80,2),b(`BVS`,s.ZP_REL,112,2),b(`BRA`,s.ZP_REL,128,2),b(`BRK`,s.IMPLIED,0,1),b(`CLC`,s.IMPLIED,24,1),b(`CLD`,s.IMPLIED,216,1),b(`CLI`,s.IMPLIED,88,1),b(`CLV`,s.IMPLIED,184,1),b(`CMP`,s.IMM,201,2),b(`CMP`,s.ZP_REL,197,2),b(`CMP`,s.ZP_X,213,2),b(`CMP`,s.ABS,205,3),b(`CMP`,s.ABS_X,221,3),b(`CMP`,s.ABS_Y,217,3),b(`CMP`,s.IND_X,193,2),b(`CMP`,s.IND_Y,209,2),b(`CMP`,s.IND,210,2),b(`CPX`,s.IMM,224,2),b(`CPX`,s.ZP_REL,228,2),b(`CPX`,s.ABS,236,3),b(`CPY`,s.IMM,192,2),b(`CPY`,s.ZP_REL,196,2),b(`CPY`,s.ABS,204,3),b(`DEC`,s.IMPLIED,58,1),b(`DEC`,s.ZP_REL,198,2),b(`DEC`,s.ZP_X,214,2),b(`DEC`,s.ABS,206,3),b(`DEC`,s.ABS_X,222,3),b(`DEX`,s.IMPLIED,202,1),b(`DEY`,s.IMPLIED,136,1),b(`EOR`,s.IMM,73,2),b(`EOR`,s.ZP_REL,69,2),b(`EOR`,s.ZP_X,85,2),b(`EOR`,s.ABS,77,3),b(`EOR`,s.ABS_X,93,3),b(`EOR`,s.ABS_Y,89,3),b(`EOR`,s.IND_X,65,2),b(`EOR`,s.IND_Y,81,2),b(`EOR`,s.IND,82,2),b(`INC`,s.IMPLIED,26,1),b(`INC`,s.ZP_REL,230,2),b(`INC`,s.ZP_X,246,2),b(`INC`,s.ABS,238,3),b(`INC`,s.ABS_X,254,3),b(`INX`,s.IMPLIED,232,1),b(`INY`,s.IMPLIED,200,1),b(`JMP`,s.ABS,76,3),b(`JMP`,s.IND,108,3),b(`JMP`,s.IND_X,124,3),b(`JSR`,s.ABS,32,3),b(`LDA`,s.IMM,169,2),b(`LDA`,s.ZP_REL,165,2),b(`LDA`,s.ZP_X,181,2),b(`LDA`,s.ABS,173,3),b(`LDA`,s.ABS_X,189,3),b(`LDA`,s.ABS_Y,185,3),b(`LDA`,s.IND_X,161,2),b(`LDA`,s.IND_Y,177,2),b(`LDA`,s.IND,178,2),b(`LDX`,s.IMM,162,2),b(`LDX`,s.ZP_REL,166,2),b(`LDX`,s.ZP_Y,182,2),b(`LDX`,s.ABS,174,3),b(`LDX`,s.ABS_Y,190,3),b(`LDY`,s.IMM,160,2),b(`LDY`,s.ZP_REL,164,2),b(`LDY`,s.ZP_X,180,2),b(`LDY`,s.ABS,172,3),b(`LDY`,s.ABS_X,188,3),b(`LSR`,s.IMPLIED,74,1),b(`LSR`,s.ZP_REL,70,2),b(`LSR`,s.ZP_X,86,2),b(`LSR`,s.ABS,78,3),b(`LSR`,s.ABS_X,94,3),b(`NOP`,s.IMPLIED,234,1),b(`ORA`,s.IMM,9,2),b(`ORA`,s.ZP_REL,5,2),b(`ORA`,s.ZP_X,21,2),b(`ORA`,s.ABS,13,3),b(`ORA`,s.ABS_X,29,3),b(`ORA`,s.ABS_Y,25,3),b(`ORA`,s.IND_X,1,2),b(`ORA`,s.IND_Y,17,2),b(`ORA`,s.IND,18,2),b(`PHA`,s.IMPLIED,72,1),b(`PHP`,s.IMPLIED,8,1),b(`PHX`,s.IMPLIED,218,1),b(`PHY`,s.IMPLIED,90,1),b(`PLA`,s.IMPLIED,104,1),b(`PLP`,s.IMPLIED,40,1),b(`PLX`,s.IMPLIED,250,1),b(`PLY`,s.IMPLIED,122,1),b(`ROL`,s.IMPLIED,42,1),b(`ROL`,s.ZP_REL,38,2),b(`ROL`,s.ZP_X,54,2),b(`ROL`,s.ABS,46,3),b(`ROL`,s.ABS_X,62,3),b(`ROR`,s.IMPLIED,106,1),b(`ROR`,s.ZP_REL,102,2),b(`ROR`,s.ZP_X,118,2),b(`ROR`,s.ABS,110,3),b(`ROR`,s.ABS_X,126,3),b(`RTI`,s.IMPLIED,64,1),b(`RTS`,s.IMPLIED,96,1),b(`SBC`,s.IMM,233,2),b(`SBC`,s.ZP_REL,229,2),b(`SBC`,s.ZP_X,245,2),b(`SBC`,s.ABS,237,3),b(`SBC`,s.ABS_X,253,3),b(`SBC`,s.ABS_Y,249,3),b(`SBC`,s.IND_X,225,2),b(`SBC`,s.IND_Y,241,2),b(`SBC`,s.IND,242,2),b(`SEC`,s.IMPLIED,56,1),b(`SED`,s.IMPLIED,248,1),b(`SEI`,s.IMPLIED,120,1),b(`STA`,s.ZP_REL,133,2),b(`STA`,s.ZP_X,149,2),b(`STA`,s.ABS,141,3),b(`STA`,s.ABS_X,157,3),b(`STA`,s.ABS_Y,153,3),b(`STA`,s.IND_X,129,2),b(`STA`,s.IND_Y,145,2),b(`STA`,s.IND,146,2),b(`STX`,s.ZP_REL,134,2),b(`STX`,s.ZP_Y,150,2),b(`STX`,s.ABS,142,3),b(`STY`,s.ZP_REL,132,2),b(`STY`,s.ZP_X,148,2),b(`STY`,s.ABS,140,3),b(`STZ`,s.ZP_REL,100,2),b(`STZ`,s.ZP_X,116,2),b(`STZ`,s.ABS,156,3),b(`STZ`,s.ABS_X,158,3),b(`TAX`,s.IMPLIED,170,1),b(`TAY`,s.IMPLIED,168,1),b(`TSX`,s.IMPLIED,186,1),b(`TXA`,s.IMPLIED,138,1),b(`TXS`,s.IMPLIED,154,1),b(`TYA`,s.IMPLIED,152,1),b(`TRB`,s.ZP_REL,20,2),b(`TRB`,s.ABS,28,3),b(`TSB`,s.ZP_REL,4,2),b(`TSB`,s.ABS,12,3),Object.keys(kn);let An=()=>{let e={register:``,address:768,operator:`==`,value:128},t={action:``,register:`A`,address:768,value:0};return{address:-1,watchpoint:!1,instruction:!1,disabled:!1,hidden:!1,once:!1,memget:!1,memset:!0,expression1:{...e},expression2:{...e},expressionOperator:``,hexvalue:-1,hitcount:1,nhits:0,memoryBank:``,action1:{...t},action2:{...t},halt:!1,basic:!1}};var jn=class extends Map{set(e,t){let n=[...this.entries()];n.push([e,t]),n.sort((e,t)=>e[0]-t[0]),super.clear();for(let[e,t]of n)super.set(e,t);return this}};let x={};x[``]={name:`Any`,min:0,max:65535},x.MAIN={name:`Main RAM ($0 - $FFFF)`,min:0,max:65535},x.AUX={name:`Auxiliary RAM ($0 - $FFFF)`,min:0,max:65535},x.ROM={name:`ROM ($D000 - $FFFF)`,min:53248,max:65535},x[`MAIN-DXXX-1`]={name:`Main D000 Bank 1 ($D000 - $DFFF)`,min:53248,max:57343},x[`MAIN-DXXX-2`]={name:`Main D000 Bank 2 ($D000 - $DFFF)`,min:53248,max:57343},x[`AUX-DXXX-1`]={name:`Aux D000 Bank 1 ($D000 - $DFFF)`,min:53248,max:57343},x[`AUX-DXXX-2`]={name:`Aux D000 Bank 2 ($D000 - $DFFF)`,min:53248,max:57343},x[`CXXX-ROM`]={name:`Internal ROM ($C100 - $CFFF)`,min:49408,max:53247},x[`CXXX-CARD`]={name:`Peripheral Card ROM ($C100 - $CFFF)`,min:49408,max:53247},Object.keys(x),Object.values(x).map(e=>e.name);let Mn=(e,t)=>e+2+(t>127?t-256:t),Nn=(e,t)=>{if(t<0)return!1;let n=!1;switch(e){case`BCS`:n=(t&1)!=0;break;case`BCC`:n=(t&1)==0;break;case`BEQ`:n=(t&2)!=0;break;case`BNE`:n=(t&2)==0;break;case`BMI`:n=(t&128)!=0;break;case`BPL`:n=(t&128)==0;break;case`BVS`:n=(t&64)!=0;break;case`BVC`:n=(t&64)==0;break;case`BRA`:n=!0;break}return n},Pn=(e,t,n,r,i)=>{if(e>>8==192){let n=`---`;return e>=49168&&e<=49183&&(n=t.pcode>=128?`ON`:`OFF`),`${u(e,4)}: ${u(t.pcode)}        ${n}`}let a=``,o=`${u(t.pcode)}`,c=``,d=``;switch(t.bytes){case 1:o+=`      `;break;case 2:c=u(n),o+=` ${c}   `;break;case 3:c=u(n),d=u(r),o+=` ${c} ${d}`;break}let f=``;i>=0&&l(t.name)&&(f=Nn(t.name,i)?`  ✓`:`  ✗`);let p=l(t.name)?u(Mn(e,n),4):c;switch(t.mode){case s.IMPLIED:break;case s.IMM:a=` #$${c}`;break;case s.ZP_REL:a=` $${p}`;break;case s.ZP_X:a=` $${c},X`;break;case s.ZP_Y:a=` $${c},Y`;break;case s.ABS:a=` $${d}${c}`;break;case s.ABS_X:a=` $${d}${c},X`;break;case s.ABS_Y:a=` $${d}${c},Y`;break;case s.IND_X:a=` ($${d.trim()}${c},X)`;break;case s.IND_Y:a=` ($${c}),Y`;break;case s.IND:a=` ($${d.trim()}${c})`;break}return`${u(e,4)}: ${o}  ${t.name}${a}${f}`},Fn={numLines:1e4,collapseLoops:!0,ignoreRegisters:!1},In=!1,Ln=!1,Rn=new jn,zn=!1,Bn=()=>{In=!0},Vn=()=>{new jn(Rn).forEach((e,t)=>{e.once&&Rn.delete(t)});let e=Ti();if(e<0||Rn.get(e))return;let t=An();t.address=e,t.once=!0,t.hidden=!0,Rn.set(e,t)},Hn=()=>{new jn(Rn).forEach((e,t)=>{e.once&&Rn.delete(t)});let e=55301,t=An();t.address=e,t.once=!0,t.hidden=!0,Rn.set(e,t)},Un=e=>{Rn=e},Wn=!1,Gn=()=>{Wn=!0,x.MAIN.enabled=(e=0)=>e>=53248?!y.ALTZP.isSet&&y.BSRREADRAM.isSet:e>=512?!y.RAMRD.isSet:!y.ALTZP.isSet,x.AUX.enabled=(e=0)=>e>=53248?y.ALTZP.isSet&&y.BSRREADRAM.isSet:e>=512?y.RAMRD.isSet:y.ALTZP.isSet,x.ROM.enabled=()=>!y.BSRREADRAM.isSet,x[`MAIN-DXXX-1`].enabled=()=>!y.ALTZP.isSet&&y.BSRREADRAM.isSet&&!y.BSRBANK2.isSet,x[`MAIN-DXXX-2`].enabled=()=>!y.ALTZP.isSet&&y.BSRREADRAM.isSet&&y.BSRBANK2.isSet,x[`AUX-DXXX-1`].enabled=()=>y.ALTZP.isSet&&y.BSRREADRAM.isSet&&!y.BSRBANK2.isSet,x[`AUX-DXXX-2`].enabled=()=>y.ALTZP.isSet&&y.BSRREADRAM.isSet&&y.BSRBANK2.isSet,x[`CXXX-ROM`].enabled=(e=0)=>e>=49920&&e<=50175?y.INTCXROM.isSet||!y.SLOTC3ROM.isSet:e>=51200?y.INTCXROM.isSet||y.INTC8ROM.isSet:y.INTCXROM.isSet,x[`CXXX-CARD`].enabled=(e=0)=>e>=49920&&e<=50175?!y.INTCXROM.isSet&&y.SLOTC3ROM.isSet:e>=51200?!y.INTCXROM.isSet&&!y.INTC8ROM.isSet:!y.INTCXROM.isSet},Kn=(e,t)=>{Wn||Gn();let n=x[e];return!(t<n.min||t>n.max||n.enabled&&!n?.enabled(t))},qn=(e,t,n)=>{let r=Rn.get(e);return!r||!r.watchpoint||r.disabled||r.hexvalue>=0&&r.hexvalue!==t||r.memoryBank&&!Kn(r.memoryBank,e)?!1:n?r.memset:r.memget},Jn=(e=0,t=!0)=>{t?k.flagIRQ|=1<<e:k.flagIRQ&=~(1<<e),k.flagIRQ&=255},Yn=(e=!0)=>{k.flagNMI=e===!0},Xn=()=>{k.flagIRQ=0,k.flagNMI=!1},Zn=[],Qn=[],$n=(e,t)=>{Zn.push(e),Qn.push(t)},er=()=>{Zn.length=0,Qn.length=0},tr=()=>{for(let e=0;e<Zn.length;e++)Zn[e](Qn[e])},nr=e=>{let t=0;switch(e.register){case`$`:t=Wr(e.address);break;case`A`:t=k.Accum;break;case`X`:t=k.XReg;break;case`Y`:t=k.YReg;break;case`S`:t=k.StackPtr;break;case`P`:t=k.PStatus;break;case`C`:t=k.PC;break}switch(e.operator){case`==`:return t===e.value;case`!=`:return t!==e.value;case`<`:return t<e.value;case`<=`:return t<=e.value;case`>`:return t>e.value;case`>=`:return t>=e.value}},rr=e=>{let t=nr(e.expression1);return e.expressionOperator===``?t:e.expressionOperator===`&&`&&!t?!1:e.expressionOperator===`||`&&t?!0:nr(e.expression2)},ir=()=>{Ln=!0},ar=(e,t,n)=>{let r=Pn(k.PC,{...n},e,t,k.PStatus)+`          `,i=`${(`0000000000`+k.cycleCount.toString()).slice(-10)}  ${r.slice(0,29)}  ${bi()}`;console.log(i)},or=(e,t,n,r)=>{if(e.action===``)return!1;let i=e.value&255,a=e.address&65535;switch(e.action){case`set`:switch(e.register){case`A`:k.Accum=i;break;case`X`:k.XReg=i;break;case`Y`:k.YReg=i;break;case`S`:k.StackPtr=i;break;case`P`:k.PStatus=i;break;case`C`:k.PC=e.value&65535;break}break;case`jump`:k.PC=a;break;case`print`:ar(t,n,r);break;case`snapshot`:ep();break}return!0},sr=(e,t,n,r)=>{let i=or(e.action1,t,n,r),a=or(e.action2,t,n,r);return i||a?e.halt?1:2:e.hidden?3:1},cr=(e=-1,t=0,n=0,r=null)=>{if(Ln)return Ln=!1,1;if(Rn.size===0||In)return 0;if(k.PC===55301){let e=E(117)+(E(118)<<8),t=Rn.get(e);if(t&&!t.disabled)return 3}let i=Rn.get(k.PC)||Rn.get(-1)||Rn.get(e|65536)||e>=0&&Rn.get(65792)||e>=0&&Rn.get(66048);if(!i||i.disabled||i.watchpoint)return 0;if(i.instruction){let r=(n<<8)+t;if(i.address===65792){if(L[e].name!==`???`)return 0}else if(i.address===66048){if(L[e].is6502)return 0}else if(r>=0&&i.hexvalue>=0&&i.hexvalue!==r)return 0}if(i.expression1.register!==``&&!rr(i))return 0;if(i.hitcount>1){if(i.nhits++,i.nhits<i.hitcount)return 0;i.nhits=0}return i.memoryBank&&!Kn(i.memoryBank,k.PC)?0:(i.once&&Rn.delete(k.PC),sr(i,t,n,r))},lr=(e=null)=>{let t=0,n=k.PC,i=E(k.PC,!1),a=L[i],o=a.bytes>1?E(k.PC+1,!1):-1,s=a.bytes>2?E(k.PC+2,!1):0;if(!Kf()){let e=cr(i,o,s,a);if(e===1||e===3)return ap(r.PAUSED,e!==3),-1;if(e===2)return k.PC===n&&(In=!0),0;In=!1}let c=Pr.get(n);if(c&&(!y.INTCXROM.isSet||(n&61440)!=49152)&&c(),t=a.execute(o,s),e&&(n<64680||n>64691)){let t=Pn(n,a,o,s,k.PStatus)+`          `,r=`${(`00000000`+k.cycleCount.toString()).slice(-8)}  ${t.slice(0,29)}  ${bi()}`,i=r.indexOf(`JMP`);if(i===-1&&(i=r.indexOf(`RTS`)),i!==-1){let e=r.slice(i,i+15);e=e.replaceAll(` `,`_`),r=r.slice(0,i)+e+r.slice(i+15)}e(r)}if(gi(a.bytes),pi(k.cycleCount+t),tr(),k.flagNMI&&(k.flagNMI=!1,t=Qi(),pi(k.cycleCount+t)),k.flagIRQ){let e=Zi();e>0&&(pi(k.cycleCount+e),t=e)}return zn&&a.pcode===96?(zn=!1,ap(r.PAUSED),-1):t},ur=[197,58,163,92,197,58,163,92],dr=new class{constructor(){this.bits=[],this.pattern=Array(64),this.patternIdx=0,this.reset=()=>{this.patternIdx=0},this.checkPattern=e=>e===(ur[Math.floor(this.patternIdx/8)]>>this.patternIdx%8&1),this.calcBits=()=>{let e=e=>{this.bits.push(e&8?1:0),this.bits.push(e&4?1:0),this.bits.push(e&2?1:0),this.bits.push(e&1?1:0)},t=t=>{e(Math.floor(t/10)),e(Math.floor(t%10))},n=new Date,r=n.getFullYear()%100,i=n.getDate(),a=n.getDay()+1,o=n.getMonth()+1,s=n.getHours(),c=n.getMinutes(),l=n.getSeconds(),u=n.getMilliseconds()/10;this.bits=[],t(r),t(o),t(i),t(a),t(s),t(c),t(l),t(u)},this.access=e=>{e&4?this.reset():this.checkPattern(e&1)?(this.patternIdx++,this.patternIdx===64&&this.calcBits()):this.reset()},this.read=e=>{let t=-1;return this.bits.length>0?e&4&&(t=this.bits.pop()):this.access(e),t}}},fr=256*320,pr=256*327,mr=0,hr=n,S=new Uint8Array(hr+(mr+1)*65536).fill(0),gr=new Uint8Array(8).fill(0),_r=()=>Kr(49194),vr=e=>{O(49194,e)},yr=()=>Kr(49267),br=e=>{O(49267,e)},C=Array(257).fill(0),xr=Array(257).fill(0),Sr=`APPLE2EE`,Cr=()=>Sr,wr=e=>{Sr=e;let n=``;switch(e){case`APPLE2P`:n=`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
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
g39dzLX8Fxf1A/sDYvpA+g==`;break;case`APPLE2EU`:n=`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
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
g39dzLX8Fxf1A/sDYvpA+g==`;break;case`APPLE2EE`:n=`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
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
g39dzLX8Fxf1A/sDYvr6ww==`;break}let r=n.replace(/\n/g,``),i=new Uint8Array(Dn.Buffer.from(r,`base64`));i[15035]=5,S.set(i,t)},Tr=e=>{e=Math.max(64,Math.min(8192,e));let t=mr;if(mr=Math.floor(e/64)-1,mr===t)return;yr()>mr&&(br(0),Nr());let n=hr+(mr+1)*65536;if(mr<t)S=S.slice(0,n);else{let e=S;S=new Uint8Array(n).fill(255),S.set(e)}},Er=()=>{let e=y.RAMRD.isSet?383+yr()*256:0,t=y.RAMWRT.isSet?383+yr()*256:0,n=y.PAGE2.isSet?383+yr()*256:0,r=y.STORE80.isSet?n:e,i=y.STORE80.isSet?n:t,a=y.STORE80.isSet&&y.HIRES.isSet?n:e,o=y.STORE80.isSet&&y.HIRES.isSet?n:t;for(let n=2;n<256;n++)C[n]=n+e,xr[n]=n+t;for(let e=4;e<=7;e++)C[e]=e+r,xr[e]=e+i;for(let e=32;e<=63;e++)C[e]=e+a,xr[e]=e+o},Dr=()=>{let e=y.ALTZP.isSet?383+yr()*256:0;if(C[0]=e,C[1]=1+e,xr[0]=e,xr[1]=1+e,y.BSRREADRAM.isSet){for(let t=208;t<=255;t++)C[t]=t+e;if(!y.BSRBANK2.isSet)for(let t=208;t<=223;t++)C[t]=t-16+e}else for(let e=208;e<=255;e++)C[e]=256+e-192},Or=()=>{let e=y.ALTZP.isSet?383+yr()*256:0,t=y.BSR_WRITE.isSet;for(let e=192;e<=255;e++)xr[e]=-1;if(t){for(let t=208;t<=255;t++)xr[t]=t+e;if(!y.BSRBANK2.isSet)for(let t=208;t<=223;t++)xr[t]=t-16+e}},kr=e=>y.INTCXROM.isSet?!1:e!==3||y.SLOTC3ROM.isSet,Ar=()=>!!(y.INTCXROM.isSet||y.INTC8ROM.isSet),jr=e=>{if(e<=7){if(y.INTCXROM.isSet)return;e===3&&!y.SLOTC3ROM.isSet&&(y.INTC8ROM.isSet||(y.INTC8ROM.isSet=!0,vr(255),Nr())),_r()===0&&Ir[e]&&(vr(e),Nr())}else y.INTC8ROM.isSet=!1,vr(0),Nr()},Mr=()=>{C[192]=64;for(let e=1;e<=7;e++){let t=192+e;C[t]=e+(kr(e)?319:256)}if(Ar())for(let e=200;e<=207;e++)C[e]=256+e-192;else{let e=327+8*(_r()-1);for(let t=0;t<=7;t++){let n=200+t;C[n]=e+t}}},Nr=()=>{Er(),Dr(),Or(),Mr();for(let e=0;e<256;e++)C[e]=256*C[e],xr[e]=256*xr[e]},Pr=new Map,Fr=Array(8),Ir=new Uint8Array(8),Lr=(e,n=-1)=>{let r=e>>8==192?e-49280>>4:(e>>8)-192;if(e>=49408&&(jr(r),!kr(r)))return;let i=Fr[r];if(i!==void 0){let r=i(e,n);if(r>=0){let n=e>=49408?fr-256:t;S[e-49152+n]=r}}},Rr=(e,t)=>{gr[e]=1,Fr[e]=t},zr=e=>{e<1||e>7||(S.fill(0,fr+(e-1)*256,fr+e*256),S.fill(0,pr+(e-1)*2048,pr+e*2048),gr[e]=0,Ir[e]=0,Fr[e]=void 0)},Br=(e,t,n=0,r=()=>{})=>{if(S.set(t.slice(0,256),fr+(e-1)*256),gr[e]=+!!t.some(e=>e!==0),t.length>256){let n=t.length>2304?2304:t.length,r=pr+(e-1)*2048;S.set(t.slice(256,n),r),Ir[e]=255}n&&Pr.set(n,r)},Vr=()=>{S.fill(255,0,65536),S.fill(255,hr),vr(0),br(0),Nr()},Hr=e=>(e>=49296?Lr(e):_n(e,!1,k.cycleCount),e>=49232&&Nr(),S[t+e-49152]),w=(e,t)=>{let n=fr+(e-1)*256+(t&255);return S[n]},T=(e,t,n)=>{if(n>=0){let r=fr+(e-1)*256+(t&255);S[r]=n&255}},Ur=(e,t,n,r=-1)=>{if(kr(e)&&(t-49280>>4===e||(t>>8)-192===e)){let e=`$${k.PC.toString(16)}: $${t.toString(16)} (${n})`;r>=0&&(e+=` = $${r.toString(16)}`),console.log(e)}},E=(e,t=!0)=>{let n=0,r=e>>>8;if(r===192)n=Hr(e);else if(n=-1,r>=193&&r<=199?(r==195&&(y.INTCXROM.isSet||!y.SLOTC3ROM.isSet)?n=dr.read(e):kr(r-192)&&!gr[r-192]&&(n=Math.floor(256*Math.random())),Lr(e)):e===53247&&jr(255),n<0){let t=C[r];n=S[t+(e&255)]}return t&&qn(e,n,!1)&&ir(),n},Wr=e=>{let t=e>>>8,n=C[t];return S[n+(e&255)]},Gr=(e,t)=>{if(e===49265||e===49267){if(t>mr)return;br(t)}else e>=49296?Lr(e,t):_n(e,!0,k.cycleCount);(e<=49167||e>=49232)&&Nr()},D=(e,t)=>{let n=e>>>8;if(n===192)Gr(e,t);else{n>=193&&n<=199?Lr(e,t):e===53247&&jr(255);let r=xr[n];if(r<0)return;S[r+(e&255)]=t}qn(e,t,!0)&&ir()},Kr=e=>S[t+e-49152],O=(e,n,r=1)=>{let i=t+e-49152;S.fill(n,i,i+r)},qr=1024,Jr=2048,Yr=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],Xr=(e=!1)=>{let t=0,r=24,i=!1;if(e){if(y.TEXT.isSet||y.HIRES.isSet)return new Uint8Array;r=y.MIXED.isSet?20:24,i=y.COLUMN80.isSet&&y.DHIRES.isSet}else{if(!y.TEXT.isSet&&!y.MIXED.isSet)return new Uint8Array;!y.TEXT.isSet&&y.MIXED.isSet&&(t=20),i=y.COLUMN80.isSet}if(i){let e=y.PAGE2.isSet&&!y.STORE80.isSet?Jr:qr,i=new Uint8Array(80*(r-t)).fill(160);for(let a=t;a<r;a++){let r=80*(a-t);for(let t=0;t<40;t++)i[r+2*t+1]=S[e+Yr[a]+t],i[r+2*t]=S[n+e+Yr[a]+t]}return i}if(y.DHIRES.isSet&&!y.COLUMN80.isSet&&y.STORE80.isSet){let e=new Uint8Array(80*(r-t));for(let i=t;i<r;i++){let r=80*(i-t),a=qr+Yr[i];e.set(S.slice(a,a+40),r),a+=n,e.set(S.slice(a,a+40),r+40)}return e}let a=y.PAGE2.isSet&&!y.STORE80.isSet?Jr:qr,o=new Uint8Array(40*(r-t));for(let e=t;e<r;e++){let n=40*(e-t),r=a+Yr[e];o.set(S.slice(r,r+40),n)}return o},Zr=()=>Dn.Buffer.from(Xr().map(e=>e&=127)).toString(),Qr=new Uint8Array(7680),$r=new Uint8Array(15360),ei=Qr,ti=192,ni=e=>{let t=y.DHIRES.isSet&&y.COLUMN80.isSet,r=y.DHIRES.isSet&&!y.COLUMN80.isSet&&y.STORE80.isSet;if(t||y.VIDEO7_MONO.isSet||y.VIDEO7_160.isSet||r){e===0&&(ei=$r,ti=y.MIXED.isSet?160:192);let t=ie(y.PAGE2.isSet&&!y.STORE80.isSet?16384:8192,e);for(let r=0;r<40;r++)$r[e*80+2*r+1]=S[t+r],$r[e*80+2*r]=S[n+t+r]}else{e===0&&(ei=Qr,ti=y.MIXED.isSet?160:192);let t=(y.PAGE2.isSet?16384:8192)+40*Math.trunc(e/64)+e%8*1024+128*(Math.trunc(e/8)&7);Qr.set(S.slice(t,t+40),e*40)}},ri=()=>y.TEXT.isSet||!y.HIRES.isSet?new Uint8Array:ti===192?ei:ei===Qr?ei.slice(0,40*ti):ei.slice(0,80*ti),ii=e=>{let t=C[e>>>8]+(e&255);return S.slice(t,t+512)},ai=(e,t)=>{let n=xr[e>>>8]+(e&255);S.set(t,n)},oi=(e,t)=>{for(let n=0;n<t.length;n++)if(E(e+n,!1)!==t[n])return!1;return!0},si=()=>{let e=C[0];return S.slice(e,e+256)},ci=()=>S.slice(0,163584),li=()=>{let e=new Uint8Array(65536);for(let t=0;t<256;t++){let n=C[t];e.set(S.slice(n,n+256),t*256)}return e},k=c(),ui=e=>{k.Accum=e},di=e=>{k.XReg=e},fi=e=>{k.YReg=e},pi=e=>{k.cycleCount=e},mi=e=>{hi(),Object.assign(k,e)},hi=()=>{k.Accum=0,k.XReg=0,k.YReg=0,k.PStatus=36,k.StackPtr=255,_i(E(65533,!1)*256+E(65532,!1)),k.flagIRQ=0,k.flagNMI=!1},gi=e=>{_i((k.PC+e+65536)%65536)},_i=e=>{k.PC=e},vi=e=>{k.PStatus=e|48},yi=e=>(e&128?`N`:`.`)+(e&64?`V`:`.`)+(e&16?`B`:`.`)+(e&8?`D`:`.`)+(e&4?`I`:`.`)+(e&2?`Z`:`.`)+(e&1?`C`:`.`),bi=()=>`${u(k.Accum)}  ${u(k.XReg)}  ${u(k.YReg)}  ${u(k.StackPtr)}  ${u(k.PStatus)}  ${yi(k.PStatus)}`,xi=Array(256).fill(``),Si=()=>{let e=0;for(;e<256&&xi[e]===``;)e++;return xi.slice(e,256)},Ci=e=>{xi.splice(256-e.length,e.length,...e)},wi=()=>{let e=ii(256).slice(0,256),t=[];for(let n=255;n>k.StackPtr;n--){let r=`$`+u(e[n]),i=xi[n];xi[n].length>3&&n-1>k.StackPtr&&(xi[n-1]===`JSR`||xi[n-1]===`BRK`||xi[n-1]===`IRQ`?(n--,r+=u(e[n])):i=``),r=(r+`   `).substring(0,6),t.push(u(256+n,4)+`: `+r+i)}return t.join(`
`)},Ti=()=>{let e=ii(256).slice(0,256);for(let t=k.StackPtr-2;t<=255;t++){let n=e[t];if(xi[t].startsWith(`JSR`)&&t-1>k.StackPtr&&xi[t-1]===`JSR`){let r=e[t-1]+1;return(n<<8)+r}}return-1},Ei=(e,t)=>{xi[k.StackPtr]=e,D(256+k.StackPtr,t),k.StackPtr=(k.StackPtr+255)%256},Di=()=>{k.StackPtr=(k.StackPtr+1)%256;let e=E(256+k.StackPtr);if(isNaN(e))throw Error(`illegal stack value`);return e},Oi=()=>(k.PStatus&1)!=0,A=(e=!0)=>k.PStatus=e?k.PStatus|1:k.PStatus&254,ki=()=>(k.PStatus&2)!=0,Ai=(e=!0)=>k.PStatus=e?k.PStatus|2:k.PStatus&253,ji=()=>(k.PStatus&4)!=0,Mi=(e=!0)=>k.PStatus=e?k.PStatus|4:k.PStatus&251,Ni=()=>(k.PStatus&8)!=0,j=()=>+!!Ni(),Pi=(e=!0)=>k.PStatus=e?k.PStatus|8:k.PStatus&247,Fi=(e=!0)=>k.PStatus=e?k.PStatus|16:k.PStatus&239,Ii=()=>(k.PStatus&64)!=0,Li=(e=!0)=>k.PStatus=e?k.PStatus|64:k.PStatus&191,Ri=()=>(k.PStatus&128)!=0,zi=(e=!0)=>k.PStatus=e?k.PStatus|128:k.PStatus&127,M=e=>{Ai(e===0),zi(e>=128)},N=(e,t)=>(e+t+256)%256,P=(e,t)=>t*256+e,F=(e,t,n)=>(t*256+e+n+65536)%65536,I=(e,t)=>e>>8==t>>8?0:1,Bi=(e,t)=>{if(e){let e=k.PC;return gi(t>127?t-256:t),3+I(e+2,k.PC+2)}return 2},L=Array(256),R=(e,t,n,r,i,a=!1)=>{console.assert(!L[n],`Duplicate instruction: `+e+` mode=`+t),L[n]={name:e,pcode:n,mode:t,bytes:r,execute:i,is6502:!a}},Vi=(e,t,n)=>{let r=E(e),i=E((e+1)%256),a=F(r,i,k.YReg);t(a);let o=5+I(a,P(r,i));return n&&(o+=j()),o},Hi=(e,t,n)=>{let r=E(e),i=E((e+1)%256);t(P(r,i));let a=5;return n&&(a+=j()),a},Ui=e=>{let t=(k.Accum&15)+(e&15)+ +!!Oi();t>=10&&(t+=6);let n=(k.Accum&240)+(e&240)+t,r=k.Accum<=127&&e<=127,i=k.Accum>=128&&e>=128;Li((n&255)>=128?r:i),A(n>=160),Oi()&&(n+=96),k.Accum=n&255,M(k.Accum)},Wi=e=>{let t=k.Accum+e+ +!!Oi();A(t>=256),t%=256;let n=k.Accum<=127&&e<=127,r=k.Accum>=128&&e>=128;Li(t>=128?n:r),k.Accum=t,M(k.Accum)},Gi=e=>{Ni()?Ui(E(e)):Wi(E(e))};R(`ADC`,s.IMM,105,2,e=>(j()?Ui(e):Wi(e),2+j())),R(`ADC`,s.ZP_REL,101,2,e=>(Gi(e),3+j())),R(`ADC`,s.ZP_X,117,2,e=>(Gi(N(e,k.XReg)),4+j())),R(`ADC`,s.ABS,109,3,(e,t)=>(Gi(P(e,t)),4+j())),R(`ADC`,s.ABS_X,125,3,(e,t)=>{let n=F(e,t,k.XReg);return Gi(n),4+j()+I(n,P(e,t))}),R(`ADC`,s.ABS_Y,121,3,(e,t)=>{let n=F(e,t,k.YReg);return Gi(n),4+j()+I(n,P(e,t))}),R(`ADC`,s.IND_X,97,2,e=>{let t=N(e,k.XReg);return Gi(P(E(t),E(t+1))),6+j()}),R(`ADC`,s.IND_Y,113,2,e=>Vi(e,Gi,!0)),R(`ADC`,s.IND,114,2,e=>Hi(e,Gi,!0),!0);let Ki=e=>{k.Accum&=E(e),M(k.Accum)};R(`AND`,s.IMM,41,2,e=>(k.Accum&=e,M(k.Accum),2)),R(`AND`,s.ZP_REL,37,2,e=>(Ki(e),3)),R(`AND`,s.ZP_X,53,2,e=>(Ki(N(e,k.XReg)),4)),R(`AND`,s.ABS,45,3,(e,t)=>(Ki(P(e,t)),4)),R(`AND`,s.ABS_X,61,3,(e,t)=>{let n=F(e,t,k.XReg);return Ki(n),4+I(n,P(e,t))}),R(`AND`,s.ABS_Y,57,3,(e,t)=>{let n=F(e,t,k.YReg);return Ki(n),4+I(n,P(e,t))}),R(`AND`,s.IND_X,33,2,e=>{let t=N(e,k.XReg);return Ki(P(E(t),E(t+1))),6}),R(`AND`,s.IND_Y,49,2,e=>Vi(e,Ki,!1)),R(`AND`,s.IND,50,2,e=>Hi(e,Ki,!1),!0);let qi=e=>{let t=E(e);E(e),A((t&128)==128),t=(t<<1)%256,D(e,t),M(t)};R(`ASL`,s.IMPLIED,10,1,()=>(A((k.Accum&128)==128),k.Accum=(k.Accum<<1)%256,M(k.Accum),2)),R(`ASL`,s.ZP_REL,6,2,e=>(qi(e),5)),R(`ASL`,s.ZP_X,22,2,e=>(qi(N(e,k.XReg)),6)),R(`ASL`,s.ABS,14,3,(e,t)=>(qi(P(e,t)),6)),R(`ASL`,s.ABS_X,30,3,(e,t)=>{let n=F(e,t,k.XReg);return qi(n),6+I(n,P(e,t))}),R(`BCC`,s.ZP_REL,144,2,e=>Bi(!Oi(),e)),R(`BCS`,s.ZP_REL,176,2,e=>Bi(Oi(),e)),R(`BEQ`,s.ZP_REL,240,2,e=>Bi(ki(),e)),R(`BMI`,s.ZP_REL,48,2,e=>Bi(Ri(),e)),R(`BNE`,s.ZP_REL,208,2,e=>Bi(!ki(),e)),R(`BPL`,s.ZP_REL,16,2,e=>Bi(!Ri(),e)),R(`BVC`,s.ZP_REL,80,2,e=>Bi(!Ii(),e)),R(`BVS`,s.ZP_REL,112,2,e=>Bi(Ii(),e)),R(`BRA`,s.ZP_REL,128,2,e=>Bi(!0,e),!0);let Ji=e=>{Ai((k.Accum&e)===0),zi((e&128)!=0),Li((e&64)!=0)};R(`BIT`,s.ZP_REL,36,2,e=>(Ji(E(e)),3)),R(`BIT`,s.ABS,44,3,(e,t)=>(Ji(E(P(e,t))),4)),R(`BIT`,s.IMM,137,2,e=>(Ai((k.Accum&e)===0),2),!0),R(`BIT`,s.ZP_X,52,2,e=>(Ji(E(N(e,k.XReg))),4),!0),R(`BIT`,s.ABS_X,60,3,(e,t)=>{let n=F(e,t,k.XReg);return Ji(E(n)),4+I(n,P(e,t))},!0);let Yi=(e,t,n=0)=>{let r=(k.PC+n)%65536,i=E(t),a=E(t+1);Ei(`${e} $`+u(a)+u(i),Math.trunc(r/256)),Ei(e,r%256),Ei(`P`,k.PStatus),Pi(!1),Mi();let o=F(i,a,e===`BRK`?-1:0);_i(o)},Xi=()=>(Fi(),Yi(`BRK`,65534,2),7);R(`BRK`,s.IMPLIED,0,1,Xi);let Zi=()=>ji()?0:(Fi(!1),Yi(`IRQ`,65534),7),Qi=()=>(Yi(`NMI`,65530),7);R(`CLC`,s.IMPLIED,24,1,()=>(A(!1),2)),R(`CLD`,s.IMPLIED,216,1,()=>(Pi(!1),2)),R(`CLI`,s.IMPLIED,88,1,()=>(Mi(!1),2)),R(`CLV`,s.IMPLIED,184,1,()=>(Li(!1),2));let $i=e=>{let t=E(e);A(k.Accum>=t),M((k.Accum-t+256)%256)},ea=e=>{let t=E(e);A(k.Accum>=t),M((k.Accum-t+256)%256)};R(`CMP`,s.IMM,201,2,e=>(A(k.Accum>=e),M((k.Accum-e+256)%256),2)),R(`CMP`,s.ZP_REL,197,2,e=>($i(e),3)),R(`CMP`,s.ZP_X,213,2,e=>($i(N(e,k.XReg)),4)),R(`CMP`,s.ABS,205,3,(e,t)=>($i(P(e,t)),4)),R(`CMP`,s.ABS_X,221,3,(e,t)=>{let n=F(e,t,k.XReg);return ea(n),4+I(n,P(e,t))}),R(`CMP`,s.ABS_Y,217,3,(e,t)=>{let n=F(e,t,k.YReg);return $i(n),4+I(n,P(e,t))}),R(`CMP`,s.IND_X,193,2,e=>{let t=N(e,k.XReg);return $i(P(E(t),E(t+1))),6}),R(`CMP`,s.IND_Y,209,2,e=>Vi(e,$i,!1)),R(`CMP`,s.IND,210,2,e=>Hi(e,$i,!1),!0);let ta=e=>{let t=E(e);A(k.XReg>=t),M((k.XReg-t+256)%256)};R(`CPX`,s.IMM,224,2,e=>(A(k.XReg>=e),M((k.XReg-e+256)%256),2)),R(`CPX`,s.ZP_REL,228,2,e=>(ta(e),3)),R(`CPX`,s.ABS,236,3,(e,t)=>(ta(P(e,t)),4));let na=e=>{let t=E(e);A(k.YReg>=t),M((k.YReg-t+256)%256)};R(`CPY`,s.IMM,192,2,e=>(A(k.YReg>=e),M((k.YReg-e+256)%256),2)),R(`CPY`,s.ZP_REL,196,2,e=>(na(e),3)),R(`CPY`,s.ABS,204,3,(e,t)=>(na(P(e,t)),4));let ra=e=>{let t=N(E(e),-1);D(e,t),M(t)};R(`DEC`,s.IMPLIED,58,1,()=>(k.Accum=N(k.Accum,-1),M(k.Accum),2),!0),R(`DEC`,s.ZP_REL,198,2,e=>(ra(e),5)),R(`DEC`,s.ZP_X,214,2,e=>(ra(N(e,k.XReg)),6)),R(`DEC`,s.ABS,206,3,(e,t)=>(ra(P(e,t)),6)),R(`DEC`,s.ABS_X,222,3,(e,t)=>{let n=F(e,t,k.XReg);return E(n),ra(n),7}),R(`DEX`,s.IMPLIED,202,1,()=>(k.XReg=N(k.XReg,-1),M(k.XReg),2)),R(`DEY`,s.IMPLIED,136,1,()=>(k.YReg=N(k.YReg,-1),M(k.YReg),2));let ia=e=>{k.Accum^=E(e),M(k.Accum)};R(`EOR`,s.IMM,73,2,e=>(k.Accum^=e,M(k.Accum),2)),R(`EOR`,s.ZP_REL,69,2,e=>(ia(e),3)),R(`EOR`,s.ZP_X,85,2,e=>(ia(N(e,k.XReg)),4)),R(`EOR`,s.ABS,77,3,(e,t)=>(ia(P(e,t)),4)),R(`EOR`,s.ABS_X,93,3,(e,t)=>{let n=F(e,t,k.XReg);return ia(n),4+I(n,P(e,t))}),R(`EOR`,s.ABS_Y,89,3,(e,t)=>{let n=F(e,t,k.YReg);return ia(n),4+I(n,P(e,t))}),R(`EOR`,s.IND_X,65,2,e=>{let t=N(e,k.XReg);return ia(P(E(t),E(t+1))),6}),R(`EOR`,s.IND_Y,81,2,e=>Vi(e,ia,!1)),R(`EOR`,s.IND,82,2,e=>Hi(e,ia,!1),!0);let aa=e=>{let t=N(E(e),1);D(e,t),M(t)};R(`INC`,s.IMPLIED,26,1,()=>(k.Accum=N(k.Accum,1),M(k.Accum),2),!0),R(`INC`,s.ZP_REL,230,2,e=>(aa(e),5)),R(`INC`,s.ZP_X,246,2,e=>(aa(N(e,k.XReg)),6)),R(`INC`,s.ABS,238,3,(e,t)=>(aa(P(e,t)),6)),R(`INC`,s.ABS_X,254,3,(e,t)=>{let n=F(e,t,k.XReg);return E(n),aa(n),7}),R(`INX`,s.IMPLIED,232,1,()=>(k.XReg=N(k.XReg,1),M(k.XReg),2)),R(`INY`,s.IMPLIED,200,1,()=>(k.YReg=N(k.YReg,1),M(k.YReg),2)),R(`JMP`,s.ABS,76,3,(e,t)=>(_i(F(e,t,-3)),3)),R(`JMP`,s.IND,108,3,(e,t)=>{let n=P(e,t);return e=E(n),t=E((n+1)%65536),_i(F(e,t,-3)),6}),R(`JMP`,s.IND_X,124,3,(e,t)=>{let n=F(e,t,k.XReg);return e=E(n),t=E((n+1)%65536),_i(F(e,t,-3)),6},!0),R(`JSR`,s.ABS,32,3,(e,t)=>{let n=(k.PC+2)%65536;return Ei(`JSR $`+u(t)+u(e),Math.trunc(n/256)),Ei(`JSR`,n%256),_i(F(e,t,-3)),6});let oa=e=>{k.Accum=E(e),M(k.Accum)};R(`LDA`,s.IMM,169,2,e=>(k.Accum=e,M(k.Accum),2)),R(`LDA`,s.ZP_REL,165,2,e=>(oa(e),3)),R(`LDA`,s.ZP_X,181,2,e=>(oa(N(e,k.XReg)),4)),R(`LDA`,s.ABS,173,3,(e,t)=>(oa(P(e,t)),4)),R(`LDA`,s.ABS_X,189,3,(e,t)=>{let n=F(e,t,k.XReg);return oa(n),4+I(n,P(e,t))}),R(`LDA`,s.ABS_Y,185,3,(e,t)=>{let n=F(e,t,k.YReg);return oa(n),4+I(n,P(e,t))}),R(`LDA`,s.IND_X,161,2,e=>{let t=N(e,k.XReg);return oa(P(E(t),E((t+1)%256))),6}),R(`LDA`,s.IND_Y,177,2,e=>Vi(e,oa,!1)),R(`LDA`,s.IND,178,2,e=>Hi(e,oa,!1),!0);let sa=e=>{k.XReg=E(e),M(k.XReg)};R(`LDX`,s.IMM,162,2,e=>(k.XReg=e,M(k.XReg),2)),R(`LDX`,s.ZP_REL,166,2,e=>(sa(e),3)),R(`LDX`,s.ZP_Y,182,2,e=>(sa(N(e,k.YReg)),4)),R(`LDX`,s.ABS,174,3,(e,t)=>(sa(P(e,t)),4)),R(`LDX`,s.ABS_Y,190,3,(e,t)=>{let n=F(e,t,k.YReg);return sa(n),4+I(n,P(e,t))});let ca=e=>{k.YReg=E(e),M(k.YReg)};R(`LDY`,s.IMM,160,2,e=>(k.YReg=e,M(k.YReg),2)),R(`LDY`,s.ZP_REL,164,2,e=>(ca(e),3)),R(`LDY`,s.ZP_X,180,2,e=>(ca(N(e,k.XReg)),4)),R(`LDY`,s.ABS,172,3,(e,t)=>(ca(P(e,t)),4)),R(`LDY`,s.ABS_X,188,3,(e,t)=>{let n=F(e,t,k.XReg);return ca(n),4+I(n,P(e,t))});let la=e=>{let t=E(e);E(e),A((t&1)==1),t>>=1,D(e,t),M(t)};R(`LSR`,s.IMPLIED,74,1,()=>(A((k.Accum&1)==1),k.Accum>>=1,M(k.Accum),2)),R(`LSR`,s.ZP_REL,70,2,e=>(la(e),5)),R(`LSR`,s.ZP_X,86,2,e=>(la(N(e,k.XReg)),6)),R(`LSR`,s.ABS,78,3,(e,t)=>(la(P(e,t)),6)),R(`LSR`,s.ABS_X,94,3,(e,t)=>{let n=F(e,t,k.XReg);return la(n),6+I(n,P(e,t))}),R(`NOP`,s.IMPLIED,234,1,()=>2);let ua=e=>{k.Accum|=E(e),M(k.Accum)};R(`ORA`,s.IMM,9,2,e=>(k.Accum|=e,M(k.Accum),2)),R(`ORA`,s.ZP_REL,5,2,e=>(ua(e),3)),R(`ORA`,s.ZP_X,21,2,e=>(ua(N(e,k.XReg)),4)),R(`ORA`,s.ABS,13,3,(e,t)=>(ua(P(e,t)),4)),R(`ORA`,s.ABS_X,29,3,(e,t)=>{let n=F(e,t,k.XReg);return ua(n),4+I(n,P(e,t))}),R(`ORA`,s.ABS_Y,25,3,(e,t)=>{let n=F(e,t,k.YReg);return ua(n),4+I(n,P(e,t))}),R(`ORA`,s.IND_X,1,2,e=>{let t=N(e,k.XReg);return ua(P(E(t),E(t+1))),6}),R(`ORA`,s.IND_Y,17,2,e=>Vi(e,ua,!1)),R(`ORA`,s.IND,18,2,e=>Hi(e,ua,!1),!0),R(`PHA`,s.IMPLIED,72,1,()=>(Ei(`PHA`,k.Accum),3)),R(`PHP`,s.IMPLIED,8,1,()=>(Ei(`PHP`,k.PStatus|16),3)),R(`PHX`,s.IMPLIED,218,1,()=>(Ei(`PHX`,k.XReg),3),!0),R(`PHY`,s.IMPLIED,90,1,()=>(Ei(`PHY`,k.YReg),3),!0),R(`PLA`,s.IMPLIED,104,1,()=>(k.Accum=Di(),M(k.Accum),4)),R(`PLP`,s.IMPLIED,40,1,()=>(vi(Di()),4)),R(`PLX`,s.IMPLIED,250,1,()=>(k.XReg=Di(),M(k.XReg),4),!0),R(`PLY`,s.IMPLIED,122,1,()=>(k.YReg=Di(),M(k.YReg),4),!0);let da=e=>{let t=E(e);E(e);let n=+!!Oi();A((t&128)==128),t=(t<<1)%256|n,D(e,t),M(t)};R(`ROL`,s.IMPLIED,42,1,()=>{let e=+!!Oi();return A((k.Accum&128)==128),k.Accum=(k.Accum<<1)%256|e,M(k.Accum),2}),R(`ROL`,s.ZP_REL,38,2,e=>(da(e),5)),R(`ROL`,s.ZP_X,54,2,e=>(da(N(e,k.XReg)),6)),R(`ROL`,s.ABS,46,3,(e,t)=>(da(P(e,t)),6)),R(`ROL`,s.ABS_X,62,3,(e,t)=>{let n=F(e,t,k.XReg);return da(n),6+I(n,P(e,t))});let fa=e=>{let t=E(e);E(e);let n=Oi()?128:0;A((t&1)==1),t=t>>1|n,D(e,t),M(t)};R(`ROR`,s.IMPLIED,106,1,()=>{let e=Oi()?128:0;return A((k.Accum&1)==1),k.Accum=k.Accum>>1|e,M(k.Accum),2}),R(`ROR`,s.ZP_REL,102,2,e=>(fa(e),5)),R(`ROR`,s.ZP_X,118,2,e=>(fa(N(e,k.XReg)),6)),R(`ROR`,s.ABS,110,3,(e,t)=>(fa(P(e,t)),6)),R(`ROR`,s.ABS_X,126,3,(e,t)=>{let n=F(e,t,k.XReg);return fa(n),6+I(n,P(e,t))}),R(`RTI`,s.IMPLIED,64,1,()=>(vi(Di()),Fi(!1),_i(P(Di(),Di())-1),6)),R(`RTS`,s.IMPLIED,96,1,()=>(_i(P(Di(),Di())),6));let pa=e=>{let t=255-e,n=k.Accum+t+ +!!Oi(),r=n>=256,i=k.Accum<=127&&t<=127,a=k.Accum>=128&&t>=128;Li(n%256>=128?i:a);let o=(k.Accum&15)-(e&15)+(Oi()?0:-1);n=k.Accum-e+(Oi()?0:-1),n<0&&(n-=96),o<0&&(n-=6),k.Accum=n&255,M(k.Accum),A(r)},ma=e=>{j()?pa(E(e)):Wi(255-E(e))};R(`SBC`,s.IMM,233,2,e=>(j()?pa(e):Wi(255-e),2+j())),R(`SBC`,s.ZP_REL,229,2,e=>(ma(e),3+j())),R(`SBC`,s.ZP_X,245,2,e=>(ma(N(e,k.XReg)),4+j())),R(`SBC`,s.ABS,237,3,(e,t)=>(ma(P(e,t)),4+j())),R(`SBC`,s.ABS_X,253,3,(e,t)=>{let n=F(e,t,k.XReg);return ma(n),4+j()+I(n,P(e,t))}),R(`SBC`,s.ABS_Y,249,3,(e,t)=>{let n=F(e,t,k.YReg);return ma(n),4+j()+I(n,P(e,t))}),R(`SBC`,s.IND_X,225,2,e=>{let t=N(e,k.XReg);return ma(P(E(t),E(t+1))),6+j()}),R(`SBC`,s.IND_Y,241,2,e=>Vi(e,ma,!0)),R(`SBC`,s.IND,242,2,e=>Hi(e,ma,!0),!0),R(`SEC`,s.IMPLIED,56,1,()=>(A(),2)),R(`SED`,s.IMPLIED,248,1,()=>(Pi(),2)),R(`SEI`,s.IMPLIED,120,1,()=>(Mi(),2)),R(`STA`,s.ZP_REL,133,2,e=>(D(e,k.Accum),3)),R(`STA`,s.ZP_X,149,2,e=>(D(N(e,k.XReg),k.Accum),4)),R(`STA`,s.ABS,141,3,(e,t)=>(D(P(e,t),k.Accum),4)),R(`STA`,s.ABS_X,157,3,(e,t)=>{let n=F(e,t,k.XReg);return E(n),D(n,k.Accum),5}),R(`STA`,s.ABS_Y,153,3,(e,t)=>(D(F(e,t,k.YReg),k.Accum),5)),R(`STA`,s.IND_X,129,2,e=>{let t=N(e,k.XReg);return D(P(E(t),E(t+1)),k.Accum),6});let ha=e=>{D(e,k.Accum)};R(`STA`,s.IND_Y,145,2,e=>(Vi(e,ha,!1),6)),R(`STA`,s.IND,146,2,e=>Hi(e,ha,!1),!0),R(`STX`,s.ZP_REL,134,2,e=>(D(e,k.XReg),3)),R(`STX`,s.ZP_Y,150,2,e=>(D(N(e,k.YReg),k.XReg),4)),R(`STX`,s.ABS,142,3,(e,t)=>(D(P(e,t),k.XReg),4)),R(`STY`,s.ZP_REL,132,2,e=>(D(e,k.YReg),3)),R(`STY`,s.ZP_X,148,2,e=>(D(N(e,k.XReg),k.YReg),4)),R(`STY`,s.ABS,140,3,(e,t)=>(D(P(e,t),k.YReg),4)),R(`STZ`,s.ZP_REL,100,2,e=>(D(e,0),3),!0),R(`STZ`,s.ZP_X,116,2,e=>(D(N(e,k.XReg),0),4),!0),R(`STZ`,s.ABS,156,3,(e,t)=>(D(P(e,t),0),4),!0),R(`STZ`,s.ABS_X,158,3,(e,t)=>{let n=F(e,t,k.XReg);return E(n),D(n,0),5},!0),R(`TAX`,s.IMPLIED,170,1,()=>(k.XReg=k.Accum,M(k.XReg),2)),R(`TAY`,s.IMPLIED,168,1,()=>(k.YReg=k.Accum,M(k.YReg),2)),R(`TSX`,s.IMPLIED,186,1,()=>(k.XReg=k.StackPtr,M(k.XReg),2)),R(`TXA`,s.IMPLIED,138,1,()=>(k.Accum=k.XReg,M(k.Accum),2)),R(`TXS`,s.IMPLIED,154,1,()=>(k.StackPtr=k.XReg,2)),R(`TYA`,s.IMPLIED,152,1,()=>(k.Accum=k.YReg,M(k.Accum),2));let ga=e=>{let t=E(e);Ai((k.Accum&t)===0),D(e,t&~k.Accum)};R(`TRB`,s.ZP_REL,20,2,e=>(ga(e),5),!0),R(`TRB`,s.ABS,28,3,(e,t)=>(ga(P(e,t)),6),!0);let _a=e=>{let t=E(e);Ai((k.Accum&t)===0),D(e,t|k.Accum)};R(`TSB`,s.ZP_REL,4,2,e=>(_a(e),5),!0),R(`TSB`,s.ABS,12,3,(e,t)=>(_a(P(e,t)),6),!0),[2,34,66,98,130,194,226].forEach(e=>{R(`???`,s.IMPLIED,e,2,()=>2),L[e].is6502=!1});for(let e=0;e<=15;e++)R(`???`,s.IMPLIED,3+16*e,1,()=>1),L[3+16*e].is6502=!1,R(`???`,s.IMPLIED,7+16*e,1,()=>1),L[7+16*e].is6502=!1,R(`???`,s.IMPLIED,11+16*e,1,()=>1),L[11+16*e].is6502=!1,R(`???`,s.IMPLIED,15+16*e,1,()=>1),L[15+16*e].is6502=!1;R(`???`,s.IMPLIED,68,2,()=>3),L[68].is6502=!1,R(`???`,s.IMPLIED,84,2,()=>4),L[84].is6502=!1,R(`???`,s.IMPLIED,212,2,()=>4),L[212].is6502=!1,R(`???`,s.IMPLIED,244,2,()=>4),L[244].is6502=!1,R(`???`,s.IMPLIED,92,3,()=>8),L[92].is6502=!1,R(`???`,s.IMPLIED,220,3,()=>4),L[220].is6502=!1,R(`???`,s.IMPLIED,252,3,()=>4),L[252].is6502=!1;for(let e=0;e<256;e++)L[e]||(console.error(`ERROR: OPCODE `+e.toString(16)+` should be implemented`),R(`BRK`,s.IMPLIED,e,1,Xi));let va=()=>{let e=Array(256);for(let t=0;t<256;t++)e[t]={name:L[t].name,mode:L[t].mode,pcode:L[t].pcode,bytes:L[t].bytes,is6502:L[t].is6502};Rp(e)},ya=(e,t,n)=>{let r=t&7,i=t>>>3;return e[i]|=n>>>r,r&&(e[i+1]|=n<<8-r),t+8},ba=(e,t,n)=>(t=ya(e,t,n>>>1|170),t=ya(e,t,n|170),t),xa=(e,t)=>(t=ya(e,t,255),t+2),Sa=e=>{
/*!
Converts a 256-byte source woz into the 343 byte values that
contain the Apple 6-and-2 encoding of that woz.
@param dest The at-least-343 byte woz to which the encoded sector is written.
@param src The 256-byte source data.
*/
let t=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],n=new Uint8Array(343),r=[0,2,1,3];for(let t=0;t<84;t++)n[t]=r[e[t]&3]|r[e[t+86]&3]<<2|r[e[t+172]&3]<<4;n[84]=r[e[84]&3]<<0|r[e[170]&3]<<2,n[85]=r[e[85]&3]<<0|r[e[171]&3]<<2;for(let t=0;t<256;t++)n[86+t]=e[t]>>>2;n[342]=n[341];let i=342;for(;i>1;)i--,n[i]^=n[i-1];for(let e=0;e<343;e++)n[e]=t[n[e]];return n},Ca=(e,t,n)=>{
/*!
Converts a DSK-style track to a WOZ-style track.
@param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
proper suffix will be written.
@param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
a fully-decoded sector.
@param track_number The track number to encode into this track.
@param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/
let r=0,i=new Uint8Array(6646).fill(0);for(let e=0;e<16;e++)r=xa(i,r);for(let a=0;a<16;a++){r=ya(i,r,213),r=ya(i,r,170),r=ya(i,r,150),r=ba(i,r,254),r=ba(i,r,t),r=ba(i,r,a),r=ba(i,r,254^t^a),r=ya(i,r,222),r=ya(i,r,170),r=ya(i,r,235);for(let e=0;e<7;e++)r=xa(i,r);r=ya(i,r,213),r=ya(i,r,170),r=ya(i,r,173);let o=a===15?15:a*(n?8:7)%15,s=Sa(e.slice(o*256,o*256+256));for(let e=0;e<s.length;e++)r=ya(i,r,s[e]);r=ya(i,r,222),r=ya(i,r,170),r=ya(i,r,235);for(let e=0;e<16;e++)r=xa(i,r)}return i},wa=(e,t)=>{let n=e.length/(16*256);if(n<34||n>40)return new Uint8Array;let r=new Uint8Array(1536+n*13*512).fill(0);r.set(d(`WOZ2ÿ
\r
`),0),r.set(d(`INFO`),12),r[16]=60,r[20]=2,r[21]=1,r[22]=0,r[23]=0,r[24]=1,r.fill(32,25,57),r.set(d(`Apple2TS (CT6502)`),25),r[57]=1,r[58]=0,r[59]=32,r[60]=0,r[62]=0,r[64]=13,r.set(d(`TMAP`),80),r[84]=160,r.fill(255,88,248);let i=0;for(let e=0;e<n;e++)i=88+(e<<2),e>0&&(r[i-1]=e),r[i]=r[i+1]=e;r.set(d(`TRKS`),248),r.set(p(1280+n*13*512),252);for(let a=0;a<n;a++){i=256+(a<<3),r.set(f(3+a*13),i),r[i+2]=13,r.set(p(50304),i+4);let n=e.slice(a*16*256,(a+1)*16*256),o=Ca(n,a,t);i=1536+a*13*512,r.set(o,i)}return r},Ta=(e,t)=>{if([87,79,90,50,255,10,13,10].find((e,n)=>e!==t[n])!==void 0)return!1;e.isWriteProtected=t[22]===1,e.isSynchronized=t[23]===1,e.optimalTiming=t[59]>0?t[59]:32;let n=t.slice(8,12),r=n[0]+(n[1]<<8)+(n[2]<<16)+n[3]*2**24,i=re(t,12);if(r!==0&&r!==i)return alert(`CRC checksum error: `+e.filename),!1;for(let n=0;n<160;n++){let r=t[88+n];if(r<255){let i=256+8*r,a=t.slice(i,i+8);e.trackStart[n]=512*((a[1]<<8)+a[0]),e.trackNbits[n]=a[4]+(a[5]<<8)+(a[6]<<16)+a[7]*2**24,e.maxQuarterTrack=n}}return!0},Ea=(e,t)=>{if([87,79,90,49,255,10,13,10].find((e,n)=>e!==t[n])!==void 0)return!1;e.isWriteProtected=t[22]===1;for(let n=0;n<160;n++){let r=t[88+n];if(r<255){e.trackStart[n]=256+r*6656;let i=t.slice(e.trackStart[n]+6646,e.trackStart[n]+6656);e.trackNbits[n]=i[2]+(i[3]<<8),e.maxQuarterTrack=n}}return!0},Da=(e,t)=>{let n=wa(t,e.filename.toLowerCase().endsWith(`.po`));return n.length===0?new Uint8Array:(e.filename=ee(e.filename,`woz`),e.diskHasChanges=!0,e.lastAppleWriteTime=Date.now(),n)},Oa=(e,t)=>{e.diskHasChanges=!1;let n=e.filename.toLowerCase();if(t.length>1e4){if(oe(n)&&(e.hardDrive=!0,e.status=``,n.endsWith(`.hdv`)||n.endsWith(`.po`)||n.endsWith(`.2meg`)||n.endsWith(`.2mg`)))return t;if(t.length===143360&&(t=Da(e,t)),Ta(e,t))return(n.endsWith(`.dsk`)||n.endsWith(`.do`)||n.endsWith(`.po`))&&(e.filename=ee(e.filename,`woz`),e.diskHasChanges=!0,e.lastAppleWriteTime=Date.now()),t;if(Ea(e,t))return t}return n!==``&&console.error(`Unknown disk format or unable to decode: ${e.filename} (${t.length} bytes).`),new Uint8Array},ka=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0],Aa=0,ja=0,Ma=!1,Na=0,Pa=!1,Fa=!1,Ia=[-1,0,2,1,4,-1,3,-1,6,7,-1,-1,5,-1,-1,-1],La=[[0,1,2,3,0,-3,-2,-1],[-1,0,1,2,3,0,-3,-2],[-2,-1,0,1,2,3,0,-3],[-3,-2,-1,0,1,2,3,0],[0,-3,-2,-1,0,1,2,3],[3,0,-3,-2,-1,0,1,2],[2,3,0,-3,-2,-1,0,1],[1,2,3,0,-3,-2,-1,0]],Ra=e=>{Pa=!1,to(e),e.quarterTrack=e.maxQuarterTrack,e.prevQuarterTrack=e.maxQuarterTrack},za=(e=!1)=>{if(e){let e=ho();e.motorRunning&&no(e)}else Ep(o.MOTOR_OFF)},Ba=0,Va=(e,t,n)=>{Ba=0,e.prevQuarterTrack=e.quarterTrack,e.quarterTrack+=t,e.quarterTrack<0||e.quarterTrack>e.maxQuarterTrack?(Ep(o.TRACK_END),e.quarterTrack=Math.max(0,Math.min(e.quarterTrack,e.maxQuarterTrack))):Ep(o.TRACK_SEEK),e.status=` Trk ${e.quarterTrack/4}`,bo(),Na+=n,e.trackLocation+=Math.floor(Na/4),Na%=4,e.quarterTrack!=e.prevQuarterTrack&&(e.trackLocation=Math.floor(e.trackLocation*(e.trackNbits[e.quarterTrack]/e.trackNbits[e.prevQuarterTrack])))},Ha=0,Ua=[0,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],Wa=()=>(Ha++,Ua[Ha&31]),Ga=0,Ka=e=>(Ga<<=1,Ga|=e,Ga&=15,Ga===0?Wa():e),qa=[128,64,32,16,8,4,2,1],Ja=[127,191,223,239,247,251,253,254],Ya=(e,t)=>{let n=e.trackLocation;e.trackLocation%=e.trackNbits[e.quarterTrack],n!==e.trackLocation&&(Ba>=9?(Ba=0,e.trackLocation+=4):Ba++);let r;if(e.trackStart[e.quarterTrack]>0){let n=t[e.trackStart[e.quarterTrack]+(e.trackLocation>>3)],i=e.trackLocation&7;r=(n&qa[i])>>7-i,r=Ka(r)}else r=Wa();return e.trackLocation++,r},Xa=()=>Math.floor(256*Math.random()),Za=(e,t,n)=>{if(t.length===0)return Xa();let r=0;for(Na+=n;Na>=e.optimalTiming/8;){let n=Ya(e,t);Ma?Ma=!n:ja&128?ja=2|n:(ja=ja<<1|n,ja&128&&(Ma=!0)),Na-=e.optimalTiming/8}return Na<0&&(Na=0),ja&=255,r=ja,r},Qa=0,$a=(e,t,n)=>{if(e.trackLocation%=e.trackNbits[e.quarterTrack],e.trackStart[e.quarterTrack]>0){let r=e.trackStart[e.quarterTrack]+(e.trackLocation>>3),i=t[r],a=e.trackLocation&7;n?i|=qa[a]:i&=Ja[a],t[r]=i}e.trackLocation++},eo=(e,t,n)=>{if(!(t.length===0||e.trackStart[e.quarterTrack]===0)&&ja>0){if(n>=16)for(let n=7;n>=0;n--)$a(e,t,ja&2**n?1:0);n>=36&&$a(e,t,0),n>=40&&$a(e,t,0),io.push(n>=40?2:n>=36?1:ja),e.diskHasChanges=!0,e.lastAppleWriteTime=Date.now(),ja=0}},to=e=>{Aa=0,Pa||(e.motorRunning=!1),bo(),Ep(o.MOTOR_OFF)},no=e=>{Aa?(clearTimeout(Aa),Aa=0):Na=0,e.motorRunning=!0,bo(),Ep(o.MOTOR_ON)},ro=e=>{Aa===0&&(Aa=setTimeout(()=>to(e),1e3))},io=[],ao=e=>{io.length>0&&e.quarterTrack===0&&(io=[])},oo=(e,t)=>{if(e>=49408)return-1;let n=ho(),r=go();if(n.hardDrive)return 0;let i=0,a=k.cycleCount-Qa;switch(e&=15,e){case 9:Pa=!0,no(n),ao(n);break;case 8:n.motorRunning&&!n.writeMode&&(i=Za(n,r,a),Qa=k.cycleCount),Pa=!1,ro(n),ao(n);break;case 10:case 11:{let t=e===10?2:3,r=ho();mo(t),n=ho(),n!==r&&r.motorRunning&&(r.motorRunning=!1,n.motorRunning=!0,bo());break}case 12:Fa=!1,n.motorRunning&&!n.writeMode&&(i=Za(n,r,a),Qa=k.cycleCount);break;case 13:Fa=!0,n.motorRunning&&(n.writeMode?(eo(n,r,a),Qa=k.cycleCount,t>=0&&(ja=t)):(ja=0,Na+=a,n.trackLocation+=Math.floor(Na/4),Na%=4,Qa=k.cycleCount));break;case 14:n.motorRunning&&n.writeMode&&(eo(n,r,a),n.lastAppleWriteTime=Date.now(),Qa=k.cycleCount),n.writeMode=!1,Fa&&(i=n.isWriteProtected?255:0),ao(n);break;case 15:n.writeMode=!0,Qa=k.cycleCount,t>=0&&(ja=t);break;default:{if(e<0||e>7)break;let t=e/2;e%2?n.currentPhase|=1<<t:n.currentPhase&=~(1<<t);let r=Ia[n.currentPhase];if(n.motorRunning&&r>=0){let e=n.quarterTrack&7,t=La[e][r];Va(n,t,a),Qa=k.cycleCount}ao(n);break}}return i},so=()=>{Br(6,Uint8Array.from(ka)),Rr(6,oo)},co=(e,t,n)=>({index:e,hardDrive:n,drive:t,status:``,filename:``,diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,isSynchronized:!1,quarterTrack:0,prevQuarterTrack:0,writeMode:!1,currentPhase:0,trackStart:n?[]:Array(160).fill(0),trackNbits:n?[]:Array(160).fill(51024),trackLocation:0,maxQuarterTrack:0,lastLocalFileWriteTime:-1,cloudData:null,writableFileHandle:null,lastAppleWriteTime:-1,optimalTiming:32}),lo=()=>{z[0]=co(0,1,!0),z[1]=co(1,2,!0),z[2]=co(2,1,!1),z[3]=co(3,2,!1);for(let e=0;e<z.length;e++)uo[e]=new Uint8Array},z=[],uo=[],fo=32e6;lo();let po=2,mo=e=>{po=e},ho=()=>z[po],go=()=>uo[po],_o=e=>z[+(e==2)],vo=e=>{let t=uo[+(e==2)],n=``;for(let e=0;e<4;e++)n+=String.fromCharCode(t[e]);let r=n===`2IMG`?64:0;return[t,r,t.length-r]},yo=[],bo=()=>{for(let e=0;e<z.length;e++){if(z[e].filename===``&&!z[e].cloudData&&yo[e]&&yo[e].diskHasChanges===z[e].diskHasChanges&&yo[e].motorRunning===z[e].motorRunning&&yo[e].status===z[e].status)continue;let t={index:e,hardDrive:z[e].hardDrive,drive:z[e].drive,filename:z[e].filename,status:z[e].status,motorRunning:z[e].motorRunning,diskHasChanges:z[e].diskHasChanges,isWriteProtected:z[e].isWriteProtected,diskData:z[e].diskHasChanges&&!z[e].motorRunning?uo[e]:new Uint8Array,lastAppleWriteTime:z[e].lastAppleWriteTime,lastLocalFileWriteTime:z[e].lastLocalFileWriteTime,cloudData:z[e].cloudData,writableFileHandle:z[e].writableFileHandle};Tp(t),yo[e]={diskHasChanges:t.diskHasChanges,motorRunning:t.motorRunning,status:t.status}}},xo=e=>{let t=Array(z.length).fill(``);for(let n=0;n<z.length;n++)(e||uo[n].length<fo)&&(t[n]=Dn.Buffer.from(uo[n]).toString(`base64`));let n={currentDrive:po,driveState:[],driveData:t};for(let e=0;e<z.length;e++)n.driveState[e]=z[e].filename===``?{}:{...z[e]};return n},So=e=>{let t=z.map(e=>({...e})),n=[...uo];Ep(o.MOTOR_OFF),po=e.currentDrive,e.driveState.length===3&&po>0&&po++,lo();let r=0;for(let i=0;i<e.driveState.length;i++)Object.keys(e.driveState[i]).length>0&&(e.driveData[i]===``?n[r].length>=fo&&(z[r]=t[r],uo[r]=n[r]):(z[r]={...e.driveState[i]},uo[r]=new Uint8Array(Dn.Buffer.from(e.driveData[i],`base64`)))),e.driveState.length===3&&i===0&&(r=1),r++;bo()},Co=()=>{for(let e=0;e<z.length;e++)z[e].hardDrive||Ra(z[e]);bo()},wo=(e=!1)=>{za(e),bo()},To=(e,t=!1)=>{let n=e.index,r=e.drive,i=e.hardDrive;if(t||e.filename!==``&&(oe(e.filename)?(i=!0,n=e.drive<=1?0:1,r=n+1):(i=!1,n=e.drive<=1?2:3,r=n-1)),z[n]=co(n,r,i),z[n].filename=e.filename,uo[n]=Oa(z[n],e.diskData),uo[n].length===0){z[n].filename=``,bo();return}z[n].motorRunning=e.motorRunning,z[n].cloudData=e.cloudData,z[n].writableFileHandle=e.writableFileHandle,z[n].lastLocalFileWriteTime=e.lastLocalFileWriteTime,bo()},Eo=e=>{let t=e.index;z[t].filename=e.filename,z[t].motorRunning=e.motorRunning,z[t].isWriteProtected=e.isWriteProtected,z[t].diskHasChanges=e.diskHasChanges,z[t].lastAppleWriteTime=e.lastAppleWriteTime,z[t].lastLocalFileWriteTime=e.lastLocalFileWriteTime,z[t].cloudData=e.cloudData,z[t].writableFileHandle=e.writableFileHandle,bo()},Do={PE:1,FE:2,OVRN:4,RX_FULL:8,TX_EMPTY:16,NDCD:32,NDSR:64,IRQ:128,HW_RESET:16},Oo={BAUD_RATE:15,INT_CLOCK:16,WORD_LENGTH:96,STOP_BITS:128,HW_RESET:0},ko={DTR_ENABLE:1,RX_INT_DIS:2,TX_INT_EN:4,RTS_TX_INT_EN:12,RX_ECHO:16,PARITY_EN:32,PARITY_CNF:192,HW_RESET:0,HW_RESET_MOS:2};var Ao=class{buffer(e){for(let t=0;t<e.length;t++)this._receiveBuffer.push(e[t]);let t=this._receiveBuffer.length-16;t=t<0?0:t;for(let e=0;e<t;e++)this._receiveBuffer.shift(),this._status|=Do.OVRN;this._status|=Do.RX_FULL,(this._control&ko.RX_INT_DIS)==0&&this.irq(!0)}set data(e){let t=new Uint8Array(1).fill(e);this._extFuncs.sendData(t),this._command&ko.TX_INT_EN&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(Do.PE|Do.FE|Do.OVRN),this._receiveBuffer.length?(this._status|=Do.RX_FULL,(this._control&ko.RX_INT_DIS)==0&&this.irq(!0)):this._status&=~Do.RX_FULL,this._lastRead}set control(e){this._control=e,this.serialConfigChange(this.buildConfigChange())}get control(){return this._control}set command(e){this._command=e,this.serialConfigChange(this.buildConfigChange())}get command(){return this._command}get status(){let e=this._status;return this._status&Do.IRQ&&this.irq(!1),this._status&=~Do.IRQ,e}set status(e){this.reset()}irq(e){e?this._status|=Do.IRQ:this._status&=~Do.IRQ,this._extFuncs.interrupt(e)}buildConfigChange(){let e={};switch(this._control&Oo.BAUD_RATE){case 0:e.baud=0;break;case 1:e.baud=50;break;case 2:e.baud=75;break;case 3:e.baud=109;break;case 4:e.baud=134;break;case 5:e.baud=150;break;case 6:e.baud=300;break;case 7:e.baud=600;break;case 8:e.baud=1200;break;case 9:e.baud=1800;break;case 10:e.baud=2400;break;case 11:e.baud=3600;break;case 12:e.baud=4800;break;case 13:e.baud=7200;break;case 14:e.baud=9600;break;case 15:e.baud=19200;break}switch(this._control&Oo.WORD_LENGTH){case 0:e.bits=8;break;case 32:e.bits=7;break;case 64:e.bits=6;break;case 96:e.bits=5;break}if(this._control&Oo.STOP_BITS?e.stop=2:e.stop=1,e.parity=`none`,this._command&ko.PARITY_EN)switch(this._command&ko.PARITY_CNF){case 0:e.parity=`odd`;break;case 64:e.parity=`even`;break;case 128:e.parity=`mark`;break;case 192:e.parity=`space`;break}return e}serialConfigChange(e){let t=!1;(e.baud!=this._lastConfig.baud||e.baud>0)&&(t=!0),e.bits!=this._lastConfig.bits&&(t=!0),e.stop!=this._lastConfig.stop&&(t=!0),e.parity!=this._lastConfig.parity&&(t=!0),t&&(this._lastConfig=e,this._extFuncs.serialConfig(this._lastConfig))}reset(){this._control=Oo.HW_RESET,this._command=ko.HW_RESET,this._status=Do.HW_RESET,this.irq(!1),this._receiveBuffer=[]}constructor(e){this._extFuncs=e,this._control=Oo.HW_RESET,this._command=ko.HW_RESET,this._status=Do.HW_RESET,this._lastConfig=this.buildConfigChange(),this._lastRead=0,this._receiveBuffer=[],this.reset()}};let jo=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]),Mo=1,No,Po=e=>{Jn(Mo,e)},Fo=e=>{console.log(`SerialConfig: `,e),zp(e)},Io=e=>{No&&No.buffer(e)},Lo=()=>{No&&No.reset()},Ro=(e=!0,t=1)=>{if(!e)return;Mo=t,No=new Ao({sendData:Pp,interrupt:Po,serialConfig:Fo});let n=new Uint8Array(jo.length+256);n.set(jo.slice(1792,2048)),n.set(jo,256),Br(Mo,n),Rr(Mo,zo)},zo=(e,t=-1)=>{if(e>=49408)return-1;let n={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(e&15){case n.DIPSW1:return 226;case n.DIPSW2:return 40;case n.IOREG:if(t>=0)No.data=t;else return No.data;break;case n.STATUS:if(t>=0)No.status=t;else return No.status;break;case n.COMMAND:if(t>=0)No.command=t;else return No.command;break;case n.CONTROL:if(t>=0)No.control=t;else return No.control;break;default:console.log(`SSC unknown softswitch`,(e&15).toString(16));break}return-1},Bo=(e,t)=>String(e).padStart(t,`0`);(()=>{let e=new Uint8Array(256).fill(96);return e[0]=8,e[2]=40,e[4]=88,e[6]=112,e})();let Vo=()=>{let e=new Date,t=Bo(e.getMonth()+1,2)+`,`+Bo(e.getDay(),2)+`,`+Bo(e.getDate(),2)+`,`+Bo(e.getHours(),2)+`,`+Bo(e.getMinutes(),2);for(let e=0;e<t.length;e++)D(512+e,t.charCodeAt(e)|128)},Ho=!1,Uo=e=>{let t=e.split(`,`),n=t[0].split(/([+-])/);return{label:n[0]?n[0]:``,operation:n[1]?n[1]:``,value:n[2]?parseInt(n[2].replace(`#`,``).replace(`$`,`0x`)):0,idx:t[1]?t[1]:``}},Wo=e=>{let t=s.IMPLIED,n=-1;if(e.length>0){e.startsWith(`#`)?(t=s.IMM,e=e.substring(1)):e.startsWith(`(`)?(t=e.endsWith(`,Y`)?s.IND_Y:e.endsWith(`,X)`)?s.IND_X:s.IND,e=e.substring(1)):t=e.endsWith(`,X`)?e.length>5?s.ABS_X:s.ZP_X:e.endsWith(`,Y`)?e.length>5?s.ABS_Y:s.ZP_Y:e.length>3?s.ABS:s.ZP_REL,e.startsWith(`$`)&&(e=`0x`+e.substring(1)),n=parseInt(e);let r=Uo(e);if(r.operation&&r.value){switch(r.operation){case`+`:n+=r.value;break;case`-`:n-=r.value;break;default:console.error(`Unknown operation in operand: `+e)}n=(n%65536+65536)%65536}}return[t,n]},Go={},Ko=(e,t,n,r)=>{let i=s.IMPLIED,a=-1;if(n.match(/^[#]?[$0-9()]+/))return Object.entries(Go).forEach(([e,t])=>{n=n.replace(RegExp(`\\b${e}\\b`,`g`),`$`+u(t))}),Wo(n);let o=Uo(n);if(o.label){let c=o.label.startsWith(`<`),u=o.label.startsWith(`>`),d=o.label.startsWith(`#`)||u||c;if(d&&(o.label=o.label.substring(1)),o.label in Go?(a=Go[o.label],u?a=a>>8&255:c&&(a&=255)):r===2&&console.error(`Missing label: `+o.label),o.operation&&o.value){switch(o.operation){case`+`:a+=o.value;break;case`-`:a-=o.value;break;default:console.error(`Unknown operation in operand: `+n)}a=(a%65536+65536)%65536}l(t)?(i=s.ZP_REL,a=a-e+254,a>255&&(a-=256)):d?i=s.IMM:(i=a>=0&&a<=255?s.ZP_REL:s.ABS,i=o.idx===`X`?i===s.ABS?s.ABS_X:s.ZP_X:i,i=o.idx===`Y`?i===s.ABS?s.ABS_Y:s.ZP_Y:i)}return[i,a]},qo=(e,t)=>{e=e.replace(/\s+/g,` `);let n=e.split(` `);return{label:n[0]?n[0]:t,instr:n[1]?n[1]:``,operand:n[2]?n[2]:``}},Jo=(e,t)=>{if(e.label in Go&&console.error(`Redefined label: `+e.label),e.instr===`EQU`){let[n,r]=Ko(t,e.instr,e.operand,2);n!==s.ABS&&n!==s.ZP_REL&&console.error(`Illegal EQU value: `+e.operand),Go[e.label]=r}else Go[e.label]=t},Yo=e=>{let t=[];switch(e.instr){case`ASC`:case`DA`:{let n=e.operand,r=0;n.startsWith(`"`)&&n.endsWith(`"`)?r=128:n.startsWith(`'`)&&n.endsWith(`'`)?r=0:console.error(`Invalid string: `+n),n=n.substring(1,n.length-1);for(let e=0;e<n.length;e++)t.push(n.charCodeAt(e)|r);t.push(0);break}case`HEX`:(e.operand.replace(/,/g,``).match(/.{1,2}/g)||[]).forEach(n=>{let r=parseInt(n,16);isNaN(r)&&console.error(`Invalid HEX value: ${n} in ${e.operand}`),t.push(r)});break;default:console.error(`Unknown pseudo ops: `+e.instr);break}return t},Xo=(e,t)=>{let n=[],r=L[e];return n.push(e),t>=0&&(n.push(t%256),r.bytes===3&&n.push(Math.trunc(t/256))),n},Zo=0,Qo=(e,t)=>{let n=Zo,r=[],i=``;if(e.forEach(e=>{if(e=e.split(`;`)[0].trimEnd().toUpperCase(),!e)return;let a=(e+`                   `).slice(0,30)+u(n,4)+`- `,o=qo(e,i);if(i=``,!o.instr){i=o.label;return}if(o.instr===`ORG`){if(t===1){let[e,t]=Wo(o.operand);e===s.ABS&&(Zo=t,n=t)}Ho&&t===2&&console.log(a);return}if(t===1&&o.label&&Jo(o,n),o.instr===`EQU`)return;let c=[],d,f;if([`ASC`,`DA`,`HEX`].includes(o.instr))c=Yo(o),n+=c.length;else if([d,f]=Ko(n,o.instr,o.operand,t),t===2&&isNaN(f)&&console.error(`Unknown/illegal value: ${e}`),o.instr===`DB`)c.push(f&255),n++;else if(o.instr===`DW`)c.push(f&255),c.push(f>>8&255),n+=2;else if(o.instr===`DS`)for(let e=0;e<f;e++)c.push(0),n++;else{t===2&&l(o.instr)&&(f<0||f>255)&&console.error(`Branch instruction out of range: ${e} value: ${f} pass: ${t}`);let r=L.findIndex(e=>e&&e.name===o.instr&&e.mode===d);r<0&&console.error(`Unknown instruction: "${e}" mode=${d} pass=${t}`),c=Xo(r,f),n+=L[r].bytes}Ho&&t===2&&(c.forEach(e=>{a+=` ${u(e)}`}),console.log(a)),r.push(...c)}),Ho&&t===2){let e=``;r.forEach(t=>{e+=` ${u(t)}`}),console.log(e)}return r},$o=(e,t,n=!1)=>{Go={},Ho=n;try{return Zo=e,Qo(t,1),Qo(t,2)}catch(e){return console.error(e),[]}},es=49286,ts=49289,ns=49291,rs=49292,is=49293,as=49294,os=49295,ss=(e,t,n,r,i)=>{let a=e&255,o=e>>8&3,s=t&255,c=t>>8&3;O(n,a),O(r,o<<4|c),O(i,s)},cs=(e,t,n)=>{let r=Kr(e),i=Kr(t),a=Kr(n),o=i>>4&3,s=i&3;return[r|o<<8,a|s<<8]},ls=()=>cs(ts,ns,rs),us=()=>cs(is,as,os),ds=(e,t)=>{ss(e,t,ts,ns,rs)},fs=(e,t)=>{ss(e,t,is,as,os)},ps=e=>{O(es,e),Mp(!!e)},ms=()=>{hs=0,gs=0,ds(0,1023),fs(0,1023),ps(0),vs=0,ys=0,bs=0,xs=0,Ss=0,Cs=0,ws=0,Ts=0,_s=0},hs=0,gs=0,_s=0,vs=0,ys=0,bs=0,xs=0,Ss=0,Cs=0,ws=0,Ts=0,Es=0,Ds=5,Os=()=>{let e=new Uint8Array(256).fill(0),t=$o(0,`
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
`.split(`
`));return e.set(t,0),e[251]=214,e[255]=1,e},ks=(e=!0,t=5)=>{if(!e)return;Ds=t;let n=49152+Ds*256,r=49152+Ds*256+8;Br(Ds,Os(),n,Is),Br(Ds,Os(),r,Vo),Rr(Ds,zs),es=49280+(es&15)+Ds*16,ts=49280+(ts&15)+Ds*16,ns=49280+(ns&15)+Ds*16,rs=49280+(rs&15)+Ds*16,is=49280+(is&15)+Ds*16,as=49280+(as&15)+Ds*16,os=49280+(os&15)+Ds*16;let[i,a]=ls();i===0&&a===0&&(ds(0,1023),fs(0,1023)),Kr(es)!==0&&Mp(!0)},As=()=>{let e=Kr(es);if(e&1){let t=!1;e&8&&(Ts|=8,t=!0),e&ys&4&&(Ts|=4,t=!0),e&ys&2&&(Ts|=2,t=!0),t&&Jn(Ds,!0)}},js=e=>{if(Kr(es)&1)if(e.buttons>=0){switch(e.buttons){case 0:vs&=-129;break;case 16:vs|=128;break;case 1:vs&=-17;break;case 17:vs|=16;break}ys|=vs&128?4:0}else{if(e.x>=0&&e.x<=1){let[t,n]=ls();hs=Math.round((n-t)*e.x+t),ys|=2}if(e.y>=0&&e.y<=1){let[t,n]=us();gs=Math.round((n-t)*e.y+t),ys|=2}}},Ms=0,Ns=``,Ps=0,Fs=0,Is=()=>{let e=192+Ds;E(55)===e&&E(54)===0?Rs():E(57)===e&&E(56)===0&&Ls()},Ls=()=>{if(Ms===0){let e=192+Ds;Ps=E(55),Fs=E(54),D(55,e),D(54,3);let t=(vs&128)!=(bs&128),n=0;n=vs&128?t?2:1:t?3:4,E(49152)&128&&(n=-n),bs=vs,Ns=hs.toString()+`,`+gs.toString()+`,`+n.toString()}Ms>=Ns.length?(k.Accum=141,Ms=0,D(55,Ps),D(54,Fs)):(k.Accum=Ns.charCodeAt(Ms)|128,Ms++)},Rs=()=>{switch(k.Accum){case 128:console.log(`mouse off`),ps(0);break;case 129:console.log(`mouse on`),ps(1);break;default:break}},zs=(e,t)=>{if(e>=49408)return-1;let n=t<0,r={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},i={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(e&15){case r.LOWX:if(n)return hs&255;Cs=Cs&65280|t,Cs&=65535;break;case r.HIGHX:if(n)return hs>>8&255;Cs=t<<8|Cs&255,Cs&=65535;break;case r.LOWY:if(n)return gs&255;ws=ws&65280|t,ws&=65535;break;case r.HIGHY:if(n)return gs>>8&255;ws=t<<8|ws&255,ws&=65535;break;case r.STATUS:return vs;case r.MODE:if(n)return Kr(es);ps(t);break;case r.CLAMP:if(n){let[e,t]=ls(),[n,r]=us();switch(_s){case 0:return e>>8&255;case 1:return n>>8&255;case 2:return e&255;case 3:return n&255;case 4:return t>>8&255;case 5:return r>>8&255;case 6:return t&255;case 7:return r&255;default:return console.log(`AppleMouse: invalid clamp index: `+_s),0}}_s=78-t;break;case r.CLOCK:case r.CLOCKMAGIC:return console.log(`clock registers not implemented: C080, C088`),0;case r.COMMAND:if(n)return Es;switch(Es=t,t){case i.INIT:hs=0,gs=0,xs=0,Ss=0,ds(0,1023),fs(0,1023),vs=0,ys=0;break;case i.READ:ys=0,vs&=-112,vs|=bs>>1&64,vs|=bs>>4&1,bs=vs,(xs!==hs||Ss!==gs)&&(vs|=32,xs=hs,Ss=gs);break;case i.CLEAR:console.log(`cmd.clear`),hs=0,gs=0,xs=0,Ss=0;break;case i.SERVE:vs&=-15,vs|=Ts,Ts=0,Jn(Ds,!1);break;case i.HOME:{let[e]=ls(),[t]=us();hs=e,gs=t}break;case i.CLAMPX:{let e=Cs>32767?Cs-65536:Cs,t=ws;ds(e,t),console.log(e+` -> `+t)}break;case i.CLAMPY:{let e=Cs>32767?Cs-65536:Cs,t=ws;fs(e,t),console.log(e+` -> `+t)}break;case i.GCLAMP:console.log(`cmd.getclamp`);break;case i.POS:hs=Cs,gs=ws;break}break;default:console.log(`AppleMouse unknown IO addr`,e.toString(16));break}return t},Bs={RX_FULL:1,TX_EMPTY:2,DCD:4,CTS:8,FE:16,OVRN:32,PE:64,IRQ:128},Vs={COUNTER_DIV:3,WORD_SEL:28,TX_RTS:96,RX_INT_ENABLE:128},Hs={DIV01:0,DIV16:1,DIV64:2,RESET:3},Us={RTS_NO_INT:0,RTS_TX_INT:32,RTS_CLEAR:64,RTS_BREAK:96};var Ws=class{update(e){(this._status&Bs.TX_EMPTY)===0&&(this._outDelay+=e,this._outDelay>320&&(this._outDelay=0,this._status|=Bs.TX_EMPTY,(this._control&Vs.TX_RTS)===Us.RTS_TX_INT&&this.irq(!0)))}buffer(e){for(let t=0;t<e.length;t++)this._receiveBuffer.push(e[t]);let t=this._receiveBuffer.length-16;t=t<0?0:t;for(let e=0;e<t;e++)this._receiveBuffer.shift(),this._status|=Bs.OVRN;this._status|=Bs.RX_FULL,this._control&Vs.RX_INT_ENABLE&&this.irq(!0)}set data(e){let t=new Uint8Array(1).fill(e);this._extFuncs.sendData(t),this._status&=~Bs.TX_EMPTY,this._outCount++}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(Bs.DCD|Bs.FE|Bs.OVRN|Bs.PE),this._receiveBuffer.length?(this._status|=Bs.RX_FULL,this._control&Vs.RX_INT_ENABLE&&this.irq(!0)):(this._status&=~Bs.RX_FULL,this.irq(!1)),this._lastRead}set control(e){this._control,this._control=e,(this._control&Vs.COUNTER_DIV)===Hs.RESET?this.reset():(this._control&Vs.TX_RTS)==Us.RTS_TX_INT&&(this._status&=~Bs.TX_EMPTY),this._status&Bs.RX_FULL&&this._control&Vs.RX_INT_ENABLE&&this.irq(!0)}get status(){let e=this._status;return this._status&Bs.IRQ&&this.irq(!1),e}irq(e){e?this._status|=Bs.IRQ:this._status&=~Bs.IRQ,this._extFuncs.interrupt(e)}reset(){this._control=0,this._status=Bs.TX_EMPTY|Bs.DCD,this.irq(!1),this._receiveBuffer=[],this._outCount=0,this._outDelay=0}constructor(e){this._extFuncs=e,this._lastRead=0,this._control=0,this._status=0,this._receiveBuffer=[],this._outCount=0,this._outDelay=0,this.reset()}};let Gs={OUTPUT_ENABLE:128,IRQ_ENABLE:64,COUNTER_MODE:56,BIT8_MODE:4,INTERNAL_CLOCK:2,SPECIAL:1},Ks={TIMER1_IRQ:1,TIMER2_IRQ:2,TIMER3_IRQ:4,ANY_IRQ:128},qs=(e,t)=>{let n=``;if(t&Gs.OUTPUT_ENABLE?n+=`OE   `:n+=`/OE  `,t&Gs.IRQ_ENABLE?n+=`IRQ  `:n+=`/IRQ `,t&Gs.BIT8_MODE?n+=`D8BIT `:n+=`16BIT `,t&Gs.INTERNAL_CLOCK?n+=`ICLK `:n+=`ECLK `,t&Gs.SPECIAL)switch(e){case 0:n+=`RST  `;break;case 1:n+=`WR0  `;break;case 2:n+=`DIV8 `;break}else switch(e){case 0:n+=`RUN  `;break;case 1:n+=`WR2  `;break;case 2:n+=`DIV1 `;break}switch(n+=`-> `,t&Gs.COUNTER_MODE){case 0:n+=`CONTINUOUS0`;break;case 8:n+=`FREQUENCY_CMP0`;break;case 16:n+=`CONTINUOUS1`;break;case 24:n+=`PULSE_WIDTH_CMP0`;break;case 32:n+=`SINGLE_SHOT0`;break;case 40:n+=`FREQUENCY_CMP1`;break;case 48:n+=`SINGLE_SHOT1`;break;case 56:n+=`PULSE_WIDTH_CMP1`;break}return n};var Js=class{decrement(e){return this._enabled?(this._count-=e,this._count<0?(this._count=65535,this._enabled=!1,!0):!1):!1}get count(){return this._count}set control(e){this._control=e}get control(){return this._control}set latch(e){switch(this._latch=e,this._control&Gs.COUNTER_MODE){case 0:case 32:this.reload();break;default:break}}get latch(){return this._latch}reload(){this._count=this._latch,this._enabled=!0}reset(){this._latch=65535,this._control=0,this._enabled=!0,this.reload()}constructor(){this._latch=65535,this._count=65535,this._control=0,this._enabled=!0}},Ys=class{status(){return this._statusRead=this._status&7,this._status}timerControl(e,t){e===0&&(e=this._timer[1].control&Gs.SPECIAL?0:2);let n=this._timer[e].control;if(this._timer[e].control=t,n!=t&&(t&Gs.IRQ_ENABLE?this._irqMask|=1<<e:this._irqMask&=~(1<<e),e==0))switch((n&Gs.SPECIAL)<<1|t&Gs.SPECIAL){case 0:case 3:break;case 1:case 2:this._timer[0].reload(),this._timer[1].reload(),this._timer[2].reload(),this.irq(0,!1),this.irq(1,!1),this.irq(2,!1);break}}timerLSBw(e,t){let n=this._timer[0].control&Gs.SPECIAL,r=!1;switch(this._timer[e].control&Gs.COUNTER_MODE){case 16:case 48:r=!0;break}let i=this._msb*256+t;this._timer[e].latch=i,(n||r)&&this._timer[e].reload(),this.irq(e,!1)}timerLSBr(e){return this._lsb}timerMSBw(e,t){this._msb=t}timerMSBr(e){let t=this._timer[0].control&Gs.SPECIAL?this._timer[e].latch:this._timer[e].count;return this._lsb=t&255,this._statusRead&1<<e&&(this._statusRead&=~(1<<e),this.irq(e,!1)),t>>8&255}update(e){let t=this._timer[0].control&Gs.SPECIAL;if(this._debugStatus&&(this._debugStatusCount++,this._debugStatusCount>1020300&&(this._debugStatusCount=0,this.printStatus())),!t){this._div8+=e;let t=!1;for(let n=0;n<3;n++){let r=e;if(n==2&&this._timer[2].control&Gs.SPECIAL)if(this._div8>8)r=Math.floor(this._div8/8),this._div8%=8;else continue;if(t=this._timer[n].decrement(r),t)switch(this.irq(n,!0),this._timer[n].control&Gs.COUNTER_MODE){case 0:case 16:this._timer[n].reload();break;default:break}}}}irq(e,t){let n=1<<e;t?this._status|=n:this._status&=~n,this._status&this._irqMask?(this._status|=Ks.ANY_IRQ,this._statusRead&=~n,this._interrupt(!0)):(this._status&=~Ks.ANY_IRQ,this._interrupt(!1))}printStatus(){console.log(`Status : `+this._status.toString(16)),console.log(`IRQMask: `+this._irqMask.toString(16));for(let e=0;e<3;e++)console.log(`[`+e+`]: `+qs(e,this._timer[e].control)+` : `+this._timer[e].latch+` : `+this._timer[e].count)}reset(){this._timer.forEach(e=>{e.reset()}),this._status=0,this._irqMask=0,this.irq(0,!1),this.irq(1,!1),this.irq(2,!1),this._timer[0].control=Gs.SPECIAL}constructor(e){this._interrupt=e,this._status=0,this._irqMask=0,this._statusRead=0,this._timer=[new Js,new Js,new Js],this._msb=this._lsb=0,this._div8=0,this._debugStatus=!1,this._debugStatusCount=0,this.reset()}};let Xs=2,B,Zs,Qs=0,$s=e=>{if(Qs){let e=k.cycleCount-Qs;B.update(e),Zs.update(e)}Qs=k.cycleCount},ec=e=>{Jn(Xs,e)},tc=e=>{Zs&&Zs.buffer(e)},nc=(e=!0,t=2)=>{e&&(Xs=t,B=new Ys(ec),Zs=new Ws({sendData:Fp,interrupt:ec}),Rr(Xs,ic),$n($s,Xs))},rc=()=>{B&&(B.reset(),Zs.reset())},ic=(e,t=-1)=>{if(e>=49408)return-1;let n={TCONTROL1:0,TCONTROL2:1,T1MSB:2,T1LSB:3,T2MSB:4,T2LSB:5,T3MSB:6,T3LSB:7,ACIASTATCTRL:8,ACIADATA:9,SDMIDICTRL:12,SDMIDIDATA:13,DRUMSET:14,DRUMCLEAR:15},r=-1;switch(e&15){case n.SDMIDIDATA:case n.ACIADATA:t>=0?Zs.data=t:r=Zs.data;break;case n.SDMIDICTRL:case n.ACIASTATCTRL:t>=0?Zs.control=t:r=Zs.status;break;case n.TCONTROL1:t>=0?B.timerControl(0,t):r=0;break;case n.TCONTROL2:t>=0?B.timerControl(1,t):r=B.status();break;case n.T1MSB:t>=0?B.timerMSBw(0,t):r=B.timerMSBr(0);break;case n.T1LSB:t>=0?B.timerLSBw(0,t):r=B.timerLSBr(0);break;case n.T2MSB:t>=0?B.timerMSBw(1,t):r=B.timerMSBr(1);break;case n.T2LSB:t>=0?B.timerLSBw(1,t):r=B.timerLSBr(1);break;case n.T3MSB:t>=0?B.timerMSBw(2,t):r=B.timerMSBr(2);break;case n.T3LSB:t>=0?B.timerLSBw(2,t):r=B.timerLSBr(2);break;case n.DRUMSET:case n.DRUMCLEAR:break;default:console.log(`PASSPORT unknown IO`,(e&15).toString(16));break}return r},ac,oc,sc,cc,lc,uc,dc,fc=()=>{ac=!1,oc=!1,sc=!1,lc=255,dc=!1},pc=e=>{oc&&(uc+=e*12,uc>=10&&(oc=!1,lc=dc?_c(cc):255))},mc=e=>{switch(e){case 0:return sc&&ac&&!oc&&(cc=255,oc=!0,uc=0),lc;case 1:return!!oc<<7|!!sc<<2|!!ac}return 0},hc=(e,t)=>{switch(e){case 0:ac&&!oc&&(cc=t,oc=!0,uc=0);break;case 1:+!!ac!=(t&1)&&(ac=(t&1)!=0,ac&&gc(ac)),sc=!!(t&4);break}},gc=e=>{console.log(`*** SD card select: `+e)},_c=e=>255;var vc=class{constructor(){this.freq=0,this.volume=0,this.left=!1,this.right=!1,this.pw=0,this.waveform=0,this.noiseval=0,this.phase=0}};let yc=Array.from({length:16},()=>new vc),bc=new Uint16Array([0,4,8,12,16,17,18,20,21,22,23,25,26,28,30,31,33,35,37,40,42,45,47,50,53,56,60,63,67,71,75,80,85,90,95,101,107,113,120,127,135,143,151,160,170,180,191,202,214,227,241,255,270,286,303,321,341,361,382,405,429,455,482,511]),xc=()=>{for(let e=0;e<16;e++)yc[e]=new vc},Sc=(e,t)=>{e&=63;let n=Math.floor(e/4);switch(e&3){case 0:yc[n].freq=yc[n].freq&65280|t;break;case 1:yc[n].freq=yc[n].freq&255|t<<8;break;case 2:yc[n].right=(t&128)!=0,yc[n].left=(t&64)!=0,yc[n].volume=bc[t&63];break;case 3:yc[n].pw=t&63,yc[n].waveform=t>>6;break}},Cc=new Uint8Array(4096),wc=0,Tc=0,Ec=0,Dc=0,Oc=0,kc=!1,Ac=new Uint8Array([0,1,2,3,4,5,6,8,11,14,18,23,30,38,49,64]),jc=0,Mc=0,Nc=0,Pc=()=>{wc=0,Tc=0,Ec=0},Fc=()=>{Tc=0,Ec=wc},Ic=()=>{Pc(),Dc=0,Oc=0,jc=0,Mc=0,Nc=0},Lc=e=>{(e&192)==192?kc=!0:(kc=!1,e&128&&Pc()),e&64&&Fc(),Dc=e&63},Rc=()=>{let e=Dc;return Ec==4095&&(e|=128),Ec==0&&(e|=64),e},zc=e=>{Oc=e>128?256-e:e},Bc=()=>Oc,Vc=e=>{Ec<4095&&(Cc[wc++]=e,wc==4096&&(wc=0),Ec++)},Hc=()=>{let e=0;return Ec==0?0:(e=Cc[Tc++],Tc==4096&&(Tc=0),Ec--,e)},Uc=()=>Ec<1024,Wc=(e,t)=>{let n=0;for(;t--;){let t=Nc;if(Nc+=Oc,Nc&=255,(t&128)!=(Nc&128))if(Ec==0)jc=0,Mc=0;else{switch(Dc>>4&3){case 0:jc=Hc()<<8<<16>>16,Mc=jc;break;case 1:Ec<2?(Ec=0,Tc=wc):(jc=Hc()<<8<<16>>16,Mc=Hc()<<8<<16>>16);break;case 2:Ec<2?(Ec=0,Tc=wc):(jc=(Hc()|Hc()<<8)<<16>>16,Mc=jc);break;case 3:Ec<4?(Ec=0,Tc=wc):(jc=(Hc()|Hc()<<8)<<16>>16,Mc=(Hc()|Hc()<<8)<<16>>16);break}kc&&Ec==0&&Fc()}e[n++]=Math.trunc(jc*Ac[Dc&15]/64),e[n++]=Math.trunc(Mc*Ac[Dc&15]/64)}},Gc=.067,Kc=.05,qc=console.log,Jc=2**53-1,Yc=-(2**53-1),Xc=(e,t)=>e>t?e:t,Zc=1024,Qc=0,$c=0,el=new Int16Array(Zc*2),tl=()=>{let e=k.cycleCount-Qc;if(e<=0){Qc=k.cycleCount;return}let t=$c+e*48828.125/(1*1e6),n=Math.trunc(t);for($c=t-n,Qc=k.cycleCount;n>0;){let e=Math.min(n,Zc);Wc(el,e),n-=e}},V=new Uint8Array(131072),nl=new Uint8Array(256*2),rl=Array(128).fill(null).map(()=>new Uint8Array(8)),H=new Uint32Array(2),il=new Uint8Array(2),al=new Uint8Array(2),U=0,ol=0,sl=0,cl=0,ll=0,W=[,,].fill(null).map(()=>new Uint8Array(7)),G=new Uint8Array(256),ul=[,,].fill(null).map(()=>new Uint8Array(256)),dl=[,,].fill(null).map(()=>new Uint8Array(640)),fl=new Uint8Array(640),pl=new Uint8Array(640),ml=new Uint8Array(640),hl=0,gl=new Uint8Array(2),_l=new Uint8Array(2),vl=!1,yl=!1,bl,xl,Sl,K,q,Cl,wl,Tl,El,Dl,Ol,kl,Al,jl,Ml,Nl,Pl,Fl,Il,J,Ll,Rl,zl,Bl,Vl=new Uint8Array(2),Hl=new Uint8Array(2),Y=new Uint8Array(4),Ul,Wl=new Uint8Array([86,47,0,2]),Gl=new Uint8Array(640),Kl=new Uint8Array(64),ql=0,Jl=0,Yl=0,Xl=0,Zl=0,Ql=new Uint8ClampedArray(640*480*4),$l=new Uint16Array([0,4095,2048,2814,3148,197,10,3815,3461,1600,3959,819,1911,2806,143,3003,0,273,546,819,1092,1365,1638,1911,2184,2457,2730,3003,3276,3549,3822,4095,529,1075,1604,2150,2696,3225,4027,529,1058,1587,2116,2645,3174,3959,512,1041,1553,2082,2594,3123,3891,512,1024,1536,2048,2560,3072,3840,545,1091,1636,2182,2728,3273,4075,529,1074,1619,2164,2709,3254,4055,528,1073,1617,2146,2690,3235,4035,528,1072,1600,2144,2688,3216,4016,289,835,1380,1926,2472,3017,3579,289,834,1123,1668,2213,2502,3063,288,577,1121,1410,1698,2243,2547,288,576,864,1152,1440,1728,2032,289,835,1125,1670,2216,2506,3068,289,578,868,1157,1446,1736,2041,32,321,354,643,676,965,1014,32,65,97,130,162,195,243,290,836,1126,1672,2218,2508,3071,290,580,870,1160,1450,1740,2047,34,324,358,648,682,972,1023,34,68,102,136,170,204,255,274,820,1110,1640,2186,2476,3023,274,548,838,1112,1386,1676,1951,2,276,294,568,586,860,879,2,20,22,40,42,60,63,274,820,1350,1896,2442,2972,3519,274,804,1078,1608,2138,2412,2943,258,532,1046,1320,1578,2108,2367,258,516,774,1032,1290,1548,1807,530,1076,1606,2152,2698,3228,4030,529,1059,1589,2119,2649,3179,3965,513,1043,1557,2086,2600,3130,3900,513,1027,1540,2054,2568,3081,3851]),eu=()=>{console.log(`[VERA] video_reset`),H.fill(0),al.fill(0),U=0,ol=0,il.fill(0),sl=0,cl=0,ll=0,W.forEach(e=>e.fill(0)),G.fill(0),G[1]=128,G[2]=128,G[5]=160,G[7]=240,bl=0,K=32768,q=32768,xl=0,Sl=0,jl=!1,Al=!1,Dl=!1,Ol=!1,Rl=!1,kl=!1,Ml=!1,Ll=!1,Ul=0,Nl=!1,Pl=!1,Il=0,J=0,Fl=0,Y[0]=0,Y[1]=0,Y[2]=0,Y[3]=0,Bl=0,Vl[0]=0,Vl[1]=0,Hl[0]=0,Hl[1]=0,Cl=0,wl=0,Tl=0,El=2,zl=!1,rl.forEach(e=>e.fill(0));for(let e=0;e<256;e++)nl[e*2+0]=$l[e]&255,nl[e*2+1]=$l[e]>>8;du();for(let e=0;e<128*1024;e++)V[e]=Math.floor(Math.random()*256);hl=0,ql=0,Jl=0,Yl=0,Xl=0,xc(),Ic(),Qc=k.cycleCount,$c=0},tu=()=>(eu(),!0),nu=[,,].fill(null).map(()=>({})),ru=[,,].fill(null).map(()=>[,,].fill(null).map(()=>({}))),iu=(e,t)=>t+e.hscroll&e.layerw_max,au=(e,t)=>t+e.vscroll&e.layerh_max,ou=(e,t,n)=>e.map_base+((n>>e.tileh_log2<<e.mapw_log2)+(t>>e.tilew_log2)<<1),su=e=>{let t=nu[e],n=t.layerw_max,r=t.hscroll;t.color_depth=W[e][0]&3,t.map_base=W[e][1]<<9,t.tile_base=(W[e][2]&252)<<9,t.bitmap_mode=(W[e][0]&4)!=0,t.text_mode=t.color_depth==0&&!t.bitmap_mode,t.text_mode_256c=(W[e][0]&8)!=0,t.tile_mode=!t.bitmap_mode&&!t.text_mode,t.bitmap_mode?(t.hscroll=0,t.vscroll=0):(t.hscroll=W[e][3]|(W[e][4]&15)<<8,t.vscroll=W[e][5]|(W[e][6]&15)<<8);let i=0,a=0;if(t.tilew=0,t.tileh=0,t.tile_mode||t.text_mode?(t.mapw_log2=5+(W[e][0]>>4&3),t.maph_log2=5+(W[e][0]>>6&3),i=1<<t.mapw_log2,a=1<<t.maph_log2,t.tilew_log2=3+(W[e][2]&1),t.tileh_log2=3+(W[e][2]>>1&1),t.tilew=1<<t.tilew_log2,t.tileh=1<<t.tileh_log2):t.bitmap_mode&&(t.tilew=W[e][2]&1?640:320,t.tileh=480),t.mapw_max=i-1,t.maph_max=a-1,t.tilew_max=t.tilew-1,t.tileh_max=t.tileh-1,t.layerw_max=i*t.tilew-1,t.layerh_max=a*t.tileh-1,n!=t.layerw_max||r!=t.hscroll){let e=Jc,n=Yc;for(let r=0;r<640;++r){let i=iu(t,r);i<e&&(e=i),i>n&&(n=i)}t.min_eff_x=e,t.max_eff_x=n}t.bits_per_pixel=1<<t.color_depth,t.tile_size_log2=t.tilew_log2+t.tileh_log2+t.color_depth-3,t.first_color_pos=8-t.bits_per_pixel,t.color_mask=(1<<t.bits_per_pixel)-1,t.color_fields_max=(8>>t.color_depth)-1},cu=Array(128).fill(null).map(()=>({})),lu=e=>{let t=cu[e];t.sprite_zdepth=rl[e][6]>>2&3,t.sprite_collision_mask=rl[e][6]&240,t.sprite_x=rl[e][2]|(rl[e][3]&3)<<8,t.sprite_y=rl[e][4]|(rl[e][5]&3)<<8,t.sprite_width_log2=(rl[e][7]>>4&3)+3,t.sprite_height_log2=(rl[e][7]>>6)+3,t.sprite_width=1<<t.sprite_width_log2,t.sprite_height=1<<t.sprite_height_log2,t.sprite_x>=1024-t.sprite_width&&(t.sprite_x-=1024),t.sprite_y>=1024-t.sprite_height&&(t.sprite_y-=1024),t.hflip=rl[e][6]&1,t.vflip=rl[e][6]>>1&1,t.color_mode=rl[e][1]>>7&1,t.sprite_address=rl[e][0]<<5|(rl[e][1]&15)<<13,t.palette_offset=(rl[e][7]&15)<<4},uu={entries:new Uint32Array(256),dirty:!1},du=()=>{let e=G[0]&3,t=(G[0]&7)==6;for(let n=0;n<256;++n){let r=0,i=0,a=0;if(e==0)r=0,i=0,a=255;else{let e=nl[n*2]|nl[n*2+1]<<8;r=(e>>8&15)<<4|e>>8&15,i=(e>>4&15)<<4|e>>4&15,a=(e&15)<<4|e&15,t&&(r=i=a=(r+a+i)/3)}uu.entries[n]=Number(r<<16)|Number(i)<<8|Number(a)}uu.dirty=!1},fu=(e,t,n)=>{let r=0,i=t;for(;n>=2;){let t=V[i++];e[r++]=t>>4,e[r++]=t&15,n-=2}},pu=e=>{Vu(fl,0,640),Vu(pl,0,640),Vu(ml,0,640);let t=801;for(let n=0;n<128&&(t--,t!=0);n++){let r=cu[n];if(r.sprite_zdepth==0||e<r.sprite_y||e>=r.sprite_y+r.sprite_height)continue;let i=r.vflip?r.sprite_height-1-(e-r.sprite_y):e-r.sprite_y,a=r.hflip?r.sprite_width-1:0,o=r.hflip?-1:1,s=r.sprite_address+(i<<r.sprite_width_log2-(1-r.color_mode)),c=r.sprite_width<64?r.sprite_width:64,l=(2-r.color_mode<<2)-1;if(r.color_mode==0)fu(Kl,s,c);else for(let e=0;e<c;e++)Kl[e]=V[s+e];for(let e=0;e<r.sprite_width;++e){let n=r.sprite_x+e;if(n>=640){a+=o;continue}if(!(e&l)&&(t--,t==0)||(t--,t==0))break;let i=Kl[a];a+=o,i>0&&(hl|=ml[n]&r.sprite_collision_mask,ml[n]|=r.sprite_collision_mask,r.sprite_zdepth>pl[n]&&(i<16&&(i+=r.palette_offset),fl[n]=i,pl[n]=r.sprite_zdepth))}}},mu=(e,t)=>{let n=ru[1][e],r=ru[0][e],i=(8>>n.color_depth)-1,a=au(r,t),o=(a&n.tileh_max)<<n.tilew_log2>>3,s=ou(n,n.min_eff_x,a),c=ou(n,n.max_eff_x,a)-s+2,l=new Uint8Array(512);ju(l,s,c);let u=0,d=0,f=0,p=0,ee=0;{let e=iu(n,0),t=e&n.tilew_max,r=ou(n,e,a)-s,c=l[r],te=l[r+1];n.text_mode_256c?(d=te,f=0):(d=te&15,f=te>>4),u=c<<n.tile_size_log2;let ne=t>>3,re=u+o+ne;p=Au(n.tile_base+re),ee=i-(t&7)}for(let t=0;t<640;t++){let r=iu(n,t),c=r&n.tilew_max;if(!(r&7)){if((r&n.tilew_max)==0){let e=ou(n,r,a)-s,t=l[e],i=l[e+1];n.text_mode_256c?(d=i,f=0):(d=i&15,f=i>>4),u=t<<n.tile_size_log2}let e=c>>3,t=u+o+e;p=Au(n.tile_base+t),ee=i}let te=p>>ee&1;--ee,dl[e][t]=te?d:f}},hu=(e,t)=>{let n=ru[1][e],r=ru[0][e],i=(8>>n.color_depth)-1,a=au(r,t),o=a&n.tileh_max,s=o^n.tileh_max,c=o<<(n.tilew_log2+n.color_depth-3&31),l=s<<(n.tilew_log2+n.color_depth-3&31),u=ou(n,n.min_eff_x,a),d=ou(n,n.max_eff_x,a)-u+2,f=new Uint8Array(512);ju(f,u,d);let p=0,ee=!1,te=!1,ne=0,re=0,ie=0,ae=0;{let e=iu(n,0),t=ou(n,e,a)-u,r=f[t],i=f[t+1];ee=i>>3&1,te=i>>2&1,p=i&240,ne=(r|(i&3)<<8)<<n.tile_size_log2,ae=te?n.bits_per_pixel:-n.bits_per_pixel;let o=e&n.tilew_max;te?(o^=n.tilew_max,ie=0):ie=n.first_color_pos;let s=o<<n.color_depth>>3,d=ne+(ee?l:c)+s;re=Au(n.tile_base+d)}for(let t=0;t<640;t++){let r=iu(n,t);if((r&i)==0){if((r&n.tilew_max)==0){let e=ou(n,r,a)-u,t=f[e],i=f[e+1];ee=i>>3&1,te=i>>2&1,p=i&240,ne=(t|(i&3)<<8)<<n.tile_size_log2,ae=te?n.bits_per_pixel:-n.bits_per_pixel}let e=r&n.tilew_max;te?(e^=n.tilew_max,ie=0):ie=n.first_color_pos;let t=e<<n.color_depth>>3,i=ne+(ee?l:c)+t;re=Au(n.tile_base+i)}let o=re>>ie&n.color_mask;ie+=ae,o>0&&o<16&&(o+=p,n.text_mode_256c&&(o|=128)),dl[e][t]=o}},gu=(e,t)=>{let n=ru[1][e],r=t%n.tileh*n.tilew*n.bits_per_pixel>>3;for(let t=0;t<640;t++){let i=t%n.tilew,a=W[e][4]&15,o=r+(i*n.bits_per_pixel>>3),s=Au(n.tile_base+o)>>n.first_color_pos-((i&n.color_fields_max)<<n.color_depth)&n.color_mask;s>0&&s<16&&(s+=a<<4,n.text_mode_256c&&(s|=128)),dl[e][t]=s}},_u=(e,t,n,r)=>{let i=0;switch(e){case 3:i=t||r||n;break;case 2:i=r||t||n;break;case 1:i=r||n||t;break;case 0:i=r||n;break}return i},vu=-1,yu=0,bu=0,xu=0,Su=(e,t)=>{let n=G[0],r=G[6]<<1,i=G[7]<<1;if(e!=vu&&(vu=e,yu=0,Hu(ul[1],ul[0],1*256),Hu(ul[0],G,1*256),Hu(ru[1],ru[0],2),Hu(ru[0],nu,2),(n&3)>1?e>>1?(e&65534)>=r&&(e&65534)<i&&(bu+=ul[1][2]<<10):bu=e*(ul[1][2]<<9):e==0?bu=0:e>=r&&e<i&&(bu+=ul[1][2]<<9)),n&8&&(n&3)>1&&(e&=65534),uu.dirty&&du(),e>=480)return;let a=Math.round(t);a>640&&(a=640),yu==0&&(xu=0);let o=G[0]&3,s=G[3],c=G[4]<<2,l=G[5]<<2,u=bu>>16;u>=480&&(u=480-(e&1)),gl[0]=n&16?1:0,gl[1]=n&32?1:0,yl=!!(n&64);for(let e=0;e<2;e++){if(!gl[e]&&_l[e])for(let t=yu;t<640;t++)dl[e][t]=0;yu==0&&(_l[e]=gl[e])}if(!yl&&vl)for(let e=yu;e<640;e++)fl[e]=0,pl[e]=0,ml[e]=0;if(yu==0&&(vl=yl),yl&&pu(u),gl[0]&&(ru[1][0].text_mode?mu(0,u):ru[1][0].bitmap_mode?gu(0,u):hu(0,u)),gl[1]&&(ru[1][1].text_mode?mu(1,u):ru[1][1].bitmap_mode?gu(1,u):hu(1,u)),o!=0)if(e<r||e>=i){let e=s;e|=e<<8,e|=e<<16,Vu(Gl,e,640)}else{c=c<640?c:640,l=l<640?l:640;for(let e=yu;e<c&&e<a;++e)Gl[e]=s;let e=G[1];for(let t=Xc(c,yu);t<l&&t<a;++t){let n=xu>>16;Gl[t]=n<640?_u(pl[n],fl[n],dl[0][n],dl[1][n]):0,xu+=e<<9}for(let e=l;e<a;++e)Gl[e]=s}{let t=(e*640+yu)*4;for(let e=yu;e<a;e++){let n=uu.entries[Gl[e]];Ql[t++]=n>>16&255,Ql[t++]=n>>8&255,Ql[t++]=n&255,Ql[t++]=255}}if(o==2){let t=(e*640+yu)*4;for(let n=yu;n<a;n++)(n<640*Gc||n>640*(1-Gc)||e<480*Kc||e>480*(1-Kc))&&(Ql[t]>>=2,Ql[t+1]>>=2,Ql[t+2]>>=2),t+=4}yu=a},Cu=(e,t)=>{e==480&&(hl!=0&&(cl|=4),cl=cl&15|hl,hl=0,cl|=1),e==t&&(cl|=2)},wu=(e,t,n)=>{let r=0,i=G[0]&2,a=!1;return ql+=25*t/e,ql>800?(ql-=800,i||Su(Jl-0,800),Jl++,Jl==525&&(Jl=0,i||(a=!0,Zl++)),i||Cu(Jl-0,ll)):n&&(i||Su(Jl-0,ql)),Yl+=25*t/e,Yl>794?(Yl-=794,i&&(Xl<525?(r=Xl-42,r&1||Su(r,794)):(r=Xl-568,r&1||Su(r|1,794))),Xl++,Xl==525&&(G[0]|=128,i&&(a=!0,Zl++)),Xl==525*2&&(G[0]&=-129,Xl=0,i&&(a=!0,Zl++)),i&&Cu(Xl<525?Xl-42:Xl-568,ll&-2)):n&&i&&(Xl<525?(r=Xl-42,r&1||Su(r,Yl)):(r=Xl-568,r&1||Su(r|1,Yl))),a},Tu=()=>(tl(),((cl|(Uc()?8:0))&sl)!=0),Eu=()=>(bp(Ql,G[0]),!0),Du=new Int16Array([0,0,1,-1,2,-2,4,-4,8,-8,16,-16,32,-32,64,-64,128,-128,256,-256,512,-512,40,-40,80,-80,160,-160,320,-320,640,-640]),Ou=(e,t)=>{let n=H[e],r=Du[al[e]];return Dl&&Hl[e]&&!r&&(Vl[e]?(al[e]&1||(H[e]+=1),Vl[e]=0):(al[e]&1&&--H[e],Vl[e]=1)),e==1&&Ol&&(r==4?r=Bl==(n&3)?1:3:r==320&&(r=Bl==(n&3)?1:319)),H[e]+=r,e==1&&bl==1?(K+=xl,K&65536&&(K&=-65537,Dl&&Hl[0]&&(Vl[1]?(al[0]&1||(H[1]+=1),Vl[1]=0):(al[0]&1&&--H[1],Vl[1]=1)),H[1]+=Du[al[0]])):bl==2&&t==0?(K+=xl,q+=Sl,Cl=(Number(q)>>16)-(Number(K)>>16),e==0&&kl&&!Al&&(J=J+1&3),e==1&&(Dl?(H[1]=H[0]+(K>>17),Vl[1]=K>>16&1):H[1]=H[0]+(K>>16))):e==1&&bl==3&&t==0&&(K+=xl,q+=Sl),n},ku=()=>{if(bl!=3)return;let e=0,t=K>>19&255,n=q>>19&255,r=K>>16&7,i=q>>16&7;if(zl||(t&=El-1,n&=El-1),t>=El||n>=El)e=wl+(i<<3-Dl)+(r>>Number(Dl)),Vl[1]=(r&1)>>1-Dl;else{e=Tl+n*El+t;let a=Au(e);e=wl+(a<<6-Dl),e+=(i<<3-Dl)+(r>>Number(Dl)),Vl[1]=(r&1)>>1-Dl}H[1]=e,il[1]=Au(e)},Au=e=>V[e&131071],ju=(e,t,n)=>{if(t>=0&&t+n<=131072)for(let r=0;r<n;r++)e[r]=V[t+r];else for(let r=0;r<n;++r)e[r]=Au(t+r)},Mu=(e,t)=>{let n=e&63;tl(),Sc(n,t),xp({cycle:k.cycleCount,reg:n,value:t})},Nu=(e,t)=>{Sp({cycle:k.cycleCount,reg:e,value:t})},Pu=(e,t,n)=>{Dl?t?(!Ml||(n&15)>0)&&(V[e&131071]=V[e&131071]&240|n&15):(!Ml||(n&240)>0)&&(V[e&131071]=V[e&131071]&15|n&240):(!Ml||n>0)&&(V[e&131071]=n),e>=129472&&e<129536?Mu(e,n):e>=129536&&e<130048?(nl[e&511]=n,uu.dirty=!0):e>=130048&&e<131072&&(rl[e>>3&127][e&7]=n,lu(e>>3&127))},Fu=(e,t,n)=>{if(!Ml||t>0)switch(n){case 0:V[e&131071]=t;break;case 1:V[e&131071]=V[e&131071]&15|t&240;break;case 2:V[e&131071]=V[e&131071]&240|t&15;break;case 3:break}},Iu=e=>{switch(e&31){case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:case 8:case 9:case 10:case 12:case 13:case 14:case 15:return G[e];case 11:return G[e]&63;case 16:return K>>16&255;case 17:return K>>24&7|K&128;case 18:return q>>16&255;case 19:return q>>24&7|q&128;case 20:return K>>8&255;case 21:return q>>8&255;case 22:return Cl>=768?Nl&&bl==2?0:128:Dl?Nl&&bl==2?(q&32768)>>8|K>>11&96|K>>14&16|(Cl&7)<<1|(K&32768)>>15:!!(Cl&65528)<<7|K>>11&96|K>>14&16|(Cl&7)<<1:!!(Cl&65520)<<7|K>>11&96|(Cl&15)<<1;case 23:return(Cl&1016)>>2;case 24:return Y[0];case 25:return Y[1];case 26:return Y[2];case 27:return Y[3];default:break}return Wl[e%4]},Lu=e=>{let t=!1;switch(ol){case 5:switch(e){case 11:case 12:t=!0;break}break;case 63:switch(e){case 9:case 10:case 11:case 12:t=!0;break}break}t&&qc(`Warning: %04X wrote to read-only VERA register at 9F%02X (DCSEL=%d)
`,0,e+32,ol)},Ru=e=>{let t=!1;switch(ol){case 2:switch(e){case 10:case 11:case 12:t=!0;break}break;case 3:case 4:switch(e){case 9:case 10:case 11:case 12:t=!0;break}break;case 5:switch(e){case 9:case 10:t=!0;break}break;case 6:switch(e){case 11:case 12:t=!0;break}break}t&&qc(`Warning: %04X read from write-only VERA register at 9F%02X (DCSEL=%d)
`,0,e+32,ol)},zu=(e,t)=>{let n=G[0]&2?Xl%525:Jl;switch(n>=512&&(n=511),Ru(e),e&31){case 0:return H[U]&255;case 1:return H[U]>>8&255;case 2:return H[U]>>16|Vl[U]<<1|Hl[U]<<2|al[U]<<3;case 3:case 4:{if(t)return il[e-3];let n=!!Vl[e-3];Ou(e-3,!1);let r=il[e-3];if(e==4&&bl==3?ku():il[e-3]=Au(H[e-3]),Al)if(Dl){let e=n?(r&15)<<4:r&240;Il?(Y[J]=Y[J]&240|e>>4,Il=0,J=J+1&3):(Y[J]=Y[J]&15|e,Il=1)}else Y[J]=r,J=Fl?J&2|J+1&1:J+1&3;return r}case 5:return ol<<1|U;case 6:return(ll&256)>>1|(n&256)>>2|sl&15;case 7:return tl(),cl|(Uc()?8:0);case 8:return n&255;case 9:case 10:case 11:case 12:{let n=e-9+(ol<<2);if(t)return Iu(n);switch(n){case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:case 8:case 22:case 23:return Iu(n);case 24:Ul=0;break;case 25:{let e=((Y[1]<<8|Y[0])<<16>>16)*((Y[3]<<8|Y[2])<<16>>16);Rl?Ul-=e:Ul+=e;break}default:break}return Wl[n%4]}case 13:case 14:case 15:case 16:case 17:case 18:case 19:return W[0][e-13];case 20:case 21:case 22:case 23:case 24:case 25:case 26:return W[1][e-20];case 27:return tl(),Rc();case 28:return Bc();case 29:return 0;case 30:case 31:return mc(e&1)}return 0},Bu=(e,t)=>{switch(Lu(e),e&31){case 0:Nl&&Dl&&bl==2&&U==1?(Pl=!0,H[1]=H[1]&131068|t&3):(H[U]=H[U]&130816|t,Ol&&U==1&&(Bl=t&3)),il[U]=Au(H[U]);break;case 1:H[U]=H[U]&65791|t<<8,il[U]=Au(H[U]);break;case 2:H[U]=H[U]&65535|(t&1)<<16,Vl[U]=t>>1&1,Hl[U]=t>>2&1,al[U]=t>>3,il[U]=Au(H[U]);break;case 3:case 4:{if(Pl&&bl){switch(Pl=!1,t>>6){case 0:V[H[1]&131071]=Y[J]&192|il[1]&63;break;case 1:V[H[1]&131071]=Y[J]&48|il[1]&207;break;case 2:V[H[1]&131071]=Y[J]&12|il[1]&243;break;case 3:V[H[1]&131071]=Y[J]&3|il[1]&252;break}break}let n=!!Vl[e-3],r=Ou(e-3,!0),i=0,a=new Uint8Array(4),o=new Uint8Array(4),s=new Uint8Array(4);if(Ll){let e=((Y[1]<<8|Y[0])<<16>>16)*((Y[3]<<8|Y[2])<<16>>16);e=Rl?Ul-e:Ul+e,s[0]=e&255,s[1]=e>>8&255,s[2]=e>>16&255,s[3]=e>>24&255}else Hu(s,Y,Y.length);i=kl?Y[J]:t,jl&&!kl?(a[0]=s[0],a[1]=s[1],a[2]=s[2],a[3]=s[3]):(a[0]=i,a[1]=i,a[2]=i,a[3]=i),jl?(r&=131068,Ml?Dl?(o[0]=((a[0]&240)==0)<<1|(a[0]&15)==0,o[1]=((a[1]&240)==0)<<1|(a[1]&15)==0,o[2]=((a[2]&240)==0)<<1|(a[2]&15)==0,o[3]=((a[3]&240)==0)<<1|(a[3]&15)==0):(o[0]=a[0]==0?3:0,o[1]=a[1]==0?3:0,o[2]=a[2]==0?3:0,o[3]=a[3]==0?3:0):(o[0]=t&3,o[1]=t>>2&3,o[2]=t>>4&3,o[3]=t>>6&3),Fu(r+0,a[0],o[0]),Fu(r+1,a[1],o[1]),Fu(r+2,a[2],o[2]),Fu(r+3,a[3],o[3])):Pu(r,n,i),il[e-3]=Au(H[e-3]);break}case 5:t&128&&eu(),ol=t>>1&63,U=t&1;break;case 6:ll=ll&255|t>>7<<8,sl=t&15;break;case 7:cl&=t^255;break;case 8:ll=ll&256|t;break;case 9:case 10:case 11:case 12:{wu(1,0,!0);let n=e-9+(ol<<2);switch(n==0?((!(G[0]&8)&&t&8||(G[0]&3)==1&&(t&3)>1&&t&8)&&Vu(Ql,0,640*480*4),G[0]=G[0]&-128|t&127,uu.dirty=!0):G[n]=t,n){case 8:bl=t&3,Dl=(t&4)>>2,Ol=(t&8)>>3,kl=(t&16)>>4,Al=(t&32)>>5,jl=(t&64)>>6,Ml=(t&128)>>7;break;case 9:wl=(t&252)<<9,zl=(t&2)>>1,Nl=t&1;break;case 10:Tl=(t&252)<<9,El=2<<((t&3)<<1);break;case 11:if(Fl=t&1,Il=(t&2)>>1,J=(t&12)>>2,Ll=(t&16)>>4,Rl=(t&32)>>5,t&64){let e=((Y[1]<<8|Y[0])<<16>>16)*((Y[3]<<8|Y[2])<<16>>16);Rl?Ul-=e:Ul+=e}t&128&&(Ul=0);break;case 12:xl=(((G[13]&127)<<15)+(G[12]<<7)|(G[13]&64?4290772992:0))<<5*!!(G[13]&128);break;case 13:xl=(((G[13]&127)<<15)+(G[12]<<7)|(G[13]&64?4290772992:0))<<5*!!(G[13]&128),(bl==1||bl==2)&&(K=K&134152192|32768);break;case 14:Sl=(((G[15]&127)<<15)+(G[14]<<7)|(G[15]&64?4290772992:0))<<5*!!(G[15]&128);break;case 15:Sl=(((G[15]&127)<<15)+(G[14]<<7)|(G[15]&64?4290772992:0))<<5*!!(G[15]&128),(bl==1||bl==2)&&(q=q&134152192|32768);break;case 16:K=K&117505920|t<<16,ku();break;case 17:K=K&16776960|(t&7)<<24|t&128,ku();break;case 18:q=q&117505920|t<<16,ku();break;case 19:q=q&16776960|(t&7)<<24|t&128,ku();break;case 20:K=K&134152320|t<<8;break;case 21:q=q&134152320|t<<8;break;case 24:Y[0]=t;break;case 25:Y[1]=t;break;case 26:Y[2]=t;break;case 27:Y[3]=t;break}break}case 13:case 14:case 15:case 16:case 17:case 18:case 19:wu(1,0,!0),W[0][e-13]=t,su(0);break;case 20:case 21:case 22:case 23:case 24:case 25:case 26:wu(1,0,!0),W[1][e-20]=t,su(1);break;case 27:tl(),Lc(t),Nu(`ctrl`,t);break;case 28:tl(),zc(t),Nu(`rate`,t);break;case 29:tl(),Vc(t),Nu(`fifo`,t);break;case 30:case 31:hc(e&1,t);break}},Vu=(e,t,n)=>{e.fill(t,0,n)},Hu=(e,t,n)=>{if(ArrayBuffer.isView(e)&&ArrayBuffer.isView(t)){let r=e,i=t;r.set(i.subarray(0,n),0);return}let r=e;for(let e=0;e<n;e++){let n=t[e],i=r[e];ArrayBuffer.isView(i)&&ArrayBuffer.isView(n)?i.set(n):typeof n==`object`&&n?(i||(r[e]=Array.isArray(n)?[]:{}),Object.assign(r[e],n)):r[e]=n}},Uu=5,Wu=!1,Gu=e=>{e!=Wu&&(Wu=e,Jn(Uu,e))},Ku=()=>{let e=tu();return e||console.log(`video_init fails`),fc(),e},qu=()=>{eu()},Ju=(e=!0,t=3)=>{e&&Ku()&&(Uu=t,Rr(Uu,Zu),$n(Xu,Uu))},Yu=0,Xu=e=>{if(Yu){let e=k.cycleCount-Yu,t=wu(1,e,!1);pc(e),t&&Eu(),Gu(Tu())}Yu=k.cycleCount},Zu=(e,t=-1)=>e>=49408?t>=0?(Bu(e&255,t),0):zu(e&255,!1):0,Qu=(e=!0,t=4)=>{e&&(Rr(t,Id),$n(Dd,t))},$u=[0,128],ed=[1,129],td=[2,130],nd=[3,131],rd=[4,132],id=[5,133],ad=[6,134],od=[7,135],sd=[8,136],cd=[9,137],ld=[10,138],ud=[11,139],dd=[12,140],fd=[13,141],pd=[14,142],md=[16,145],hd=[17,145],gd=[18,146],_d=[32,160],vd=(e=4)=>{for(let t=0;t<=255;t++)T(e,t,0);for(let t=0;t<=1;t++)jd(e,t)},yd=(e,t)=>(w(e,pd[t])&64)!=0,bd=(e,t)=>(w(e,gd[t])&64)!=0,xd=(e,t)=>(w(e,ud[t])&64)!=0,Sd=(e,t,n)=>{let r=w(e,rd[t])-n;if(T(e,rd[t],r),r<0){r=r%256+256,T(e,rd[t],r);let n=w(e,id[t]);if(n--,T(e,id[t],n),n<0&&(n+=256,T(e,id[t],n),yd(e,t)&&(!bd(e,t)||xd(e,t)))){let n=w(e,gd[t]);T(e,gd[t],n|64);let r=w(e,fd[t]);if(T(e,fd[t],r|64),Nd(e,t,-1),xd(e,t)){let n=w(e,od[t]),r=w(e,ad[t]);T(e,rd[t],r),T(e,id[t],n)}}}},Cd=(e,t)=>(w(e,pd[t])&32)!=0,wd=(e,t)=>(w(e,gd[t])&32)!=0,Td=(e,t,n)=>{if(w(e,ud[t])&32)return;let r=w(e,sd[t])-n;if(T(e,sd[t],r),r<0){r=r%256+256,T(e,sd[t],r);let n=w(e,cd[t]);if(n--,T(e,cd[t],n),n<0&&(n+=256,T(e,cd[t],n),Cd(e,t)&&!wd(e,t))){let n=w(e,gd[t]);T(e,gd[t],n|32);let r=w(e,fd[t]);T(e,fd[t],r|32),Nd(e,t,-1)}}},Ed=Array(8).fill(0),Dd=e=>{let t=k.cycleCount-Ed[e];for(let n=0;n<=1;n++)Sd(e,n,t),Td(e,n,t);Ed[e]=k.cycleCount},Od=(e,t)=>{let n=[];for(let r=0;r<=15;r++)n[r]=w(e,_d[t]+r);return n},kd=(e,t)=>e.length===t.length&&e.every((e,n)=>e===t[n]),Ad={slot:-1,chip:-1,params:[-1]},jd=(e,t)=>{let n=Od(e,t);e===Ad.slot&&t===Ad.chip&&kd(n,Ad.params)||(Ad.slot=e,Ad.chip=t,Ad.params=n,Np({slot:e,chip:t,params:n}))},Md=(e,t)=>{switch(w(e,$u[t])&7){case 0:for(let n=0;n<=15;n++)T(e,_d[t]+n,0);jd(e,t);break;case 7:T(e,hd[t],w(e,ed[t]));break;case 6:{let n=w(e,hd[t]),r=w(e,ed[t]);n>=0&&n<=15&&(T(e,_d[t]+n,r),jd(e,t));break}case 4:break;default:break}},Nd=(e,t,n)=>{let r=w(e,fd[t]);n>=0&&(r&=127-(n&127),T(e,fd[t],r));let i=w(e,pd[t]),a=(r&i&127)!=0;switch(t){case 0:Jn(e,a);break;case 1:Yn(a);break}},Pd=(e,t,n)=>{let r=w(e,pd[t]);n>=0&&(n&=255,n&128?r|=n:r&=255-n),r|=128,T(e,pd[t],r),Nd(e,t,-1)},Fd=1e3,Id=(e,t=-1)=>{if(e<49408)return-1;let n=(e&3840)>>8,r=e&255;Fd<500&&(Fd++,Ur(n,e,w(n,r),t));let i=r&128?1:0;switch(r){case $u[i]:t>=0&&(T(n,$u[i],t),Md(n,i));break;case ed[i]:case td[i]:case nd[i]:case ld[i]:case ud[i]:case dd[i]:T(n,r,t);break;case rd[i]:t>=0&&T(n,ad[i],t),Nd(n,i,64);break;case id[i]:if(t>=0){T(n,od[i],t),T(n,rd[i],w(n,ad[i])),T(n,id[i],t);let e=w(n,gd[i]);T(n,gd[i],e&-65),Nd(n,i,64)}break;case ad[i]:t>=0&&(T(n,r,t),Nd(n,i,64));break;case od[i]:t>=0&&T(n,r,t);break;case sd[i]:t>=0&&T(n,md[i],t),Nd(n,i,32);break;case cd[i]:if(t>=0){T(n,cd[i],t),T(n,sd[i],w(n,md[i]));let e=w(n,gd[i]);T(n,gd[i],e&-33),Nd(n,i,32)}break;case fd[i]:t>=0&&Nd(n,i,t);break;case pd[i]:Pd(n,i,t);break;default:break}return-1},Ld=0,Rd=`
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${u(192)}   ; jump address
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
`,zd=()=>{let e=new Uint8Array(256).fill(0),t=$o(0,Rd.split(`
`));e.set(t,0);let n=$o(0,`
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
`.split(`
`));return e.set(n,192),e[254]=23,e[255]=192,e},Bd=new Uint8Array,Vd=(e=!0)=>{Bd.length===0&&(Bd=zd()),Bd[1]=e?32:0,Br(7,Bd,51136,Kd),Br(7,Bd,51139,Gd)},Hd=(e,t)=>{if(e===0)D(t,2);else if(e<=2){D(t,240);let[,,n]=vo(e),r=n/512;D(t+1,r&255),D(t+2,r>>>8),D(t+3,0),di(4),fi(0)}else ui(40),di(0),fi(0),A()},Ud=(e,t)=>{let[,,n]=vo(e),r=n/512,i=r>1600?2:1,a=i==2?32:64;D(t,240),D(t+1,r&255),D(t+2,r>>>8),D(t+3,0);let o=`Apple2TS SP`;D(t+4,11);let s=0;for(;s<11;s++)D(t+5+s,o.charCodeAt(s));for(;s<16;s++)D(t+5+s,o.charCodeAt(8));D(t+21,i),D(t+22,a),D(t+23,1),D(t+24,0),di(25),fi(0)},Wd=(e,t,n)=>{if(E(e)!==3){console.error(`Incorrect SmartPort parameter count at address ${e}`),ui(4),A();return}let r=E(e+4);switch(r){case 0:Hd(t,n);break;case 1:case 2:ui(33),A();break;case 3:case 4:Ud(t,n);break;default:console.error(`SmartPort statusCode ${r} not implemented`);break}},Gd=()=>{ui(0),A(!1);let e=256+k.StackPtr,t=E(e+1)+256*E(e+2),n=E(t+1),r=E(t+2)+256*E(t+3),i=E(r+1),a=E(r+2)+256*E(r+3);switch(n){case 0:Wd(r,i,a);return;case 1:{if(E(r)!==3){console.error(`Incorrect SmartPort parameter count at address ${r}`),A();return}let e=512*(E(r+4)+256*E(r+5)+65536*E(r+6)),[t,n]=vo(i);ai(a,t.slice(e+n,e+512+n));break}default:console.error(`SmartPort command ${n} not implemented`),A();return}let o=_o(i);o.motorRunning=!0,Ld||=setTimeout(()=>{Ld=0,o&&(o.motorRunning=!1),bo()},500),bo()},Kd=()=>{ui(0),A(!1);let e=E(66),t=Math.max(Math.min(E(67)>>6,2),0),n=_o(t);if(!n.hardDrive)return;let[r,i,a]=vo(t),o=E(70)+256*E(71),s=512*o,c=E(68)+256*E(69);switch(n.status=` ${u(o,4)}`,e){case 0:{if(n.filename.length===0||a===0){di(0),fi(0),A();return}let e=a/512;di(e&255),fi(e>>>8);break}case 1:if(s+512>a){A();return}ai(c,r.slice(s+i,s+512+i));break;case 2:{if(s+512>a){A();return}if(n.isWriteProtected){A();return}let e=ii(c);r.set(e,s+i),n.diskHasChanges=!0,n.lastAppleWriteTime=Date.now();break}case 3:console.error(`Hard drive format not implemented yet`),A();return;default:console.error(`unknown hard drive command`),A();return}A(!1),n.motorRunning=!0,Ld||=setTimeout(()=>{Ld=0,n&&(n.motorRunning=!1),bo()},500),bo()},qd={numLines:Fn.numLines,collapseLoops:Fn.collapseLoops,ignoreRegisters:Fn.ignoreRegisters},Jd=e=>{qd.numLines=e.numLines,qd.collapseLoops=e.collapseLoops,qd.ignoreRegisters=e.ignoreRegisters},X=[],Yd=()=>{if(X.length<50)return;let e=qd.ignoreRegisters?24:99,t=X[X.length-1].slice(10,e),n=X.length-2,r=Math.max(X.length-20,0),i=-1;for(;n>=r;){if(X[n].slice(10,e)===t){i=n;break}n--}let a=X.length-i-1;if(i===-1||X.length-2*a<0)return;for(let t=i-1;t>=i-a+1;t--)if(X[t].slice(10,e)!==X[t+a].slice(10,e))return;let o=X[i-a].indexOf(`repeated`),s=`******** ${a===1?`1 line repeated`:`${a} lines repeated`}`;if(qd.ignoreRegisters)for(let t=i-a+1;t<i;t++){let n=X[t],r=X[t+a];X[t+a]=r.slice(0,e)+r.slice(e).split(``).map((t,r)=>t===n[e+r]?t:`*`).join(``)}if(i>=a&&o>0){X.splice(i-a+1,a);let e=parseInt(X[i-a].slice(o+9))+1;X[i-a]=`${s} ${e} times`}else X[i]=`${s} 1 time`,X.splice(i-a+1,a-1);for(let e=i-a+1;e<X.length;e++)X[e].startsWith(`    `)?X[e]=`      ..`+X[e].slice(8):X[e].startsWith(`  `)?X[e]=`    ....`+X[e].slice(8):X[e].startsWith(`..`)?X[e]=`  ......`+X[e].slice(8):X[e]=`........`+X[e].slice(8)},Xd=e=>{X.length>qd.numLines&&(X=X.slice(X.length-qd.numLines)),X.push(e),qd.collapseLoops&&Yd()},Zd=()=>{X=[]},Qd=()=>X,$d=0,Z=[],ef=()=>$d,tf=()=>{let e=JSON.parse(JSON.stringify(k)),r=0,i=Array(256+256*(mr+1)).fill(0);for(let e=0;e<256;e++){let t=e*256;S.subarray(t,t+256).some(e=>e!==255)&&(i[e]=1,r++)}for(let e=0;e<256*(mr+1);e++){let t=n+e*256;S.subarray(t,t+256).some(e=>e!==255)&&(i[256+e]=1,r++)}let a=new Uint8Array(r*256);r=0;let o=0;i.forEach((e,t)=>{if(e){let e=(t<256?0:n-65536)+t*256,i=S.subarray(e,e+256);a.set(i,256*r),r++,o=t}});let s=S.subarray(t,65792);return{s6502:e,extraRamSize:64*(mr+1),machineName:Ff(),softSwitches:Pf(),stackDump:Si(),memvalid:i.slice(0,o+1).join(``),memC000:Dn.Buffer.from(s).toString(`base64`),memory:Dn.Buffer.from(a).toString(`base64`)}},nf=(e,r)=>{let i=JSON.parse(JSON.stringify(e.s6502));Vr(),Yf(e.machineName||`APPLE2EE`,!1),Bf(),mi(i);let a=e.softSwitches;for(let e in a){let t=e;try{y[t].isSet=a[e]}catch{}}`WRITEBSR1`in a&&(y.BSR_PREWRITE.isSet=!1,y.BSR_WRITE.isSet=a.WRITEBSR1||a.WRITEBSR2||a.RDWRBSR1||a.RDWRBSR2);let o=Dn.Buffer.from(e.memory,`base64`);if(r<1){S.set(o.slice(0,65536)),S.set(o.slice(131072,163584),65536),S.set(o.slice(65536,131072),n);let e=(o.length-163584)/1024;e>0&&(Tr(e+64),S.set(o.slice(163584),163584))}else if(r<2)Tr(e.extraRamSize),S.set(o);else{let r=0;(typeof e.memvalid==`string`?e.memvalid.split(``).map(e=>+(e===`1`)):e.memvalid).forEach((e,t)=>{if(e){let e=o.subarray(r*256,r*256+256);t<256?S.set(e,t*256):S.set(e,n+(t-256)*256),r++}}),S.set(Dn.Buffer.from(e.memC000,`base64`),t)}e.stackDump&&Ci(e.stackDump),Nr(),Ut(!0)},rf=e=>({emulator:null,state6502:tf(),driveState:xo(e),thumbnail:``,snapshots:null}),af=()=>{let e=rf(!0);return e.snapshots=Z,e},of=(e,t=!1)=>{Uf();let n=e.emulator?.version?e.emulator.version:.9;nf(e.state6502,n),So(e.driveState),t&&(Z.length=0,$d=0),e.snapshots&&(Z.length=0,Z.push(...e.snapshots),$d=Z.length),hp()},sf=()=>{let e=$d-1;return e<0||!Z[e]?-1:e},cf=()=>{let e=$d+1;return e>=Z.length||!Z[e]?-1:e},lf=()=>{Z.length===30&&Z.shift(),Z.push(rf(!1)),$d=Z.length,Ip(Z[Z.length-1].state6502.s6502.PC)},uf=()=>{let e=sf();e<0||(ap(r.PAUSED),setTimeout(()=>{$d===Z.length&&(lf(),e=Math.max($d-2,0)),$d=e,of(Z[$d])},50))},df=()=>{let e=cf();e<0||(ap(r.PAUSED),setTimeout(()=>{$d=e,of(Z[e])},50))},ff=e=>{e<0||e>=Z.length||(ap(r.PAUSED),setTimeout(()=>{$d=e,of(Z[e])},50))},pf=()=>{for(;Z.length>0&&$d<Z.length-1;)Z.pop();$d=Z.length},mf=()=>{let e=[];for(let t=0;t<Z.length;t++)e[t]={s6502:Z[t].state6502.s6502,thumbnail:Z[t].thumbnail};return e},hf=e=>{Z.length>0&&(Z[Z.length-1].thumbnail=e)},gf=0,_f=0,vf=!1,yf=`default`,bf=!1,xf=16.6881,Sf=17030,Q=r.IDLE,Cf=0,wf=0,Tf=`APPLE2EE`,Ef=0,Df=!1,Of=0,kf=!1,Af=[],jf=e=>{kf=e},Mf=()=>{y.VBL.isSet=!0,As()},Nf=()=>{y.VBL.isSet=!1},Pf=()=>{let e={};for(let t in y)e[t]=y[t].isSet;return e},Ff=()=>Tf,If=e=>{mi(e),hp()},Lf=e=>{pi(e),hp()},Rf=e=>{bf=e,hp()},zf=!1,Bf=()=>{zf||(zf=!0,er(),zr(2),zr(4),Ro(),Ef!==2&&nc(!0,2),Ef!==4&&Qu(!0,4),ks(!0,5),Ef!==0&&Ju(!0,Ef),so(),Vd(),va())},Vf=()=>{Co(),Be(),ms(),rc(),Ef!==0&&qu(),Lo(),Ef!==4&&vd(4)},Hf=()=>{pi(0),Vr(),wr(Tf),Bf();{let e=$o(768,`
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
`.split(`
`));S.set(e,768)}Vd(),Uf(),_o(1).filename===``&&(Vd(!1),setTimeout(()=>{Vd()},200))},Uf=()=>{if(Xn(),vn(),E(49282),hi(),Vf(),Ut(!0),ce()){le(!1);let e=k.cycleCount,t=setInterval(()=>{k.cycleCount-e>1e3&&(le(!0),clearInterval(t))},50)}},Wf=e=>{gf=e,xf=gf===4?0:16.6881,Sf=17030*[.1,.5,1,2,3,4,24][gf+2],ip()},Gf=e=>{yf=e},Kf=()=>yf===`game`||yf===`embed`,qf=e=>{vf=e,hp()},Jf=(e,t)=>{e>>8==192?D(e,t):S[e]=t,e>=8192&&e<=24575&&Q===r.PAUSED&&ni(ae(e)),hp()},Yf=(e,t=!0)=>{Tf=e,wr(Tf),t&&Uf(),hp()},Xf=e=>{e!==0&&e!==2&&e!==4||Ef!==e&&(Ef=e,zf=!1,hp())},Zf=e=>{let t={...k},n=ii(256),r=$o(256,`
       JSR   $D82A
LOOP   JMP   LOOP
`.split(`
`));for(let t=0;t<e.length;t++)S[512+t]=e.charCodeAt(t);S[512+e.length]=0,S.set(r,256),S[184]=0,S[185]=2,k.Accum=e.charCodeAt(0),k.PC=256,setTimeout(()=>{ai(256,n),mi(t)},30)},Qf=e=>{Tr(e),hp()},$f=null,ep=(e=!1)=>{$f&&clearTimeout($f),e?$f=setTimeout(()=>{Df=!0,$f=null},100):Df=!0},tp=()=>{Bn(),Q===r.IDLE&&(Hf(),Q=r.PAUSED),kf||Zd(),lr(kf?Xd:null),ap(r.PAUSED)},np=()=>{Bn(),Q===r.IDLE&&(Hf(),Q=r.PAUSED),E(k.PC,!1)===32?(kf||Zd(),lr(kf?Xd:null),rp()):tp()},rp=()=>{Bn(),Q===r.IDLE&&(Hf(),Q=r.PAUSED),Vn(),ap(r.RUNNING)},ip=()=>{Af=[{time:performance.now(),cycles:k.cycleCount}],wf=performance.now()},ap=(e,t=!0)=>{Bf(),t&&Q===r.RUNNING&&e===r.PAUSED&&(bf=!0),Q=e,Q===r.PAUSED?(wn(),Of&&=(clearInterval(Of),0),wo()):Q===r.RUNNING&&(wo(!0),Bn(),pf(),Of||=setInterval(Ut,1e3)),kf||Zd(),hp(),ip(),_f===0&&(_f=1,yp())},op=e=>{Cf=isNaN(e)||e<1?0:e},sp=e=>{Q===r.IDLE?(ap(r.NEED_BOOT),setTimeout(()=>{ap(r.NEED_RESET),setTimeout(()=>{e()},200)},200)):e()},cp=(e,t,n)=>{sp(()=>{ai(e,t),n&&_i(e)})},lp=e=>{sp(()=>{on(e)})},up=()=>Q===r.PAUSED?ci():new Uint8Array,dp=()=>{let e=si(),t=e[105]|e[106]<<8,n=e[107]|e[108]<<8,r=S.slice(t,n+1),i=r.length-1;r[i]=0;for(let e=0;e<i;e+=7){let t=r.slice(e,e+7),n=t[0];if(n===0)break;let i=t[1];if(!(n&128)&&i&128){let n=t[3]|t[4]<<8,i=t[2],a=S.slice(n,n+i);r[e+3]=r.length&255,r[e+4]=r.length>>8&255,r=new Uint8Array([...r,...a])}}return r},fp=()=>Q===r.IDLE?``:wi(),pp=!1,mp=()=>{E(y.PB0.isSetAddr),E(y.PB1.isSetAddr);let e={addressGetTable:C,altChar:y.ALTCHARSET.isSet,basicMemory:dp(),breakpoints:Rn,button0:y.PB0.isSet,button1:y.PB1.isSet,canGoBackward:sf()>=0,canGoForward:cf()>=0,c800Slot:_r(),cout:E(57)<<8|E(56),cpuSpeed:_f,extraRamSize:64*(mr+1),hires:ri(),iTempState:ef(),isDebugging:vf,isTracing:!1,lores:Xr(!0),machineName:Tf,memoryDump:up(),noDelayMode:!y.COLUMN80.isSet&&y.DHIRES.isSet&&Tf!==`APPLE2P`,ramWorksBank:yr(),runMode:Q,s6502:k,showDebugTab:bf,softSwitches:Pf(),speedMode:gf,stackString:fp(),textPage:Xr(),timeTravelThumbnails:mf(),tracelog:Q===r.PAUSED?Qd():[],veraSlot:Ef,zeroPage:si()};return console.log(e.noDelayMode),e},hp=()=>{Cp(mp()),pp||(pp=!0,Lp(Cn()))},gp=e=>{if(e)for(let t=0;t<e.length;t++)bn(e[t]);else xn();e&&(e[0]<=49167||e[0]>=49232)&&Nr(),hp()},_p=-1,vp=()=>{if(Q===r.IDLE||Q===r.PAUSED)return;Q===r.NEED_BOOT?(Hf(),ap(r.RUNNING)):Q===r.NEED_RESET&&(Uf(),ap(r.RUNNING));let e=0,t=-1;for(Cf>0&&(_p=k.cycleCount);;){let n=lr(kf?Xd:null);if(n<0)break;e+=n;let i=k.cycleCount%17030;if(i<4550)y.VBL.isSet||Mf();else{Nf();let e=Math.floor((i-4550)/65);e!==t&&e<192&&(t=e,ni(e))}if(Cf>0&&k.cycleCount-_p>=Cf){Cf=0,ap(r.PAUSED);break}if(e>=Sf)break}Af.length>120&&Af.shift(),Af.push({time:performance.now(),cycles:k.cycleCount});let n=Af.length>1?(Af[Af.length-1].cycles-Af[0].cycles)/(Af[Af.length-1].time-Af[0].time):0;_f=n<1e4?Math.round(n/10)/100:Math.round(n/100)/10,tt(),Jt(),hp(),Df&&(Df=!1,lf())},yp=()=>{vp(),wf+=xf;let e=performance.now(),t=wf-e;t<0&&(wf=e,t=0),t=Q===r.PAUSED?20:Math.max(1,t),setTimeout(yp,t)},$=(e,t)=>{try{self.postMessage({msg:e,payload:t})}catch(e){console.error(`worker2main: doPostMessage error: ${e}`)}},bp=(e,t)=>{t===0?$(i.VERA_FRAME,{dcVideo:t}):$(i.VERA_FRAME,{fb:e,dcVideo:t})},xp=e=>{$(i.VERA_PSG_WRITE,e)},Sp=e=>{$(i.VERA_PCM_WRITE,e)},Cp=e=>{$(i.MACHINE_STATE,e)},wp=e=>{$(i.CLICK,e)},Tp=e=>{$(i.DRIVE_PROPS,e)},Ep=e=>{$(i.DRIVE_SOUND,e)},Dp=e=>{$(i.GET_MEMORY_RESPONSE,e)},Op=e=>{$(i.SAVE_STATE,e)},kp=e=>{$(i.RUMBLE,e)},Ap=e=>{$(i.HELP_TEXT,e)},jp=e=>{$(i.ENHANCED_MIDI,e)},Mp=e=>{$(i.SHOW_APPLE_MOUSE,e)},Np=e=>{$(i.MBOARD_SOUND,e)},Pp=e=>{$(i.COMM_DATA,e)},Fp=e=>{$(i.MIDI_DATA,e)},Ip=e=>{$(i.REQUEST_THUMBNAIL,e)},Lp=e=>{$(i.SOFTSWITCH_DESCRIPTIONS,e)},Rp=e=>{$(i.INSTRUCTIONS,e)},zp=e=>{$(i.SERIAL_CONFIG_CHANGE,e)};typeof self<`u`&&(self.onmessage=e=>{if(!(!e.data||typeof e.data!=`object`)&&`msg`in e.data)switch(e.data.msg){case a.RUN_MODE:ap(e.data.payload);break;case a.CYCLES_TO_RUN:op(e.data.payload);break;case a.STATE6502:If(e.data.payload);break;case a.DEBUG:qf(e.data.payload);break;case a.APP_MODE:Gf(e.data.payload);break;case a.SHOW_DEBUG_TAB:Rf(e.data.payload);break;case a.BREAKPOINTS:Un(e.data.payload);break;case a.STEP_INTO:tp();break;case a.STEP_OVER:np();break;case a.STEP_OUT:rp();break;case a.BASIC_STEP:Hn();break;case a.SPEED:Wf(e.data.payload);break;case a.TIME_TRAVEL_STEP:e.data.payload===`FORWARD`?df():uf();break;case a.TIME_TRAVEL_INDEX:ff(e.data.payload);break;case a.TIME_TRAVEL_SNAPSHOT:ep();break;case a.THUMBNAIL_IMAGE:hf(e.data.payload);break;case a.RESTORE_STATE:of(e.data.payload,!0);break;case a.KEYBOARD_STATE:qt(e.data.payload);break;case a.KEYPRESS:an(e.data.payload);break;case a.KEYRELEASE:Xt();break;case a.MOUSEEVENT:js(e.data.payload);break;case a.PASTE_TEXT:lp(e.data.payload);break;case a.APPLE_PRESS:Ve(!0,e.data.payload);break;case a.APPLE_RELEASE:Ve(!1,e.data.payload);break;case a.GET_MEMORY:Dp(li());break;case a.GET_SAVE_STATE:Op(rf(!0));break;case a.GET_SAVE_STATE_SNAPSHOTS:Op(af());break;case a.DRIVE_PROPS:{let t=e.data.payload;Eo(t);break}case a.DRIVE_NEW_DATA:{let t=e.data.payload;To(t);break}case a.GAMEPAD:Ye(e.data.payload);break;case a.SET_BINARY_BLOCK:{let t=e.data.payload;cp(t.address,t.data,t.run);break}case a.SET_CYCLECOUNT:Lf(e.data.payload);break;case a.SET_MEMORY:{let t=e.data.payload;Jf(t.address,t.value);break}case a.COMM_DATA:Io(e.data.payload);break;case a.MIDI_DATA:tc(e.data.payload);break;case a.RAMWORKS:Qf(e.data.payload);break;case a.MACHINE_NAME:Yf(e.data.payload);break;case a.VERA_SLOT:Xf(e.data.payload);break;case a.REVERSE_YAXIS:He(e.data.payload);break;case a.SOFTSWITCHES:gp(e.data.payload);break;case a.SIRIUS_JOYPORT:le(e.data.payload);break;case a.EXECUTE_BASIC_COMMAND:{let t=e.data.payload;Zf(t);break}case a.TRACING:jf(e.data.payload);break;case a.TRACE_SETTINGS:Jd(e.data.payload);break;default:console.error(`worker2main: unhandled msg: ${JSON.stringify(e.data)}`);break}})})();
//# sourceMappingURL=worker2main-D32hQRTf.js.map