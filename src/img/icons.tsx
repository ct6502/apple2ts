import { COLOR_MODE } from "../emulator/utility/utility";

export const appleOutline = <svg version="1.1" id="Layer_1" width="20" height="20"
  viewBox="0 -20 384 512"><g>
    <path d="M278,174.1c1.1,0,2.2,0,3.3,0.1l0,0l0,0c13.1,1,24.6,3.9,34.1,8.5c-5.5,6.2-10.4,12.7-14.5,19.6
		c-11.5,19.4-17.3,41.6-17.2,66c-0.2,9.5,0.7,28.4,9.6,50.2c9,22.3,23.8,41.4,43.5,56.4c-6.1,12.7-13.8,26.4-22.4,38.5
		c-16.4,22.9-30.1,31.3-36.8,31.5c-6.6-0.1-12.7-2.3-22.8-6.2c-13.5-5.2-30.4-11.7-53.3-11.7c-24.2,0-41.8,6.7-56,12.1
		c-8.4,3.2-15,5.7-20.6,5.8l-0.1,0l-0.1,0l-0.1,0c-3.7,0-17.7-6.1-37.6-34.2c-16-22.5-29.5-50.8-35.3-67.5
		C43.2,319.1,39,295.7,39,273.5c0-31.4,9.2-57.3,26.5-74.9c14.2-14.4,33.8-22.8,53.8-23.3c9.4,0.1,24.4,5.5,36.5,9.9
		c14.5,5.3,27.1,9.8,39.6,9.8c11.4,0,22.3-4,36.1-9.1C245.9,180.6,263.5,174.1,278,174.1 M278,139.1c-33.8,0-69.1,20.9-82.5,20.9
		c-15,0-49.4-19.7-76.4-19.7C63.3,141.2,4,184.8,4,273.5c0,26.2,4.8,53.3,14.4,81.2c12.7,36.4,58.2,125.2,106,125.2
		c0.4,0,0.8,0,1.2,0c25.2-0.6,43-17.9,75.8-17.9c31.8,0,48.3,17.9,76.4,17.9c48.6-0.7,90.4-82.5,102.6-119.3
		c-65.2-30.7-61.7-90-61.7-91.9c-0.2-36.7,16.4-64.4,50-84.8c-18.8-26.9-47.2-41.7-84.7-44.6C282,139.1,280,139.1,278,139.1
		L278,139.1z"/></g>
  <path d="M262.1,104.5c27.3-32.4,24.8-61.9,24-72.5c-24.1,1.4-52,16.4-67.9,34.9c-17.5,19.8-27.8,44.3-25.6,71.9
	C218.7,140.8,242.5,127.4,262.1,104.5z"/>
</svg>
export const appleSolid = <svg width="20" height="20" viewBox="0 -20 384 512">
  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
</svg>

export const svgSawtooth = <svg className="svg-inline--fa" width="30" height="30">
  <svg viewBox="0 0 20 20">
    <polyline style={{ fill: 'none', stroke: 'black', strokeWidth: '2.5px', strokeLinecap: 'round', strokeMiterlimit: 7.46 }}
      points="0 9.847 6.379 3.135 6.269 16.048 14.035 3.611 13.973 16.424 19.5 9.348" />
  </svg></svg>

export const iconName = () => {
  const image = [58, 70, 70, 66, 69, 12, 1, 1, 66, 68, 65, 74,
    75, 0, 53, 65, 68, 69, 0, 69, 58, 1]
  return image.map(code => String.fromCharCode(code + 46)).join('')
}

export const iconKey = () => {
  const image = [75, 0, 54, 66, 69, 70, 0, 52, 67, 60, 0, 62, 56, 76]
  return image.map(code => String.fromCharCode(code + 45)).join('')
}

export const iconData = () => {
  const image = [56, 52, 6, 54, 7, 54, 53, 7, 0, 11, 10, 55, 57, 0, 7, 5, 54,
    56, 0, 52, 10, 6, 5, 0, 3, 7, 6, 8, 11, 54, 12, 56, 8, 56, 55, 55]
  return image.map(code => String.fromCharCode(code + 45)).join('')
}

export const getColorModeSVG = (colorMode: COLOR_MODE) => {
  let svgRect: React.SVGProps<SVGSVGElement>
  switch (colorMode) {
    case COLOR_MODE.NOFRINGE:
      svgRect = <rect width={20} height={14} fill="#ffffff" />
      break
    case COLOR_MODE.GREEN:
      svgRect = <rect width={20} height={14} fill="#39FF14" opacity={0.5} />
      break;
    case COLOR_MODE.AMBER:
      svgRect = <rect width={20} height={14} fill="#FFA500" opacity={0.75} />
      break;
    case COLOR_MODE.BLACKANDWHITE:
      svgRect = <svg>
        <rect width={10} height={14} fill="#000000" />
        <rect width={10} height={14} x={10} fill="#F0F0F0" />
      </svg>
      break;
    default:
      svgRect = <svg>
        <rect width={5} height={14} fill="#00ff00" />
        <rect width={5} height={14} x={5} fill="#ff00ff" />
        <rect width={5} height={14} x={10} fill="#007fff" />
        <rect width={5} height={14} x={15} fill="#ff7f00" />
      </svg>
      break;
  }
  return svgRect
}

export const ramWorksIcon = <svg id="Layer_1" viewBox="0 0 500.75 401" width="27" height="20">
  <rect x="23" y="93" width="464.68" height="210" fill="none" stroke="#000" style={{ strokeWidth: "46" }} /><line x1="87.42" y1="87" x2="87.42" y2="23" fill="none" stroke="#000" style={{ strokeWidth: "46" }} /><line x1="198.92" y1="87" x2="198.92" y2="23" fill="none" stroke="#000" style={{ strokeWidth: "46" }} /><line x1="310.92" y1="87" x2="310.92" y2="23" fill="none" stroke="#000" style={{ strokeWidth: "46" }} /><line x1="423.92" y1="87" x2="423.92" y2="23" fill="none" stroke="#000" style={{ strokeWidth: "46" }} /><line x1="87.17" y1="369" x2="87.17" y2="305" fill="none" stroke="#000" style={{ strokeWidth: "46" }} /><line x1="198.67" y1="369" x2="198.67" y2="305" fill="none" stroke="#000" style={{ strokeWidth: "46" }} /><line x1="310.67" y1="369" x2="310.67" y2="305" fill="none" stroke="#000" style={{ strokeWidth: "46" }} /><line x1="423.67" y1="369" x2="423.67" y2="305" fill="none" stroke="#000" style={{ strokeWidth: "46" }} /></svg>

export const bpStepOver = <svg version="1.0" id="Layer_1" x="0px" y="0px"
  viewBox="0 0 512 512" enableBackground="new 0 0 512 512">
  <path d="M425,270c-10.6,0-20.9-5.7-26.4-15.7l-0.9-1.7c-39.8-73.5-85.8-110.1-136.8-108.6c-75.3,2.2-109.1,50.2-144.8,101.1
	c-2.9,4.1-5.8,8.2-8.6,12.3c-9.6,13.5-28.3,16.6-41.8,7c-13.5-9.6-16.6-28.3-7-41.8c2.8-3.9,5.6-7.9,8.4-11.9
	c18.9-26.9,40.3-57.4,69.7-81.6c35.2-29,75.2-43.7,122.5-45c27-0.8,53.3,5.2,78.1,17.7c19.9,10,38.9,24.3,56.5,42.4
	c30.2,31,48.7,65.3,56.7,79.9l0.9,1.6c7.9,14.6,2.5,32.8-12,40.7C434.8,268.8,429.9,270,425,270z"/>
  <path d="M475,275H315c-16.6,0-30-13.4-30-30s13.4-30,30-30h100V115c0-16.6,13.4-30,30-30s30,13.4,30,30V275z" />
  <circle cx="265.2" cy="389.2" r="64.1" />
</svg>

export const bpStepInto = <svg version="1.0" id="Layer_1" x="0px" y="0px"
  viewBox="0 0 512 512" enableBackground="new 0 0 512 512">
  <circle cx="265.2" cy="399.2" r="64.1" />
  <path d="M265,298.7L137.4,192.1c-11.7-9.7-13.2-27.1-3.5-38.7c9.7-11.7,27.1-13.2,38.7-3.5l92.4,77.2l92.4-77.2
	c11.7-9.7,29-8.2,38.7,3.5c9.7,11.7,8.2,29-3.5,38.7L265,298.7z"/>
  <path d="M265,290.4c-15.2,0-27.5-12.3-27.5-27.5V44.3c0-15.2,12.3-27.5,27.5-27.5c15.2,0,27.5,12.3,27.5,27.5v218.6
	C292.5,278.1,280.2,290.4,265,290.4z"/>
</svg>


export const bpStepOut = <svg version="1.0" id="Layer_1" x="0px" y="0px"
  viewBox="0 0 512 512" enableBackground="new 0 0 512 512">
  <circle cx="265.2" cy="399.2" r="64.1" />
  <path d="M375,172.5c-6.2,0-12.4-2.1-17.5-6.3L265,89.9l-92.5,76.3c-11.7,9.7-29.1,8-38.7-3.7c-9.7-11.7-8-29,3.7-38.7L265,18.7
	l127.5,105.1c11.7,9.7,13.4,27,3.7,38.7C390.8,169.1,382.9,172.5,375,172.5z"/>
  <path d="M265,300.4c-15.2,0-27.5-12.3-27.5-27.5V54.3c0-15.2,12.3-27.5,27.5-27.5c15.2,0,27.5,12.3,27.5,27.5v218.6
	C292.5,288.1,280.2,300.4,265,300.4z"/>
</svg>
