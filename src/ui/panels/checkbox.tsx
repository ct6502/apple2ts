
interface EditFieldProps {
  name?: string;
  checked: boolean;
  setChecked: (v: boolean) => void;
  disabled?: boolean;
}

const CheckBox = (props: EditFieldProps) => {
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setChecked(e.target.checked)
  }

return(<div className="flex-row" style={{marginRight: "10px",
        ...(props.disabled && {
        opacity: 0.4,
        pointerEvents: "none"
      })}}>
        <input type="checkbox" id={props.name} value="halt"
          className="check-radio-box shift-down"
          checked={props.checked}
          onChange={(e) => { handleValueChange(e) }} />
        {props.name && <label htmlFor={props.name} className="dialog-title flush-left">{props.name}</label>}
      </div>
      )
}

export default CheckBox