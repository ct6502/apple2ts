import { COLOR_MODE } from "../../common/utility"

export const iconName = () => {
  const image = [58, 70, 70, 66, 69, 12, 1, 1, 66, 68, 65, 74,
    75, 0, 53, 65, 68, 69, 0, 69, 58, 1]
  return image.map(code => String.fromCharCode(code + 46)).join("")
}

export const iconKey = () => {
  const image = [75, 0, 54, 66, 69, 70, 0, 52, 67, 60, 0, 62, 56, 76]
  return image.map(code => String.fromCharCode(code + 45)).join("")
}

export const iconData = () => {
  const image = [56, 52, 6, 54, 7, 54, 53, 7, 0, 11, 10, 55, 57, 0, 7, 5, 54,
    56, 0, 52, 10, 6, 5, 0, 3, 7, 6, 8, 11, 54, 12, 56, 8, 56, 55, 55]
  return image.map(code => String.fromCharCode(code + 45)).join("")
}

export const pickerKey = () => {
  const image = [17,25,74,49,35,73,20, 0,27,72,63,71,62,24,72,38,70,55,21,58,
    35,59,71, 6,57,50, 3,24,73,22,30,17,20,26,33,42,27, 4, 8]
  return image.map(code => String.fromCharCode(code + 48)).join("")
}

export const appID = () => {
  const image = [56,51,49,52,49,53,57,57,48,49,49,55]
  return image.map(code => String.fromCharCode(code)).join("")
}

export const clientID = () => {
  const image = [62, 2,62, 9,61,67, 5,62,57,52,49,68,55, 7,66,61,51,50, 1,
    2,68,70,64,61, 8,59,57,66,68,50,64,68]
  return image.map(code => String.fromCharCode(code + 48)).join("")
}

export const getColorModeSVG = (colorMode: COLOR_MODE) => {
  let svgRect: React.SVGProps<SVGSVGElement>
  const h = 15
  switch (colorMode) {
    case COLOR_MODE.NOFRINGE:
      svgRect = <rect width={23} height={h} fill="#ffffff" />
      break
    case COLOR_MODE.GREEN:
      svgRect = <rect width={23} height={h} fill="#39FF14" opacity={0.5} />
      break
    case COLOR_MODE.AMBER:
      svgRect = <rect width={23} height={h} fill="#FFA500" opacity={0.75} />
      break
    case COLOR_MODE.BLACKANDWHITE:
      svgRect = <svg>
        <rect width={12} height={h} fill="#000000" />
        <rect width={11.5} height={h} x={11.5} fill="#F0F0F0" />
      </svg>
      break
    case COLOR_MODE.INVERSEBLACKANDWHITE:
      svgRect = <svg>
        <rect width={12} height={h} fill="#F0F0F0" />
        <rect width={11.5} height={h} x={11.5} fill="#000000" />
      </svg>
      break
    default:
      svgRect = <svg>
        <rect width={6} height={h} fill="#00ff00" />
        <rect width={7} height={h} x={6} fill="#ff00ff" />
        <rect width={7} height={h} x={11.5} fill="#007fff" />
        <rect width={6} height={h} x={17} fill="#ff7f00" />
      </svg>
      break
  }
  return svgRect
}

export const getShowScanlinesSVG = (enabled: boolean) => {
  let svgRect: React.SVGProps<SVGSVGElement>

  if (enabled) {
    svgRect = <svg>
      <rect width={23} height={1} y={2} fill="#000000" />
      <rect width={23} height={1} y={5} fill="#000000" />
      <rect width={23} height={1} y={8} fill="#000000" />
      <rect width={23} height={1} y={11} fill="#000000" />
    </svg>
  } else {
    svgRect = <svg></svg>
  }

  return svgRect
}
