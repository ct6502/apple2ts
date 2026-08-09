import CheckBox from "../checkbox"
import { useTranslation } from "../../../i18n/useTranslation"

const Breakpoint_Once = (props: {
  breakpoint: Breakpoint,
  setBreakpoint: (bp: Breakpoint) => void,
}) => {
  const { t } = useTranslation()
  return <CheckBox name={t("debug.breakOnce")}
    checked={props.breakpoint.once}
    setChecked={(checked) => props.setBreakpoint({ ...props.breakpoint, once: checked })} />
}

export default Breakpoint_Once
