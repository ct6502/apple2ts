import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMedal, faShieldHalved, faShield } from "@fortawesome/free-solid-svg-icons"
import { handleGetRetroAchievementsState } from "../main2worker"
import {
  getPreferenceRetroAchievementsEnabled,
  getPreferenceRetroAchievementsHardcore,
  setPreferenceRetroAchievementsEnabled,
  setPreferenceRetroAchievementsHardcore,
} from "../localstorage"

const RetroAchievementsButtons = (props: DisplayProps) => {
  const state = handleGetRetroAchievementsState()
  const enabled = getPreferenceRetroAchievementsEnabled()
  const hardcore = getPreferenceRetroAchievementsHardcore()

  return <span className="flex-row">
    <button className={`push-button${enabled ? " achievement-button-active" : ""}`}
      title={enabled ? "Disable Retro Achievements" : "Enable Retro Achievements"}
      onClick={() => {
        setPreferenceRetroAchievementsEnabled(!enabled)
        props.updateDisplay()
      }}>
      <FontAwesomeIcon icon={faMedal} />
    </button>
    <button className={`push-button${hardcore ? " achievement-button-active" : ""}`}
      title={hardcore ? "Disable Hardcore Restrictions" : "Enable Hardcore Restrictions"}
      disabled={!enabled}
      onClick={() => {
        setPreferenceRetroAchievementsHardcore(!hardcore)
        props.updateDisplay()
      }}>
      <FontAwesomeIcon icon={hardcore ? faShieldHalved : faShield} />
    </button>
    {state.active && <span className="default-font achievement-status-inline">{state.gameTitle}</span>}
  </span>
}

export default RetroAchievementsButtons
