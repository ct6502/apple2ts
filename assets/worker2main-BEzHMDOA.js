(function(){var e=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports);let t=256*256,n=256*383,r=function(e){return e[e.IDLE=0]=`IDLE`,e[e.RUNNING=-1]=`RUNNING`,e[e.PAUSED=-2]=`PAUSED`,e[e.NEED_BOOT=-3]=`NEED_BOOT`,e[e.NEED_RESET=-4]=`NEED_RESET`,e}({}),i=function(e){return e[e.MACHINE_STATE=0]=`MACHINE_STATE`,e[e.CLICK=1]=`CLICK`,e[e.DRIVE_PROPS=2]=`DRIVE_PROPS`,e[e.DRIVE_SOUND=3]=`DRIVE_SOUND`,e[e.GET_MEMORY_RESPONSE=4]=`GET_MEMORY_RESPONSE`,e[e.SAVE_STATE=5]=`SAVE_STATE`,e[e.RUMBLE=6]=`RUMBLE`,e[e.HELP_TEXT=7]=`HELP_TEXT`,e[e.SHOW_APPLE_MOUSE=8]=`SHOW_APPLE_MOUSE`,e[e.MBOARD_SOUND=9]=`MBOARD_SOUND`,e[e.COMM_DATA=10]=`COMM_DATA`,e[e.MIDI_DATA=11]=`MIDI_DATA`,e[e.ENHANCED_MIDI=12]=`ENHANCED_MIDI`,e[e.REQUEST_THUMBNAIL=13]=`REQUEST_THUMBNAIL`,e[e.SOFTSWITCH_DESCRIPTIONS=14]=`SOFTSWITCH_DESCRIPTIONS`,e[e.INSTRUCTIONS=15]=`INSTRUCTIONS`,e[e.SERIAL_CONFIG_CHANGE=16]=`SERIAL_CONFIG_CHANGE`,e}({}),a=function(e){return e[e.APPLE_PRESS=0]=`APPLE_PRESS`,e[e.APPLE_RELEASE=1]=`APPLE_RELEASE`,e[e.APP_MODE=2]=`APP_MODE`,e[e.BASIC_STEP=3]=`BASIC_STEP`,e[e.BREAKPOINTS=4]=`BREAKPOINTS`,e[e.COMM_DATA=5]=`COMM_DATA`,e[e.CYCLES_TO_RUN=6]=`CYCLES_TO_RUN`,e[e.DEBUG=7]=`DEBUG`,e[e.DRIVE_NEW_DATA=8]=`DRIVE_NEW_DATA`,e[e.DRIVE_PROPS=9]=`DRIVE_PROPS`,e[e.EXECUTE_BASIC_COMMAND=10]=`EXECUTE_BASIC_COMMAND`,e[e.GAMEPAD=11]=`GAMEPAD`,e[e.GET_MEMORY=12]=`GET_MEMORY`,e[e.GET_SAVE_STATE=13]=`GET_SAVE_STATE`,e[e.GET_SAVE_STATE_SNAPSHOTS=14]=`GET_SAVE_STATE_SNAPSHOTS`,e[e.KEYPRESS=15]=`KEYPRESS`,e[e.KEYRELEASE=16]=`KEYRELEASE`,e[e.MACHINE_NAME=17]=`MACHINE_NAME`,e[e.MIDI_DATA=18]=`MIDI_DATA`,e[e.MOUSEEVENT=19]=`MOUSEEVENT`,e[e.PASTE_TEXT=20]=`PASTE_TEXT`,e[e.RAMWORKS=21]=`RAMWORKS`,e[e.RESTORE_STATE=22]=`RESTORE_STATE`,e[e.REVERSE_YAXIS=23]=`REVERSE_YAXIS`,e[e.RUN_MODE=24]=`RUN_MODE`,e[e.SET_BINARY_BLOCK=25]=`SET_BINARY_BLOCK`,e[e.SET_CYCLECOUNT=26]=`SET_CYCLECOUNT`,e[e.SET_MEMORY=27]=`SET_MEMORY`,e[e.SHOW_DEBUG_TAB=28]=`SHOW_DEBUG_TAB`,e[e.SIRIUS_JOYPORT=29]=`SIRIUS_JOYPORT`,e[e.SOFTSWITCHES=30]=`SOFTSWITCHES`,e[e.SPEED=31]=`SPEED`,e[e.STATE6502=32]=`STATE6502`,e[e.STEP_INTO=33]=`STEP_INTO`,e[e.STEP_OUT=34]=`STEP_OUT`,e[e.STEP_OVER=35]=`STEP_OVER`,e[e.THUMBNAIL_IMAGE=36]=`THUMBNAIL_IMAGE`,e[e.TIME_TRAVEL_INDEX=37]=`TIME_TRAVEL_INDEX`,e[e.TIME_TRAVEL_SNAPSHOT=38]=`TIME_TRAVEL_SNAPSHOT`,e[e.TIME_TRAVEL_STEP=39]=`TIME_TRAVEL_STEP`,e[e.TRACING=40]=`TRACING`,e[e.TRACE_SETTINGS=41]=`TRACE_SETTINGS`,e}({}),o=function(e){return e[e.MOTOR_OFF=0]=`MOTOR_OFF`,e[e.MOTOR_ON=1]=`MOTOR_ON`,e[e.TRACK_END=2]=`TRACK_END`,e[e.TRACK_SEEK=3]=`TRACK_SEEK`,e}({}),s=function(e){return e[e.IMPLIED=0]=`IMPLIED`,e[e.IMM=1]=`IMM`,e[e.ZP_REL=2]=`ZP_REL`,e[e.ZP_X=3]=`ZP_X`,e[e.ZP_Y=4]=`ZP_Y`,e[e.ABS=5]=`ABS`,e[e.ABS_X=6]=`ABS_X`,e[e.ABS_Y=7]=`ABS_Y`,e[e.IND_X=8]=`IND_X`,e[e.IND_Y=9]=`IND_Y`,e[e.IND=10]=`IND`,e}({}),c=()=>({cycleCount:0,PStatus:0,PC:0,Accum:0,XReg:0,YReg:0,StackPtr:0,flagIRQ:0,flagNMI:!1}),l=e=>e.startsWith(`B`)&&e!==`BIT`&&e!==`BRK`,u=(e,t=2)=>(e>255&&(t=4),(`0000`+e.toString(16).toUpperCase()).slice(-t));new Uint8Array(256).fill(0);let d=e=>e.split(``).map(e=>e.charCodeAt(0)),f=e=>[e&255,e>>>8&255],p=e=>[e&255,e>>>8&255,e>>>16&255,e>>>24&255],ee=(e,t)=>{let n=e.lastIndexOf(`.`)+1;return e.substring(0,n)+t},te=new Uint32Array(256).fill(0),ne=()=>{let e;for(let t=0;t<256;t++){e=t;for(let t=0;t<8;t++)e=e&1?3988292384^e>>>1:e>>>1;te[t]=e}},re=(e,t=0)=>{te[255]===0&&ne();let n=-1;for(let r=t;r<e.length;r++)n=n>>>8^te[(n^e[r])&255];return(n^-1)>>>0},ie=(e,t)=>e+40*Math.trunc(t/64)+t%8*1024+128*(Math.trunc(t/8)&7),ae=e=>{let t=e.toLowerCase();return`.2mg,.hdv,.po,.2meg`.split(`,`).some(e=>t.endsWith(e))},oe=!1,se=()=>oe,ce=e=>{oe=e},le=!1,ue=!1,de=!1,fe=!1,pe=!1,me=!1,he=!1,ge=!1,_e=!1,ve=!1,ye=e=>{let t=x.AN0.isSet,n=x.AN1.isSet,r=!1;switch(e){case x.PB0.isSetAddr:x.PB0.isSet=!t&&le||t&&ue,r=x.PB0.isSet;break;case x.PB1.isSetAddr:x.PB1.isSet=!t&&n&&pe||t&&n&&me||!t&&!n&&he||t&&!n&&ge,r=x.PB1.isSet;break;case x.PB2.isSetAddr:x.PB2.isSet=!t&&n&&de||t&&n&&fe||!t&&!n&&_e||t&&!n&&ve,r=x.PB2.isSet;break}M(e,r?0:128)},be=(e,t,n)=>{let r=!n;switch(t||(r=!0,n=!0),e){case-1:r&&(le=!1,de=!1,pe=!1,he=!1,_e=!1),n&&(ue=!1,fe=!1,me=!1,ge=!1,ve=!1);break;case 0:r&&(le=!0),n&&(ue=!0);break;case 1:break;case 12:r&&(pe=!0),n&&(me=!0);break;case 13:r&&(de=!0),n&&(fe=!0);break;case 14:r&&(he=!0),n&&(ge=!0);break;case 15:r&&(_e=!0),n&&(ve=!0);break;default:break}},xe,Se=2836,m=Se/2,h=Se/2,Ce=Se/2,we=Se/2,Te=0,Ee=!1,De=!1,Oe=!1,ke=!1,Ae=!1,je=!1,Me=!1,Ne=!1,Pe=()=>{Oe=!0},Fe=()=>{ke=!0},Ie=(e,t=!1)=>(e=Math.min(Math.max(e,-1),1),t&&Ne&&(e=-e),(e+1)*Se/2),Le=(e,t)=>{switch(e){case 0:m=Ie(t);break;case 1:h=Ie(t,!0);break;case 2:Ce=Ie(t);break;case 3:we=Ie(t);break}},Re=()=>{je=Ee||Oe,Me=De||ke,x.PB0.isSet=je,x.PB1.isSet=Me,x.PB2.isSet=Ae},ze=(e,t)=>{t?Ee=e:De=e,Re()},Be=e=>{Ne=e},Ve=e=>{M(49252,128),M(49253,128),M(49254,128),M(49255,128),Te=e},g=(e,t)=>{let n=e-Te;M(49252,n<m?t|128:t&127),M(49253,n<h?t|128:t&127),M(49254,n<Ce?t|128:t&127),M(49255,n<we?t|128:t&127)},He=(e,t)=>{if(se())ye(e);else{let n=!1;switch(e){case x.PB0.isSetAddr:n=x.PB0.isSet;break;case x.PB1.isSetAddr:n=x.PB1.isSet;break;case x.PB2.isSetAddr:n=x.PB2.isSet;break}M(e,n?t|128:t&127)}},Ue,We,Ge=!1,Ke=e=>{xe=e,Ge=!xe.length||!xe[0].buttons.length,Ue=Lt(),We=Ue.gamepad?Ue.gamepad:se()?be:Pt},qe=e=>e>-.01&&e<.01,Je=(e,t)=>{qe(e)&&(e=0),qe(t)&&(t=0);let n=Math.sqrt(e*e+t*t),r=.95*(n===0?1:Math.max(Math.abs(e),Math.abs(t))/n);return e=Math.min(Math.max(-r,e),r),t=Math.min(Math.max(-r,t),r),e=(e+r)/(2*r),t=(t+r)/(2*r),[e,t]},Ye=(e,t)=>([e,t]=Je(e,t),e=Math.trunc(Se*e),t=Math.trunc(Se*t),[e,t]),Xe=e=>{Ne&&(e=e.map((e,t)=>t%2==1?-e:e));let[t,n]=Ye(e[0],e[1]),r=e.length>=6?e[5]:e[3],[i,a]=e.length>=4?Ye(e[2],r):[0,0];return[t,n,i,a]},Ze=e=>{let t=Ue.joystick?Ue.joystick(xe[e].axes,Ge):xe[e].axes,n=Xe(t);e===0?(m=n[0],h=n[1]):(Ce=n[0],we=n[1]);let r=xe[e].buttons;t.length>=10&&t[9]!==0&&t[9]<2&&(t[9]<-.4&&t[9]>-.5?r[15]=!0:t[9]>.7&&t[9]<.8?r[14]=!0:t[9]>.1&&t[9]<.2?r[13]=!0:t[9]<-.95&&(r[12]=!0)),We(-1,xe.length>1,e===1),r.forEach((t,n)=>{t&&We(n,xe.length>1,e===1)}),Ue.rumble&&Ue.rumble(),Re()},Qe=()=>{Oe=!1,ke=!1,Ae=!1,xe&&xe.length>0&&(Ze(0),xe.length>1&&Ze(1))},$e=e=>{switch(e){case 0:y(`JL`);break;case 1:y(`G`,200);break;case 2:v(`M`),y(`O`);break;case 3:y(`L`);break;case 4:y(`F`);break;case 5:v(`P`),y(`T`);break;case 6:break;case 7:break;case 8:y(`Z`);break;case 9:{let e=Lr();e.includes(`'N'`)?v(`N`):e.includes(`'S'`)?v(`S`):e.includes(`NUMERIC KEY`)?v(`1`):v(`N`);break}case 10:break;case 11:break;case 12:y(`L`);break;case 13:y(`M`);break;case 14:y(`A`);break;case 15:y(`D`);break;case-1:return;default:break}},et=0,tt=0,nt=!1,rt=.5,it={address:24835,data:[173,198,9],keymap:{},joystick:e=>e[0]<-.5?(tt=0,et===0||et>2?(et=0,v(`A`)):et===1&&nt?y(`W`):et===2&&nt&&y(`R`),et++,nt=!1,e):e[0]>rt?(et=0,tt===0||tt>2?(tt=0,v(`D`)):tt===1&&nt?y(`W`):tt===2&&nt&&y(`R`),tt++,nt=!1,e):e[1]<-.5?(y(`C`),e):e[1]>rt?(y(`S`),e):(nt=!0,e),gamepad:$e,rumble:null,setup:null,helptext:`AZTEC
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
`},at={address:25200,data:[141,16,192],keymap:{A:`J`,S:`K`,D:`L`,W:`I`,"\b":`U`,"":`O`},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Championship Lode Runner by Doug Smith
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
`},ot={address:24583,data:[173,0,192],keymap:{"\v":`A`,"\n":`Z`},joystick:null,gamepad:e=>{switch(e){case 0:v(` `);break;case 12:v(`A`);break;case 13:v(`Z`);break;case 14:v(`\b`);break;case 15:v(``);break;case-1:return;default:break}},rumble:null,setup:null,helptext:`Drol
Benny Aik Beng Ngo, Brøderbund 1983

KEYBOARD:
Arrow keys for left/right
Arrow keys or A/Z for up/down
Spacebar: Fire

GAMEPAD:
D-pad: Up/Down/Left/Right
A button: Fire
`},st={address:17706,data:[173,0,192],keymap:{"\b":`A`,"":`D`,"\v":`W`,"\n":`X`,P:`\r`,M:` `},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`FIREBUG
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
`},ct={address:1037,data:[201,206,202,213,210],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{Fl(`APPLE2EU`,!1)},helptext:`Injured Engine
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
C         Close throttle`},lt=14,ut=14,dt={address:28268,data:[173,0,192],keymap:{N:`\b`,M:``,",":`\b`,".":``},joystick:null,gamepad:null,rumble:()=>{let e=k(182,!1);lt<40&&e<lt&&uu({startDelay:220,duration:300,weakMagnitude:1,strongMagnitude:0}),lt=e,e=k(183,!1),ut<40&&e<ut&&uu({startDelay:220,duration:300,weakMagnitude:0,strongMagnitude:1}),ut=e},setup:null,helptext:`KARATEKA
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
`},ft={address:25078,data:[141,16,192],keymap:{A:`J`,S:`K`,D:`L`,W:`I`,"\b":`U`,"":`O`},gamepad:null,joystick:null,rumble:null,setup:()=>{A(46793,234),A(46794,234)},helptext:`Lode Runner by Doug Smith
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
`},pt=e=>{switch(e){case 0:y(`A`);break;case 1:y(`C`,50);break;case 2:y(`O`);break;case 3:y(`T`);break;case 4:y(`\x1B`);break;case 5:y(`\r`);break;case 6:break;case 7:break;case 8:v(`N`),y(`'`);break;case 9:v(`Y`),y(`1`);break;case 10:break;case 11:break;case 12:break;case 13:y(` `);break;case 14:break;case 15:y(`	`);break;case-1:return;default:break}},mt=.5,ht={address:768,data:[141,74,3,132],keymap:{},gamepad:pt,joystick:(e,t)=>{if(t)return e;let n=(e[0]<-.5?`\b`:e[0]>mt?``:``)+(e[1]<-.5?`\v`:e[1]>mt?`
`:``);return n||(n=e[2]<-.5?`L\b`:e[2]>mt?`L`:``,n||=e[3]<-.5?`L\v`:e[3]>mt?`L
`:``),n&&y(n,200),[0,0,0,0]},rumble:null,setup:null,helptext:`Nox Archaist, Mark Lemmert
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
ESC  exit conversation`},gt={address:41642,data:[67,82,79],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Julius Erving and Larry Bird Go One-on-One
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
`},_t={address:55645,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`Prince of Persia
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
`},vt={address:30110,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:`The Print Shop

Total Reprint is a port of The Print Shop Color (1986) to ProDOS. Some notable features:

* All Broderbund graphic libraries
* Additional openly licensed 3rd party graphics and fonts
* Unified UI for selecting 3rd party graphics and borders
* All libraries available from hard drive (no swapping floppies!)

Total Reprint is © 2025 by 4am and licensed under the MIT open source license.
All original code is available on <a href="https://github.com/a2-4am/4print" target="_blank" rel="noopener noreferrer">GitHub</a>.

Program and graphic libraries are © their respective authors.`},yt={address:16962,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:()=>{k(14799,!1)===255&&uu({startDelay:0,duration:1e3,weakMagnitude:1,strongMagnitude:0})},setup:()=>{A(3178,99)},helptext:`Robotron: 2084
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
Ctrl+S    Turn Sound On/Off`},bt=`SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A      up
Z      down
N ← ,  left
M → .  right
`,xt=e=>{switch(e){case 1:A(109,255);break;case 12:v(`A`);break;case 13:v(`Z`);break;case 14:v(`\b`);break;case 15:v(``);break;default:break}},St=.75,Ct=[{address:34918,data:[32,0,96],keymap:{},joystick:null,gamepad:null,rumble:null,setup:()=>{A(25025,173),A(25036,64)},helptext:bt},{address:7291,data:[173,0,192],keymap:{N:`\b`,M:``,",":`\b`,".":``},joystick:e=>{let t=e[0]<-.75?`\b`:e[0]>St?``:e[1]<-.75?`A`:e[1]>St?`Z`:``;return t&&v(t),e},gamepad:xt,rumble:null,setup:null,helptext:bt}],wt={address:514,data:[85,76,84,73,77,65,53],keymap:{},gamepad:null,joystick:null,rumble:null,setup:()=>{fu(1)},helptext:`Ultima V: Warriors of Destiny
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

`},Tt={address:46999,data:[173,0,192],keymap:{},gamepad:null,joystick:null,rumble:null,setup:null,helptext:`Wizardry
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
`},Et=`<b>Castle Wolfenstein</b>
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
LB button: Inventory`,Dt=e=>{switch(e){case 0:Pe();break;case 1:Fe();break;case 2:y(` `);break;case 3:y(`U`);break;case 4:y(`\r`);break;case 5:y(`T`);break;case 9:{let e=Lr();e.includes(`'N'`)?v(`N`):e.includes(`'S'`)?v(`S`):e.includes(`NUMERIC KEY`)?v(`1`):v(`N`);break}case 10:Pe();break;case-1:break;default:break}},Ot=()=>{A(5128,0),A(5130,4);let e=5210;A(e,234),A(e+1,234),A(e+2,234),e=5224,A(e,234),A(e+1,234),A(e+2,234)},kt=()=>{k(49178,!1)<128&&k(49181,!1)<128&&uu({startDelay:0,duration:200,weakMagnitude:1,strongMagnitude:0})},At={address:3205,data:[173,0,192],keymap:{},joystick:null,gamepad:null,rumble:null,setup:null,helptext:Et},jt={address:4745,data:[173,0,192],keymap:{},joystick:null,gamepad:Dt,rumble:kt,setup:Ot,helptext:Et},Mt={address:2926,data:[169,0,133],keymap:{},joystick:null,gamepad:e=>{switch(e){case 0:Pe();break;case 1:Fe();break;case 2:y(` `);break;case 3:y(`U`);break;case 4:y(`\r`);break;case 5:y(`:`);break;case 9:{let e=Lr();e.includes(`'N'`)?v(`N`):e.includes(`'S'`)?v(`S`):e.includes(`NUMERIC KEY`)?v(`1`):v(`N`);break}case 10:Pe();break;case-1:break;default:break}},rumble:null,setup:null,helptext:`<b>Beyond Castle Wolfenstein</b>
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
LB button: Inventory`},Nt=[],_=e=>{Array.isArray(e)?Nt.push(...e):Nt.push(e)};_(it),_(at),_(ot),_(st),_(ct),_(dt),_(ft),_(ht),_(gt),_(_t),_(vt),_(yt),_(Ct),_(wt),_(Tt),_(jt),_(At),_(Mt);let Pt=(e,t,n)=>{let r=!n;switch(e){case 0:r&&Pe();break;case 1:r&&Fe();break;case 12:Le(n?3:1,-1);break;case 13:Le(n?3:1,1);break;case 14:Le(n?2:0,-1);break;case 15:Le(n?2:0,1);break;default:break}},Ft={address:0,data:[],keymap:{},gamepad:null,joystick:e=>e,rumble:null,setup:null,helptext:``},It=e=>{for(let t of Nt)if(Kr(t.address,t.data))return e.toUpperCase()in t.keymap?t.keymap[e.toUpperCase()]:e;return e},Lt=()=>{for(let e of Nt)if(Kr(e.address,e.data))return e;return Ft},Rt=(e=!1)=>{for(let e of Nt)if(Kr(e.address,e.data)){du(e.helptext?e.helptext:` `),e.setup&&e.setup();return}e&&(du(` `),fu(0))},zt=e=>{M(49152,e|128,16),M(49168,e&255|128,16)},Bt=()=>{M(49152,j(49152)&127,16)},Vt=()=>{M(49152,j(49152)&127,32)},Ht=``,Ut=1e9,Wt=0,Gt=0,Kt=()=>{let e=performance.now();if(Gt++,Ht!==``&&Gt>2&&(j(49152)<128||e-Ut>3800)){Gt=0,Ut=e;let t=Ht.charCodeAt(0);zt(t),Ht=Ht.slice(1),Ht.length===0&&e-Wt>500&&(Wt=e,zl(!0))}},qt=``,v=e=>{e===qt&&Ht.length>0||(qt=e,Ht+=e)},Jt=0,y=(e,t=300)=>{let n=performance.now();n-Jt<t||(Jt=n,v(e))},Yt=e=>{let t=String.fromCharCode(e);t=It(t),v(t),Kt()},Xt=e=>{e.length===1&&(e=It(e)),v(e)},Zt=[],b=(e,t,n,r=!1,i=null)=>{let a={offAddr:e,onAddr:t,isSetAddr:n,writeOnly:r,isSet:!1,setFunc:i};return e>=49152&&(Zt[e-49152]=a),t>=49152&&(Zt[t-49152]=a),n>=49152&&(Zt[n-49152]=a),a},Qt=()=>Math.floor(180*Math.random()),$t=()=>Math.floor(256*Math.random()),en=e=>{M(e,j(e&65527)&128|Qt()&127)},tn=(e,t)=>{e&=11,t?x.BSR_PREWRITE.isSet=!1:e&1?x.BSR_PREWRITE.isSet?x.BSR_WRITE.isSet=!0:x.BSR_PREWRITE.isSet=!0:(x.BSR_PREWRITE.isSet=!1,x.BSR_WRITE.isSet=!1),x.BSRBANK2.isSet=e<=3,x.BSRREADRAM.isSet=[0,3,8,11].includes(e)},x={STORE80:b(49152,49153,49176,!0),RAMRD:b(49154,49155,49171,!0),RAMWRT:b(49156,49157,49172,!0),INTCXROM:b(49158,49159,49173,!0),INTC8ROM:b(49194,0,0),ALTZP:b(49160,49161,49174,!0),SLOTC3ROM:b(49162,49163,49175,!0),COLUMN80:b(49164,49165,49183,!0),ALTCHARSET:b(49166,49167,49182,!0),KBRDSTROBE:b(49168,0,0,!1),BSRBANK2:b(0,0,49169),BSRREADRAM:b(0,0,49170),VBL:b(0,0,49177),CASSOUT:b(49184,0,0),SPEAKER:b(49200,0,0,!1,(e,t)=>{M(49200,Qt()),au(t)}),GCSTROBE:b(49216,0,0),EMUBYTE:b(0,0,49231,!1,()=>{M(49231,205)}),TEXT:b(49232,49233,49178),MIXED:b(49234,49235,49179),PAGE2:b(49236,49237,49180),HIRES:b(49238,49239,49181),AN0:b(49240,49241,0),AN1:b(49242,49243,0),AN2:b(49244,49245,0),DHIRES:b(49247,49246,0),CASSIN1:b(0,0,49248,!1,()=>{M(49248,Qt())}),PB0:b(0,0,49249,!1,e=>{He(e,Qt())}),PB1:b(0,0,49250,!1,e=>{He(e,Qt())}),PB2:b(0,0,49251,!1,e=>{He(e,Qt())}),JOYSTICK0:b(0,0,49252,!1,(e,t)=>{g(t,Qt())}),JOYSTICK1:b(0,0,49253,!1,(e,t)=>{g(t,Qt())}),JOYSTICK2:b(0,0,49254,!1,(e,t)=>{g(t,Qt())}),JOYSTICK3:b(0,0,49255,!1,(e,t)=>{g(t,Qt())}),CASSIN2:b(0,0,49256,!1,e=>{en(e)}),C069:b(0,0,49257,!1,e=>{en(e)}),FASTCHIP_LOCK:b(49258,0,0,!1,e=>{en(e)}),FASTCHIP_ENABLE:b(49259,0,0,!1,e=>{en(e)}),C06C:b(0,0,49260,!1,e=>{en(e)}),FASTCHIP_SPEED:b(49261,0,0,!1,e=>{en(e)}),C06E:b(0,0,49262,!1,e=>{en(e)}),C06F:b(0,0,49263,!1,e=>{en(e)}),JOYSTICKRESET:b(0,0,49264,!1,(e,t)=>{Ve(t),M(49264,Qt())}),BANKSEL:b(49267,0,0),LASER128EX:b(49268,0,0),VIDEO7_160:b(49272,49273,0),VIDEO7_MONO:b(49274,49275,0),VIDEO7_MIXED:b(49276,49277,0),BSR_PREWRITE:b(49280,0,0),BSR_WRITE:b(49288,0,0)};x.TEXT.isSet=!0;let nn=!0,rn=0,an=e=>{if(nn!==e&&x.STORE80.isSet){if(e)switch(x.VIDEO7_160.isSet=!1,x.VIDEO7_MONO.isSet=!1,x.VIDEO7_MIXED.isSet=!1,rn=rn<<1&2,rn|=+!x.COLUMN80.isSet,rn){case 0:break;case 1:x.VIDEO7_160.isSet=!0;break;case 2:x.VIDEO7_MIXED.isSet=!0;break;case 3:x.VIDEO7_MONO.isSet=!0;break}nn=e}},on=[49152,49153,49165,49167,49168,49200,49236,49237,49183],sn=(e,t)=>8192+e%8*1024+128*(Math.trunc(e/8)&7)+40*Math.trunc(e/64)+t,cn=(e,t,n)=>{if(e>1048575&&!on.includes(e)){let r=+(j(e)>128);console.log(`${n} $${u(N.PC)}: $${u(e)} [${r}] ${t?`write`:``}`)}if(e<=49183&&dr()===`APPLE2P`){!t&&e<=49167&&Kt(),e===49168?Bt():e!==49152&&M(e,Qt());return}if(e>=49280&&e<=49295){tn(e&-5,t);return}let r=Zt[e-49152];if(!r){console.error(`Unknown softswitch `+u(e)),M(e,Qt());return}if(e<=49167?t||Kt():(e===49168||e<=49183&&t)&&Bt(),r.setFunc){(e===r.offAddr||e===r.onAddr)&&(r.isSet=e===r.onAddr),r.setFunc(e,n);return}if(e===x.DHIRES.offAddr?an(!0):e===x.DHIRES.onAddr&&an(!1),e===r.offAddr||e===r.onAddr){if((!r.writeOnly||t)&&(un[r.offAddr-49152]===void 0?r.isSet=e===r.onAddr:un[r.offAddr-49152]=e===r.onAddr),r.isSetAddr){let e=j(r.isSetAddr);M(r.isSetAddr,r.isSet?e|128:e&127)}if(e>=49184){let t;if(e>=49232&&e<=49247){let e=n%17030-4550;if(e>=0){let r=Math.floor(e/65),i=n%65;t=k(sn(r,i))}else t=$t()}else t=Qt();M(e,t)}}else if(e===r.isSetAddr){let t=j(e);M(e,r.isSet?t|128:t&127)}},ln=()=>{for(let e in x){let t=e;un[x[t].offAddr-49152]===void 0?x[t].isSet=!1:un[x[t].offAddr-49152]=!1}un[x.TEXT.offAddr-49152]===void 0?x.TEXT.isSet=!0:un[x.TEXT.offAddr-49152]=!0},un=[],dn=e=>{if(e>=49280&&e<=49295){tn(e&-5,!1);return}let t=Zt[e-49152];if(!t){console.error(`overrideSoftSwitch: Unknown softswitch `+u(e));return}un[t.offAddr-49152]===void 0&&(un[t.offAddr-49152]=t.isSet),t.isSet=e===t.onAddr},fn=()=>{un.forEach((e,t)=>{e!==void 0&&(Zt[t].isSet=e)}),un.length=0},pn=[],mn=()=>{if(pn.length===0)for(let e in x){let t=x[e],n=t.onAddr>0,r=t.writeOnly?` (write)`:``;if(t.offAddr>0){let i=u(t.offAddr)+` `+e;pn[t.offAddr]=i+(n?`-OFF`:``)+r}if(t.onAddr>0){let n=u(t.onAddr)+` `+e;pn[t.onAddr]=n+`-ON`+r}if(t.isSetAddr>0){let n=u(t.isSetAddr)+` `+e;pn[t.isSetAddr]=n+`-STATUS`+r}}return pn[49152]=`C000 KBRD/STORE80-OFF`,pn},hn=()=>{for(let e in x){let t=x[e];if(t.isSetAddr){let e=j(t.isSetAddr);M(t.isSetAddr,t.isSet?e|128:e&127)}}};var gn=e((e=>{e.byteLength=c,e.toByteArray=u,e.fromByteArray=p;for(var t=[],n=[],r=typeof Uint8Array<`u`?Uint8Array:Array,i=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`,a=0,o=i.length;a<o;++a)t[a]=i[a],n[i.charCodeAt(a)]=a;n[45]=62,n[95]=63;function s(e){var t=e.length;if(t%4>0)throw Error(`Invalid string. Length must be a multiple of 4`);var n=e.indexOf(`=`);n===-1&&(n=t);var r=n===t?0:4-n%4;return[n,r]}function c(e){var t=s(e),n=t[0],r=t[1];return(n+r)*3/4-r}function l(e,t,n){return(t+n)*3/4-n}function u(e){var t,i=s(e),a=i[0],o=i[1],c=new r(l(e,a,o)),u=0,d=o>0?a-4:a,f;for(f=0;f<d;f+=4)t=n[e.charCodeAt(f)]<<18|n[e.charCodeAt(f+1)]<<12|n[e.charCodeAt(f+2)]<<6|n[e.charCodeAt(f+3)],c[u++]=t>>16&255,c[u++]=t>>8&255,c[u++]=t&255;return o===2&&(t=n[e.charCodeAt(f)]<<2|n[e.charCodeAt(f+1)]>>4,c[u++]=t&255),o===1&&(t=n[e.charCodeAt(f)]<<10|n[e.charCodeAt(f+1)]<<4|n[e.charCodeAt(f+2)]>>2,c[u++]=t>>8&255,c[u++]=t&255),c}function d(e){return t[e>>18&63]+t[e>>12&63]+t[e>>6&63]+t[e&63]}function f(e,t,n){for(var r,i=[],a=t;a<n;a+=3)r=(e[a]<<16&16711680)+(e[a+1]<<8&65280)+(e[a+2]&255),i.push(d(r));return i.join(``)}function p(e){for(var n,r=e.length,i=r%3,a=[],o=16383,s=0,c=r-i;s<c;s+=o)a.push(f(e,s,s+o>c?c:s+o));return i===1?(n=e[r-1],a.push(t[n>>2]+t[n<<4&63]+`==`)):i===2&&(n=(e[r-2]<<8)+e[r-1],a.push(t[n>>10]+t[n>>4&63]+t[n<<2&63]+`=`)),a.join(``)}})),_n=e((e=>{
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
e.read=function(e,t,n,r,i){var a,o,s=i*8-r-1,c=(1<<s)-1,l=c>>1,u=-7,d=n?i-1:0,f=n?-1:1,p=e[t+d];for(d+=f,a=p&(1<<-u)-1,p>>=-u,u+=s;u>0;a=a*256+e[t+d],d+=f,u-=8);for(o=a&(1<<-u)-1,a>>=-u,u+=r;u>0;o=o*256+e[t+d],d+=f,u-=8);if(a===0)a=1-l;else if(a===c)return o?NaN:(p?-1:1)*(1/0);else o+=2**r,a-=l;return(p?-1:1)*o*2**(a-r)},e.write=function(e,t,n,r,i,a){var o,s,c,l=a*8-i-1,u=(1<<l)-1,d=u>>1,f=i===23?2**-24-2**-77:0,p=r?0:a-1,ee=r?1:-1,te=+(t<0||t===0&&1/t<0);for(t=Math.abs(t),isNaN(t)||t===1/0?(s=+!!isNaN(t),o=u):(o=Math.floor(Math.log(t)/Math.LN2),t*(c=2**-o)<1&&(o--,c*=2),o+d>=1?t+=f/c:t+=f*2**(1-d),t*c>=2&&(o++,c/=2),o+d>=u?(s=0,o=u):o+d>=1?(s=(t*c-1)*2**i,o+=d):(s=t*2**(d-1)*2**i,o=0));i>=8;e[n+p]=s&255,p+=ee,s/=256,i-=8);for(o=o<<i|s,l+=i;l>0;e[n+p]=o&255,p+=ee,o/=256,l-=8);e[n+p-ee]|=te*128}})),vn=e((e=>{
/*!
* The buffer module from node.js, for the browser.
*
* @author   Feross Aboukhadijeh <https://feross.org>
* @license  MIT
*/
let t=gn(),n=_n(),r=typeof Symbol==`function`&&typeof Symbol.for==`function`?Symbol.for(`nodejs.util.inspect.custom`):null;e.Buffer=s,e.SlowBuffer=ie,e.INSPECT_MAX_BYTES=50;let i=2147483647;e.kMaxLength=i,s.TYPED_ARRAY_SUPPORT=a(),!s.TYPED_ARRAY_SUPPORT&&typeof console<`u`&&typeof console.error==`function`&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function a(){try{let e=new Uint8Array(1),t={foo:function(){return 42}};return Object.setPrototypeOf(t,Uint8Array.prototype),Object.setPrototypeOf(e,t),e.foo()===42}catch{return!1}}Object.defineProperty(s.prototype,"parent",{enumerable:!0,get:function(){if(s.isBuffer(this))return this.buffer}}),Object.defineProperty(s.prototype,"offset",{enumerable:!0,get:function(){if(s.isBuffer(this))return this.byteOffset}});function o(e){if(e>i)throw RangeError(`The value "`+e+`" is invalid for option "size"`);let t=new Uint8Array(e);return Object.setPrototypeOf(t,s.prototype),t}function s(e,t,n){if(typeof e==`number`){if(typeof t==`string`)throw TypeError(`The "string" argument must be of type string. Received type number`);return d(e)}return c(e,t,n)}s.poolSize=8192;function c(e,t,n){if(typeof e==`string`)return f(e,t);if(ArrayBuffer.isView(e))return ee(e);if(e==null)throw TypeError(`The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type `+typeof e);if(g(e,ArrayBuffer)||e&&g(e.buffer,ArrayBuffer)||typeof SharedArrayBuffer<`u`&&(g(e,SharedArrayBuffer)||e&&g(e.buffer,SharedArrayBuffer)))return te(e,t,n);if(typeof e==`number`)throw TypeError(`The "value" argument must not be of type number. Received type number`);let r=e.valueOf&&e.valueOf();if(r!=null&&r!==e)return s.from(r,t,n);let i=ne(e);if(i)return i;if(typeof Symbol<`u`&&Symbol.toPrimitive!=null&&typeof e[Symbol.toPrimitive]==`function`)return s.from(e[Symbol.toPrimitive](`string`),t,n);throw TypeError(`The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type `+typeof e)}s.from=function(e,t,n){return c(e,t,n)},Object.setPrototypeOf(s.prototype,Uint8Array.prototype),Object.setPrototypeOf(s,Uint8Array);function l(e){if(typeof e!=`number`)throw TypeError(`"size" argument must be of type number`);if(e<0)throw RangeError(`The value "`+e+`" is invalid for option "size"`)}function u(e,t,n){return l(e),e<=0||t===void 0?o(e):typeof n==`string`?o(e).fill(t,n):o(e).fill(t)}s.alloc=function(e,t,n){return u(e,t,n)};function d(e){return l(e),o(e<0?0:re(e)|0)}s.allocUnsafe=function(e){return d(e)},s.allocUnsafeSlow=function(e){return d(e)};function f(e,t){if((typeof t!=`string`||t===``)&&(t=`utf8`),!s.isEncoding(t))throw TypeError(`Unknown encoding: `+t);let n=ae(e,t)|0,r=o(n),i=r.write(e,t);return i!==n&&(r=r.slice(0,i)),r}function p(e){let t=e.length<0?0:re(e.length)|0,n=o(t);for(let r=0;r<t;r+=1)n[r]=e[r]&255;return n}function ee(e){if(g(e,Uint8Array)){let t=new Uint8Array(e);return te(t.buffer,t.byteOffset,t.byteLength)}return p(e)}function te(e,t,n){if(t<0||e.byteLength<t)throw RangeError(`"offset" is outside of buffer bounds`);if(e.byteLength<t+(n||0))throw RangeError(`"length" is outside of buffer bounds`);let r;return r=t===void 0&&n===void 0?new Uint8Array(e):n===void 0?new Uint8Array(e,t):new Uint8Array(e,t,n),Object.setPrototypeOf(r,s.prototype),r}function ne(e){if(s.isBuffer(e)){let t=re(e.length)|0,n=o(t);return n.length===0||e.copy(n,0,0,t),n}if(e.length!==void 0)return typeof e.length!=`number`||He(e.length)?o(0):p(e);if(e.type===`Buffer`&&Array.isArray(e.data))return p(e.data)}function re(e){if(e>=i)throw RangeError(`Attempt to allocate Buffer larger than maximum size: 0x`+i.toString(16)+` bytes`);return e|0}function ie(e){return+e!=e&&(e=0),s.alloc(+e)}s.isBuffer=function(e){return e!=null&&e._isBuffer===!0&&e!==s.prototype},s.compare=function(e,t){if(g(e,Uint8Array)&&(e=s.from(e,e.offset,e.byteLength)),g(t,Uint8Array)&&(t=s.from(t,t.offset,t.byteLength)),!s.isBuffer(e)||!s.isBuffer(t))throw TypeError(`The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array`);if(e===t)return 0;let n=e.length,r=t.length;for(let i=0,a=Math.min(n,r);i<a;++i)if(e[i]!==t[i]){n=e[i],r=t[i];break}return n<r?-1:+(r<n)},s.isEncoding=function(e){switch(String(e).toLowerCase()){case`hex`:case`utf8`:case`utf-8`:case`ascii`:case`latin1`:case`binary`:case`base64`:case`ucs2`:case`ucs-2`:case`utf16le`:case`utf-16le`:return!0;default:return!1}},s.concat=function(e,t){if(!Array.isArray(e))throw TypeError(`"list" argument must be an Array of Buffers`);if(e.length===0)return s.alloc(0);let n;if(t===void 0)for(t=0,n=0;n<e.length;++n)t+=e[n].length;let r=s.allocUnsafe(t),i=0;for(n=0;n<e.length;++n){let t=e[n];if(g(t,Uint8Array))i+t.length>r.length?(s.isBuffer(t)||(t=s.from(t)),t.copy(r,i)):Uint8Array.prototype.set.call(r,t,i);else if(s.isBuffer(t))t.copy(r,i);else throw TypeError(`"list" argument must be an Array of Buffers`);i+=t.length}return r};function ae(e,t){if(s.isBuffer(e))return e.length;if(ArrayBuffer.isView(e)||g(e,ArrayBuffer))return e.byteLength;if(typeof e!=`string`)throw TypeError(`The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type `+typeof e);let n=e.length,r=arguments.length>2&&arguments[2]===!0;if(!r&&n===0)return 0;let i=!1;for(;;)switch(t){case`ascii`:case`latin1`:case`binary`:return n;case`utf8`:case`utf-8`:return Le(e).length;case`ucs2`:case`ucs-2`:case`utf16le`:case`utf-16le`:return n*2;case`hex`:return n>>>1;case`base64`:return Be(e).length;default:if(i)return r?-1:Le(e).length;t=(``+t).toLowerCase(),i=!0}}s.byteLength=ae;function oe(e,t,n){let r=!1;if((t===void 0||t<0)&&(t=0),t>this.length||((n===void 0||n>this.length)&&(n=this.length),n<=0)||(n>>>=0,t>>>=0,n<=t))return``;for(e||=`utf8`;;)switch(e){case`hex`:return xe(this,t,n);case`utf8`:case`utf-8`:return ge(this,t,n);case`ascii`:return ye(this,t,n);case`latin1`:case`binary`:return be(this,t,n);case`base64`:return he(this,t,n);case`ucs2`:case`ucs-2`:case`utf16le`:case`utf-16le`:return Se(this,t,n);default:if(r)throw TypeError(`Unknown encoding: `+e);e=(e+``).toLowerCase(),r=!0}}s.prototype._isBuffer=!0;function se(e,t,n){let r=e[t];e[t]=e[n],e[n]=r}s.prototype.swap16=function(){let e=this.length;if(e%2!=0)throw RangeError(`Buffer size must be a multiple of 16-bits`);for(let t=0;t<e;t+=2)se(this,t,t+1);return this},s.prototype.swap32=function(){let e=this.length;if(e%4!=0)throw RangeError(`Buffer size must be a multiple of 32-bits`);for(let t=0;t<e;t+=4)se(this,t,t+3),se(this,t+1,t+2);return this},s.prototype.swap64=function(){let e=this.length;if(e%8!=0)throw RangeError(`Buffer size must be a multiple of 64-bits`);for(let t=0;t<e;t+=8)se(this,t,t+7),se(this,t+1,t+6),se(this,t+2,t+5),se(this,t+3,t+4);return this},s.prototype.toString=function(){let e=this.length;return e===0?``:arguments.length===0?ge(this,0,e):oe.apply(this,arguments)},s.prototype.toLocaleString=s.prototype.toString,s.prototype.equals=function(e){if(!s.isBuffer(e))throw TypeError(`Argument must be a Buffer`);return this===e||s.compare(this,e)===0},s.prototype.inspect=function(){let t=``,n=e.INSPECT_MAX_BYTES;return t=this.toString(`hex`,0,n).replace(/(.{2})/g,`$1 `).trim(),this.length>n&&(t+=` ... `),`<Buffer `+t+`>`},r&&(s.prototype[r]=s.prototype.inspect),s.prototype.compare=function(e,t,n,r,i){if(g(e,Uint8Array)&&(e=s.from(e,e.offset,e.byteLength)),!s.isBuffer(e))throw TypeError(`The "target" argument must be one of type Buffer or Uint8Array. Received type `+typeof e);if(t===void 0&&(t=0),n===void 0&&(n=e?e.length:0),r===void 0&&(r=0),i===void 0&&(i=this.length),t<0||n>e.length||r<0||i>this.length)throw RangeError(`out of range index`);if(r>=i&&t>=n)return 0;if(r>=i)return-1;if(t>=n)return 1;if(t>>>=0,n>>>=0,r>>>=0,i>>>=0,this===e)return 0;let a=i-r,o=n-t,c=Math.min(a,o),l=this.slice(r,i),u=e.slice(t,n);for(let e=0;e<c;++e)if(l[e]!==u[e]){a=l[e],o=u[e];break}return a<o?-1:+(o<a)};function ce(e,t,n,r,i){if(e.length===0)return-1;if(typeof n==`string`?(r=n,n=0):n>2147483647?n=2147483647:n<-2147483648&&(n=-2147483648),n=+n,He(n)&&(n=i?0:e.length-1),n<0&&(n=e.length+n),n>=e.length){if(i)return-1;n=e.length-1}else if(n<0)if(i)n=0;else return-1;if(typeof t==`string`&&(t=s.from(t,r)),s.isBuffer(t))return t.length===0?-1:le(e,t,n,r,i);if(typeof t==`number`)return t&=255,typeof Uint8Array.prototype.indexOf==`function`?i?Uint8Array.prototype.indexOf.call(e,t,n):Uint8Array.prototype.lastIndexOf.call(e,t,n):le(e,[t],n,r,i);throw TypeError(`val must be string, number or Buffer`)}function le(e,t,n,r,i){let a=1,o=e.length,s=t.length;if(r!==void 0&&(r=String(r).toLowerCase(),r===`ucs2`||r===`ucs-2`||r===`utf16le`||r===`utf-16le`)){if(e.length<2||t.length<2)return-1;a=2,o/=2,s/=2,n/=2}function c(e,t){return a===1?e[t]:e.readUInt16BE(t*a)}let l;if(i){let r=-1;for(l=n;l<o;l++)if(c(e,l)===c(t,r===-1?0:l-r)){if(r===-1&&(r=l),l-r+1===s)return r*a}else r!==-1&&(l-=l-r),r=-1}else for(n+s>o&&(n=o-s),l=n;l>=0;l--){let n=!0;for(let r=0;r<s;r++)if(c(e,l+r)!==c(t,r)){n=!1;break}if(n)return l}return-1}s.prototype.includes=function(e,t,n){return this.indexOf(e,t,n)!==-1},s.prototype.indexOf=function(e,t,n){return ce(this,e,t,n,!0)},s.prototype.lastIndexOf=function(e,t,n){return ce(this,e,t,n,!1)};function ue(e,t,n,r){n=Number(n)||0;let i=e.length-n;r?(r=Number(r),r>i&&(r=i)):r=i;let a=t.length;r>a/2&&(r=a/2);let o;for(o=0;o<r;++o){let r=parseInt(t.substr(o*2,2),16);if(He(r))return o;e[n+o]=r}return o}function de(e,t,n,r){return Ve(Le(t,e.length-n),e,n,r)}function fe(e,t,n,r){return Ve(Re(t),e,n,r)}function pe(e,t,n,r){return Ve(Be(t),e,n,r)}function me(e,t,n,r){return Ve(ze(t,e.length-n),e,n,r)}s.prototype.write=function(e,t,n,r){if(t===void 0)r=`utf8`,n=this.length,t=0;else if(n===void 0&&typeof t==`string`)r=t,n=this.length,t=0;else if(isFinite(t))t>>>=0,isFinite(n)?(n>>>=0,r===void 0&&(r=`utf8`)):(r=n,n=void 0);else throw Error(`Buffer.write(string, encoding, offset[, length]) is no longer supported`);let i=this.length-t;if((n===void 0||n>i)&&(n=i),e.length>0&&(n<0||t<0)||t>this.length)throw RangeError(`Attempt to write outside buffer bounds`);r||=`utf8`;let a=!1;for(;;)switch(r){case`hex`:return ue(this,e,t,n);case`utf8`:case`utf-8`:return de(this,e,t,n);case`ascii`:case`latin1`:case`binary`:return fe(this,e,t,n);case`base64`:return pe(this,e,t,n);case`ucs2`:case`ucs-2`:case`utf16le`:case`utf-16le`:return me(this,e,t,n);default:if(a)throw TypeError(`Unknown encoding: `+r);r=(``+r).toLowerCase(),a=!0}},s.prototype.toJSON=function(){return{type:`Buffer`,data:Array.prototype.slice.call(this._arr||this,0)}};function he(e,n,r){return n===0&&r===e.length?t.fromByteArray(e):t.fromByteArray(e.slice(n,r))}function ge(e,t,n){n=Math.min(e.length,n);let r=[],i=t;for(;i<n;){let t=e[i],a=null,o=t>239?4:t>223?3:t>191?2:1;if(i+o<=n){let n,r,s,c;switch(o){case 1:t<128&&(a=t);break;case 2:n=e[i+1],(n&192)==128&&(c=(t&31)<<6|n&63,c>127&&(a=c));break;case 3:n=e[i+1],r=e[i+2],(n&192)==128&&(r&192)==128&&(c=(t&15)<<12|(n&63)<<6|r&63,c>2047&&(c<55296||c>57343)&&(a=c));break;case 4:n=e[i+1],r=e[i+2],s=e[i+3],(n&192)==128&&(r&192)==128&&(s&192)==128&&(c=(t&15)<<18|(n&63)<<12|(r&63)<<6|s&63,c>65535&&c<1114112&&(a=c))}}a===null?(a=65533,o=1):a>65535&&(a-=65536,r.push(a>>>10&1023|55296),a=56320|a&1023),r.push(a),i+=o}return ve(r)}let _e=4096;function ve(e){let t=e.length;if(t<=_e)return String.fromCharCode.apply(String,e);let n=``,r=0;for(;r<t;)n+=String.fromCharCode.apply(String,e.slice(r,r+=_e));return n}function ye(e,t,n){let r=``;n=Math.min(e.length,n);for(let i=t;i<n;++i)r+=String.fromCharCode(e[i]&127);return r}function be(e,t,n){let r=``;n=Math.min(e.length,n);for(let i=t;i<n;++i)r+=String.fromCharCode(e[i]);return r}function xe(e,t,n){let r=e.length;(!t||t<0)&&(t=0),(!n||n<0||n>r)&&(n=r);let i=``;for(let r=t;r<n;++r)i+=Ue[e[r]];return i}function Se(e,t,n){let r=e.slice(t,n),i=``;for(let e=0;e<r.length-1;e+=2)i+=String.fromCharCode(r[e]+r[e+1]*256);return i}s.prototype.slice=function(e,t){let n=this.length;e=~~e,t=t===void 0?n:~~t,e<0?(e+=n,e<0&&(e=0)):e>n&&(e=n),t<0?(t+=n,t<0&&(t=0)):t>n&&(t=n),t<e&&(t=e);let r=this.subarray(e,t);return Object.setPrototypeOf(r,s.prototype),r};function m(e,t,n){if(e%1!=0||e<0)throw RangeError(`offset is not uint`);if(e+t>n)throw RangeError(`Trying to access beyond buffer length`)}s.prototype.readUintLE=s.prototype.readUIntLE=function(e,t,n){e>>>=0,t>>>=0,n||m(e,t,this.length);let r=this[e],i=1,a=0;for(;++a<t&&(i*=256);)r+=this[e+a]*i;return r},s.prototype.readUintBE=s.prototype.readUIntBE=function(e,t,n){e>>>=0,t>>>=0,n||m(e,t,this.length);let r=this[e+--t],i=1;for(;t>0&&(i*=256);)r+=this[e+--t]*i;return r},s.prototype.readUint8=s.prototype.readUInt8=function(e,t){return e>>>=0,t||m(e,1,this.length),this[e]},s.prototype.readUint16LE=s.prototype.readUInt16LE=function(e,t){return e>>>=0,t||m(e,2,this.length),this[e]|this[e+1]<<8},s.prototype.readUint16BE=s.prototype.readUInt16BE=function(e,t){return e>>>=0,t||m(e,2,this.length),this[e]<<8|this[e+1]},s.prototype.readUint32LE=s.prototype.readUInt32LE=function(e,t){return e>>>=0,t||m(e,4,this.length),(this[e]|this[e+1]<<8|this[e+2]<<16)+this[e+3]*16777216},s.prototype.readUint32BE=s.prototype.readUInt32BE=function(e,t){return e>>>=0,t||m(e,4,this.length),this[e]*16777216+(this[e+1]<<16|this[e+2]<<8|this[e+3])},s.prototype.readBigUInt64LE=We(function(e){e>>>=0,Ne(e,`offset`);let t=this[e],n=this[e+7];(t===void 0||n===void 0)&&Pe(e,this.length-8);let r=t+this[++e]*2**8+this[++e]*2**16+this[++e]*2**24,i=this[++e]+this[++e]*2**8+this[++e]*2**16+n*2**24;return BigInt(r)+(BigInt(i)<<BigInt(32))}),s.prototype.readBigUInt64BE=We(function(e){e>>>=0,Ne(e,`offset`);let t=this[e],n=this[e+7];(t===void 0||n===void 0)&&Pe(e,this.length-8);let r=t*2**24+this[++e]*2**16+this[++e]*2**8+this[++e],i=this[++e]*2**24+this[++e]*2**16+this[++e]*2**8+n;return(BigInt(r)<<BigInt(32))+BigInt(i)}),s.prototype.readIntLE=function(e,t,n){e>>>=0,t>>>=0,n||m(e,t,this.length);let r=this[e],i=1,a=0;for(;++a<t&&(i*=256);)r+=this[e+a]*i;return i*=128,r>=i&&(r-=2**(8*t)),r},s.prototype.readIntBE=function(e,t,n){e>>>=0,t>>>=0,n||m(e,t,this.length);let r=t,i=1,a=this[e+--r];for(;r>0&&(i*=256);)a+=this[e+--r]*i;return i*=128,a>=i&&(a-=2**(8*t)),a},s.prototype.readInt8=function(e,t){return e>>>=0,t||m(e,1,this.length),this[e]&128?(255-this[e]+1)*-1:this[e]},s.prototype.readInt16LE=function(e,t){e>>>=0,t||m(e,2,this.length);let n=this[e]|this[e+1]<<8;return n&32768?n|4294901760:n},s.prototype.readInt16BE=function(e,t){e>>>=0,t||m(e,2,this.length);let n=this[e+1]|this[e]<<8;return n&32768?n|4294901760:n},s.prototype.readInt32LE=function(e,t){return e>>>=0,t||m(e,4,this.length),this[e]|this[e+1]<<8|this[e+2]<<16|this[e+3]<<24},s.prototype.readInt32BE=function(e,t){return e>>>=0,t||m(e,4,this.length),this[e]<<24|this[e+1]<<16|this[e+2]<<8|this[e+3]},s.prototype.readBigInt64LE=We(function(e){e>>>=0,Ne(e,`offset`);let t=this[e],n=this[e+7];(t===void 0||n===void 0)&&Pe(e,this.length-8);let r=this[e+4]+this[e+5]*2**8+this[e+6]*2**16+(n<<24);return(BigInt(r)<<BigInt(32))+BigInt(t+this[++e]*2**8+this[++e]*2**16+this[++e]*2**24)}),s.prototype.readBigInt64BE=We(function(e){e>>>=0,Ne(e,`offset`);let t=this[e],n=this[e+7];(t===void 0||n===void 0)&&Pe(e,this.length-8);let r=(t<<24)+this[++e]*2**16+this[++e]*2**8+this[++e];return(BigInt(r)<<BigInt(32))+BigInt(this[++e]*2**24+this[++e]*2**16+this[++e]*2**8+n)}),s.prototype.readFloatLE=function(e,t){return e>>>=0,t||m(e,4,this.length),n.read(this,e,!0,23,4)},s.prototype.readFloatBE=function(e,t){return e>>>=0,t||m(e,4,this.length),n.read(this,e,!1,23,4)},s.prototype.readDoubleLE=function(e,t){return e>>>=0,t||m(e,8,this.length),n.read(this,e,!0,52,8)},s.prototype.readDoubleBE=function(e,t){return e>>>=0,t||m(e,8,this.length),n.read(this,e,!1,52,8)};function h(e,t,n,r,i,a){if(!s.isBuffer(e))throw TypeError(`"buffer" argument must be a Buffer instance`);if(t>i||t<a)throw RangeError(`"value" argument is out of bounds`);if(n+r>e.length)throw RangeError(`Index out of range`)}s.prototype.writeUintLE=s.prototype.writeUIntLE=function(e,t,n,r){if(e=+e,t>>>=0,n>>>=0,!r){let r=2**(8*n)-1;h(this,e,t,n,r,0)}let i=1,a=0;for(this[t]=e&255;++a<n&&(i*=256);)this[t+a]=e/i&255;return t+n},s.prototype.writeUintBE=s.prototype.writeUIntBE=function(e,t,n,r){if(e=+e,t>>>=0,n>>>=0,!r){let r=2**(8*n)-1;h(this,e,t,n,r,0)}let i=n-1,a=1;for(this[t+i]=e&255;--i>=0&&(a*=256);)this[t+i]=e/a&255;return t+n},s.prototype.writeUint8=s.prototype.writeUInt8=function(e,t,n){return e=+e,t>>>=0,n||h(this,e,t,1,255,0),this[t]=e&255,t+1},s.prototype.writeUint16LE=s.prototype.writeUInt16LE=function(e,t,n){return e=+e,t>>>=0,n||h(this,e,t,2,65535,0),this[t]=e&255,this[t+1]=e>>>8,t+2},s.prototype.writeUint16BE=s.prototype.writeUInt16BE=function(e,t,n){return e=+e,t>>>=0,n||h(this,e,t,2,65535,0),this[t]=e>>>8,this[t+1]=e&255,t+2},s.prototype.writeUint32LE=s.prototype.writeUInt32LE=function(e,t,n){return e=+e,t>>>=0,n||h(this,e,t,4,4294967295,0),this[t+3]=e>>>24,this[t+2]=e>>>16,this[t+1]=e>>>8,this[t]=e&255,t+4},s.prototype.writeUint32BE=s.prototype.writeUInt32BE=function(e,t,n){return e=+e,t>>>=0,n||h(this,e,t,4,4294967295,0),this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=e&255,t+4};function Ce(e,t,n,r,i){Me(t,r,i,e,n,7);let a=Number(t&BigInt(4294967295));e[n++]=a,a>>=8,e[n++]=a,a>>=8,e[n++]=a,a>>=8,e[n++]=a;let o=Number(t>>BigInt(32)&BigInt(4294967295));return e[n++]=o,o>>=8,e[n++]=o,o>>=8,e[n++]=o,o>>=8,e[n++]=o,n}function we(e,t,n,r,i){Me(t,r,i,e,n,7);let a=Number(t&BigInt(4294967295));e[n+7]=a,a>>=8,e[n+6]=a,a>>=8,e[n+5]=a,a>>=8,e[n+4]=a;let o=Number(t>>BigInt(32)&BigInt(4294967295));return e[n+3]=o,o>>=8,e[n+2]=o,o>>=8,e[n+1]=o,o>>=8,e[n]=o,n+8}s.prototype.writeBigUInt64LE=We(function(e,t=0){return Ce(this,e,t,BigInt(0),BigInt(`0xffffffffffffffff`))}),s.prototype.writeBigUInt64BE=We(function(e,t=0){return we(this,e,t,BigInt(0),BigInt(`0xffffffffffffffff`))}),s.prototype.writeIntLE=function(e,t,n,r){if(e=+e,t>>>=0,!r){let r=2**(8*n-1);h(this,e,t,n,r-1,-r)}let i=0,a=1,o=0;for(this[t]=e&255;++i<n&&(a*=256);)e<0&&o===0&&this[t+i-1]!==0&&(o=1),this[t+i]=(e/a>>0)-o&255;return t+n},s.prototype.writeIntBE=function(e,t,n,r){if(e=+e,t>>>=0,!r){let r=2**(8*n-1);h(this,e,t,n,r-1,-r)}let i=n-1,a=1,o=0;for(this[t+i]=e&255;--i>=0&&(a*=256);)e<0&&o===0&&this[t+i+1]!==0&&(o=1),this[t+i]=(e/a>>0)-o&255;return t+n},s.prototype.writeInt8=function(e,t,n){return e=+e,t>>>=0,n||h(this,e,t,1,127,-128),e<0&&(e=255+e+1),this[t]=e&255,t+1},s.prototype.writeInt16LE=function(e,t,n){return e=+e,t>>>=0,n||h(this,e,t,2,32767,-32768),this[t]=e&255,this[t+1]=e>>>8,t+2},s.prototype.writeInt16BE=function(e,t,n){return e=+e,t>>>=0,n||h(this,e,t,2,32767,-32768),this[t]=e>>>8,this[t+1]=e&255,t+2},s.prototype.writeInt32LE=function(e,t,n){return e=+e,t>>>=0,n||h(this,e,t,4,2147483647,-2147483648),this[t]=e&255,this[t+1]=e>>>8,this[t+2]=e>>>16,this[t+3]=e>>>24,t+4},s.prototype.writeInt32BE=function(e,t,n){return e=+e,t>>>=0,n||h(this,e,t,4,2147483647,-2147483648),e<0&&(e=4294967295+e+1),this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=e&255,t+4},s.prototype.writeBigInt64LE=We(function(e,t=0){return Ce(this,e,t,-BigInt(`0x8000000000000000`),BigInt(`0x7fffffffffffffff`))}),s.prototype.writeBigInt64BE=We(function(e,t=0){return we(this,e,t,-BigInt(`0x8000000000000000`),BigInt(`0x7fffffffffffffff`))});function Te(e,t,n,r,i,a){if(n+r>e.length||n<0)throw RangeError(`Index out of range`)}function Ee(e,t,r,i,a){return t=+t,r>>>=0,a||Te(e,t,r,4,34028234663852886e22,-34028234663852886e22),n.write(e,t,r,i,23,4),r+4}s.prototype.writeFloatLE=function(e,t,n){return Ee(this,e,t,!0,n)},s.prototype.writeFloatBE=function(e,t,n){return Ee(this,e,t,!1,n)};function De(e,t,r,i,a){return t=+t,r>>>=0,a||Te(e,t,r,8,17976931348623157e292,-17976931348623157e292),n.write(e,t,r,i,52,8),r+8}s.prototype.writeDoubleLE=function(e,t,n){return De(this,e,t,!0,n)},s.prototype.writeDoubleBE=function(e,t,n){return De(this,e,t,!1,n)},s.prototype.copy=function(e,t,n,r){if(!s.isBuffer(e))throw TypeError(`argument should be a Buffer`);if(n||=0,!r&&r!==0&&(r=this.length),t>=e.length&&(t=e.length),t||=0,r>0&&r<n&&(r=n),r===n||e.length===0||this.length===0)return 0;if(t<0)throw RangeError(`targetStart out of bounds`);if(n<0||n>=this.length)throw RangeError(`Index out of range`);if(r<0)throw RangeError(`sourceEnd out of bounds`);r>this.length&&(r=this.length),e.length-t<r-n&&(r=e.length-t+n);let i=r-n;return this===e&&typeof Uint8Array.prototype.copyWithin==`function`?this.copyWithin(t,n,r):Uint8Array.prototype.set.call(e,this.subarray(n,r),t),i},s.prototype.fill=function(e,t,n,r){if(typeof e==`string`){if(typeof t==`string`?(r=t,t=0,n=this.length):typeof n==`string`&&(r=n,n=this.length),r!==void 0&&typeof r!=`string`)throw TypeError(`encoding must be a string`);if(typeof r==`string`&&!s.isEncoding(r))throw TypeError(`Unknown encoding: `+r);if(e.length===1){let t=e.charCodeAt(0);(r===`utf8`&&t<128||r===`latin1`)&&(e=t)}}else typeof e==`number`?e&=255:typeof e==`boolean`&&(e=Number(e));if(t<0||this.length<t||this.length<n)throw RangeError(`Out of range index`);if(n<=t)return this;t>>>=0,n=n===void 0?this.length:n>>>0,e||=0;let i;if(typeof e==`number`)for(i=t;i<n;++i)this[i]=e;else{let a=s.isBuffer(e)?e:s.from(e,r),o=a.length;if(o===0)throw TypeError(`The value "`+e+`" is invalid for argument "value"`);for(i=0;i<n-t;++i)this[i+t]=a[i%o]}return this};let Oe={};function ke(e,t,n){Oe[e]=class extends n{constructor(){super(),Object.defineProperty(this,"message",{value:t.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${e}]`,this.stack,delete this.name}get code(){return e}set code(e){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:e,writable:!0})}toString(){return`${this.name} [${e}]: ${this.message}`}}}ke(`ERR_BUFFER_OUT_OF_BOUNDS`,function(e){return e?`${e} is outside of buffer bounds`:`Attempt to access memory outside buffer bounds`},RangeError),ke(`ERR_INVALID_ARG_TYPE`,function(e,t){return`The "${e}" argument must be of type number. Received type ${typeof t}`},TypeError),ke(`ERR_OUT_OF_RANGE`,function(e,t,n){let r=`The value of "${e}" is out of range.`,i=n;return Number.isInteger(n)&&Math.abs(n)>2**32?i=Ae(String(n)):typeof n==`bigint`&&(i=String(n),(n>BigInt(2)**BigInt(32)||n<-(BigInt(2)**BigInt(32)))&&(i=Ae(i)),i+=`n`),r+=` It must be ${t}. Received ${i}`,r},RangeError);function Ae(e){let t=``,n=e.length,r=+(e[0]===`-`);for(;n>=r+4;n-=3)t=`_${e.slice(n-3,n)}${t}`;return`${e.slice(0,n)}${t}`}function je(e,t,n){Ne(t,`offset`),(e[t]===void 0||e[t+n]===void 0)&&Pe(t,e.length-(n+1))}function Me(e,t,n,r,i,a){if(e>n||e<t){let r=typeof t==`bigint`?`n`:``,i;throw i=a>3?t===0||t===BigInt(0)?`>= 0${r} and < 2${r} ** ${(a+1)*8}${r}`:`>= -(2${r} ** ${(a+1)*8-1}${r}) and < 2 ** ${(a+1)*8-1}${r}`:`>= ${t}${r} and <= ${n}${r}`,new Oe.ERR_OUT_OF_RANGE(`value`,i,e)}je(r,i,a)}function Ne(e,t){if(typeof e!=`number`)throw new Oe.ERR_INVALID_ARG_TYPE(t,`number`,e)}function Pe(e,t,n){throw Math.floor(e)===e?t<0?new Oe.ERR_BUFFER_OUT_OF_BOUNDS:new Oe.ERR_OUT_OF_RANGE(n||`offset`,`>= ${+!!n} and <= ${t}`,e):(Ne(e,n),new Oe.ERR_OUT_OF_RANGE(n||`offset`,`an integer`,e))}let Fe=/[^+/0-9A-Za-z-_]/g;function Ie(e){if(e=e.split(`=`)[0],e=e.trim().replace(Fe,``),e.length<2)return``;for(;e.length%4!=0;)e+=`=`;return e}function Le(e,t){t||=1/0;let n,r=e.length,i=null,a=[];for(let o=0;o<r;++o){if(n=e.charCodeAt(o),n>55295&&n<57344){if(!i){if(n>56319){(t-=3)>-1&&a.push(239,191,189);continue}else if(o+1===r){(t-=3)>-1&&a.push(239,191,189);continue}i=n;continue}if(n<56320){(t-=3)>-1&&a.push(239,191,189),i=n;continue}n=(i-55296<<10|n-56320)+65536}else i&&(t-=3)>-1&&a.push(239,191,189);if(i=null,n<128){if(--t<0)break;a.push(n)}else if(n<2048){if((t-=2)<0)break;a.push(n>>6|192,n&63|128)}else if(n<65536){if((t-=3)<0)break;a.push(n>>12|224,n>>6&63|128,n&63|128)}else if(n<1114112){if((t-=4)<0)break;a.push(n>>18|240,n>>12&63|128,n>>6&63|128,n&63|128)}else throw Error(`Invalid code point`)}return a}function Re(e){let t=[];for(let n=0;n<e.length;++n)t.push(e.charCodeAt(n)&255);return t}function ze(e,t){let n,r,i,a=[];for(let o=0;o<e.length&&!((t-=2)<0);++o)n=e.charCodeAt(o),r=n>>8,i=n%256,a.push(i),a.push(r);return a}function Be(e){return t.toByteArray(Ie(e))}function Ve(e,t,n,r){let i;for(i=0;i<r&&!(i+n>=t.length||i>=e.length);++i)t[i+n]=e[i];return i}function g(e,t){return e instanceof t||e!=null&&e.constructor!=null&&e.constructor.name!=null&&e.constructor.name===t.name}function He(e){return e!==e}let Ue=(function(){let e=`0123456789abcdef`,t=Array(256);for(let n=0;n<16;++n){let r=n*16;for(let i=0;i<16;++i)t[r+i]=e[n]+e[i]}return t})();function We(e){return typeof BigInt>`u`?Ge:e}function Ge(){throw Error(`BigInt not supported`)}}))();let yn=Array(256),bn={},S=(e,t,n,r)=>{console.assert(!yn[n],`Duplicate instruction: `+e+` mode=`+t),yn[n]={name:e,mode:t,bytes:r},bn[e]||(bn[e]=[]),bn[e][t]=n};S(`ADC`,s.IMM,105,2),S(`ADC`,s.ZP_REL,101,2),S(`ADC`,s.ZP_X,117,2),S(`ADC`,s.ABS,109,3),S(`ADC`,s.ABS_X,125,3),S(`ADC`,s.ABS_Y,121,3),S(`ADC`,s.IND_X,97,2),S(`ADC`,s.IND_Y,113,2),S(`ADC`,s.IND,114,2),S(`AND`,s.IMM,41,2),S(`AND`,s.ZP_REL,37,2),S(`AND`,s.ZP_X,53,2),S(`AND`,s.ABS,45,3),S(`AND`,s.ABS_X,61,3),S(`AND`,s.ABS_Y,57,3),S(`AND`,s.IND_X,33,2),S(`AND`,s.IND_Y,49,2),S(`AND`,s.IND,50,2),S(`ASL`,s.IMPLIED,10,1),S(`ASL`,s.ZP_REL,6,2),S(`ASL`,s.ZP_X,22,2),S(`ASL`,s.ABS,14,3),S(`ASL`,s.ABS_X,30,3),S(`BCC`,s.ZP_REL,144,2),S(`BCS`,s.ZP_REL,176,2),S(`BEQ`,s.ZP_REL,240,2),S(`BIT`,s.ZP_REL,36,2),S(`BIT`,s.ABS,44,3),S(`BIT`,s.IMM,137,2),S(`BIT`,s.ZP_X,52,2),S(`BIT`,s.ABS_X,60,3),S(`BMI`,s.ZP_REL,48,2),S(`BNE`,s.ZP_REL,208,2),S(`BPL`,s.ZP_REL,16,2),S(`BVC`,s.ZP_REL,80,2),S(`BVS`,s.ZP_REL,112,2),S(`BRA`,s.ZP_REL,128,2),S(`BRK`,s.IMPLIED,0,1),S(`CLC`,s.IMPLIED,24,1),S(`CLD`,s.IMPLIED,216,1),S(`CLI`,s.IMPLIED,88,1),S(`CLV`,s.IMPLIED,184,1),S(`CMP`,s.IMM,201,2),S(`CMP`,s.ZP_REL,197,2),S(`CMP`,s.ZP_X,213,2),S(`CMP`,s.ABS,205,3),S(`CMP`,s.ABS_X,221,3),S(`CMP`,s.ABS_Y,217,3),S(`CMP`,s.IND_X,193,2),S(`CMP`,s.IND_Y,209,2),S(`CMP`,s.IND,210,2),S(`CPX`,s.IMM,224,2),S(`CPX`,s.ZP_REL,228,2),S(`CPX`,s.ABS,236,3),S(`CPY`,s.IMM,192,2),S(`CPY`,s.ZP_REL,196,2),S(`CPY`,s.ABS,204,3),S(`DEC`,s.IMPLIED,58,1),S(`DEC`,s.ZP_REL,198,2),S(`DEC`,s.ZP_X,214,2),S(`DEC`,s.ABS,206,3),S(`DEC`,s.ABS_X,222,3),S(`DEX`,s.IMPLIED,202,1),S(`DEY`,s.IMPLIED,136,1),S(`EOR`,s.IMM,73,2),S(`EOR`,s.ZP_REL,69,2),S(`EOR`,s.ZP_X,85,2),S(`EOR`,s.ABS,77,3),S(`EOR`,s.ABS_X,93,3),S(`EOR`,s.ABS_Y,89,3),S(`EOR`,s.IND_X,65,2),S(`EOR`,s.IND_Y,81,2),S(`EOR`,s.IND,82,2),S(`INC`,s.IMPLIED,26,1),S(`INC`,s.ZP_REL,230,2),S(`INC`,s.ZP_X,246,2),S(`INC`,s.ABS,238,3),S(`INC`,s.ABS_X,254,3),S(`INX`,s.IMPLIED,232,1),S(`INY`,s.IMPLIED,200,1),S(`JMP`,s.ABS,76,3),S(`JMP`,s.IND,108,3),S(`JMP`,s.IND_X,124,3),S(`JSR`,s.ABS,32,3),S(`LDA`,s.IMM,169,2),S(`LDA`,s.ZP_REL,165,2),S(`LDA`,s.ZP_X,181,2),S(`LDA`,s.ABS,173,3),S(`LDA`,s.ABS_X,189,3),S(`LDA`,s.ABS_Y,185,3),S(`LDA`,s.IND_X,161,2),S(`LDA`,s.IND_Y,177,2),S(`LDA`,s.IND,178,2),S(`LDX`,s.IMM,162,2),S(`LDX`,s.ZP_REL,166,2),S(`LDX`,s.ZP_Y,182,2),S(`LDX`,s.ABS,174,3),S(`LDX`,s.ABS_Y,190,3),S(`LDY`,s.IMM,160,2),S(`LDY`,s.ZP_REL,164,2),S(`LDY`,s.ZP_X,180,2),S(`LDY`,s.ABS,172,3),S(`LDY`,s.ABS_X,188,3),S(`LSR`,s.IMPLIED,74,1),S(`LSR`,s.ZP_REL,70,2),S(`LSR`,s.ZP_X,86,2),S(`LSR`,s.ABS,78,3),S(`LSR`,s.ABS_X,94,3),S(`NOP`,s.IMPLIED,234,1),S(`ORA`,s.IMM,9,2),S(`ORA`,s.ZP_REL,5,2),S(`ORA`,s.ZP_X,21,2),S(`ORA`,s.ABS,13,3),S(`ORA`,s.ABS_X,29,3),S(`ORA`,s.ABS_Y,25,3),S(`ORA`,s.IND_X,1,2),S(`ORA`,s.IND_Y,17,2),S(`ORA`,s.IND,18,2),S(`PHA`,s.IMPLIED,72,1),S(`PHP`,s.IMPLIED,8,1),S(`PHX`,s.IMPLIED,218,1),S(`PHY`,s.IMPLIED,90,1),S(`PLA`,s.IMPLIED,104,1),S(`PLP`,s.IMPLIED,40,1),S(`PLX`,s.IMPLIED,250,1),S(`PLY`,s.IMPLIED,122,1),S(`ROL`,s.IMPLIED,42,1),S(`ROL`,s.ZP_REL,38,2),S(`ROL`,s.ZP_X,54,2),S(`ROL`,s.ABS,46,3),S(`ROL`,s.ABS_X,62,3),S(`ROR`,s.IMPLIED,106,1),S(`ROR`,s.ZP_REL,102,2),S(`ROR`,s.ZP_X,118,2),S(`ROR`,s.ABS,110,3),S(`ROR`,s.ABS_X,126,3),S(`RTI`,s.IMPLIED,64,1),S(`RTS`,s.IMPLIED,96,1),S(`SBC`,s.IMM,233,2),S(`SBC`,s.ZP_REL,229,2),S(`SBC`,s.ZP_X,245,2),S(`SBC`,s.ABS,237,3),S(`SBC`,s.ABS_X,253,3),S(`SBC`,s.ABS_Y,249,3),S(`SBC`,s.IND_X,225,2),S(`SBC`,s.IND_Y,241,2),S(`SBC`,s.IND,242,2),S(`SEC`,s.IMPLIED,56,1),S(`SED`,s.IMPLIED,248,1),S(`SEI`,s.IMPLIED,120,1),S(`STA`,s.ZP_REL,133,2),S(`STA`,s.ZP_X,149,2),S(`STA`,s.ABS,141,3),S(`STA`,s.ABS_X,157,3),S(`STA`,s.ABS_Y,153,3),S(`STA`,s.IND_X,129,2),S(`STA`,s.IND_Y,145,2),S(`STA`,s.IND,146,2),S(`STX`,s.ZP_REL,134,2),S(`STX`,s.ZP_Y,150,2),S(`STX`,s.ABS,142,3),S(`STY`,s.ZP_REL,132,2),S(`STY`,s.ZP_X,148,2),S(`STY`,s.ABS,140,3),S(`STZ`,s.ZP_REL,100,2),S(`STZ`,s.ZP_X,116,2),S(`STZ`,s.ABS,156,3),S(`STZ`,s.ABS_X,158,3),S(`TAX`,s.IMPLIED,170,1),S(`TAY`,s.IMPLIED,168,1),S(`TSX`,s.IMPLIED,186,1),S(`TXA`,s.IMPLIED,138,1),S(`TXS`,s.IMPLIED,154,1),S(`TYA`,s.IMPLIED,152,1),S(`TRB`,s.ZP_REL,20,2),S(`TRB`,s.ABS,28,3),S(`TSB`,s.ZP_REL,4,2),S(`TSB`,s.ABS,12,3),Object.keys(bn);let xn=()=>{let e={register:``,address:768,operator:`==`,value:128},t={action:``,register:`A`,address:768,value:0};return{address:-1,watchpoint:!1,instruction:!1,disabled:!1,hidden:!1,once:!1,memget:!1,memset:!0,expression1:{...e},expression2:{...e},expressionOperator:``,hexvalue:-1,hitcount:1,nhits:0,memoryBank:``,action1:{...t},action2:{...t},halt:!1,basic:!1}};var Sn=class extends Map{set(e,t){let n=[...this.entries()];n.push([e,t]),n.sort((e,t)=>e[0]-t[0]),super.clear();for(let[e,t]of n)super.set(e,t);return this}};let C={};C[``]={name:`Any`,min:0,max:65535},C.MAIN={name:`Main RAM ($0 - $FFFF)`,min:0,max:65535},C.AUX={name:`Auxiliary RAM ($0 - $FFFF)`,min:0,max:65535},C.ROM={name:`ROM ($D000 - $FFFF)`,min:53248,max:65535},C[`MAIN-DXXX-1`]={name:`Main D000 Bank 1 ($D000 - $DFFF)`,min:53248,max:57343},C[`MAIN-DXXX-2`]={name:`Main D000 Bank 2 ($D000 - $DFFF)`,min:53248,max:57343},C[`AUX-DXXX-1`]={name:`Aux D000 Bank 1 ($D000 - $DFFF)`,min:53248,max:57343},C[`AUX-DXXX-2`]={name:`Aux D000 Bank 2 ($D000 - $DFFF)`,min:53248,max:57343},C[`CXXX-ROM`]={name:`Internal ROM ($C100 - $CFFF)`,min:49408,max:53247},C[`CXXX-CARD`]={name:`Peripheral Card ROM ($C100 - $CFFF)`,min:49408,max:53247},Object.keys(C),Object.values(C).map(e=>e.name);let Cn=(e,t)=>e+2+(t>127?t-256:t),wn=(e,t)=>{if(t<0)return!1;let n=!1;switch(e){case`BCS`:n=(t&1)!=0;break;case`BCC`:n=(t&1)==0;break;case`BEQ`:n=(t&2)!=0;break;case`BNE`:n=(t&2)==0;break;case`BMI`:n=(t&128)!=0;break;case`BPL`:n=(t&128)==0;break;case`BVS`:n=(t&64)!=0;break;case`BVC`:n=(t&64)==0;break;case`BRA`:n=!0;break}return n},Tn=(e,t,n,r,i)=>{if(e>>8==192){let n=`---`;return e>=49168&&e<=49183&&(n=t.pcode>=128?`ON`:`OFF`),`${u(e,4)}: ${u(t.pcode)}        ${n}`}let a=``,o=`${u(t.pcode)}`,c=``,d=``;switch(t.bytes){case 1:o+=`      `;break;case 2:c=u(n),o+=` ${c}   `;break;case 3:c=u(n),d=u(r),o+=` ${c} ${d}`;break}let f=``;i>=0&&l(t.name)&&(f=wn(t.name,i)?`  ✓`:`  ✗`);let p=l(t.name)?u(Cn(e,n),4):c;switch(t.mode){case s.IMPLIED:break;case s.IMM:a=` #$${c}`;break;case s.ZP_REL:a=` $${p}`;break;case s.ZP_X:a=` $${c},X`;break;case s.ZP_Y:a=` $${c},Y`;break;case s.ABS:a=` $${d}${c}`;break;case s.ABS_X:a=` $${d}${c},X`;break;case s.ABS_Y:a=` $${d}${c},Y`;break;case s.IND_X:a=` ($${d.trim()}${c},X)`;break;case s.IND_Y:a=` ($${c}),Y`;break;case s.IND:a=` ($${d.trim()}${c})`;break}return`${u(e,4)}: ${o}  ${t.name}${a}${f}`},En={numLines:1e4,collapseLoops:!0,ignoreRegisters:!1},Dn=!1,On=!1,w=new Sn,kn=!1,An=()=>{Dn=!0},jn=()=>{new Sn(w).forEach((e,t)=>{e.once&&w.delete(t)});let e=di();if(e<0||w.get(e))return;let t=xn();t.address=e,t.once=!0,t.hidden=!0,w.set(e,t)},Mn=()=>{new Sn(w).forEach((e,t)=>{e.once&&w.delete(t)});let e=55301,t=xn();t.address=e,t.once=!0,t.hidden=!0,w.set(e,t)},Nn=e=>{w=e},Pn=!1,Fn=()=>{Pn=!0,C.MAIN.enabled=(e=0)=>e>=53248?!x.ALTZP.isSet&&x.BSRREADRAM.isSet:e>=512?!x.RAMRD.isSet:!x.ALTZP.isSet,C.AUX.enabled=(e=0)=>e>=53248?x.ALTZP.isSet&&x.BSRREADRAM.isSet:e>=512?x.RAMRD.isSet:x.ALTZP.isSet,C.ROM.enabled=()=>!x.BSRREADRAM.isSet,C[`MAIN-DXXX-1`].enabled=()=>!x.ALTZP.isSet&&x.BSRREADRAM.isSet&&!x.BSRBANK2.isSet,C[`MAIN-DXXX-2`].enabled=()=>!x.ALTZP.isSet&&x.BSRREADRAM.isSet&&x.BSRBANK2.isSet,C[`AUX-DXXX-1`].enabled=()=>x.ALTZP.isSet&&x.BSRREADRAM.isSet&&!x.BSRBANK2.isSet,C[`AUX-DXXX-2`].enabled=()=>x.ALTZP.isSet&&x.BSRREADRAM.isSet&&x.BSRBANK2.isSet,C[`CXXX-ROM`].enabled=(e=0)=>e>=49920&&e<=50175?x.INTCXROM.isSet||!x.SLOTC3ROM.isSet:e>=51200?x.INTCXROM.isSet||x.INTC8ROM.isSet:x.INTCXROM.isSet,C[`CXXX-CARD`].enabled=(e=0)=>e>=49920&&e<=50175?!x.INTCXROM.isSet&&x.SLOTC3ROM.isSet:e>=51200?!x.INTCXROM.isSet&&!x.INTC8ROM.isSet:!x.INTCXROM.isSet},In=(e,t)=>{Pn||Fn();let n=C[e];return!(t<n.min||t>n.max||n.enabled&&!n?.enabled(t))},Ln=(e,t,n)=>{let r=w.get(e);return!r||!r.watchpoint||r.disabled||r.hexvalue>=0&&r.hexvalue!==t||r.memoryBank&&!In(r.memoryBank,e)?!1:n?r.memset:r.memget},Rn=(e=0,t=!0)=>{t?N.flagIRQ|=1<<e:N.flagIRQ&=~(1<<e),N.flagIRQ&=255},zn=(e=!0)=>{N.flagNMI=e===!0},Bn=()=>{N.flagIRQ=0,N.flagNMI=!1},Vn=[],Hn=[],Un=(e,t)=>{Vn.push(e),Hn.push(t)},Wn=()=>{for(let e=0;e<Vn.length;e++)Vn[e](Hn[e])},Gn=e=>{let t=0;switch(e.register){case`$`:t=jr(e.address);break;case`A`:t=N.Accum;break;case`X`:t=N.XReg;break;case`Y`:t=N.YReg;break;case`S`:t=N.StackPtr;break;case`P`:t=N.PStatus;break;case`C`:t=N.PC;break}switch(e.operator){case`==`:return t===e.value;case`!=`:return t!==e.value;case`<`:return t<e.value;case`<=`:return t<=e.value;case`>`:return t>e.value;case`>=`:return t>=e.value}},Kn=e=>{let t=Gn(e.expression1);return e.expressionOperator===``?t:e.expressionOperator===`&&`&&!t?!1:e.expressionOperator===`||`&&t?!0:Gn(e.expression2)},qn=()=>{On=!0},Jn=(e,t,n)=>{let r=Tn(N.PC,{...n},e,t,N.PStatus)+`          `,i=`${(`0000000000`+N.cycleCount.toString()).slice(-10)}  ${r.slice(0,29)}  ${oi()}`;console.log(i)},Yn=(e,t,n,r)=>{if(e.action===``)return!1;let i=e.value&255,a=e.address&65535;switch(e.action){case`set`:switch(e.register){case`A`:N.Accum=i;break;case`X`:N.XReg=i;break;case`Y`:N.YReg=i;break;case`S`:N.StackPtr=i;break;case`P`:N.PStatus=i;break;case`C`:N.PC=e.value&65535;break}break;case`jump`:N.PC=a;break;case`print`:Jn(t,n,r);break;case`snapshot`:zl();break}return!0},Xn=(e,t,n,r)=>{let i=Yn(e.action1,t,n,r),a=Yn(e.action2,t,n,r);return i||a?e.halt?1:2:e.hidden?3:1},Zn=(e=-1,t=0,n=0,r=null)=>{if(On)return On=!1,1;if(w.size===0||Dn)return 0;if(N.PC===55301){let e=k(117)+(k(118)<<8),t=w.get(e);if(t&&!t.disabled)return 3}let i=w.get(N.PC)||w.get(-1)||w.get(e|65536)||e>=0&&w.get(65792)||e>=0&&w.get(66048);if(!i||i.disabled||i.watchpoint)return 0;if(i.instruction){let r=(n<<8)+t;if(i.address===65792){if(V[e].name!==`???`)return 0}else if(i.address===66048){if(V[e].is6502)return 0}else if(r>=0&&i.hexvalue>=0&&i.hexvalue!==r)return 0}if(i.expression1.register!==``&&!Kn(i))return 0;if(i.hitcount>1){if(i.nhits++,i.nhits<i.hitcount)return 0;i.nhits=0}return i.memoryBank&&!In(i.memoryBank,N.PC)?0:(i.once&&w.delete(N.PC),Xn(i,t,n,r))},Qn=(e=null)=>{let t=0,n=N.PC,i=k(N.PC,!1),a=V[i],o=a.bytes>1?k(N.PC+1,!1):-1,s=a.bytes>2?k(N.PC+2,!1):0;if(!Ml()){let e=Zn(i,o,s,a);if(e===1||e===3)return Wl(r.PAUSED,e!==3),-1;if(e===2)return N.PC===n&&(Dn=!0),0;Dn=!1}let c=Sr.get(n);if(c&&(!x.INTCXROM.isSet||(n&61440)!=49152)&&c(),t=a.execute(o,s),e&&(n<64680||n>64691)){let t=Tn(n,a,o,s,N.PStatus)+`          `,r=`${(`00000000`+N.cycleCount.toString()).slice(-8)}  ${t.slice(0,29)}  ${oi()}`,i=r.indexOf(`JMP`);if(i===-1&&(i=r.indexOf(`RTS`)),i!==-1){let e=r.slice(i,i+15);e=e.replaceAll(` `,`_`),r=r.slice(0,i)+e+r.slice(i+15)}e(r)}if(ni(a.bytes),$r(N.cycleCount+t),Wn(),N.flagNMI&&(N.flagNMI=!1,t=Ri(),$r(N.cycleCount+t)),N.flagIRQ){let e=Li();e>0&&($r(N.cycleCount+e),t=e)}return kn&&a.pcode===96?(kn=!1,Wl(r.PAUSED),-1):t},$n=[197,58,163,92,197,58,163,92],er=new class{constructor(){this.bits=[],this.pattern=Array(64),this.patternIdx=0,this.reset=()=>{this.patternIdx=0},this.checkPattern=e=>e===($n[Math.floor(this.patternIdx/8)]>>this.patternIdx%8&1),this.calcBits=()=>{let e=e=>{this.bits.push(e&8?1:0),this.bits.push(e&4?1:0),this.bits.push(e&2?1:0),this.bits.push(e&1?1:0)},t=t=>{e(Math.floor(t/10)),e(Math.floor(t%10))},n=new Date,r=n.getFullYear()%100,i=n.getDate(),a=n.getDay()+1,o=n.getMonth()+1,s=n.getHours(),c=n.getMinutes(),l=n.getSeconds(),u=n.getMilliseconds()/10;this.bits=[],t(r),t(o),t(i),t(a),t(s),t(c),t(l),t(u)},this.access=e=>{e&4?this.reset():this.checkPattern(e&1)?(this.patternIdx++,this.patternIdx===64&&this.calcBits()):this.reset()},this.read=e=>{let t=-1;return this.bits.length>0?e&4&&(t=this.bits.pop()):this.access(e),t}}},tr=256*320,nr=0,rr=n,T=new Uint8Array(rr+(nr+1)*65536).fill(0),ir=new Uint8Array(8).fill(0),ar=()=>j(49194),or=e=>{M(49194,e)},sr=()=>j(49267),cr=e=>{M(49267,e)},E=Array(257).fill(0),lr=Array(257).fill(0),ur=`APPLE2EE`,dr=()=>ur,fr=e=>{ur=e;let n=``;switch(e){case`APPLE2P`:n=`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
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
g39dzLX8Fxf1A/sDYvr6ww==`;break}let r=n.replace(/\n/g,``),i=new Uint8Array(vn.Buffer.from(r,`base64`));i[15035]=5,T.set(i,t)},pr=e=>{e=Math.max(64,Math.min(8192,e));let t=nr;if(nr=Math.floor(e/64)-1,nr===t)return;sr()>nr&&(cr(0),xr());let n=rr+(nr+1)*65536;if(nr<t)T=T.slice(0,n);else{let e=T;T=new Uint8Array(n).fill(255),T.set(e)}},mr=()=>{let e=x.RAMRD.isSet?383+sr()*256:0,t=x.RAMWRT.isSet?383+sr()*256:0,n=x.PAGE2.isSet?383+sr()*256:0,r=x.STORE80.isSet?n:e,i=x.STORE80.isSet?n:t,a=x.STORE80.isSet&&x.HIRES.isSet?n:e,o=x.STORE80.isSet&&x.HIRES.isSet?n:t;for(let n=2;n<256;n++)E[n]=n+e,lr[n]=n+t;for(let e=4;e<=7;e++)E[e]=e+r,lr[e]=e+i;for(let e=32;e<=63;e++)E[e]=e+a,lr[e]=e+o},hr=()=>{let e=x.ALTZP.isSet?383+sr()*256:0;if(E[0]=e,E[1]=1+e,lr[0]=e,lr[1]=1+e,x.BSRREADRAM.isSet){for(let t=208;t<=255;t++)E[t]=t+e;if(!x.BSRBANK2.isSet)for(let t=208;t<=223;t++)E[t]=t-16+e}else for(let e=208;e<=255;e++)E[e]=256+e-192},gr=()=>{let e=x.ALTZP.isSet?383+sr()*256:0,t=x.BSR_WRITE.isSet;for(let e=192;e<=255;e++)lr[e]=-1;if(t){for(let t=208;t<=255;t++)lr[t]=t+e;if(!x.BSRBANK2.isSet)for(let t=208;t<=223;t++)lr[t]=t-16+e}},_r=e=>x.INTCXROM.isSet?!1:e!==3||x.SLOTC3ROM.isSet,vr=()=>!!(x.INTCXROM.isSet||x.INTC8ROM.isSet),yr=e=>{if(e<=7){if(x.INTCXROM.isSet)return;e===3&&!x.SLOTC3ROM.isSet&&(x.INTC8ROM.isSet||(x.INTC8ROM.isSet=!0,or(255),xr())),ar()===0&&wr[e]&&(or(e),xr())}else x.INTC8ROM.isSet=!1,or(0),xr()},br=()=>{E[192]=64;for(let e=1;e<=7;e++){let t=192+e;E[t]=e+(_r(e)?319:256)}if(vr())for(let e=200;e<=207;e++)E[e]=256+e-192;else{let e=327+8*(ar()-1);for(let t=0;t<=7;t++){let n=200+t;E[n]=e+t}}},xr=()=>{mr(),hr(),gr(),br();for(let e=0;e<256;e++)E[e]=256*E[e],lr[e]=256*lr[e]},Sr=new Map,Cr=Array(8),wr=new Uint8Array(8),Tr=(e,n=-1)=>{let r=e>>8==192?e-49280>>4:(e>>8)-192;if(e>=49408&&(yr(r),!_r(r)))return;let i=Cr[r];if(i!==void 0){let r=i(e,n);if(r>=0){let n=e>=49408?tr-256:t;T[e-49152+n]=r}}},Er=(e,t)=>{ir[e]=1,Cr[e]=t},Dr=(e,t,n=0,r=()=>{})=>{if(T.set(t.slice(0,256),tr+(e-1)*256),ir[e]=+!!t.some(e=>e!==0),t.length>256){let n=t.length>2304?2304:t.length,r=83712+(e-1)*2048;T.set(t.slice(256,n),r),wr[e]=255}n&&Sr.set(n,r)},Or=()=>{T.fill(255,0,65536),T.fill(255,rr),or(0),cr(0),xr()},kr=e=>(e>=49296?Tr(e):cn(e,!1,N.cycleCount),e>=49232&&xr(),T[t+e-49152]),D=(e,t)=>{let n=tr+(e-1)*256+(t&255);return T[n]},O=(e,t,n)=>{if(n>=0){let r=tr+(e-1)*256+(t&255);T[r]=n&255}},Ar=(e,t,n,r=-1)=>{if(_r(e)&&(t-49280>>4===e||(t>>8)-192===e)){let e=`$${N.PC.toString(16)}: $${t.toString(16)} (${n})`;r>=0&&(e+=` = $${r.toString(16)}`),console.log(e)}},k=(e,t=!0)=>{let n=0,r=e>>>8;if(r===192)n=kr(e);else if(n=-1,r>=193&&r<=199?(r==195&&(x.INTCXROM.isSet||!x.SLOTC3ROM.isSet)?n=er.read(e):_r(r-192)&&!ir[r-192]&&(n=Math.floor(256*Math.random())),Tr(e)):e===53247&&yr(255),n<0){let t=E[r];n=T[t+(e&255)]}return t&&Ln(e,n,!1)&&qn(),n},jr=e=>{let t=e>>>8,n=E[t];return T[n+(e&255)]},Mr=(e,t)=>{if(e===49265||e===49267){if(t>nr)return;cr(t)}else e>=49296?Tr(e,t):cn(e,!0,N.cycleCount);(e<=49167||e>=49232)&&xr()},A=(e,t)=>{let n=e>>>8;if(n===192)Mr(e,t);else{n>=193&&n<=199?Tr(e,t):e===53247&&yr(255);let r=lr[n];if(r<0)return;T[r+(e&255)]=t}Ln(e,t,!0)&&qn()},j=e=>T[t+e-49152],M=(e,n,r=1)=>{let i=t+e-49152;T.fill(n,i,i+r)},Nr=1024,Pr=2048,Fr=[0,128,256,384,512,640,768,896,40,168,296,424,552,680,808,936,80,208,336,464,592,720,848,976],Ir=(e=!1)=>{let t=0,r=24,i=!1;if(e){if(x.TEXT.isSet||x.HIRES.isSet)return new Uint8Array;r=x.MIXED.isSet?20:24,i=x.COLUMN80.isSet&&x.DHIRES.isSet}else{if(!x.TEXT.isSet&&!x.MIXED.isSet)return new Uint8Array;!x.TEXT.isSet&&x.MIXED.isSet&&(t=20),i=x.COLUMN80.isSet}if(i){let e=x.PAGE2.isSet&&!x.STORE80.isSet?Pr:Nr,i=new Uint8Array(80*(r-t)).fill(160);for(let a=t;a<r;a++){let r=80*(a-t);for(let t=0;t<40;t++)i[r+2*t+1]=T[e+Fr[a]+t],i[r+2*t]=T[n+e+Fr[a]+t]}return i}if(x.DHIRES.isSet&&!x.COLUMN80.isSet&&x.STORE80.isSet){let e=new Uint8Array(80*(r-t));for(let i=t;i<r;i++){let r=80*(i-t),a=Nr+Fr[i];e.set(T.slice(a,a+40),r),a+=n,e.set(T.slice(a,a+40),r+40)}return e}let a=x.PAGE2.isSet&&!x.STORE80.isSet?Pr:Nr,o=new Uint8Array(40*(r-t));for(let e=t;e<r;e++){let n=40*(e-t),r=a+Fr[e];o.set(T.slice(r,r+40),n)}return o},Lr=()=>vn.Buffer.from(Ir().map(e=>e&=127)).toString(),Rr=new Uint8Array(7680),zr=new Uint8Array(15360),Br=Rr,Vr=192,Hr=e=>{let t=x.DHIRES.isSet&&x.COLUMN80.isSet,r=x.DHIRES.isSet&&!x.COLUMN80.isSet&&x.STORE80.isSet;if(t||x.VIDEO7_MONO.isSet||x.VIDEO7_160.isSet||r){e===0&&(Br=zr,Vr=x.MIXED.isSet?160:192);let t=ie(x.PAGE2.isSet&&!x.STORE80.isSet?16384:8192,e);for(let r=0;r<40;r++)zr[e*80+2*r+1]=T[t+r],zr[e*80+2*r]=T[n+t+r]}else{e===0&&(Br=Rr,Vr=x.MIXED.isSet?160:192);let t=(x.PAGE2.isSet?16384:8192)+40*Math.trunc(e/64)+e%8*1024+128*(Math.trunc(e/8)&7);Rr.set(T.slice(t,t+40),e*40)}},Ur=()=>x.TEXT.isSet||!x.HIRES.isSet?new Uint8Array:Vr===192?Br:Br.slice(0,40*Vr),Wr=e=>{let t=E[e>>>8]+(e&255);return T.slice(t,t+512)},Gr=(e,t)=>{let n=lr[e>>>8]+(e&255);T.set(t,n)},Kr=(e,t)=>{for(let n=0;n<t.length;n++)if(k(e+n,!1)!==t[n])return!1;return!0},qr=()=>{let e=E[0];return T.slice(e,e+256)},Jr=()=>T.slice(0,163584),Yr=()=>{let e=new Uint8Array(65536);for(let t=0;t<256;t++){let n=E[t];e.set(T.slice(n,n+256),t*256)}return e},N=c(),Xr=e=>{N.Accum=e},Zr=e=>{N.XReg=e},Qr=e=>{N.YReg=e},$r=e=>{N.cycleCount=e},ei=e=>{ti(),Object.assign(N,e)},ti=()=>{N.Accum=0,N.XReg=0,N.YReg=0,N.PStatus=36,N.StackPtr=255,ri(k(65533,!1)*256+k(65532,!1)),N.flagIRQ=0,N.flagNMI=!1},ni=e=>{ri((N.PC+e+65536)%65536)},ri=e=>{N.PC=e},ii=e=>{N.PStatus=e|48},ai=e=>(e&128?`N`:`.`)+(e&64?`V`:`.`)+(e&16?`B`:`.`)+(e&8?`D`:`.`)+(e&4?`I`:`.`)+(e&2?`Z`:`.`)+(e&1?`C`:`.`),oi=()=>`${u(N.Accum)}  ${u(N.XReg)}  ${u(N.YReg)}  ${u(N.StackPtr)}  ${u(N.PStatus)}  ${ai(N.PStatus)}`,si=Array(256).fill(``),ci=()=>{let e=0;for(;e<256&&si[e]===``;)e++;return si.slice(e,256)},li=e=>{si.splice(256-e.length,e.length,...e)},ui=()=>{let e=Wr(256).slice(0,256),t=[];for(let n=255;n>N.StackPtr;n--){let r=`$`+u(e[n]),i=si[n];si[n].length>3&&n-1>N.StackPtr&&(si[n-1]===`JSR`||si[n-1]===`BRK`||si[n-1]===`IRQ`?(n--,r+=u(e[n])):i=``),r=(r+`   `).substring(0,6),t.push(u(256+n,4)+`: `+r+i)}return t.join(`
`)},di=()=>{let e=Wr(256).slice(0,256);for(let t=N.StackPtr-2;t<=255;t++){let n=e[t];if(si[t].startsWith(`JSR`)&&t-1>N.StackPtr&&si[t-1]===`JSR`){let r=e[t-1]+1;return(n<<8)+r}}return-1},fi=(e,t)=>{si[N.StackPtr]=e,A(256+N.StackPtr,t),N.StackPtr=(N.StackPtr+255)%256},pi=()=>{N.StackPtr=(N.StackPtr+1)%256;let e=k(256+N.StackPtr);if(isNaN(e))throw Error(`illegal stack value`);return e},mi=()=>(N.PStatus&1)!=0,P=(e=!0)=>N.PStatus=e?N.PStatus|1:N.PStatus&254,hi=()=>(N.PStatus&2)!=0,gi=(e=!0)=>N.PStatus=e?N.PStatus|2:N.PStatus&253,_i=()=>(N.PStatus&4)!=0,vi=(e=!0)=>N.PStatus=e?N.PStatus|4:N.PStatus&251,yi=()=>(N.PStatus&8)!=0,F=()=>+!!yi(),bi=(e=!0)=>N.PStatus=e?N.PStatus|8:N.PStatus&247,xi=(e=!0)=>N.PStatus=e?N.PStatus|16:N.PStatus&239,Si=()=>(N.PStatus&64)!=0,Ci=(e=!0)=>N.PStatus=e?N.PStatus|64:N.PStatus&191,wi=()=>(N.PStatus&128)!=0,Ti=(e=!0)=>N.PStatus=e?N.PStatus|128:N.PStatus&127,I=e=>{gi(e===0),Ti(e>=128)},L=(e,t)=>(e+t+256)%256,R=(e,t)=>t*256+e,z=(e,t,n)=>(t*256+e+n+65536)%65536,B=(e,t)=>e>>8==t>>8?0:1,Ei=(e,t)=>{if(e){let e=N.PC;return ni(t>127?t-256:t),3+B(e+2,N.PC+2)}return 2},V=Array(256),H=(e,t,n,r,i,a=!1)=>{console.assert(!V[n],`Duplicate instruction: `+e+` mode=`+t),V[n]={name:e,pcode:n,mode:t,bytes:r,execute:i,is6502:!a}},Di=(e,t,n)=>{let r=k(e),i=k((e+1)%256),a=z(r,i,N.YReg);t(a);let o=5+B(a,R(r,i));return n&&(o+=F()),o},Oi=(e,t,n)=>{let r=k(e),i=k((e+1)%256);t(R(r,i));let a=5;return n&&(a+=F()),a},ki=e=>{let t=(N.Accum&15)+(e&15)+ +!!mi();t>=10&&(t+=6);let n=(N.Accum&240)+(e&240)+t,r=N.Accum<=127&&e<=127,i=N.Accum>=128&&e>=128;Ci((n&255)>=128?r:i),P(n>=160),mi()&&(n+=96),N.Accum=n&255,I(N.Accum)},Ai=e=>{let t=N.Accum+e+ +!!mi();P(t>=256),t%=256;let n=N.Accum<=127&&e<=127,r=N.Accum>=128&&e>=128;Ci(t>=128?n:r),N.Accum=t,I(N.Accum)},ji=e=>{yi()?ki(k(e)):Ai(k(e))};H(`ADC`,s.IMM,105,2,e=>(F()?ki(e):Ai(e),2+F())),H(`ADC`,s.ZP_REL,101,2,e=>(ji(e),3+F())),H(`ADC`,s.ZP_X,117,2,e=>(ji(L(e,N.XReg)),4+F())),H(`ADC`,s.ABS,109,3,(e,t)=>(ji(R(e,t)),4+F())),H(`ADC`,s.ABS_X,125,3,(e,t)=>{let n=z(e,t,N.XReg);return ji(n),4+F()+B(n,R(e,t))}),H(`ADC`,s.ABS_Y,121,3,(e,t)=>{let n=z(e,t,N.YReg);return ji(n),4+F()+B(n,R(e,t))}),H(`ADC`,s.IND_X,97,2,e=>{let t=L(e,N.XReg);return ji(R(k(t),k(t+1))),6+F()}),H(`ADC`,s.IND_Y,113,2,e=>Di(e,ji,!0)),H(`ADC`,s.IND,114,2,e=>Oi(e,ji,!0),!0);let Mi=e=>{N.Accum&=k(e),I(N.Accum)};H(`AND`,s.IMM,41,2,e=>(N.Accum&=e,I(N.Accum),2)),H(`AND`,s.ZP_REL,37,2,e=>(Mi(e),3)),H(`AND`,s.ZP_X,53,2,e=>(Mi(L(e,N.XReg)),4)),H(`AND`,s.ABS,45,3,(e,t)=>(Mi(R(e,t)),4)),H(`AND`,s.ABS_X,61,3,(e,t)=>{let n=z(e,t,N.XReg);return Mi(n),4+B(n,R(e,t))}),H(`AND`,s.ABS_Y,57,3,(e,t)=>{let n=z(e,t,N.YReg);return Mi(n),4+B(n,R(e,t))}),H(`AND`,s.IND_X,33,2,e=>{let t=L(e,N.XReg);return Mi(R(k(t),k(t+1))),6}),H(`AND`,s.IND_Y,49,2,e=>Di(e,Mi,!1)),H(`AND`,s.IND,50,2,e=>Oi(e,Mi,!1),!0);let Ni=e=>{let t=k(e);k(e),P((t&128)==128),t=(t<<1)%256,A(e,t),I(t)};H(`ASL`,s.IMPLIED,10,1,()=>(P((N.Accum&128)==128),N.Accum=(N.Accum<<1)%256,I(N.Accum),2)),H(`ASL`,s.ZP_REL,6,2,e=>(Ni(e),5)),H(`ASL`,s.ZP_X,22,2,e=>(Ni(L(e,N.XReg)),6)),H(`ASL`,s.ABS,14,3,(e,t)=>(Ni(R(e,t)),6)),H(`ASL`,s.ABS_X,30,3,(e,t)=>{let n=z(e,t,N.XReg);return Ni(n),6+B(n,R(e,t))}),H(`BCC`,s.ZP_REL,144,2,e=>Ei(!mi(),e)),H(`BCS`,s.ZP_REL,176,2,e=>Ei(mi(),e)),H(`BEQ`,s.ZP_REL,240,2,e=>Ei(hi(),e)),H(`BMI`,s.ZP_REL,48,2,e=>Ei(wi(),e)),H(`BNE`,s.ZP_REL,208,2,e=>Ei(!hi(),e)),H(`BPL`,s.ZP_REL,16,2,e=>Ei(!wi(),e)),H(`BVC`,s.ZP_REL,80,2,e=>Ei(!Si(),e)),H(`BVS`,s.ZP_REL,112,2,e=>Ei(Si(),e)),H(`BRA`,s.ZP_REL,128,2,e=>Ei(!0,e),!0);let Pi=e=>{gi((N.Accum&e)===0),Ti((e&128)!=0),Ci((e&64)!=0)};H(`BIT`,s.ZP_REL,36,2,e=>(Pi(k(e)),3)),H(`BIT`,s.ABS,44,3,(e,t)=>(Pi(k(R(e,t))),4)),H(`BIT`,s.IMM,137,2,e=>(gi((N.Accum&e)===0),2),!0),H(`BIT`,s.ZP_X,52,2,e=>(Pi(k(L(e,N.XReg))),4),!0),H(`BIT`,s.ABS_X,60,3,(e,t)=>{let n=z(e,t,N.XReg);return Pi(k(n)),4+B(n,R(e,t))},!0);let Fi=(e,t,n=0)=>{let r=(N.PC+n)%65536,i=k(t),a=k(t+1);fi(`${e} $`+u(a)+u(i),Math.trunc(r/256)),fi(e,r%256),fi(`P`,N.PStatus),bi(!1),vi();let o=z(i,a,e===`BRK`?-1:0);ri(o)},Ii=()=>(xi(),Fi(`BRK`,65534,2),7);H(`BRK`,s.IMPLIED,0,1,Ii);let Li=()=>_i()?0:(xi(!1),Fi(`IRQ`,65534),7),Ri=()=>(Fi(`NMI`,65530),7);H(`CLC`,s.IMPLIED,24,1,()=>(P(!1),2)),H(`CLD`,s.IMPLIED,216,1,()=>(bi(!1),2)),H(`CLI`,s.IMPLIED,88,1,()=>(vi(!1),2)),H(`CLV`,s.IMPLIED,184,1,()=>(Ci(!1),2));let zi=e=>{let t=k(e);P(N.Accum>=t),I((N.Accum-t+256)%256)},Bi=e=>{let t=k(e);P(N.Accum>=t),I((N.Accum-t+256)%256)};H(`CMP`,s.IMM,201,2,e=>(P(N.Accum>=e),I((N.Accum-e+256)%256),2)),H(`CMP`,s.ZP_REL,197,2,e=>(zi(e),3)),H(`CMP`,s.ZP_X,213,2,e=>(zi(L(e,N.XReg)),4)),H(`CMP`,s.ABS,205,3,(e,t)=>(zi(R(e,t)),4)),H(`CMP`,s.ABS_X,221,3,(e,t)=>{let n=z(e,t,N.XReg);return Bi(n),4+B(n,R(e,t))}),H(`CMP`,s.ABS_Y,217,3,(e,t)=>{let n=z(e,t,N.YReg);return zi(n),4+B(n,R(e,t))}),H(`CMP`,s.IND_X,193,2,e=>{let t=L(e,N.XReg);return zi(R(k(t),k(t+1))),6}),H(`CMP`,s.IND_Y,209,2,e=>Di(e,zi,!1)),H(`CMP`,s.IND,210,2,e=>Oi(e,zi,!1),!0);let Vi=e=>{let t=k(e);P(N.XReg>=t),I((N.XReg-t+256)%256)};H(`CPX`,s.IMM,224,2,e=>(P(N.XReg>=e),I((N.XReg-e+256)%256),2)),H(`CPX`,s.ZP_REL,228,2,e=>(Vi(e),3)),H(`CPX`,s.ABS,236,3,(e,t)=>(Vi(R(e,t)),4));let Hi=e=>{let t=k(e);P(N.YReg>=t),I((N.YReg-t+256)%256)};H(`CPY`,s.IMM,192,2,e=>(P(N.YReg>=e),I((N.YReg-e+256)%256),2)),H(`CPY`,s.ZP_REL,196,2,e=>(Hi(e),3)),H(`CPY`,s.ABS,204,3,(e,t)=>(Hi(R(e,t)),4));let Ui=e=>{let t=L(k(e),-1);A(e,t),I(t)};H(`DEC`,s.IMPLIED,58,1,()=>(N.Accum=L(N.Accum,-1),I(N.Accum),2),!0),H(`DEC`,s.ZP_REL,198,2,e=>(Ui(e),5)),H(`DEC`,s.ZP_X,214,2,e=>(Ui(L(e,N.XReg)),6)),H(`DEC`,s.ABS,206,3,(e,t)=>(Ui(R(e,t)),6)),H(`DEC`,s.ABS_X,222,3,(e,t)=>{let n=z(e,t,N.XReg);return k(n),Ui(n),7}),H(`DEX`,s.IMPLIED,202,1,()=>(N.XReg=L(N.XReg,-1),I(N.XReg),2)),H(`DEY`,s.IMPLIED,136,1,()=>(N.YReg=L(N.YReg,-1),I(N.YReg),2));let Wi=e=>{N.Accum^=k(e),I(N.Accum)};H(`EOR`,s.IMM,73,2,e=>(N.Accum^=e,I(N.Accum),2)),H(`EOR`,s.ZP_REL,69,2,e=>(Wi(e),3)),H(`EOR`,s.ZP_X,85,2,e=>(Wi(L(e,N.XReg)),4)),H(`EOR`,s.ABS,77,3,(e,t)=>(Wi(R(e,t)),4)),H(`EOR`,s.ABS_X,93,3,(e,t)=>{let n=z(e,t,N.XReg);return Wi(n),4+B(n,R(e,t))}),H(`EOR`,s.ABS_Y,89,3,(e,t)=>{let n=z(e,t,N.YReg);return Wi(n),4+B(n,R(e,t))}),H(`EOR`,s.IND_X,65,2,e=>{let t=L(e,N.XReg);return Wi(R(k(t),k(t+1))),6}),H(`EOR`,s.IND_Y,81,2,e=>Di(e,Wi,!1)),H(`EOR`,s.IND,82,2,e=>Oi(e,Wi,!1),!0);let Gi=e=>{let t=L(k(e),1);A(e,t),I(t)};H(`INC`,s.IMPLIED,26,1,()=>(N.Accum=L(N.Accum,1),I(N.Accum),2),!0),H(`INC`,s.ZP_REL,230,2,e=>(Gi(e),5)),H(`INC`,s.ZP_X,246,2,e=>(Gi(L(e,N.XReg)),6)),H(`INC`,s.ABS,238,3,(e,t)=>(Gi(R(e,t)),6)),H(`INC`,s.ABS_X,254,3,(e,t)=>{let n=z(e,t,N.XReg);return k(n),Gi(n),7}),H(`INX`,s.IMPLIED,232,1,()=>(N.XReg=L(N.XReg,1),I(N.XReg),2)),H(`INY`,s.IMPLIED,200,1,()=>(N.YReg=L(N.YReg,1),I(N.YReg),2)),H(`JMP`,s.ABS,76,3,(e,t)=>(ri(z(e,t,-3)),3)),H(`JMP`,s.IND,108,3,(e,t)=>{let n=R(e,t);return e=k(n),t=k((n+1)%65536),ri(z(e,t,-3)),6}),H(`JMP`,s.IND_X,124,3,(e,t)=>{let n=z(e,t,N.XReg);return e=k(n),t=k((n+1)%65536),ri(z(e,t,-3)),6},!0),H(`JSR`,s.ABS,32,3,(e,t)=>{let n=(N.PC+2)%65536;return fi(`JSR $`+u(t)+u(e),Math.trunc(n/256)),fi(`JSR`,n%256),ri(z(e,t,-3)),6});let Ki=e=>{N.Accum=k(e),I(N.Accum)};H(`LDA`,s.IMM,169,2,e=>(N.Accum=e,I(N.Accum),2)),H(`LDA`,s.ZP_REL,165,2,e=>(Ki(e),3)),H(`LDA`,s.ZP_X,181,2,e=>(Ki(L(e,N.XReg)),4)),H(`LDA`,s.ABS,173,3,(e,t)=>(Ki(R(e,t)),4)),H(`LDA`,s.ABS_X,189,3,(e,t)=>{let n=z(e,t,N.XReg);return Ki(n),4+B(n,R(e,t))}),H(`LDA`,s.ABS_Y,185,3,(e,t)=>{let n=z(e,t,N.YReg);return Ki(n),4+B(n,R(e,t))}),H(`LDA`,s.IND_X,161,2,e=>{let t=L(e,N.XReg);return Ki(R(k(t),k((t+1)%256))),6}),H(`LDA`,s.IND_Y,177,2,e=>Di(e,Ki,!1)),H(`LDA`,s.IND,178,2,e=>Oi(e,Ki,!1),!0);let qi=e=>{N.XReg=k(e),I(N.XReg)};H(`LDX`,s.IMM,162,2,e=>(N.XReg=e,I(N.XReg),2)),H(`LDX`,s.ZP_REL,166,2,e=>(qi(e),3)),H(`LDX`,s.ZP_Y,182,2,e=>(qi(L(e,N.YReg)),4)),H(`LDX`,s.ABS,174,3,(e,t)=>(qi(R(e,t)),4)),H(`LDX`,s.ABS_Y,190,3,(e,t)=>{let n=z(e,t,N.YReg);return qi(n),4+B(n,R(e,t))});let Ji=e=>{N.YReg=k(e),I(N.YReg)};H(`LDY`,s.IMM,160,2,e=>(N.YReg=e,I(N.YReg),2)),H(`LDY`,s.ZP_REL,164,2,e=>(Ji(e),3)),H(`LDY`,s.ZP_X,180,2,e=>(Ji(L(e,N.XReg)),4)),H(`LDY`,s.ABS,172,3,(e,t)=>(Ji(R(e,t)),4)),H(`LDY`,s.ABS_X,188,3,(e,t)=>{let n=z(e,t,N.XReg);return Ji(n),4+B(n,R(e,t))});let Yi=e=>{let t=k(e);k(e),P((t&1)==1),t>>=1,A(e,t),I(t)};H(`LSR`,s.IMPLIED,74,1,()=>(P((N.Accum&1)==1),N.Accum>>=1,I(N.Accum),2)),H(`LSR`,s.ZP_REL,70,2,e=>(Yi(e),5)),H(`LSR`,s.ZP_X,86,2,e=>(Yi(L(e,N.XReg)),6)),H(`LSR`,s.ABS,78,3,(e,t)=>(Yi(R(e,t)),6)),H(`LSR`,s.ABS_X,94,3,(e,t)=>{let n=z(e,t,N.XReg);return Yi(n),6+B(n,R(e,t))}),H(`NOP`,s.IMPLIED,234,1,()=>2);let Xi=e=>{N.Accum|=k(e),I(N.Accum)};H(`ORA`,s.IMM,9,2,e=>(N.Accum|=e,I(N.Accum),2)),H(`ORA`,s.ZP_REL,5,2,e=>(Xi(e),3)),H(`ORA`,s.ZP_X,21,2,e=>(Xi(L(e,N.XReg)),4)),H(`ORA`,s.ABS,13,3,(e,t)=>(Xi(R(e,t)),4)),H(`ORA`,s.ABS_X,29,3,(e,t)=>{let n=z(e,t,N.XReg);return Xi(n),4+B(n,R(e,t))}),H(`ORA`,s.ABS_Y,25,3,(e,t)=>{let n=z(e,t,N.YReg);return Xi(n),4+B(n,R(e,t))}),H(`ORA`,s.IND_X,1,2,e=>{let t=L(e,N.XReg);return Xi(R(k(t),k(t+1))),6}),H(`ORA`,s.IND_Y,17,2,e=>Di(e,Xi,!1)),H(`ORA`,s.IND,18,2,e=>Oi(e,Xi,!1),!0),H(`PHA`,s.IMPLIED,72,1,()=>(fi(`PHA`,N.Accum),3)),H(`PHP`,s.IMPLIED,8,1,()=>(fi(`PHP`,N.PStatus|16),3)),H(`PHX`,s.IMPLIED,218,1,()=>(fi(`PHX`,N.XReg),3),!0),H(`PHY`,s.IMPLIED,90,1,()=>(fi(`PHY`,N.YReg),3),!0),H(`PLA`,s.IMPLIED,104,1,()=>(N.Accum=pi(),I(N.Accum),4)),H(`PLP`,s.IMPLIED,40,1,()=>(ii(pi()),4)),H(`PLX`,s.IMPLIED,250,1,()=>(N.XReg=pi(),I(N.XReg),4),!0),H(`PLY`,s.IMPLIED,122,1,()=>(N.YReg=pi(),I(N.YReg),4),!0);let Zi=e=>{let t=k(e);k(e);let n=+!!mi();P((t&128)==128),t=(t<<1)%256|n,A(e,t),I(t)};H(`ROL`,s.IMPLIED,42,1,()=>{let e=+!!mi();return P((N.Accum&128)==128),N.Accum=(N.Accum<<1)%256|e,I(N.Accum),2}),H(`ROL`,s.ZP_REL,38,2,e=>(Zi(e),5)),H(`ROL`,s.ZP_X,54,2,e=>(Zi(L(e,N.XReg)),6)),H(`ROL`,s.ABS,46,3,(e,t)=>(Zi(R(e,t)),6)),H(`ROL`,s.ABS_X,62,3,(e,t)=>{let n=z(e,t,N.XReg);return Zi(n),6+B(n,R(e,t))});let Qi=e=>{let t=k(e);k(e);let n=mi()?128:0;P((t&1)==1),t=t>>1|n,A(e,t),I(t)};H(`ROR`,s.IMPLIED,106,1,()=>{let e=mi()?128:0;return P((N.Accum&1)==1),N.Accum=N.Accum>>1|e,I(N.Accum),2}),H(`ROR`,s.ZP_REL,102,2,e=>(Qi(e),5)),H(`ROR`,s.ZP_X,118,2,e=>(Qi(L(e,N.XReg)),6)),H(`ROR`,s.ABS,110,3,(e,t)=>(Qi(R(e,t)),6)),H(`ROR`,s.ABS_X,126,3,(e,t)=>{let n=z(e,t,N.XReg);return Qi(n),6+B(n,R(e,t))}),H(`RTI`,s.IMPLIED,64,1,()=>(ii(pi()),xi(!1),ri(R(pi(),pi())-1),6)),H(`RTS`,s.IMPLIED,96,1,()=>(ri(R(pi(),pi())),6));let $i=e=>{let t=255-e,n=N.Accum+t+ +!!mi(),r=n>=256,i=N.Accum<=127&&t<=127,a=N.Accum>=128&&t>=128;Ci(n%256>=128?i:a);let o=(N.Accum&15)-(e&15)+(mi()?0:-1);n=N.Accum-e+(mi()?0:-1),n<0&&(n-=96),o<0&&(n-=6),N.Accum=n&255,I(N.Accum),P(r)},ea=e=>{F()?$i(k(e)):Ai(255-k(e))};H(`SBC`,s.IMM,233,2,e=>(F()?$i(e):Ai(255-e),2+F())),H(`SBC`,s.ZP_REL,229,2,e=>(ea(e),3+F())),H(`SBC`,s.ZP_X,245,2,e=>(ea(L(e,N.XReg)),4+F())),H(`SBC`,s.ABS,237,3,(e,t)=>(ea(R(e,t)),4+F())),H(`SBC`,s.ABS_X,253,3,(e,t)=>{let n=z(e,t,N.XReg);return ea(n),4+F()+B(n,R(e,t))}),H(`SBC`,s.ABS_Y,249,3,(e,t)=>{let n=z(e,t,N.YReg);return ea(n),4+F()+B(n,R(e,t))}),H(`SBC`,s.IND_X,225,2,e=>{let t=L(e,N.XReg);return ea(R(k(t),k(t+1))),6+F()}),H(`SBC`,s.IND_Y,241,2,e=>Di(e,ea,!0)),H(`SBC`,s.IND,242,2,e=>Oi(e,ea,!0),!0),H(`SEC`,s.IMPLIED,56,1,()=>(P(),2)),H(`SED`,s.IMPLIED,248,1,()=>(bi(),2)),H(`SEI`,s.IMPLIED,120,1,()=>(vi(),2)),H(`STA`,s.ZP_REL,133,2,e=>(A(e,N.Accum),3)),H(`STA`,s.ZP_X,149,2,e=>(A(L(e,N.XReg),N.Accum),4)),H(`STA`,s.ABS,141,3,(e,t)=>(A(R(e,t),N.Accum),4)),H(`STA`,s.ABS_X,157,3,(e,t)=>{let n=z(e,t,N.XReg);return k(n),A(n,N.Accum),5}),H(`STA`,s.ABS_Y,153,3,(e,t)=>(A(z(e,t,N.YReg),N.Accum),5)),H(`STA`,s.IND_X,129,2,e=>{let t=L(e,N.XReg);return A(R(k(t),k(t+1)),N.Accum),6});let ta=e=>{A(e,N.Accum)};H(`STA`,s.IND_Y,145,2,e=>(Di(e,ta,!1),6)),H(`STA`,s.IND,146,2,e=>Oi(e,ta,!1),!0),H(`STX`,s.ZP_REL,134,2,e=>(A(e,N.XReg),3)),H(`STX`,s.ZP_Y,150,2,e=>(A(L(e,N.YReg),N.XReg),4)),H(`STX`,s.ABS,142,3,(e,t)=>(A(R(e,t),N.XReg),4)),H(`STY`,s.ZP_REL,132,2,e=>(A(e,N.YReg),3)),H(`STY`,s.ZP_X,148,2,e=>(A(L(e,N.XReg),N.YReg),4)),H(`STY`,s.ABS,140,3,(e,t)=>(A(R(e,t),N.YReg),4)),H(`STZ`,s.ZP_REL,100,2,e=>(A(e,0),3),!0),H(`STZ`,s.ZP_X,116,2,e=>(A(L(e,N.XReg),0),4),!0),H(`STZ`,s.ABS,156,3,(e,t)=>(A(R(e,t),0),4),!0),H(`STZ`,s.ABS_X,158,3,(e,t)=>{let n=z(e,t,N.XReg);return k(n),A(n,0),5},!0),H(`TAX`,s.IMPLIED,170,1,()=>(N.XReg=N.Accum,I(N.XReg),2)),H(`TAY`,s.IMPLIED,168,1,()=>(N.YReg=N.Accum,I(N.YReg),2)),H(`TSX`,s.IMPLIED,186,1,()=>(N.XReg=N.StackPtr,I(N.XReg),2)),H(`TXA`,s.IMPLIED,138,1,()=>(N.Accum=N.XReg,I(N.Accum),2)),H(`TXS`,s.IMPLIED,154,1,()=>(N.StackPtr=N.XReg,2)),H(`TYA`,s.IMPLIED,152,1,()=>(N.Accum=N.YReg,I(N.Accum),2));let na=e=>{let t=k(e);gi((N.Accum&t)===0),A(e,t&~N.Accum)};H(`TRB`,s.ZP_REL,20,2,e=>(na(e),5),!0),H(`TRB`,s.ABS,28,3,(e,t)=>(na(R(e,t)),6),!0);let ra=e=>{let t=k(e);gi((N.Accum&t)===0),A(e,t|N.Accum)};H(`TSB`,s.ZP_REL,4,2,e=>(ra(e),5),!0),H(`TSB`,s.ABS,12,3,(e,t)=>(ra(R(e,t)),6),!0),[2,34,66,98,130,194,226].forEach(e=>{H(`???`,s.IMPLIED,e,2,()=>2),V[e].is6502=!1});for(let e=0;e<=15;e++)H(`???`,s.IMPLIED,3+16*e,1,()=>1),V[3+16*e].is6502=!1,H(`???`,s.IMPLIED,7+16*e,1,()=>1),V[7+16*e].is6502=!1,H(`???`,s.IMPLIED,11+16*e,1,()=>1),V[11+16*e].is6502=!1,H(`???`,s.IMPLIED,15+16*e,1,()=>1),V[15+16*e].is6502=!1;H(`???`,s.IMPLIED,68,2,()=>3),V[68].is6502=!1,H(`???`,s.IMPLIED,84,2,()=>4),V[84].is6502=!1,H(`???`,s.IMPLIED,212,2,()=>4),V[212].is6502=!1,H(`???`,s.IMPLIED,244,2,()=>4),V[244].is6502=!1,H(`???`,s.IMPLIED,92,3,()=>8),V[92].is6502=!1,H(`???`,s.IMPLIED,220,3,()=>4),V[220].is6502=!1,H(`???`,s.IMPLIED,252,3,()=>4),V[252].is6502=!1;for(let e=0;e<256;e++)V[e]||(console.error(`ERROR: OPCODE `+e.toString(16)+` should be implemented`),H(`BRK`,s.IMPLIED,e,1,Ii));let ia=()=>{let e=Array(256);for(let t=0;t<256;t++)e[t]={name:V[t].name,mode:V[t].mode,pcode:V[t].pcode,bytes:V[t].bytes,is6502:V[t].is6502};yu(e)},U=(e,t,n)=>{let r=t&7,i=t>>>3;return e[i]|=n>>>r,r&&(e[i+1]|=n<<8-r),t+8},aa=(e,t,n)=>(t=U(e,t,n>>>1|170),t=U(e,t,n|170),t),oa=(e,t)=>(t=U(e,t,255),t+2),sa=e=>{
/*!
Converts a 256-byte source woz into the 343 byte values that
contain the Apple 6-and-2 encoding of that woz.
@param dest The at-least-343 byte woz to which the encoded sector is written.
@param src The 256-byte source data.
*/
let t=[150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255],n=new Uint8Array(343),r=[0,2,1,3];for(let t=0;t<84;t++)n[t]=r[e[t]&3]|r[e[t+86]&3]<<2|r[e[t+172]&3]<<4;n[84]=r[e[84]&3]<<0|r[e[170]&3]<<2,n[85]=r[e[85]&3]<<0|r[e[171]&3]<<2;for(let t=0;t<256;t++)n[86+t]=e[t]>>>2;n[342]=n[341];let i=342;for(;i>1;)i--,n[i]^=n[i-1];for(let e=0;e<343;e++)n[e]=t[n[e]];return n},ca=(e,t,n)=>{
/*!
Converts a DSK-style track to a WOZ-style track.
@param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
proper suffix will be written.
@param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
a fully-decoded sector.
@param track_number The track number to encode into this track.
@param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/
let r=0,i=new Uint8Array(6646).fill(0);for(let e=0;e<16;e++)r=oa(i,r);for(let a=0;a<16;a++){r=U(i,r,213),r=U(i,r,170),r=U(i,r,150),r=aa(i,r,254),r=aa(i,r,t),r=aa(i,r,a),r=aa(i,r,254^t^a),r=U(i,r,222),r=U(i,r,170),r=U(i,r,235);for(let e=0;e<7;e++)r=oa(i,r);r=U(i,r,213),r=U(i,r,170),r=U(i,r,173);let o=a===15?15:a*(n?8:7)%15,s=sa(e.slice(o*256,o*256+256));for(let e=0;e<s.length;e++)r=U(i,r,s[e]);r=U(i,r,222),r=U(i,r,170),r=U(i,r,235);for(let e=0;e<16;e++)r=oa(i,r)}return i},la=(e,t)=>{let n=e.length/(16*256);if(n<34||n>40)return new Uint8Array;let r=new Uint8Array(1536+n*13*512).fill(0);r.set(d(`WOZ2ÿ
\r
`),0),r.set(d(`INFO`),12),r[16]=60,r[20]=2,r[21]=1,r[22]=0,r[23]=0,r[24]=1,r.fill(32,25,57),r.set(d(`Apple2TS (CT6502)`),25),r[57]=1,r[58]=0,r[59]=32,r[60]=0,r[62]=0,r[64]=13,r.set(d(`TMAP`),80),r[84]=160,r.fill(255,88,248);let i=0;for(let e=0;e<n;e++)i=88+(e<<2),e>0&&(r[i-1]=e),r[i]=r[i+1]=e;r.set(d(`TRKS`),248),r.set(p(1280+n*13*512),252);for(let a=0;a<n;a++){i=256+(a<<3),r.set(f(3+a*13),i),r[i+2]=13,r.set(p(50304),i+4);let n=e.slice(a*16*256,(a+1)*16*256),o=ca(n,a,t);i=1536+a*13*512,r.set(o,i)}return r},ua=(e,t)=>{if([87,79,90,50,255,10,13,10].find((e,n)=>e!==t[n])!==void 0)return!1;e.isWriteProtected=t[22]===1,e.isSynchronized=t[23]===1,e.optimalTiming=t[59]>0?t[59]:32;let n=t.slice(8,12),r=n[0]+(n[1]<<8)+(n[2]<<16)+n[3]*2**24,i=re(t,12);if(r!==0&&r!==i)return alert(`CRC checksum error: `+e.filename),!1;for(let n=0;n<160;n++){let r=t[88+n];if(r<255){let i=256+8*r,a=t.slice(i,i+8);e.trackStart[n]=512*((a[1]<<8)+a[0]),e.trackNbits[n]=a[4]+(a[5]<<8)+(a[6]<<16)+a[7]*2**24,e.maxQuarterTrack=n}}return!0},da=(e,t)=>{if([87,79,90,49,255,10,13,10].find((e,n)=>e!==t[n])!==void 0)return!1;e.isWriteProtected=t[22]===1;for(let n=0;n<160;n++){let r=t[88+n];if(r<255){e.trackStart[n]=256+r*6656;let i=t.slice(e.trackStart[n]+6646,e.trackStart[n]+6656);e.trackNbits[n]=i[2]+(i[3]<<8),e.maxQuarterTrack=n}}return!0},fa=e=>{let t=e.toLowerCase(),n=t.endsWith(`.dsk`)||t.endsWith(`.do`),r=t.endsWith(`.po`);return n||r},pa=(e,t)=>{let n=la(t,e.filename.toLowerCase().endsWith(`.po`));return n.length===0?new Uint8Array:(e.filename=ee(e.filename,`woz`),e.diskHasChanges=!0,e.lastAppleWriteTime=Date.now(),n)},ma=(e,t)=>{e.diskHasChanges=!1;let n=e.filename.toLowerCase();return t.length>1e4&&(ae(n)&&(e.hardDrive=!0,e.status=``,n.endsWith(`.hdv`)||n.endsWith(`.po`)||n.endsWith(`.2meg`)||n.endsWith(`.2mg`))||((fa(e.filename)||t.length===143360)&&(t=pa(e,t)),ua(e,t))||da(e,t))?t:(n!==``&&console.error(`Unknown disk format or unable to decode: ${e.filename} (${t.length} bytes).`),new Uint8Array)},ha=[162,32,160,0,162,3,134,60,138,10,36,60,240,16,5,60,73,255,41,126,176,8,74,208,251,152,157,86,3,200,232,16,229,32,88,255,186,189,0,1,10,10,10,10,133,43,170,189,142,192,189,140,192,189,138,192,189,137,192,160,80,189,128,192,152,41,3,10,5,43,170,189,129,192,169,86,32,168,252,136,16,235,133,38,133,61,133,65,169,8,133,39,24,8,189,140,192,16,251,73,213,208,247,189,140,192,16,251,201,170,208,243,234,189,140,192,16,251,201,150,240,9,40,144,223,73,173,240,37,208,217,160,3,133,64,189,140,192,16,251,42,133,60,189,140,192,16,251,37,60,136,208,236,40,197,61,208,190,165,64,197,65,208,184,176,183,160,86,132,60,188,140,192,16,251,89,214,2,164,60,136,153,0,3,208,238,132,60,188,140,192,16,251,89,214,2,164,60,145,38,200,208,239,188,140,192,16,251,89,214,2,208,135,160,0,162,86,202,48,251,177,38,94,0,3,42,94,0,3,42,145,38,200,208,238,230,39,230,61,165,61,205,0,8,166,43,144,219,76,1,8,0,0,0,0,0],ga=0,_a=0,va=!1,ya=0,ba=!1,xa=!1,Sa=[-1,0,2,1,4,-1,3,-1,6,7,-1,-1,5,-1,-1,-1],Ca=[[0,1,2,3,0,-3,-2,-1],[-1,0,1,2,3,0,-3,-2],[-2,-1,0,1,2,3,0,-3],[-3,-2,-1,0,1,2,3,0],[0,-3,-2,-1,0,1,2,3],[3,0,-3,-2,-1,0,1,2],[2,3,0,-3,-2,-1,0,1],[1,2,3,0,-3,-2,-1,0]],wa=e=>{ba=!1,Va(e),e.quarterTrack=e.maxQuarterTrack,e.prevQuarterTrack=e.maxQuarterTrack},Ta=(e=!1)=>{if(e){let e=$a();e.motorRunning&&Ha(e)}else su(o.MOTOR_OFF)},Ea=0,Da=(e,t,n)=>{Ea=0,e.prevQuarterTrack=e.quarterTrack,e.quarterTrack+=t,e.quarterTrack<0||e.quarterTrack>e.maxQuarterTrack?(su(o.TRACK_END),e.quarterTrack=Math.max(0,Math.min(e.quarterTrack,e.maxQuarterTrack))):su(o.TRACK_SEEK),e.status=` Trk ${e.quarterTrack/4}`,io(),ya+=n,e.trackLocation+=Math.floor(ya/4),ya%=4,e.quarterTrack!=e.prevQuarterTrack&&(e.trackLocation=Math.floor(e.trackLocation*(e.trackNbits[e.quarterTrack]/e.trackNbits[e.prevQuarterTrack])))},Oa=0,ka=[0,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],Aa=()=>(Oa++,ka[Oa&31]),ja=0,Ma=e=>(ja<<=1,ja|=e,ja&=15,ja===0?Aa():e),Na=[128,64,32,16,8,4,2,1],Pa=[127,191,223,239,247,251,253,254],Fa=(e,t)=>{let n=e.trackLocation;e.trackLocation%=e.trackNbits[e.quarterTrack],n!==e.trackLocation&&(Ea>=9?(Ea=0,e.trackLocation+=4):Ea++);let r;if(e.trackStart[e.quarterTrack]>0){let n=t[e.trackStart[e.quarterTrack]+(e.trackLocation>>3)],i=e.trackLocation&7;r=(n&Na[i])>>7-i,r=Ma(r)}else r=Aa();return e.trackLocation++,r},Ia=()=>Math.floor(256*Math.random()),La=(e,t,n)=>{if(t.length===0)return Ia();let r=0;for(ya+=n;ya>=e.optimalTiming/8;){let n=Fa(e,t);va?va=!n:_a&128?_a=2|n:(_a=_a<<1|n,_a&128&&(va=!0)),ya-=e.optimalTiming/8}return ya<0&&(ya=0),_a&=255,r=_a,r},Ra=0,za=(e,t,n)=>{if(e.trackLocation%=e.trackNbits[e.quarterTrack],e.trackStart[e.quarterTrack]>0){let r=e.trackStart[e.quarterTrack]+(e.trackLocation>>3),i=t[r],a=e.trackLocation&7;n?i|=Na[a]:i&=Pa[a],t[r]=i}e.trackLocation++},Ba=(e,t,n)=>{if(!(t.length===0||e.trackStart[e.quarterTrack]===0)&&_a>0){if(n>=16)for(let n=7;n>=0;n--)za(e,t,_a&2**n?1:0);n>=36&&za(e,t,0),n>=40&&za(e,t,0),Wa.push(n>=40?2:n>=36?1:_a),e.diskHasChanges=!0,e.lastAppleWriteTime=Date.now(),_a=0}},Va=e=>{ga=0,ba||(e.motorRunning=!1),io(),su(o.MOTOR_OFF)},Ha=e=>{ga?(clearTimeout(ga),ga=0):ya=0,e.motorRunning=!0,io(),su(o.MOTOR_ON)},Ua=e=>{ga===0&&(ga=setTimeout(()=>Va(e),1e3))},Wa=[],Ga=e=>{Wa.length>0&&e.quarterTrack===0&&(Wa=[])},Ka=(e,t)=>{if(e>=49408)return-1;let n=$a(),r=eo();if(n.hardDrive)return 0;let i=0,a=N.cycleCount-Ra;switch(e&=15,e){case 9:ba=!0,Ha(n),Ga(n);break;case 8:n.motorRunning&&!n.writeMode&&(i=La(n,r,a),Ra=N.cycleCount),ba=!1,Ua(n),Ga(n);break;case 10:case 11:{let t=e===10?2:3,r=$a();Qa(t),n=$a(),n!==r&&r.motorRunning&&(r.motorRunning=!1,n.motorRunning=!0,io());break}case 12:xa=!1,n.motorRunning&&!n.writeMode&&(i=La(n,r,a),Ra=N.cycleCount);break;case 13:xa=!0,n.motorRunning&&(n.writeMode?(Ba(n,r,a),Ra=N.cycleCount,t>=0&&(_a=t)):(_a=0,ya+=a,n.trackLocation+=Math.floor(ya/4),ya%=4,Ra=N.cycleCount));break;case 14:n.motorRunning&&n.writeMode&&(Ba(n,r,a),n.lastAppleWriteTime=Date.now(),Ra=N.cycleCount),n.writeMode=!1,xa&&(i=n.isWriteProtected?255:0),Ga(n);break;case 15:n.writeMode=!0,Ra=N.cycleCount,t>=0&&(_a=t);break;default:{if(e<0||e>7)break;let t=e/2;e%2?n.currentPhase|=1<<t:n.currentPhase&=~(1<<t);let r=Sa[n.currentPhase];if(n.motorRunning&&r>=0){let e=n.quarterTrack&7,t=Ca[e][r];Da(n,t,a),Ra=N.cycleCount}Ga(n);break}}return i},qa=()=>{Dr(6,Uint8Array.from(ha)),Er(6,Ka)},Ja=(e,t,n)=>({index:e,hardDrive:n,drive:t,status:``,filename:``,diskHasChanges:!1,motorRunning:!1,isWriteProtected:!1,isSynchronized:!1,quarterTrack:0,prevQuarterTrack:0,writeMode:!1,currentPhase:0,trackStart:n?[]:Array(160).fill(0),trackNbits:n?[]:Array(160).fill(51024),trackLocation:0,maxQuarterTrack:0,lastLocalFileWriteTime:-1,cloudData:null,writableFileHandle:null,lastAppleWriteTime:-1,optimalTiming:32}),Ya=()=>{W[0]=Ja(0,1,!0),W[1]=Ja(1,2,!0),W[2]=Ja(2,1,!1),W[3]=Ja(3,2,!1);for(let e=0;e<W.length;e++)Xa[e]=new Uint8Array},W=[],Xa=[];Ya();let Za=2,Qa=e=>{Za=e},$a=()=>W[Za],eo=()=>Xa[Za],to=e=>W[+(e==2)],no=e=>{let t=Xa[+(e==2)],n=``;for(let e=0;e<4;e++)n+=String.fromCharCode(t[e]);let r=n===`2IMG`?64:0;return[t,r,t.length-r]},ro=[],io=()=>{for(let e=0;e<W.length;e++){if(W[e].filename===``&&!W[e].cloudData&&ro[e]&&ro[e].diskHasChanges===W[e].diskHasChanges&&ro[e].motorRunning===W[e].motorRunning&&ro[e].status===W[e].status)continue;let t={index:e,hardDrive:W[e].hardDrive,drive:W[e].drive,filename:W[e].filename,status:W[e].status,motorRunning:W[e].motorRunning,diskHasChanges:W[e].diskHasChanges,isWriteProtected:W[e].isWriteProtected,diskData:W[e].diskHasChanges&&!W[e].motorRunning?Xa[e]:new Uint8Array,lastAppleWriteTime:W[e].lastAppleWriteTime,lastLocalFileWriteTime:W[e].lastLocalFileWriteTime,cloudData:W[e].cloudData,writableFileHandle:W[e].writableFileHandle};ou(t),ro[e]={diskHasChanges:t.diskHasChanges,motorRunning:t.motorRunning,status:t.status}}},ao=e=>{let t=Array(W.length).fill(``);for(let n=0;n<W.length;n++)(e||Xa[n].length<32e6)&&(t[n]=vn.Buffer.from(Xa[n]).toString(`base64`));let n={currentDrive:Za,driveState:[],driveData:t};for(let e=0;e<W.length;e++)n.driveState[e]=W[e].filename===``?{}:{...W[e]};return n},oo=e=>{su(o.MOTOR_OFF),Za=e.currentDrive,e.driveState.length===3&&Za>0&&Za++,Ya();let t=0;for(let n=0;n<e.driveState.length;n++)Object.keys(e.driveState[n]).length>0&&(W[t]={...e.driveState[n]},e.driveData[n]!==``&&(Xa[t]=new Uint8Array(vn.Buffer.from(e.driveData[n],`base64`)))),e.driveState.length===3&&n===0&&(t=1),t++;io()},so=()=>{for(let e=0;e<W.length;e++)W[e].hardDrive||wa(W[e]);io()},co=(e=!1)=>{Ta(e),io()},lo=(e,t=!1)=>{let n=e.index,r=e.drive,i=e.hardDrive;if(t||e.filename!==``&&(ae(e.filename)?(i=!0,n=e.drive<=1?0:1,r=n+1):(i=!1,n=e.drive<=1?2:3,r=n-1)),W[n]=Ja(n,r,i),W[n].filename=e.filename,Xa[n]=ma(W[n],e.diskData),Xa[n].length===0){W[n].filename=``,io();return}W[n].motorRunning=e.motorRunning,W[n].cloudData=e.cloudData,W[n].writableFileHandle=e.writableFileHandle,W[n].lastLocalFileWriteTime=e.lastLocalFileWriteTime,io()},uo=e=>{let t=e.index;W[t].filename=e.filename,W[t].motorRunning=e.motorRunning,W[t].isWriteProtected=e.isWriteProtected,W[t].diskHasChanges=e.diskHasChanges,W[t].lastAppleWriteTime=e.lastAppleWriteTime,W[t].lastLocalFileWriteTime=e.lastLocalFileWriteTime,W[t].cloudData=e.cloudData,W[t].writableFileHandle=e.writableFileHandle,io()},fo={PE:1,FE:2,OVRN:4,RX_FULL:8,TX_EMPTY:16,NDCD:32,NDSR:64,IRQ:128,HW_RESET:16},po={BAUD_RATE:15,INT_CLOCK:16,WORD_LENGTH:96,STOP_BITS:128,HW_RESET:0},mo={DTR_ENABLE:1,RX_INT_DIS:2,TX_INT_EN:4,RTS_TX_INT_EN:12,RX_ECHO:16,PARITY_EN:32,PARITY_CNF:192,HW_RESET:0,HW_RESET_MOS:2};var ho=class{buffer(e){for(let t=0;t<e.length;t++)this._receiveBuffer.push(e[t]);let t=this._receiveBuffer.length-16;t=t<0?0:t;for(let e=0;e<t;e++)this._receiveBuffer.shift(),this._status|=fo.OVRN;this._status|=fo.RX_FULL,(this._control&mo.RX_INT_DIS)==0&&this.irq(!0)}set data(e){let t=new Uint8Array(1).fill(e);this._extFuncs.sendData(t),this._command&mo.TX_INT_EN&&this.irq(!0)}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(fo.PE|fo.FE|fo.OVRN),this._receiveBuffer.length?(this._status|=fo.RX_FULL,(this._control&mo.RX_INT_DIS)==0&&this.irq(!0)):this._status&=~fo.RX_FULL,this._lastRead}set control(e){this._control=e,this.serialConfigChange(this.buildConfigChange())}get control(){return this._control}set command(e){this._command=e,this.serialConfigChange(this.buildConfigChange())}get command(){return this._command}get status(){let e=this._status;return this._status&fo.IRQ&&this.irq(!1),this._status&=~fo.IRQ,e}set status(e){this.reset()}irq(e){e?this._status|=fo.IRQ:this._status&=~fo.IRQ,this._extFuncs.interrupt(e)}buildConfigChange(){let e={};switch(this._control&po.BAUD_RATE){case 0:e.baud=0;break;case 1:e.baud=50;break;case 2:e.baud=75;break;case 3:e.baud=109;break;case 4:e.baud=134;break;case 5:e.baud=150;break;case 6:e.baud=300;break;case 7:e.baud=600;break;case 8:e.baud=1200;break;case 9:e.baud=1800;break;case 10:e.baud=2400;break;case 11:e.baud=3600;break;case 12:e.baud=4800;break;case 13:e.baud=7200;break;case 14:e.baud=9600;break;case 15:e.baud=19200;break}switch(this._control&po.WORD_LENGTH){case 0:e.bits=8;break;case 32:e.bits=7;break;case 64:e.bits=6;break;case 96:e.bits=5;break}if(this._control&po.STOP_BITS?e.stop=2:e.stop=1,e.parity=`none`,this._command&mo.PARITY_EN)switch(this._command&mo.PARITY_CNF){case 0:e.parity=`odd`;break;case 64:e.parity=`even`;break;case 128:e.parity=`mark`;break;case 192:e.parity=`space`;break}return e}serialConfigChange(e){let t=!1;(e.baud!=this._lastConfig.baud||e.baud>0)&&(t=!0),e.bits!=this._lastConfig.bits&&(t=!0),e.stop!=this._lastConfig.stop&&(t=!0),e.parity!=this._lastConfig.parity&&(t=!0),t&&(this._lastConfig=e,this._extFuncs.serialConfig(this._lastConfig))}reset(){this._control=po.HW_RESET,this._command=mo.HW_RESET,this._status=fo.HW_RESET,this.irq(!1),this._receiveBuffer=[]}constructor(e){this._extFuncs=e,this._control=po.HW_RESET,this._command=mo.HW_RESET,this._status=fo.HW_RESET,this._lastConfig=this.buildConfigChange(),this._lastRead=0,this._receiveBuffer=[],this.reset()}};let go=new Uint8Array([32,155,201,169,22,72,169,0,157,184,4,157,184,3,157,56,4,157,184,5,157,56,6,157,184,6,185,130,192,133,43,74,74,144,4,104,41,254,72,184,185,129,192,74,176,7,74,176,14,169,1,208,61,74,169,3,176,2,169,128,157,184,4,44,88,255,165,43,41,32,73,32,157,184,3,112,10,32,155,200,174,248,7,157,184,5,96,165,43,74,74,41,3,168,240,4,104,41,127,72,185,166,201,157,56,6,164,38,104,41,149,72,169,9,157,56,5,104,157,56,7,165,43,72,41,160,80,2,41,128,32,161,205,32,129,205,104,41,12,80,2,169,0,10,10,10,9,11,153,138,192,185,136,192,96,32,155,201,32,170,200,41,127,172,248,7,190,184,5,96,32,255,202,176,5,32,44,204,144,246,96,32,30,202,104,168,104,170,165,39,96,240,41,189,184,6,16,5,94,184,6,208,36,32,62,204,144,26,189,184,3,41,192,240,14,165,39,201,224,144,8,189,184,4,9,64,157,184,4,40,240,208,208,203,32,255,202,144,220,32,17,204,40,8,240,218,32,209,201,76,208,200,32,26,203,176,183,165,39,72,189,56,7,41,192,208,22,165,36,240,66,201,8,240,4,201,16,208,10,9,240,61,184,6,24,101,36,133,36,189,184,6,197,36,240,41,169,160,144,8,189,56,7,10,16,31,169,136,133,39,44,88,255,8,112,12,234,44,88,255,80,184,174,248,7,76,239,201,32,181,201,32,107,203,76,104,201,104,184,8,133,39,72,32,104,203,32,181,201,104,73,141,10,208,5,157,184,6,133,36,189,184,4,16,13,189,56,6,240,8,24,253,184,6,169,141,144,218,40,112,164,189,56,7,48,22,188,184,6,10,48,14,152,160,0,56,253,56,6,201,248,144,3,105,39,168,132,36,76,184,200,142,248,7,132,38,169,0,157,184,5,96,41,72,80,132,133,39,32,155,201,32,99,203,76,163,200,165,39,73,8,10,240,4,73,238,208,9,222,184,6,16,3,157,184,6,96,201,192,176,251,254,184,6,96,189,56,7,41,8,240,22,189,184,4,164,39,192,148,208,4,9,128,208,6,192,146,208,5,41,127,157,184,4,96,138,10,10,10,10,133,38,169,0,157,184,5,112,15,160,0,177,60,133,39,32,2,204,32,186,252,144,242,96,32,210,202,144,251,185,136,192,160,0,145,60,32,186,252,144,239,96,189,184,4,16,49,169,2,72,169,127,32,226,205,164,36,177,40,133,39,169,7,37,79,208,16,164,36,169,223,209,40,208,2,165,39,145,40,230,79,230,79,189,184,4,48,9,32,17,204,104,169,141,133,39,96,32,255,202,144,12,32,17,204,32,209,201,32,163,204,76,43,202,32,62,204,144,198,112,190,189,56,7,10,16,34,104,168,165,39,192,1,240,32,176,52,201,155,208,6,200,152,72,76,43,202,201,193,144,8,201,219,176,4,9,32,133,39,152,72,32,104,203,76,43,202,201,155,240,226,201,176,144,10,201,187,176,6,168,185,9,202,133,39,160,0,240,226,201,155,208,222,160,0,240,201,155,156,159,219,220,223,251,252,253,254,255,162,202,202,208,253,56,233,1,208,246,174,248,7,96,164,38,185,137,192,72,41,32,74,74,133,53,104,41,15,201,8,144,4,41,7,176,2,165,53,5,53,240,5,9,32,157,184,5,96,164,38,185,137,192,41,112,201,16,96,32,210,202,144,21,185,136,192,9,128,201,138,208,9,168,189,56,7,41,32,208,3,152,56,96,24,96,164,38,185,129,192,74,176,54,189,184,4,41,7,240,5,32,252,205,56,96,165,39,41,127,221,56,5,208,5,254,184,4,56,96,189,56,7,41,8,240,21,32,255,202,144,16,201,147,240,14,72,189,56,7,74,74,104,144,4,157,184,6,24,96,32,170,200,201,145,208,249,24,96,32,26,203,176,241,32,158,204,164,38,185,129,192,74,144,78,74,144,75,165,39,72,189,56,4,201,103,144,16,201,108,176,34,201,107,104,72,73,155,41,127,208,24,176,25,189,184,4,41,31,9,128,133,39,32,2,204,32,170,200,73,134,208,237,157,56,4,222,56,4,104,133,39,73,141,10,208,10,189,184,3,41,48,240,3,157,56,4,32,2,204,76,234,203,32,2,204,10,168,189,184,3,192,24,240,12,74,74,192,20,240,6,74,74,192,26,208,37,41,3,240,13,168,185,254,203,168,169,32,32,196,202,136,208,248,165,39,10,201,26,208,13,189,56,7,106,144,7,169,138,133,39,76,107,203,96,1,8,64,32,245,202,208,251,152,9,137,168,165,39,153,255,191,96,72,164,36,165,39,145,40,104,201,149,208,12,165,39,201,32,176,6,32,223,204,89,219,204,133,39,96,24,189,56,7,41,4,240,9,173,0,192,16,4,141,16,192,56,96,230,78,208,2,230,79,32,44,204,184,144,243,32,17,204,41,127,221,56,5,208,61,164,38,185,129,192,74,176,53,160,10,185,147,204,133,39,152,72,32,163,204,104,168,136,16,241,169,1,32,123,206,32,52,204,16,251,201,136,240,225,133,39,32,163,204,32,26,203,189,184,4,41,7,208,232,169,141,133,39,44,88,255,56,96,186,195,211,211,160,197,204,208,208,193,141,189,56,7,16,19,189,56,7,41,2,240,13,189,184,4,41,56,240,6,138,72,169,175,72,96,32,223,204,9,128,201,224,144,6,89,211,204,76,246,253,201,193,144,249,201,219,176,245,89,215,204,144,240,32,0,224,32,0,0,0,192,0,0,224,192,189,184,3,42,42,42,41,3,168,165,39,96,66,103,192,84,71,166,67,135,166,81,71,184,82,199,172,90,231,243,73,144,211,75,144,223,69,67,128,70,227,4,76,227,1,88,227,8,84,131,64,83,67,64,77,227,32,0,66,246,124,80,246,154,68,246,155,70,246,70,76,246,64,67,246,58,84,214,52,78,144,232,83,86,96,0,169,63,160,7,208,16,169,207,160,5,208,10,169,243,160,3,208,4,169,252,160,1,61,184,3,133,42,189,56,4,41,3,24,106,42,136,208,252,5,42,157,184,3,96,41,7,10,10,10,133,42,10,197,38,240,15,189,184,4,41,199,5,42,157,184,4,169,0,157,56,6,96,41,15,208,7,185,129,192,74,74,74,74,9,16,133,42,169,224,133,43,185,139,192,37,43,5,42,153,139,192,96,136,10,10,10,10,10,133,42,169,31,208,231,30,184,4,56,176,16,153,137,192,32,147,254,32,137,254,174,248,7,30,184,4,24,126,184,4,96,185,138,192,72,9,12,153,138,192,169,233,32,196,202,104,153,138,192,96,169,40,157,56,6,169,128,29,56,7,208,5,169,254,61,56,7,157,56,7,96,201,40,144,14,157,56,6,169,63,208,238,30,56,5,56,126,56,5,96,168,165,39,41,127,201,32,208,9,192,3,240,1,96,169,4,208,109,201,13,208,18,32,121,206,192,7,240,1,96,169,205,72,189,56,4,72,164,38,96,133,53,169,206,72,185,48,206,72,165,53,96,167,55,97,137,138,167,137,137,221,56,5,208,6,222,184,4,76,2,204,201,48,144,13,201,58,176,9,41,15,157,56,4,169,2,208,39,201,32,176,6,157,56,5,76,121,206,160,0,240,77,73,48,201,10,176,13,160,10,125,56,4,136,208,250,157,56,4,240,21,160,46,208,54,169,0,133,42,174,248,7,189,184,4,41,248,5,42,157,184,4,96,168,189,56,4,192,68,240,9,192,69,208,17,29,56,7,208,5,73,255,61,56,7,157,56,7,169,6,208,211,169,32,157,184,5,208,245,185,235,204,240,244,197,53,240,5,200,200,200,208,242,200,185,235,204,133,42,41,32,208,7,189,56,7,41,16,208,235,189,56,7,74,74,36,42,176,4,16,224,48,2,80,220,165,42,72,41,7,32,123,206,200,104,41,16,208,7,185,235,204,157,56,4,96,169,205,72,185,235,204,72,164,38,189,56,4,96,194,44,88,255,112,12,56,144,24,184,80,6,1,49,142,148,151,154,133,39,134,53,138,72,152,72,8,120,141,255,207,32,88,255,186,189,0,1,141,248,7,170,10,10,10,10,133,38,168,40,80,41,30,56,5,94,56,5,185,138,192,41,31,208,5,169,239,32,5,200,228,55,208,11,169,7,197,54,240,5,133,54,24,144,8,228,57,208,249,169,5,133,56,189,56,7,41,2,8,144,3,76,191,200,189,184,4,72,10,16,14,166,53,165,39,9,32,157,0,2,133,39,174,248,7,104,41,191,157,184,4,40,240,6,32,99,203,76,181,200,76,252,200,32,0,200,162,0,96,76,155,200,76,170,201,74,32,155,201,176,8,32,245,202,240,6,24,144,3,32,210,202,189,184,5,170,96,162,3,181,54,72,202,16,250,174,248,7,189,56,6,133,54,189,184,4,41,56,74,74,74,9,192,133,55,138,72,165,39,72,9,128,32,237,253,104,133,39,104,141,248,7,170,10,10,10,10,133,38,141,255,207,165,54,157,56,6,162,0,104,149,54,232,224,4,144,248,174,248,7,96,193,208,208,204,197,8]),_o=1,vo,yo=e=>{Rn(_o,e)},bo=e=>{console.log(`SerialConfig: `,e),bu(e)},xo=e=>{vo&&vo.buffer(e)},So=()=>{vo&&vo.reset()},Co=(e=!0,t=1)=>{if(!e)return;_o=t,vo=new ho({sendData:hu,interrupt:yo,serialConfig:bo});let n=new Uint8Array(go.length+256);n.set(go.slice(1792,2048)),n.set(go,256),Dr(_o,n),Er(_o,wo)},wo=(e,t=-1)=>{if(e>=49408)return-1;let n={DIPSW1:1,DIPSW2:2,IOREG:8,STATUS:9,COMMAND:10,CONTROL:11};switch(e&15){case n.DIPSW1:return 226;case n.DIPSW2:return 40;case n.IOREG:if(t>=0)vo.data=t;else return vo.data;break;case n.STATUS:if(t>=0)vo.status=t;else return vo.status;break;case n.COMMAND:if(t>=0)vo.command=t;else return vo.command;break;case n.CONTROL:if(t>=0)vo.control=t;else return vo.control;break;default:console.log(`SSC unknown softswitch`,(e&15).toString(16));break}return-1},To=(e,t)=>String(e).padStart(t,`0`);(()=>{let e=new Uint8Array(256).fill(96);return e[0]=8,e[2]=40,e[4]=88,e[6]=112,e})();let Eo=()=>{let e=new Date,t=To(e.getMonth()+1,2)+`,`+To(e.getDay(),2)+`,`+To(e.getDate(),2)+`,`+To(e.getHours(),2)+`,`+To(e.getMinutes(),2);for(let e=0;e<t.length;e++)A(512+e,t.charCodeAt(e)|128)},Do=!1,Oo=e=>{let t=e.split(`,`),n=t[0].split(/([+-])/);return{label:n[0]?n[0]:``,operation:n[1]?n[1]:``,value:n[2]?parseInt(n[2].replace(`#`,``).replace(`$`,`0x`)):0,idx:t[1]?t[1]:``}},ko=e=>{let t=s.IMPLIED,n=-1;if(e.length>0){e.startsWith(`#`)?(t=s.IMM,e=e.substring(1)):e.startsWith(`(`)?(t=e.endsWith(`,Y`)?s.IND_Y:e.endsWith(`,X)`)?s.IND_X:s.IND,e=e.substring(1)):t=e.endsWith(`,X`)?e.length>5?s.ABS_X:s.ZP_X:e.endsWith(`,Y`)?e.length>5?s.ABS_Y:s.ZP_Y:e.length>3?s.ABS:s.ZP_REL,e.startsWith(`$`)&&(e=`0x`+e.substring(1)),n=parseInt(e);let r=Oo(e);if(r.operation&&r.value){switch(r.operation){case`+`:n+=r.value;break;case`-`:n-=r.value;break;default:console.error(`Unknown operation in operand: `+e)}n=(n%65536+65536)%65536}}return[t,n]},Ao={},jo=(e,t,n,r)=>{let i=s.IMPLIED,a=-1;if(n.match(/^[#]?[$0-9()]+/))return Object.entries(Ao).forEach(([e,t])=>{n=n.replace(RegExp(`\\b${e}\\b`,`g`),`$`+u(t))}),ko(n);let o=Oo(n);if(o.label){let c=o.label.startsWith(`<`),u=o.label.startsWith(`>`),d=o.label.startsWith(`#`)||u||c;if(d&&(o.label=o.label.substring(1)),o.label in Ao?(a=Ao[o.label],u?a=a>>8&255:c&&(a&=255)):r===2&&console.error(`Missing label: `+o.label),o.operation&&o.value){switch(o.operation){case`+`:a+=o.value;break;case`-`:a-=o.value;break;default:console.error(`Unknown operation in operand: `+n)}a=(a%65536+65536)%65536}l(t)?(i=s.ZP_REL,a=a-e+254,a>255&&(a-=256)):d?i=s.IMM:(i=a>=0&&a<=255?s.ZP_REL:s.ABS,i=o.idx===`X`?i===s.ABS?s.ABS_X:s.ZP_X:i,i=o.idx===`Y`?i===s.ABS?s.ABS_Y:s.ZP_Y:i)}return[i,a]},Mo=(e,t)=>{e=e.replace(/\s+/g,` `);let n=e.split(` `);return{label:n[0]?n[0]:t,instr:n[1]?n[1]:``,operand:n[2]?n[2]:``}},No=(e,t)=>{if(e.label in Ao&&console.error(`Redefined label: `+e.label),e.instr===`EQU`){let[n,r]=jo(t,e.instr,e.operand,2);n!==s.ABS&&n!==s.ZP_REL&&console.error(`Illegal EQU value: `+e.operand),Ao[e.label]=r}else Ao[e.label]=t},Po=e=>{let t=[];switch(e.instr){case`ASC`:case`DA`:{let n=e.operand,r=0;n.startsWith(`"`)&&n.endsWith(`"`)?r=128:n.startsWith(`'`)&&n.endsWith(`'`)?r=0:console.error(`Invalid string: `+n),n=n.substring(1,n.length-1);for(let e=0;e<n.length;e++)t.push(n.charCodeAt(e)|r);t.push(0);break}case`HEX`:(e.operand.replace(/,/g,``).match(/.{1,2}/g)||[]).forEach(n=>{let r=parseInt(n,16);isNaN(r)&&console.error(`Invalid HEX value: ${n} in ${e.operand}`),t.push(r)});break;default:console.error(`Unknown pseudo ops: `+e.instr);break}return t},Fo=(e,t)=>{let n=[],r=V[e];return n.push(e),t>=0&&(n.push(t%256),r.bytes===3&&n.push(Math.trunc(t/256))),n},Io=0,Lo=(e,t)=>{let n=Io,r=[],i=``;if(e.forEach(e=>{if(e=e.split(`;`)[0].trimEnd().toUpperCase(),!e)return;let a=(e+`                   `).slice(0,30)+u(n,4)+`- `,o=Mo(e,i);if(i=``,!o.instr){i=o.label;return}if(o.instr===`ORG`){if(t===1){let[e,t]=ko(o.operand);e===s.ABS&&(Io=t,n=t)}Do&&t===2&&console.log(a);return}if(t===1&&o.label&&No(o,n),o.instr===`EQU`)return;let c=[],d,f;if([`ASC`,`DA`,`HEX`].includes(o.instr))c=Po(o),n+=c.length;else if([d,f]=jo(n,o.instr,o.operand,t),t===2&&isNaN(f)&&console.error(`Unknown/illegal value: ${e}`),o.instr===`DB`)c.push(f&255),n++;else if(o.instr===`DW`)c.push(f&255),c.push(f>>8&255),n+=2;else if(o.instr===`DS`)for(let e=0;e<f;e++)c.push(0),n++;else{t===2&&l(o.instr)&&(f<0||f>255)&&console.error(`Branch instruction out of range: ${e} value: ${f} pass: ${t}`);let r=V.findIndex(e=>e&&e.name===o.instr&&e.mode===d);r<0&&console.error(`Unknown instruction: "${e}" mode=${d} pass=${t}`),c=Fo(r,f),n+=V[r].bytes}Do&&t===2&&(c.forEach(e=>{a+=` ${u(e)}`}),console.log(a)),r.push(...c)}),Do&&t===2){let e=``;r.forEach(t=>{e+=` ${u(t)}`}),console.log(e)}return r},Ro=(e,t,n=!1)=>{Ao={},Do=n;try{return Io=e,Lo(t,1),Lo(t,2)}catch(e){return console.error(e),[]}},zo=49286,Bo=49289,Vo=49291,Ho=49292,Uo=49293,Wo=49294,Go=49295,Ko=(e,t,n,r,i)=>{let a=e&255,o=e>>8&3,s=t&255,c=t>>8&3;M(n,a),M(r,o<<4|c),M(i,s)},qo=(e,t,n)=>{let r=j(e),i=j(t),a=j(n),o=i>>4&3,s=i&3;return[r|o<<8,a|s<<8]},Jo=()=>qo(Bo,Vo,Ho),Yo=()=>qo(Uo,Wo,Go),Xo=(e,t)=>{Ko(e,t,Bo,Vo,Ho)},Zo=(e,t)=>{Ko(e,t,Uo,Wo,Go)},Qo=e=>{M(zo,e),pu(!!e)},$o=()=>{es=0,ts=0,Xo(0,1023),Zo(0,1023),Qo(0),G=0,rs=0,is=0,as=0,os=0,ss=0,cs=0,ls=0,ns=0},es=0,ts=0,ns=0,G=0,rs=0,is=0,as=0,os=0,ss=0,cs=0,ls=0,us=0,K=5,ds=()=>{let e=new Uint8Array(256).fill(0),t=Ro(0,`
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
`));return e.set(t,0),e[251]=214,e[255]=1,e},fs=(e=!0,t=5)=>{if(!e)return;K=t;let n=49152+K*256,r=49152+K*256+8;Dr(K,ds(),n,ys),Dr(K,ds(),r,Eo),Er(K,Ss),zo=49280+(zo&15)+K*16,Bo=49280+(Bo&15)+K*16,Vo=49280+(Vo&15)+K*16,Ho=49280+(Ho&15)+K*16,Uo=49280+(Uo&15)+K*16,Wo=49280+(Wo&15)+K*16,Go=49280+(Go&15)+K*16;let[i,a]=Jo();i===0&&a===0&&(Xo(0,1023),Zo(0,1023)),j(zo)!==0&&pu(!0)},ps=()=>{let e=j(zo);if(e&1){let t=!1;e&8&&(ls|=8,t=!0),e&rs&4&&(ls|=4,t=!0),e&rs&2&&(ls|=2,t=!0),t&&Rn(K,!0)}},ms=e=>{if(j(zo)&1)if(e.buttons>=0){switch(e.buttons){case 0:G&=-129;break;case 16:G|=128;break;case 1:G&=-17;break;case 17:G|=16;break}rs|=G&128?4:0}else{if(e.x>=0&&e.x<=1){let[t,n]=Jo();es=Math.round((n-t)*e.x+t),rs|=2}if(e.y>=0&&e.y<=1){let[t,n]=Yo();ts=Math.round((n-t)*e.y+t),rs|=2}}},hs=0,gs=``,_s=0,vs=0,ys=()=>{let e=192+K;k(55)===e&&k(54)===0?xs():k(57)===e&&k(56)===0&&bs()},bs=()=>{if(hs===0){let e=192+K;_s=k(55),vs=k(54),A(55,e),A(54,3);let t=(G&128)!=(is&128),n=0;n=G&128?t?2:1:t?3:4,k(49152)&128&&(n=-n),is=G,gs=es.toString()+`,`+ts.toString()+`,`+n.toString()}hs>=gs.length?(N.Accum=141,hs=0,A(55,_s),A(54,vs)):(N.Accum=gs.charCodeAt(hs)|128,hs++)},xs=()=>{switch(N.Accum){case 128:console.log(`mouse off`),Qo(0);break;case 129:console.log(`mouse on`),Qo(1);break;default:break}},Ss=(e,t)=>{if(e>=49408)return-1;let n=t<0,r={CLOCK:0,LOWX:1,HIGHX:2,LOWY:3,HIGHY:4,STATUS:5,MODE:6,CLAMP:7,CLOCKMAGIC:8,COMMAND:10},i={INIT:0,READ:1,CLEAR:2,GCLAMP:3,SERVE:4,HOME:5,CLAMPX:6,CLAMPY:7,POS:8};switch(e&15){case r.LOWX:if(n)return es&255;ss=ss&65280|t,ss&=65535;break;case r.HIGHX:if(n)return es>>8&255;ss=t<<8|ss&255,ss&=65535;break;case r.LOWY:if(n)return ts&255;cs=cs&65280|t,cs&=65535;break;case r.HIGHY:if(n)return ts>>8&255;cs=t<<8|cs&255,cs&=65535;break;case r.STATUS:return G;case r.MODE:if(n)return j(zo);Qo(t);break;case r.CLAMP:if(n){let[e,t]=Jo(),[n,r]=Yo();switch(ns){case 0:return e>>8&255;case 1:return n>>8&255;case 2:return e&255;case 3:return n&255;case 4:return t>>8&255;case 5:return r>>8&255;case 6:return t&255;case 7:return r&255;default:return console.log(`AppleMouse: invalid clamp index: `+ns),0}}ns=78-t;break;case r.CLOCK:case r.CLOCKMAGIC:return console.log(`clock registers not implemented: C080, C088`),0;case r.COMMAND:if(n)return us;switch(us=t,t){case i.INIT:es=0,ts=0,as=0,os=0,Xo(0,1023),Zo(0,1023),G=0,rs=0;break;case i.READ:rs=0,G&=-112,G|=is>>1&64,G|=is>>4&1,is=G,(as!==es||os!==ts)&&(G|=32,as=es,os=ts);break;case i.CLEAR:console.log(`cmd.clear`),es=0,ts=0,as=0,os=0;break;case i.SERVE:G&=-15,G|=ls,ls=0,Rn(K,!1);break;case i.HOME:{let[e]=Jo(),[t]=Yo();es=e,ts=t}break;case i.CLAMPX:{let e=ss>32767?ss-65536:ss,t=cs;Xo(e,t),console.log(e+` -> `+t)}break;case i.CLAMPY:{let e=ss>32767?ss-65536:ss,t=cs;Zo(e,t),console.log(e+` -> `+t)}break;case i.GCLAMP:console.log(`cmd.getclamp`);break;case i.POS:es=ss,ts=cs;break}break;default:console.log(`AppleMouse unknown IO addr`,e.toString(16));break}return t},q={RX_FULL:1,TX_EMPTY:2,DCD:4,CTS:8,FE:16,OVRN:32,PE:64,IRQ:128},Cs={COUNTER_DIV:3,WORD_SEL:28,TX_RTS:96,RX_INT_ENABLE:128},ws={DIV01:0,DIV16:1,DIV64:2,RESET:3},Ts={RTS_NO_INT:0,RTS_TX_INT:32,RTS_CLEAR:64,RTS_BREAK:96};var Es=class{update(e){(this._status&q.TX_EMPTY)===0&&(this._outDelay+=e,this._outDelay>320&&(this._outDelay=0,this._status|=q.TX_EMPTY,(this._control&Cs.TX_RTS)===Ts.RTS_TX_INT&&this.irq(!0)))}buffer(e){for(let t=0;t<e.length;t++)this._receiveBuffer.push(e[t]);let t=this._receiveBuffer.length-16;t=t<0?0:t;for(let e=0;e<t;e++)this._receiveBuffer.shift(),this._status|=q.OVRN;this._status|=q.RX_FULL,this._control&Cs.RX_INT_ENABLE&&this.irq(!0)}set data(e){let t=new Uint8Array(1).fill(e);this._extFuncs.sendData(t),this._status&=~q.TX_EMPTY,this._outCount++}get data(){return this._receiveBuffer.length&&(this._lastRead=this._receiveBuffer.shift()),this._status&=~(q.DCD|q.FE|q.OVRN|q.PE),this._receiveBuffer.length?(this._status|=q.RX_FULL,this._control&Cs.RX_INT_ENABLE&&this.irq(!0)):(this._status&=~q.RX_FULL,this.irq(!1)),this._lastRead}set control(e){this._control,this._control=e,(this._control&Cs.COUNTER_DIV)===ws.RESET?this.reset():(this._control&Cs.TX_RTS)==Ts.RTS_TX_INT&&(this._status&=~q.TX_EMPTY),this._status&q.RX_FULL&&this._control&Cs.RX_INT_ENABLE&&this.irq(!0)}get status(){let e=this._status;return this._status&q.IRQ&&this.irq(!1),e}irq(e){e?this._status|=q.IRQ:this._status&=~q.IRQ,this._extFuncs.interrupt(e)}reset(){this._control=0,this._status=q.TX_EMPTY|q.DCD,this.irq(!1),this._receiveBuffer=[],this._outCount=0,this._outDelay=0}constructor(e){this._extFuncs=e,this._lastRead=0,this._control=0,this._status=0,this._receiveBuffer=[],this._outCount=0,this._outDelay=0,this.reset()}};let J={OUTPUT_ENABLE:128,IRQ_ENABLE:64,COUNTER_MODE:56,BIT8_MODE:4,INTERNAL_CLOCK:2,SPECIAL:1},Ds={TIMER1_IRQ:1,TIMER2_IRQ:2,TIMER3_IRQ:4,ANY_IRQ:128},Os=(e,t)=>{let n=``;if(t&J.OUTPUT_ENABLE?n+=`OE   `:n+=`/OE  `,t&J.IRQ_ENABLE?n+=`IRQ  `:n+=`/IRQ `,t&J.BIT8_MODE?n+=`D8BIT `:n+=`16BIT `,t&J.INTERNAL_CLOCK?n+=`ICLK `:n+=`ECLK `,t&J.SPECIAL)switch(e){case 0:n+=`RST  `;break;case 1:n+=`WR0  `;break;case 2:n+=`DIV8 `;break}else switch(e){case 0:n+=`RUN  `;break;case 1:n+=`WR2  `;break;case 2:n+=`DIV1 `;break}switch(n+=`-> `,t&J.COUNTER_MODE){case 0:n+=`CONTINUOUS0`;break;case 8:n+=`FREQUENCY_CMP0`;break;case 16:n+=`CONTINUOUS1`;break;case 24:n+=`PULSE_WIDTH_CMP0`;break;case 32:n+=`SINGLE_SHOT0`;break;case 40:n+=`FREQUENCY_CMP1`;break;case 48:n+=`SINGLE_SHOT1`;break;case 56:n+=`PULSE_WIDTH_CMP1`;break}return n};var ks=class{decrement(e){return this._enabled?(this._count-=e,this._count<0?(this._count=65535,this._enabled=!1,!0):!1):!1}get count(){return this._count}set control(e){this._control=e}get control(){return this._control}set latch(e){switch(this._latch=e,this._control&J.COUNTER_MODE){case 0:case 32:this.reload();break;default:break}}get latch(){return this._latch}reload(){this._count=this._latch,this._enabled=!0}reset(){this._latch=65535,this._control=0,this._enabled=!0,this.reload()}constructor(){this._latch=65535,this._count=65535,this._control=0,this._enabled=!0}},As=class{status(){return this._statusRead=this._status&7,this._status}timerControl(e,t){e===0&&(e=this._timer[1].control&J.SPECIAL?0:2);let n=this._timer[e].control;if(this._timer[e].control=t,n!=t&&(t&J.IRQ_ENABLE?this._irqMask|=1<<e:this._irqMask&=~(1<<e),e==0))switch((n&J.SPECIAL)<<1|t&J.SPECIAL){case 0:case 3:break;case 1:case 2:this._timer[0].reload(),this._timer[1].reload(),this._timer[2].reload(),this.irq(0,!1),this.irq(1,!1),this.irq(2,!1);break}}timerLSBw(e,t){let n=this._timer[0].control&J.SPECIAL,r=!1;switch(this._timer[e].control&J.COUNTER_MODE){case 16:case 48:r=!0;break}let i=this._msb*256+t;this._timer[e].latch=i,(n||r)&&this._timer[e].reload(),this.irq(e,!1)}timerLSBr(e){return this._lsb}timerMSBw(e,t){this._msb=t}timerMSBr(e){let t=this._timer[0].control&J.SPECIAL?this._timer[e].latch:this._timer[e].count;return this._lsb=t&255,this._statusRead&1<<e&&(this._statusRead&=~(1<<e),this.irq(e,!1)),t>>8&255}update(e){let t=this._timer[0].control&J.SPECIAL;if(this._debugStatus&&(this._debugStatusCount++,this._debugStatusCount>1020300&&(this._debugStatusCount=0,this.printStatus())),!t){this._div8+=e;let t=!1;for(let n=0;n<3;n++){let r=e;if(n==2&&this._timer[2].control&J.SPECIAL)if(this._div8>8)r=Math.floor(this._div8/8),this._div8%=8;else continue;if(t=this._timer[n].decrement(r),t)switch(this.irq(n,!0),this._timer[n].control&J.COUNTER_MODE){case 0:case 16:this._timer[n].reload();break;default:break}}}}irq(e,t){let n=1<<e;t?this._status|=n:this._status&=~n,this._status&this._irqMask?(this._status|=Ds.ANY_IRQ,this._statusRead&=~n,this._interrupt(!0)):(this._status&=~Ds.ANY_IRQ,this._interrupt(!1))}printStatus(){console.log(`Status : `+this._status.toString(16)),console.log(`IRQMask: `+this._irqMask.toString(16));for(let e=0;e<3;e++)console.log(`[`+e+`]: `+Os(e,this._timer[e].control)+` : `+this._timer[e].latch+` : `+this._timer[e].count)}reset(){this._timer.forEach(e=>{e.reset()}),this._status=0,this._irqMask=0,this.irq(0,!1),this.irq(1,!1),this.irq(2,!1),this._timer[0].control=J.SPECIAL}constructor(e){this._interrupt=e,this._status=0,this._irqMask=0,this._statusRead=0,this._timer=[new ks,new ks,new ks],this._msb=this._lsb=0,this._div8=0,this._debugStatus=!1,this._debugStatusCount=0,this.reset()}};let js=2,Y,Ms,Ns=0,Ps=e=>{if(Ns){let e=N.cycleCount-Ns;Y.update(e),Ms.update(e)}Ns=N.cycleCount},Fs=e=>{Rn(js,e)},Is=e=>{Ms&&Ms.buffer(e)},Ls=(e=!0,t=2)=>{e&&(js=t,Y=new As(Fs),Ms=new Es({sendData:gu,interrupt:Fs}),Er(js,zs),Un(Ps,js))},Rs=()=>{Y&&(Y.reset(),Ms.reset())},zs=(e,t=-1)=>{if(e>=49408)return-1;let n={TCONTROL1:0,TCONTROL2:1,T1MSB:2,T1LSB:3,T2MSB:4,T2LSB:5,T3MSB:6,T3LSB:7,ACIASTATCTRL:8,ACIADATA:9,SDMIDICTRL:12,SDMIDIDATA:13,DRUMSET:14,DRUMCLEAR:15},r=-1;switch(e&15){case n.SDMIDIDATA:case n.ACIADATA:t>=0?Ms.data=t:r=Ms.data;break;case n.SDMIDICTRL:case n.ACIASTATCTRL:t>=0?Ms.control=t:r=Ms.status;break;case n.TCONTROL1:t>=0?Y.timerControl(0,t):r=0;break;case n.TCONTROL2:t>=0?Y.timerControl(1,t):r=Y.status();break;case n.T1MSB:t>=0?Y.timerMSBw(0,t):r=Y.timerMSBr(0);break;case n.T1LSB:t>=0?Y.timerLSBw(0,t):r=Y.timerLSBr(0);break;case n.T2MSB:t>=0?Y.timerMSBw(1,t):r=Y.timerMSBr(1);break;case n.T2LSB:t>=0?Y.timerLSBw(1,t):r=Y.timerLSBr(1);break;case n.T3MSB:t>=0?Y.timerMSBw(2,t):r=Y.timerMSBr(2);break;case n.T3LSB:t>=0?Y.timerLSBw(2,t):r=Y.timerLSBr(2);break;case n.DRUMSET:case n.DRUMCLEAR:break;default:console.log(`PASSPORT unknown IO`,(e&15).toString(16));break}return r},Bs=(e=!0,t=4)=>{e&&(Er(t,wc),Un(hc,t))},Vs=[0,128],Hs=[1,129],Us=[2,130],Ws=[3,131],Gs=[4,132],Ks=[5,133],qs=[6,134],Js=[7,135],Ys=[8,136],Xs=[9,137],Zs=[10,138],Qs=[11,139],$s=[12,140],ec=[13,141],tc=[14,142],nc=[16,145],rc=[17,145],ic=[18,146],ac=[32,160],oc=(e=4)=>{for(let t=0;t<=255;t++)O(e,t,0);for(let t=0;t<=1;t++)yc(e,t)},sc=(e,t)=>(D(e,tc[t])&64)!=0,cc=(e,t)=>(D(e,ic[t])&64)!=0,lc=(e,t)=>(D(e,Qs[t])&64)!=0,uc=(e,t,n)=>{let r=D(e,Gs[t])-n;if(O(e,Gs[t],r),r<0){r=r%256+256,O(e,Gs[t],r);let n=D(e,Ks[t]);if(n--,O(e,Ks[t],n),n<0&&(n+=256,O(e,Ks[t],n),sc(e,t)&&(!cc(e,t)||lc(e,t)))){let n=D(e,ic[t]);O(e,ic[t],n|64);let r=D(e,ec[t]);if(O(e,ec[t],r|64),xc(e,t,-1),lc(e,t)){let n=D(e,Js[t]),r=D(e,qs[t]);O(e,Gs[t],r),O(e,Ks[t],n)}}}},dc=(e,t)=>(D(e,tc[t])&32)!=0,fc=(e,t)=>(D(e,ic[t])&32)!=0,pc=(e,t,n)=>{if(D(e,Qs[t])&32)return;let r=D(e,Ys[t])-n;if(O(e,Ys[t],r),r<0){r=r%256+256,O(e,Ys[t],r);let n=D(e,Xs[t]);if(n--,O(e,Xs[t],n),n<0&&(n+=256,O(e,Xs[t],n),dc(e,t)&&!fc(e,t))){let n=D(e,ic[t]);O(e,ic[t],n|32);let r=D(e,ec[t]);O(e,ec[t],r|32),xc(e,t,-1)}}},mc=Array(8).fill(0),hc=e=>{let t=N.cycleCount-mc[e];for(let n=0;n<=1;n++)uc(e,n,t),pc(e,n,t);mc[e]=N.cycleCount},gc=(e,t)=>{let n=[];for(let r=0;r<=15;r++)n[r]=D(e,ac[t]+r);return n},_c=(e,t)=>e.length===t.length&&e.every((e,n)=>e===t[n]),vc={slot:-1,chip:-1,params:[-1]},yc=(e,t)=>{let n=gc(e,t);e===vc.slot&&t===vc.chip&&_c(n,vc.params)||(vc.slot=e,vc.chip=t,vc.params=n,mu({slot:e,chip:t,params:n}))},bc=(e,t)=>{switch(D(e,Vs[t])&7){case 0:for(let n=0;n<=15;n++)O(e,ac[t]+n,0);yc(e,t);break;case 7:O(e,rc[t],D(e,Hs[t]));break;case 6:{let n=D(e,rc[t]),r=D(e,Hs[t]);n>=0&&n<=15&&(O(e,ac[t]+n,r),yc(e,t));break}case 4:break;default:break}},xc=(e,t,n)=>{let r=D(e,ec[t]);n>=0&&(r&=127-(n&127),O(e,ec[t],r));let i=D(e,tc[t]),a=(r&i&127)!=0;switch(t){case 0:Rn(e,a);break;case 1:zn(a);break}},Sc=(e,t,n)=>{let r=D(e,tc[t]);n>=0&&(n&=255,n&128?r|=n:r&=255-n),r|=128,O(e,tc[t],r),xc(e,t,-1)},Cc=1e3,wc=(e,t=-1)=>{if(e<49408)return-1;let n=(e&3840)>>8,r=e&255;Cc<500&&(Cc++,Ar(n,e,D(n,r),t));let i=r&128?1:0;switch(r){case Vs[i]:t>=0&&(O(n,Vs[i],t),bc(n,i));break;case Hs[i]:case Us[i]:case Ws[i]:case Zs[i]:case Qs[i]:case $s[i]:O(n,r,t);break;case Gs[i]:t>=0&&O(n,qs[i],t),xc(n,i,64);break;case Ks[i]:if(t>=0){O(n,Js[i],t),O(n,Gs[i],D(n,qs[i])),O(n,Ks[i],t);let e=D(n,ic[i]);O(n,ic[i],e&-65),xc(n,i,64)}break;case qs[i]:t>=0&&(O(n,r,t),xc(n,i,64));break;case Js[i]:t>=0&&O(n,r,t);break;case Ys[i]:t>=0&&O(n,nc[i],t),xc(n,i,32);break;case Xs[i]:if(t>=0){O(n,Xs[i],t),O(n,Ys[i],D(n,nc[i]));let e=D(n,ic[i]);O(n,ic[i],e&-33),xc(n,i,32)}break;case ec[i]:t>=0&&xc(n,i,t);break;case tc[i]:Sc(n,i,t);break;default:break}return-1},Tc=0,Ec=`
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
`,Dc=()=>{let e=new Uint8Array(256).fill(0),t=Ro(0,Ec.split(`
`));e.set(t,0);let n=Ro(0,`
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
`));return e.set(n,192),e[254]=23,e[255]=192,e},Oc=new Uint8Array,kc=(e=!0)=>{Oc.length===0&&(Oc=Dc()),Oc[1]=e?32:0,Dr(7,Oc,51136,Pc),Dr(7,Oc,51139,Nc)},Ac=(e,t)=>{if(e===0)A(t,2);else if(e<=2){A(t,240);let[,,n]=no(e),r=n/512;A(t+1,r&255),A(t+2,r>>>8),A(t+3,0),Zr(4),Qr(0)}else Xr(40),Zr(0),Qr(0),P()},jc=(e,t)=>{let[,,n]=no(e),r=n/512,i=r>1600?2:1,a=i==2?32:64;A(t,240),A(t+1,r&255),A(t+2,r>>>8),A(t+3,0);let o=`Apple2TS SP`;A(t+4,11);let s=0;for(;s<11;s++)A(t+5+s,o.charCodeAt(s));for(;s<16;s++)A(t+5+s,o.charCodeAt(8));A(t+21,i),A(t+22,a),A(t+23,1),A(t+24,0),Zr(25),Qr(0)},Mc=(e,t,n)=>{if(k(e)!==3){console.error(`Incorrect SmartPort parameter count at address ${e}`),Xr(4),P();return}let r=k(e+4);switch(r){case 0:Ac(t,n);break;case 1:case 2:Xr(33),P();break;case 3:case 4:jc(t,n);break;default:console.error(`SmartPort statusCode ${r} not implemented`);break}},Nc=()=>{Xr(0),P(!1);let e=256+N.StackPtr,t=k(e+1)+256*k(e+2),n=k(t+1),r=k(t+2)+256*k(t+3),i=k(r+1),a=k(r+2)+256*k(r+3);switch(n){case 0:Mc(r,i,a);return;case 1:{if(k(r)!==3){console.error(`Incorrect SmartPort parameter count at address ${r}`),P();return}let e=512*(k(r+4)+256*k(r+5)+65536*k(r+6)),[t,n]=no(i);Gr(a,t.slice(e+n,e+512+n));break}default:console.error(`SmartPort command ${n} not implemented`),P();return}let o=to(i);o.motorRunning=!0,Tc||=setTimeout(()=>{Tc=0,o&&(o.motorRunning=!1),io()},500),io()},Pc=()=>{Xr(0),P(!1);let e=k(66),t=Math.max(Math.min(k(67)>>6,2),0),n=to(t);if(!n.hardDrive)return;let[r,i,a]=no(t),o=k(70)+256*k(71),s=512*o,c=k(68)+256*k(69);switch(n.status=` ${u(o,4)}`,e){case 0:{if(n.filename.length===0||a===0){Zr(0),Qr(0),P();return}let e=a/512;Zr(e&255),Qr(e>>>8);break}case 1:if(s+512>a){P();return}Gr(c,r.slice(s+i,s+512+i));break;case 2:{if(s+512>a){P();return}if(n.isWriteProtected){P();return}let e=Wr(c);r.set(e,s+i),n.diskHasChanges=!0,n.lastAppleWriteTime=Date.now();break}case 3:console.error(`Hard drive format not implemented yet`),P();return;default:console.error(`unknown hard drive command`),P();return}P(!1),n.motorRunning=!0,Tc||=setTimeout(()=>{Tc=0,n&&(n.motorRunning=!1),io()},500),io()},Fc={numLines:En.numLines,collapseLoops:En.collapseLoops,ignoreRegisters:En.ignoreRegisters},Ic=e=>{Fc.numLines=e.numLines,Fc.collapseLoops=e.collapseLoops,Fc.ignoreRegisters=e.ignoreRegisters},X=[],Lc=()=>{if(X.length<50)return;let e=Fc.ignoreRegisters?24:99,t=X[X.length-1].slice(10,e),n=X.length-2,r=Math.max(X.length-20,0),i=-1;for(;n>=r;){if(X[n].slice(10,e)===t){i=n;break}n--}let a=X.length-i-1;if(i===-1||X.length-2*a<0)return;for(let t=i-1;t>=i-a+1;t--)if(X[t].slice(10,e)!==X[t+a].slice(10,e))return;let o=X[i-a].indexOf(`repeated`),s=`******** ${a===1?`1 line repeated`:`${a} lines repeated`}`;if(Fc.ignoreRegisters)for(let t=i-a+1;t<i;t++){let n=X[t],r=X[t+a];X[t+a]=r.slice(0,e)+r.slice(e).split(``).map((t,r)=>t===n[e+r]?t:`*`).join(``)}if(i>=a&&o>0){X.splice(i-a+1,a);let e=parseInt(X[i-a].slice(o+9))+1;X[i-a]=`${s} ${e} times`}else X[i]=`${s} 1 time`,X.splice(i-a+1,a-1);for(let e=i-a+1;e<X.length;e++)X[e].startsWith(`    `)?X[e]=`      ..`+X[e].slice(8):X[e].startsWith(`  `)?X[e]=`    ....`+X[e].slice(8):X[e].startsWith(`..`)?X[e]=`  ......`+X[e].slice(8):X[e]=`........`+X[e].slice(8)},Rc=e=>{X.length>Fc.numLines&&(X=X.slice(X.length-Fc.numLines)),X.push(e),Fc.collapseLoops&&Lc()},zc=()=>{X=[]},Bc=()=>X,Vc=0,Z=[],Hc=()=>Vc,Uc=()=>{let e=JSON.parse(JSON.stringify(N)),r=0,i=Array(256+256*(nr+1)).fill(0);for(let e=0;e<256;e++){let t=e*256;T.subarray(t,t+256).some(e=>e!==255)&&(i[e]=1,r++)}for(let e=0;e<256*(nr+1);e++){let t=n+e*256;T.subarray(t,t+256).some(e=>e!==255)&&(i[256+e]=1,r++)}let a=new Uint8Array(r*256);r=0;let o=0;i.forEach((e,t)=>{if(e){let e=(t<256?0:n-65536)+t*256,i=T.subarray(e,e+256);a.set(i,256*r),r++,o=t}});let s=T.subarray(t,65792);return{s6502:e,extraRamSize:64*(nr+1),machineName:xl(),softSwitches:bl(),stackDump:ci(),memvalid:i.slice(0,o+1).join(``),memC000:vn.Buffer.from(s).toString(`base64`),memory:vn.Buffer.from(a).toString(`base64`)}},Wc=(e,r)=>{let i=JSON.parse(JSON.stringify(e.s6502));Or(),Fl(e.machineName||`APPLE2EE`,!1),El(),ei(i);let a=e.softSwitches;for(let e in a){let t=e;try{x[t].isSet=a[e]}catch{}}`WRITEBSR1`in a&&(x.BSR_PREWRITE.isSet=!1,x.BSR_WRITE.isSet=a.WRITEBSR1||a.WRITEBSR2||a.RDWRBSR1||a.RDWRBSR2);let o=vn.Buffer.from(e.memory,`base64`);if(r<1){T.set(o.slice(0,65536)),T.set(o.slice(131072,163584),65536),T.set(o.slice(65536,131072),n);let e=(o.length-163584)/1024;e>0&&(pr(e+64),T.set(o.slice(163584),163584))}else if(r<2)pr(e.extraRamSize),T.set(o);else{let r=0;(typeof e.memvalid==`string`?e.memvalid.split(``).map(e=>+(e===`1`)):e.memvalid).forEach((e,t)=>{if(e){let e=o.subarray(r*256,r*256+256);t<256?T.set(e,t*256):T.set(e,n+(t-256)*256),r++}}),T.set(vn.Buffer.from(e.memC000,`base64`),t)}e.stackDump&&li(e.stackDump),xr(),Rt(!0)},Gc=e=>({emulator:null,state6502:Uc(),driveState:ao(e),thumbnail:``,snapshots:null}),Kc=()=>{let e=Gc(!0);return e.snapshots=Z,e},qc=(e,t=!1)=>{kl();let n=e.emulator?.version?e.emulator.version:.9;Wc(e.state6502,n),oo(e.driveState),t&&(Z.length=0,Vc=0),e.snapshots&&(Z.length=0,Z.push(...e.snapshots),Vc=Z.length),$l()},Jc=()=>{let e=Vc-1;return e<0||!Z[e]?-1:e},Yc=()=>{let e=Vc+1;return e>=Z.length||!Z[e]?-1:e},Xc=()=>{Z.length===30&&Z.shift(),Z.push(Gc(!1)),Vc=Z.length,_u(Z[Z.length-1].state6502.s6502.PC)},Zc=()=>{let e=Jc();e<0||(Wl(r.PAUSED),setTimeout(()=>{Vc===Z.length&&(Xc(),e=Math.max(Vc-2,0)),Vc=e,qc(Z[Vc])},50))},Qc=()=>{let e=Yc();e<0||(Wl(r.PAUSED),setTimeout(()=>{Vc=e,qc(Z[e])},50))},$c=e=>{e<0||e>=Z.length||(Wl(r.PAUSED),setTimeout(()=>{Vc=e,qc(Z[e])},50))},el=()=>{for(;Z.length>0&&Vc<Z.length-1;)Z.pop();Vc=Z.length},tl=()=>{let e=[];for(let t=0;t<Z.length;t++)e[t]={s6502:Z[t].state6502.s6502,thumbnail:Z[t].thumbnail};return e},nl=e=>{Z.length>0&&(Z[Z.length-1].thumbnail=e)},rl=0,il=0,al=!1,ol=`default`,sl=!1,cl=16.6881,ll=17030,Q=r.IDLE,ul=0,dl=0,fl=`APPLE2EE`,pl=!1,ml=0,hl=!1,gl=[],_l=e=>{hl=e},vl=()=>{x.VBL.isSet=!0,ps()},yl=()=>{x.VBL.isSet=!1},bl=()=>{let e={};for(let t in x)e[t]=x[t].isSet;return e},xl=()=>fl,Sl=e=>{ei(e),$l()},Cl=e=>{$r(e),$l()},wl=e=>{sl=e,$l()},Tl=!1,El=()=>{Tl||(Tl=!0,Co(),Ls(!0,2),Bs(!0,4),fs(!0,5),qa(),kc(),ia())},Dl=()=>{so(),Re(),$o(),Rs(),So(),oc(4)},Ol=()=>{$r(0),Or(),fr(fl),El();{let e=Ro(768,`
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
`));T.set(e,768)}kc(),kl(),to(1).filename===``&&(kc(!1),setTimeout(()=>{kc()},200))},kl=()=>{if(Bn(),ln(),k(49282),ti(),Dl(),Rt(!0),se()){ce(!1);let e=N.cycleCount,t=setInterval(()=>{N.cycleCount-e>1e3&&(ce(!0),clearInterval(t))},50)}},Al=e=>{rl=e,cl=rl===4?0:16.6881,ll=17030*[.1,.5,1,2,3,4,24][rl+2],Ul()},jl=e=>{ol=e},Ml=()=>ol===`game`||ol===`embed`,Nl=e=>{al=e,$l()},Pl=(e,t)=>{e>>8==192?A(e,t):T[e]=t,$l()},Fl=(e,t=!0)=>{fl=e,fr(fl),t&&kl(),$l()},Il=e=>{let t={...N},n=Wr(256),r=Ro(256,`
       JSR   $D82A
LOOP   JMP   LOOP
`.split(`
`));for(let t=0;t<e.length;t++)T[512+t]=e.charCodeAt(t);T[512+e.length]=0,T.set(r,256),T[184]=0,T[185]=2,N.Accum=e.charCodeAt(0),N.PC=256,setTimeout(()=>{Gr(256,n),ei(t)},30)},Ll=e=>{pr(e),$l()},Rl=null,zl=(e=!1)=>{Rl&&clearTimeout(Rl),e?Rl=setTimeout(()=>{pl=!0,Rl=null},100):pl=!0},Bl=()=>{An(),Q===r.IDLE&&(Ol(),Q=r.PAUSED),hl||zc(),Qn(hl?Rc:null),Wl(r.PAUSED)},Vl=()=>{An(),Q===r.IDLE&&(Ol(),Q=r.PAUSED),k(N.PC,!1)===32?(hl||zc(),Qn(hl?Rc:null),Hl()):Bl()},Hl=()=>{An(),Q===r.IDLE&&(Ol(),Q=r.PAUSED),jn(),Wl(r.RUNNING)},Ul=()=>{gl=[{time:performance.now(),cycles:N.cycleCount}],dl=performance.now()},Wl=(e,t=!0)=>{El(),t&&Q===r.RUNNING&&e===r.PAUSED&&(sl=!0),Q=e,Q===r.PAUSED?(hn(),ml&&=(clearInterval(ml),0),co()):Q===r.RUNNING&&(co(!0),An(),el(),ml||=setInterval(Rt,1e3)),hl||zc(),$l(),Ul(),il===0&&(il=1,ru())},Gl=e=>{ul=isNaN(e)||e<1?0:e},Kl=e=>{Q===r.IDLE?(Wl(r.NEED_BOOT),setTimeout(()=>{Wl(r.NEED_RESET),setTimeout(()=>{e()},200)},200)):e()},ql=(e,t,n)=>{Kl(()=>{Gr(e,t),n&&ri(e)})},Jl=e=>{Kl(()=>{Xt(e)})},Yl=()=>Q===r.PAUSED?Jr():new Uint8Array,Xl=()=>{let e=qr(),t=e[105]|e[106]<<8,n=e[107]|e[108]<<8,r=T.slice(t,n+1),i=r.length-1;r[i]=0;for(let e=0;e<i;e+=7){let t=r.slice(e,e+7),n=t[0];if(n===0)break;let i=t[1];if(!(n&128)&&i&128){let n=t[3]|t[4]<<8,i=t[2],a=T.slice(n,n+i);r[e+3]=r.length&255,r[e+4]=r.length>>8&255,r=new Uint8Array([...r,...a])}}return r},Zl=()=>Q===r.IDLE?``:ui(),Ql=!1,$l=()=>{k(x.PB0.isSetAddr),k(x.PB1.isSetAddr),iu({addressGetTable:E,altChar:x.ALTCHARSET.isSet,basicMemory:Xl(),breakpoints:w,button0:x.PB0.isSet,button1:x.PB1.isSet,canGoBackward:Jc()>=0,canGoForward:Yc()>=0,c800Slot:ar(),cout:k(57)<<8|k(56),cpuSpeed:il,extraRamSize:64*(nr+1),hires:Ur(),iTempState:Hc(),isDebugging:al,isTracing:!1,lores:Ir(!0),machineName:fl,memoryDump:Yl(),noDelayMode:!x.COLUMN80.isSet&&x.DHIRES.isSet,ramWorksBank:sr(),runMode:Q,s6502:N,showDebugTab:sl,softSwitches:bl(),speedMode:rl,stackString:Zl(),textPage:Ir(),timeTravelThumbnails:tl(),tracelog:Q===r.PAUSED?Bc():[],zeroPage:qr()}),Ql||(Ql=!0,vu(mn()))},eu=e=>{if(e)for(let t=0;t<e.length;t++)dn(e[t]);else fn();e&&(e[0]<=49167||e[0]>=49232)&&xr(),$l()},tu=-1,nu=()=>{if(Q===r.IDLE||Q===r.PAUSED)return;Q===r.NEED_BOOT?(Ol(),Wl(r.RUNNING)):Q===r.NEED_RESET&&(kl(),Wl(r.RUNNING));let e=0,t=-1;for(ul>0&&(tu=N.cycleCount);;){let n=Qn(hl?Rc:null);if(n<0)break;if(e+=n,e<4550)x.VBL.isSet||vl();else{yl();let n=Math.floor((e-4550)/65);n!==t&&n<192&&(t=n,Hr(n))}if(ul>0&&N.cycleCount-tu>=ul){ul=0,Wl(r.PAUSED);break}if(e>=ll)break}gl.length>120&&gl.shift(),gl.push({time:performance.now(),cycles:N.cycleCount});let n=gl.length>1?(gl[gl.length-1].cycles-gl[0].cycles)/(gl[gl.length-1].time-gl[0].time):0;il=n<1e4?Math.round(n/10)/100:Math.round(n/100)/10,Qe(),$l(),pl&&(pl=!1,Xc())},ru=()=>{nu(),dl+=cl;let e=performance.now(),t=dl-e;t<0&&(dl=e,t=0),t=Q===r.PAUSED?20:Math.max(1,t),setTimeout(ru,t)},$=(e,t)=>{try{self.postMessage({msg:e,payload:t})}catch(e){console.error(`worker2main: doPostMessage error: ${e}`)}},iu=e=>{$(i.MACHINE_STATE,e)},au=e=>{$(i.CLICK,e)},ou=e=>{$(i.DRIVE_PROPS,e)},su=e=>{$(i.DRIVE_SOUND,e)},cu=e=>{$(i.GET_MEMORY_RESPONSE,e)},lu=e=>{$(i.SAVE_STATE,e)},uu=e=>{$(i.RUMBLE,e)},du=e=>{$(i.HELP_TEXT,e)},fu=e=>{$(i.ENHANCED_MIDI,e)},pu=e=>{$(i.SHOW_APPLE_MOUSE,e)},mu=e=>{$(i.MBOARD_SOUND,e)},hu=e=>{$(i.COMM_DATA,e)},gu=e=>{$(i.MIDI_DATA,e)},_u=e=>{$(i.REQUEST_THUMBNAIL,e)},vu=e=>{$(i.SOFTSWITCH_DESCRIPTIONS,e)},yu=e=>{$(i.INSTRUCTIONS,e)},bu=e=>{$(i.SERIAL_CONFIG_CHANGE,e)};typeof self<`u`&&(self.onmessage=e=>{if(!(!e.data||typeof e.data!=`object`)&&`msg`in e.data)switch(e.data.msg){case a.RUN_MODE:Wl(e.data.payload);break;case a.CYCLES_TO_RUN:Gl(e.data.payload);break;case a.STATE6502:Sl(e.data.payload);break;case a.DEBUG:Nl(e.data.payload);break;case a.APP_MODE:jl(e.data.payload);break;case a.SHOW_DEBUG_TAB:wl(e.data.payload);break;case a.BREAKPOINTS:Nn(e.data.payload);break;case a.STEP_INTO:Bl();break;case a.STEP_OVER:Vl();break;case a.STEP_OUT:Hl();break;case a.BASIC_STEP:Mn();break;case a.SPEED:Al(e.data.payload);break;case a.TIME_TRAVEL_STEP:e.data.payload===`FORWARD`?Qc():Zc();break;case a.TIME_TRAVEL_INDEX:$c(e.data.payload);break;case a.TIME_TRAVEL_SNAPSHOT:zl();break;case a.THUMBNAIL_IMAGE:nl(e.data.payload);break;case a.RESTORE_STATE:qc(e.data.payload,!0);break;case a.KEYPRESS:Yt(e.data.payload);break;case a.KEYRELEASE:Vt();break;case a.MOUSEEVENT:ms(e.data.payload);break;case a.PASTE_TEXT:Jl(e.data.payload);break;case a.APPLE_PRESS:ze(!0,e.data.payload);break;case a.APPLE_RELEASE:ze(!1,e.data.payload);break;case a.GET_MEMORY:cu(Yr());break;case a.GET_SAVE_STATE:lu(Gc(!0));break;case a.GET_SAVE_STATE_SNAPSHOTS:lu(Kc());break;case a.DRIVE_PROPS:{let t=e.data.payload;uo(t);break}case a.DRIVE_NEW_DATA:{let t=e.data.payload;lo(t);break}case a.GAMEPAD:Ke(e.data.payload);break;case a.SET_BINARY_BLOCK:{let t=e.data.payload;ql(t.address,t.data,t.run);break}case a.SET_CYCLECOUNT:Cl(e.data.payload);break;case a.SET_MEMORY:{let t=e.data.payload;Pl(t.address,t.value);break}case a.COMM_DATA:xo(e.data.payload);break;case a.MIDI_DATA:Is(e.data.payload);break;case a.RAMWORKS:Ll(e.data.payload);break;case a.MACHINE_NAME:Fl(e.data.payload);break;case a.REVERSE_YAXIS:Be(e.data.payload);break;case a.SOFTSWITCHES:eu(e.data.payload);break;case a.SIRIUS_JOYPORT:ce(e.data.payload);break;case a.EXECUTE_BASIC_COMMAND:{let t=e.data.payload;Il(t);break}case a.TRACING:_l(e.data.payload);break;case a.TRACE_SETTINGS:Ic(e.data.payload);break;default:console.error(`worker2main: unhandled msg: ${JSON.stringify(e.data)}`);break}})})();
//# sourceMappingURL=worker2main-BEzHMDOA.js.map