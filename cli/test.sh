#!/bin/bash
npm run cli -- machine boot
npm run cli -- machine reset
npm run cli -- input text --text 'HTAB1:VTAB1:PRINT"ABC"'
npm run cli -- input key-code --key-code 13 --release
npm run cli -- machine pause
npm run cli --silent -- memory get --start 0x400 --length 16 --format hex | jq .data
npm run cli -- machine resume
