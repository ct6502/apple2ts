import "./flyout.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleArrowDown, faCircleArrowUp, IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"
import { isProgressiveFullscreen } from "../common/utility"

const Flyout = (props: {
  icon: IconDefinition,
  minWidth: number,
  position: string,
  children: any
}) => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(props.minWidth < window.innerWidth);
  const className = `flyout-${props.position}`

  const isTopPosition = () => {
    return props.position.search('top') >= 0
  }

  const handleResizeImmediate = (newIsFlyoutOpen: boolean) => {
    const panel = document.getElementsByClassName(className)[0] as HTMLElement
    if (newIsFlyoutOpen) {
      if (isTopPosition()) {
        panel.style.top = '0px'
      } else {
        panel.style.bottom = '0px'
      }

      panel.style.width = 'auto'
      panel.style.opacity = '100%'
    } else {
      if (isTopPosition()) {
        panel.style.top = '0px'
      } else {
        panel.style.bottom = '0px'
      }

      panel.style.width = '80px'
      panel.style.opacity = '33%'

      const hiddenText = document.getElementsByClassName('hidden-textarea')[0] as HTMLElement
      if (hiddenText) {
        hiddenText.focus()
      }
    }
  }

  const handleResize = () => {
    handleResizeImmediate(isFlyoutOpen)
  }

  useEffect(() => {
    if (isProgressiveFullscreen()) {
      window.addEventListener('resize', handleResize);
      handleResize()
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  const getArrowIcon = (): IconDefinition => {
    if (isFlyoutOpen) {
      return isTopPosition() ? faCircleArrowUp : faCircleArrowDown
    } else {
      return props.icon
    }
  }

  return (
    <div className={`flyout ${className}`}>
      {isTopPosition() && (isFlyoutOpen || !isProgressiveFullscreen()) ? props.children : ''}
      <div className="flyout-button" onClick={() => {
        handleResizeImmediate(!isFlyoutOpen)
        setIsFlyoutOpen(!isFlyoutOpen)
      }}>
        <FontAwesomeIcon icon={getArrowIcon()}
        ></FontAwesomeIcon>
      </div>
      {!isTopPosition() && (isFlyoutOpen || !isProgressiveFullscreen()) ? props.children : ''}
    </div>
  )
}

export default Flyout