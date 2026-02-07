import { basicSetup } from "codemirror"
import { EditorView, ViewUpdate, Decoration, DecorationSet } from "@codemirror/view"
import { EditorState, Compartment, StateField, StateEffect } from "@codemirror/state"
import { basic } from "./basic_codemirror_lang"
import { useEffect, useRef } from "react"
import { oneDark } from "@codemirror/theme-one-dark"

interface EditorProps {
  value: string;
  setValue: (v: string) => void;
  readOnly?: boolean;
  highlightLine?: number; // 1-based line number
}

// Effect to set the highlighted line
const setHighlightEffect = StateEffect.define<number | null>()

// StateField to manage line highlighting
const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes)
    for (const effect of tr.effects) {
      if (effect.is(setHighlightEffect)) {
        decorations = Decoration.none
        if (effect.value !== null && effect.value > 0) {
          try {
            const line = tr.state.doc.line(effect.value)
            const deco = Decoration.line({ class: "cm-highlighted-line" })
            decorations = Decoration.set([deco.range(line.from)])
          } catch {
            // Line doesn't exist, ignore
          }
        }
      }
    }
    return decorations
  },
  provide: f => EditorView.decorations.from(f)
})

const BasicEditor = (props: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const editableCompartment = useRef(new Compartment())

  useEffect(() => {
    if (editorRef.current) {
      const fixedHeightEditor = EditorView.theme({
        "&": { height: "100%" },
        ".cm-highlighted-line": {
          backgroundColor: "rgba(255, 255, 0, 0.15)",
          borderLeft: "3px solid yellow"
        }
      })

      const view = new EditorView({
        doc: props.value,
        parent: editorRef.current,
        extensions: [basicSetup,
          oneDark,
          fixedHeightEditor,
          basic(),
          highlightField,
          editableCompartment.current.of([
            EditorView.editable.of(true),
            EditorState.readOnly.of(false)
          ]),
          EditorView.updateListener.of((update: ViewUpdate) => {
            if (update.docChanged) {
              // Call props.setValue with the updated content
              const newValue = update.state.doc.toString()
              props.setValue(newValue)
            }
          })
        ],
      })
      viewRef.current = view
      // Cleanup on unmount
      return () => {
        view.destroy()
        viewRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Swallow Ctrl+S or Cmd+S to avoid spurious save dialogs
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Update editable state when readOnly prop changes
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: editableCompartment.current.reconfigure([
          EditorView.editable.of(!props.readOnly),
          EditorState.readOnly.of(!!props.readOnly)
        ])
      })
    }
  }, [props.readOnly])

  // Update highlighted line when highlightLine prop changes
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: setHighlightEffect.of(props.highlightLine ?? null)
      })
    }
  }, [props.highlightLine])

  return <div ref={editorRef} style={{
    height: "760px", width: "687px",
    overflowY: "hidden"
  }} />
}

export default BasicEditor
