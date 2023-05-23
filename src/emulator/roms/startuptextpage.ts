let text=
['Welcome to Apple2TS',
'',
'TypeScript Apple IIe Emulator',
'',
'(c) 2023 Chris Torrence',
'',
'Click the floppy disks to',
'choose a disk, or click on a',
'drive to load your own.',
'',
'Press the Power button to start.',
'',
]

const isMac = navigator.platform.startsWith('Mac')
const key = isMac ? '\xC3' : '^'
const isTouchDevice = "ontouchstart" in document.documentElement
if (!isTouchDevice) {
  text = text.concat([
    'Keyboard Shortcuts:',
    '',
    `${key}B Boot    ${key}C Copy Screen`,
    `${key}R Reset   ${key}V Paste Text `,
    `${key}P Pause   ${key}O Open State `,
    `${key}F Speed   ${key}S Save State `,
    `${key}\xC8: Go back in Time`,
    `${key}\xD5: Forward in Time`
  ])
}

const textPage = new Array<String>(24).fill('')
const n = text.length
for (let j = 0; j < n; j++) {
  textPage[j + 12 - Math.floor(n/2)] = text[j]
}
textPage[0] = '*'.repeat(40)
textPage[23] = '*'.repeat(40)
for (let j = 1; j < 23; j++) {
  const len = (38 - textPage[j].length) / 2
  const left = ' '.repeat(Math.floor(len))
  const right = ' '.repeat(Math.ceil(len))
  textPage[j] = `*${left}${textPage[j]}${right}*`
}

export const startupTextPage = new Uint8Array(40 * 24)
for (let j = 0; j < 24; j++) {
  for (let i = 0; i < 40; i++) {
    const c = textPage[j].charCodeAt(i)
    startupTextPage[40 * j + i] = (c + 128) % 256
  }
}