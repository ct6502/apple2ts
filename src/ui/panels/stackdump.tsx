import { handleGetStackString } from "../main2worker"
import { useTranslation } from "../../i18n/useTranslation"

const StackDump = () => {
  const { t } = useTranslation()
  return (
    <div className="debug-panel">
      <div className="bigger-font" style={{ marginBottom: "6px" }}>{t("debug.stackDump")}</div>
      <div className="thin-border mono-text"
        style={{ padding: "3px", overflow: "auto", width: "150px", height: "250px" }}>
          {handleGetStackString()}</div>
    </div>
  )
}

export default StackDump
