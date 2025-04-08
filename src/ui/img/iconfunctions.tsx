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

export const getColorModeSVG = (colorMode: COLOR_MODE) => {
  let svgRect: React.SVGProps<SVGSVGElement>
  const h = 15
  switch (colorMode) {
    case COLOR_MODE.NOFRINGE:
      svgRect = <rect width={21} height={h} fill="#ffffff" />
      break
    case COLOR_MODE.GREEN:
      svgRect = <rect width={21} height={h} fill="#39FF14" opacity={0.5} />
      break
    case COLOR_MODE.AMBER:
      svgRect = <rect width={21} height={h} fill="#FFA500" opacity={0.75} />
      break
    case COLOR_MODE.BLACKANDWHITE:
      svgRect = <svg>
        <rect width={10.5} height={h} fill="#000000" />
        <rect width={10.5} height={h} x={10} fill="#F0F0F0" />
      </svg>
      break
    case COLOR_MODE.INVERSEBLACKANDWHITE:
      svgRect = <svg>
        <rect width={10.5} height={h} fill="#F0F0F0" />
        <rect width={10.5} height={h} x={10} fill="#000000" />
      </svg>
      break
    default:
      svgRect = <svg>
        <rect width={5.25} height={h} fill="#00ff00" />
        <rect width={5.25} height={h} x={5} fill="#ff00ff" />
        <rect width={5.25} height={h} x={10} fill="#007fff" />
        <rect width={5.25} height={h} x={15} fill="#ff7f00" />
      </svg>
      break
  }
  return svgRect
}

export const getShowScanlinesSVG = (enabled: boolean) => {
  let svgRect: React.SVGProps<SVGSVGElement>

  if (enabled) {
    svgRect = <svg>
      <rect width={21} height={1} y={2} fill="#000000" />
      <rect width={21} height={1} y={5} fill="#000000" />
      <rect width={21} height={1} y={8} fill="#000000" />
      <rect width={21} height={1} y={11} fill="#000000" />
    </svg>
  } else {
    svgRect = <svg></svg>
  }

  return svgRect
}
