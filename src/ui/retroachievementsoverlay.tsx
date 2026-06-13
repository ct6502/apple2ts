import { handleGetRetroAchievementsState } from "./main2worker"

const RetroAchievementsOverlay = () => {
  const state = handleGetRetroAchievementsState()
  const achievements = state.achievements.slice(0, 6)

  return <>
    <div className="achievement-overlay-panel default-font">
      <div className="achievement-overlay-title">Retro Achievements</div>
      <div className="achievement-overlay-status">{state.statusText}</div>
      {state.trackerText && <div className="achievement-overlay-tracker">{state.trackerText}</div>}
      {state.active && achievements.length > 0 && <div className="achievement-overlay-list">
        {achievements.map((achievement) => (
          <div className="achievement-overlay-row" key={achievement.id}>
            <span className={`achievement-overlay-pill${achievement.unlocked ? " achievement-overlay-pill-unlocked" : ""}`}>{achievement.points}</span>
            <span className="achievement-overlay-text">{achievement.title}</span>
            <span className="achievement-overlay-progress">{achievement.unlocked ? "Unlocked" : `${achievement.measuredPercent}%`}</span>
          </div>
        ))}
      </div>}
    </div>
    <div className="achievement-toast-stack default-font">
      {state.toasts.map((toast) => (
        <div key={toast.id} className={`achievement-toast achievement-toast-${toast.kind}`}>
          <div className="achievement-toast-title">{toast.title}</div>
          <div className="achievement-toast-description">{toast.description}</div>
        </div>
      ))}
    </div>
  </>
}

export default RetroAchievementsOverlay
