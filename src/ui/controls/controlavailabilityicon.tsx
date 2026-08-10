import { ReactNode } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons"

type ControlAvailabilityIconProps = {
  children: ReactNode
  unavailable?: boolean
}

export const ControlAvailabilityIcon = ({
  children,
  unavailable = false,
}: ControlAvailabilityIconProps) => (
  <span className="control-availability-icon">
    {children}
    {unavailable && <FontAwesomeIcon
      className="control-unavailable-badge"
      icon={faCircleXmark}
      aria-hidden="true"
    />}
  </span>
)
