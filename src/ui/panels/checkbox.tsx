
interface EditFieldProps {
  name?: string;
  checked: boolean;
  setChecked: (v: boolean) => void;
  disabled?: boolean;
  width?: string;
}

const CheckBox = (props: EditFieldProps) => {
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setChecked(e.target.checked)
  }

return(<div className="flex-row" style={{
        ...(props.disabled && {
        opacity: 0.4,
        pointerEvents: "none"
      }),
        ...(props.width && {
        width: props.width
      })}}>
        <div style={{height: "8px" }} />
        <input type="checkbox" id={props.name} value="halt"
          className="check-radio-box shift-down"
          checked={props.checked}
          onChange={(e) => { handleValueChange(e) }} />
        {props.name && <label htmlFor={props.name} className="dialog-title flush-left">{props.name}</label>}
      </div>
      )
}

export default CheckBox