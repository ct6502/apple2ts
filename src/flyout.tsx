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
  const width = props.width ?? ''

  const handleResizeImmediate = (newIsFlyoutOpen: boolean) => {
    const panel = document.getElementsByClassName(className)[0] as HTMLElement
    if (newIsFlyoutOpen) {
      panel.style.top = '0px'
      panel.style.opacity = '100%'
    } else {
      panel.style.top = `calc(-${panel.offsetHeight}px + 2.5cqw + 8px)`
      panel.style.opacity = '75%'
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

  return (
    <div className={`flyout ${className}`} style={{width: width}}>
      {props.children}
      <div className="flyout-button">
        <FontAwesomeIcon
          icon={getArrowIcon()}
          onClick={() => {
            handleResizeImmediate(!isFlyoutOpen)
            setIsFlyoutOpen(!isFlyoutOpen)
          }}
        ></FontAwesomeIcon>
      </div>
    </div>
  )
}

export default Flyout