import "./flyout.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowUp, IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"
import { isScreenNarrow } from "./display"

const Flyout = (props: {icon: IconDefinition, position: string, children: any}) => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(isScreenNarrow());
  const className = `flyout-${props.position}`

  return (
    <div className={className}>
      {props.children}
      <FontAwesomeIcon
        className="flyout-button"
        icon={isFlyoutOpen ? faArrowUp : props.icon}
        onClick={() => {
          const panel = document.getElementsByClassName(className)[0] as HTMLElement
          if (isFlyoutOpen) {
            panel.style.top = `calc(-${panel.offsetHeight}px + 2.5cqw + 8px)`
          } else {
            panel.style.top = '0px'
          }
          setIsFlyoutOpen(!isFlyoutOpen)
        }}
      ></FontAwesomeIcon>
    </div>
  )
}

export default Flyout