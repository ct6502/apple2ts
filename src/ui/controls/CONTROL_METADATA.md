# Control Metadata

`ControlMetadata<Context, Payload>` describes a control independently of its visual renderer. Define these tags inline in the owning graphical control module; both the graphical adapters and Retro registry consume that same definition. A control only needs `id` and `label`; omitted placement puts it under `Options`, after explicitly ordered items.

## Tags

| Tag | Type | Purpose |
| --- | --- | --- |
| `id` | `string` | Required stable identifier. IDs must be unique. |
| `label` | `string` or context function | Required visible label. |
| `kind` | `action`, `choice`, `toggle`, or `submenu` | Optional explicit kind. Inferred from children or options when omitted. |
| `parentId` | `string` or `null` | Menu placement. Omit for `Options`; use `null` for the root. |
| `order` | `number` | Sort order within the parent. Omitted items follow ordered items in registration order. |
| `separator` | `boolean` | Renders the label as `— Label —`. |
| `value` | `string` or context function | Value displayed beside the label. |
| `action` | context callback | Runs an action control. |
| `children` | control array or context function | Static submenu children. |
| `dynamicChildren` | context callback | Lazily resolved submenu children. |
| `options` | option array or context function | Choices available to a choice or toggle. |
| `optionIndex` | `number` or context function | Currently selected option. |
| `defaultIndex` | `number` or context function | Default option used for the checkmark. |
| `isVisible` | `boolean` or context function | Includes or omits the control at resolution time. |
| `selectable` | `boolean` or context function | Enables keyboard selection. |
| `valueOnly` | `boolean` | Displays the selected option instead of the control label. |
| `actionLabel` | `string` or context function | Footer action text for a submenu. |
| `contextualActionLabel` | `string` or context function | Item-specific footer action text. |
| `refreshOptions` | context callback | Rebuilds controls after an option changes. |
| `refreshParentOnOption` | `boolean` | Re-resolves the parent after previewing an option. |
| `refreshTitle` | context callback | Rebuilds a submenu title after a change. |
| `checkmarkIndex` | `number` | Option index displayed with a checkmark. |
| `payload` | `Payload` | Renderer-independent data carried by a resolved control. |
| `submit` | context callback | Submits a multi-item submenu. |
| `isSubmitVisible` | context callback | Controls multi-item submit visibility. |

Option metadata supports `label`, `popupLabel`, `action`, `preview`, and `useBrowserFont`. `popupLabel` preserves graphical-only presentation while both renderers share the same value and action.