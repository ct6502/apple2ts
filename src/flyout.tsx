import "./flyout.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleArrowDown, faCircleArrowUp, IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"
import { isScreenNarrow } from "./display"

const Flyout = (props: {
  icon: IconDefinition,
  width: string,
  position: string,
  children: any}) => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(!isScreenNarrow());
  const className = `flyout-${props.position}`

  const handleResizeImmediate = (newIsFlyoutOpen: boolean) => {
    const panel = document.getElementsByClassName(className)[0] as HTMLElement
    if (newIsFlyoutOpen) {
      panel.style.top = '0px'
    } else {
      panel.style.top = `calc(-${panel.offsetHeight}px + 2.5cqw + 8px)`
    }
  }

  const handleResize = () => {
    handleResizeImmediate(isFlyoutOpen)
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize()
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getArrowIcon = (): IconDefinition => {
    if (isFlyoutOpen) {
      return props.position.search('top') >= 0 ? faCircleArrowUp : faCircleArrowDown
    } else {
      return props.icon
    }
  }

  const width = props.width ?? ''

  return (
    <div className={className} style={{width: width}}>
      {props.children}
      <FontAwesomeIcon
        className="flyout-button"
        icon={getArrowIcon()}
        onClick={() => {
          handleResizeImmediate(!isFlyoutOpen)
          setIsFlyoutOpen(!isFlyoutOpen)
        }}
      ></FontAwesomeIcon>
    </div>
  )
}

export default Flyout