HGR graphics:
color, white, cross-byte color, cross-byte white, 11011 patterns
 violet
 green
 blue
 orange
2000: 01 03 40 80 60 80 00 00 00 1B
2400: 02 06 00 40 80 60 80 00 00 36
2800: 81 83 C0 00 E0 00 E0 01 00 6C
2c00: 82 86 00 C0 00 E0 00 E0 01

Assembly code to product a nice tone:
!
300: LDA $C030
 LDX #$DF
 DEX
 BNE $305
 JMP $300

REM print values for $C000, $C010, $C020, $C030
10 FOR X = 0 TO 15: PRINT PEEK(49152+X)" ";: NEXT : PRINT : GOTO 10
10 FOR X = 0 TO 15: PRINT PEEK(49168+X)" ";: NEXT : PRINT : GOTO 10
10 FOR X = 0 TO 15: PRINT PEEK(49184+X)" ";: NEXT : PRINT : GOTO 10
10 FOR X = 0 TO 15: PRINT PEEK(49200+X)" ";: NEXT : PRINT : GOTO 10

0 REM "APPLE //e CHARACTER SETS"
100 PRINT CHR$(21) : TEXT : HOME
110 GOSUB 500
120 FOR I = 0 TO 255
122 VTAB 3 + I / 32
125 IF INT(I / 32) = (I / 32) THEN HTAB 1: PRINT I;
130 HTAB 5 + I - 32 * (INT (I / 32))
150 SL = PEEK(40) + 256 * PEEK(41) +PEEK(36)
160 POKE SL, I
170 NEXT
180 GOSUB 500
190 VTAB 20: HTAB 1 : CALL -958
200 PRINT "<P>RIMARY OR <A>LTERNATIVE?";: GET A$: PRINT A$
210 IF A$ ="P" OR A$ ="p" THEN POKE 49166,0: GOTO 180
220 IF A$ ="A" OR A$ ="a" THEN POKE 49167,0: GOTO 180
230 IF A$ = CHR$(27) THEN HOME : END
240 GOTO 180
500 VTAB 1: HTAB 1: CALL -868 : PRINT "THE " ;
510 IF PEEK(49182) > 127 THEN PRINT "ALTERNATIVE"; : GOTO 530
520 PRINT "PRIMARY";
530 PRINT " CHARACTER SET IS:"
540 RETURN

0 REM Michael Pohoreski's MAKE.256 HGR test program
0 REM https://groups.google.com/g/comp.sys.apple2.programmer/c/vxtFo6QEYGg
1 HGR:HCOLOR=0:B=0:GOTO 5
2 HPLOT X*14,Y*2+D:A=PEEK(38)+256*PEEK(39):P=A+X*2
3 POKE P,B*(1-D):POKE P+1,0: POKE P+9,B*(1-D):POKE P+10,0: POKE A+18,127:POKE A+20,255: POKE A+23,127:POKE A+25,255
4 RETURN
5 FOR X=0 TO 3:FOR Y=0 TO 63
6 D=0:GOSUB 2
7 D=1:GOSUB 2
8 B=B+1:NEXT:NEXT:B=0
9 FOR I=0 TO 7:HCOLOR=I:HPLOT 0,132+I*2 TO 28,132+I*2:NEXT

call -151
!
300: JMP $31A ; skipover
 SEI
 LDX #$7F
 STX $C40D   ; reset Mock interrupt
 BIT $C030
 DEX
 BNE $309
 RTI
 CLI         ; loop
 LDA $C405   ; Mock timer1 counter high
 STA $2FF
 JMP $310    ; to loop
 CLI         ; skipover
 BIT $C08B   ; bank switched ram enable
 BIT $C08B
 LDA #$03    ; irq vector
 STA $FFFE
 STA $FFFF
 LDA #$FF    ; enable Mockingboard
 STA $C403
 LDA #$7
 STA $C402
 LDA #$40    ; Mock make timer1 continuous
 STA $C40B
 LDA #$FF    ; Mock timer1 counter low
 STA $C404
 LDA #$FF    ; Mock timer1 counter high
 STA $C405
 LDA #$C0    ; Mock timer1 enable
 STA $C40E
 JMP $310   ; to loop



HGR
CALL-151
!
0300:LDA   #$00
  STA  $C005
  LDX   #$00
  STX   $06
  LDX   #$20
  STX   $07
  LDY   #$00
  STA   ($06),Y
  INY
  BNE   $030F
  INC   $07
  LDY   $07
  CPY   #$40
  BCC   $030D
  STA  $C004
  RTS
300G
C00D: FF
C05E


10 print chr$(4);"PR#3"
20 HGR
30 poke 49246, 0 : REM turn on AN3

REM TEST WHETHER ADJACENT HGR PIXELS TURN WHITE
10 HGR
20 FOR I = 0 TO 50
30 J = I -  INT (I / 150) * 150
40 HCOLOR= 2
50 HPLOT I,J
55 HPLOT I + 2,J+20
60 HPLOT I,J+40
70 HCOLOR= 1
80 HPLOT I + 1,J
85 HPLOT I + 1,J+20
90 HPLOT I,J+48
100 HCOLOR= 6
110 HPLOT I,J+10
115 HPLOT I + 2,J+30
120 HPLOT I,J+60
130 HCOLOR= 5
140 HPLOT I + 1,J+10
145 HPLOT I + 1,J+30
150 HPLOT I,J+68
200 NEXT

https://github.com/AppleWin/AppleWin/issues/254
10 HGR
20 FOR Y=0 TO 63:FOR X=0 TO 7
30 HCOLOR=INT(Y/8)
31 HPLOT X*32,Y*2 TO X*32+30,Y*2
32 HCOLOR=X
33 HPLOT X*32,Y*2+1 TO X*32+30,Y*2+1
40 NEXT:NEXT
50 ? "0=BLACK1  4=BLACK2"
60 ? "1=L.GREEN 5=ORANGE"
70 ? "2=PURPLE  6=MED.BLUE"
80 ? "3=WHITE1  7=WHITE2  8x8 HGR COLOR CHART";
90 GET A$:END

https://commons.wikimedia.org/wiki/File:Apple_II_low-resolution_graphics_demo_2.png
100 GR
110 FOR X = 0 TO 3
120 FOR Y = 0 TO 39
130 COLOR = X + 4 * (INT(Y/10))
140 HLIN X*10,X*10+9 AT Y
150 NEXT
160 NEXT
200 PRINT "0=BLACK    ";
210 PRINT "1=RED     ";
220 PRINT "2=D.BLUE  ";
230 PRINT "3=PURPLE ";
240 PRINT "4=D.GREEN  ";
250 PRINT "5=GRAY 1  ";
260 PRINT "6=M.BLUE  ";
270 PRINT "7=L.BLUE ";
280 PRINT "8=BROWN    ";
290 PRINT "9=ORANGE  ";
300 PRINT "10=GRAY 2 ";
310 PRINT "11=PINK  ";
320 PRINT "12=L.GREEN ";
330 PRINT "13=YELLOW ";
340 PRINT "14=AQUA   ";
350 PRINT "15=WHITE";
360 GET A$


100 PRINT CHR$(147); CHR$(18); "****      FIBONACCI GENERATOR       ****"
110 INPUT "MIN, MAX"; N1, N2
120 IF N1 > N2 THEN T = N1: N1 = N2: N2 = T
130 A = 0: B = 1: S = SGN(N1)
140 FOR I = S TO N1 STEP S
150 : IF S > 0 THEN T = A + B: A = B: B = T
160 : IF S < 0 THEN T = B - A: B = A: A = T
170 NEXT I
180 PRINT
190 PRINT STR$(A); : REM STR$() PREVENTS TRAILING SPACE
200 IF N2 = N1 THEN 250
210 FOR I = N1 + 1 TO N2
220 : T = A + B: A = B: B = T
230 : PRINT ","; STR$(A);
240 NEXT I
250 PRINT

0 REM Test pasting long lines
2 HPLOT X*14,Y*2+D:A=PEEK(38)+256*PEEK(39):P=A+X*2:POKE P,B*(1-D):POKE P+1,0: POKE P+9,B*(1-D):POKE P+10,0: POKE A+18,127:POKE A+20,255: POKE A+23,127:POKE A+25:HPLOT X*14,Y*2+D:HPLOT X*14,Y*2+D:HPLOT X*14,Y*2+D:HPLOT X*14,Y*2+D:HPLOT X*14,Y*2+D
10 REM Did this line get pasted correctly?

0 REM TEST IMAGEWRITER PRINTER FONTS
110 HOME
115 D$ = CHR$ (4)
120 PRINT D$;"PR#1"
123 FOR I=0 TO 2 STEP 1
124 PRINT CHR$(27);"N"; :REM 80cpi font default
125 IF I=0 THEN PRINT CHR$(27);"a0Correspondence Font"
126 IF I=1 THEN PRINT CHR$(27);"a1Draft Font"
127 IF I=2 THEN PRINT CHR$(27);"a2NLQ Font"
130 PRINT "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
135 PRINT "!@#$%^&*()_+=-0987654321`~{}|\][;':,./<>?"
137 PRINT "_gjp;yq"
140 PRINT CHR$(27);"X";
150 PRINT "Underlined"
160 PRINT CHR$(27);"Y";
180 PRINT CHR$(27);"!";
190 PRINT "This is in Boldface"
210 PRINT CHR$(27);CHR$ (34);
220 PRINT CHR$ (14);
231 PRINT "This is the Doublewide Mode"
240 PRINT CHR$ (15);
300 PRINT "Normal Height Mode ";
340 PRINT CHR$(27);"w";
350 PRINT "Half Height";
360 PRINT CHR$(27);"X";
370 PRINT "With Underline";
371 PRINT CHR$(27);"Y";
380 PRINT CHR$(27);"W";
390 PRINT "Normal Height Again"
400 PRINT "Super";
440 PRINT CHR$(27);"x";
450 PRINT "Script"
460 PRINT CHR$(27);"z";
470 PRINT "Sub";
480 PRINT CHR$(27);"y";
490 PRINT "Script"
491 PRINT CHR$(27);"z";
494 REM MouseText
495 PRINT CHR$(27);"&";
496 PRINT "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_"
497 PRINT CHR$(27);"$";
510 PRINT CHR$(27);"p"; :REM Proportional 144dpi
520 PRINT CHR$(27);"s1"; :REM 1 dot spacing
530 PRINT "Proportional 144 DPI 1DS abcdefghijklmnopqrstuvwxyz"
540 PRINT CHR$(27);"s3"; :REM 3 dot spacing
550 PRINT "Proportional 144 DPI 3DS abcdefghijklmnopqrstuvwxyz"
560 PRINT CHR$(27);"s1"; :REM 1 dot spacing
570 PRINT "5 dot spacing ->";
580 PRINT CHR$(27);"5"; :REM Insert 2 spaces
590 PRINT "<- here"
610 PRINT CHR$(27);"P"; :REM Proportional 160dpi
620 PRINT CHR$(27);"s1"; :REM 1 dot spacing
630 PRINT "Proportional 160 DPI 1DS abcdefghijklmnopqrstuvwxyz"
640 PRINT CHR$(27);"s3"; :REM 3 dot spacing
650 PRINT "Proportional 160 DPI 3DS abcdefghijklmnopqrstuvwxyz"
660 PRINT CHR$(27);"s1"; :REM 1 dot spacing
670 PRINT "5 dot spacing ->";
680 PRINT CHR$(27);"5"; :REM Insert 2 spaces
690 PRINT "<- here"
800 NEXT I
900 PRINT D$; "PR#0"
901 END

