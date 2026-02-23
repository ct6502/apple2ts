import { basicSetup } from "codemirror"
import { EditorView, ViewUpdate, Decoration, DecorationSet } from "@codemirror/view"
import { EditorState, Compartment, StateField, StateEffect } from "@codemirror/state"
import { basic } from "./basic_codemirror_lang"
import { useEffect, useRef, useCallback } from "react"
import { oneDark } from "@codemirror/theme-one-dark"
import { handleGetAutoNumbering } from "../../ui_settings"
import { BreakpointMap } from "../../../common/breakpoint"
import { breakpointTheme, createBreakpointGutter, toggleBreakpoint } from "./basic_breakpoints"
import { setPreferenceBreakpoints } from "../../localstorage"
import { handleGetBreakpoints } from "../../main2worker"

interface EditorProps {
  value: string;
  setValue: (v: string) => void;
  readOnly?: boolean;
  highlightLine?: number; // 1-based line number
  breakpoints?: BreakpointMap;
  onBreakpointsChange?: (breakpoints: BreakpointMap) => void;
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
  const breakpointCompartment = useRef(new Compartment())

  const handleBreakpointToggle = useCallback((line: number) => {
    const currentBreakpoints = handleGetBreakpoints()
    const newBreakpoints = toggleBreakpoint(currentBreakpoints, line)
    
    setPreferenceBreakpoints(newBreakpoints)
    
    // Notify parent component if callback provided
    if (props.onBreakpointsChange) {
      props.onBreakpointsChange(newBreakpoints)
    }
    
    // Reconfigure the gutter completely to force update
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: breakpointCompartment.current.reconfigure(
          createBreakpointGutter(handleBreakpointToggle)
        )
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.onBreakpointsChange])

  useEffect(() => {
    if (editorRef.current) {
      const fixedHeightEditor = EditorView.theme({
        "&": { height: "100%" },
        ".cm-highlighted-line": {
          backgroundColor: "rgba(255, 255, 0, 0.25)",
          borderLeft: "5px solid yellow"
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
          breakpointCompartment.current.of(createBreakpointGutter(handleBreakpointToggle)),
          breakpointTheme,
          EditorView.lineWrapping,
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
      // If user hits return/enter and auto-numbering is enabled, insert a new line with the next line number
      if (event.key === "Enter" && handleGetAutoNumbering()) {
        const view = viewRef.current
        if (view) {
          const { state } = view
          // Back up one character to get to the end of the current line,
          // since the cursor is after the newline
          const currentLine = state.doc.lineAt(state.selection.main.head - 1)
          const lineText = currentLine.text
          const lineNumberMatch = lineText.trim().match(/^(\d+)/)
          if (lineNumberMatch) {
            const currentLineNumber = parseInt(lineNumberMatch[1], 10)
            
            // Find the next line number after the current line
            let nextLineNumber: number | null = null
            for (let i = currentLine.number + 1; i <= state.doc.lines; i++) {
              const text = state.doc.line(i).text
              const match = text.trim().match(/^(\d+)/)
              if (match) {
                nextLineNumber = parseInt(match[1], 10)
                break
              }
            }
            // Calculate the new line number
            let newLineNumber: number
            if (nextLineNumber === null) {
              // End of file, just add 10
              newLineNumber = currentLineNumber + 10
            } else if (currentLineNumber + 10 < nextLineNumber) {
              // There's room, use +10
              newLineNumber = currentLineNumber + 10
            } else {
              // Find a number between current and next
              newLineNumber = Math.floor((currentLineNumber + nextLineNumber) / 2)
              // If there's no room (consecutive numbers), use +1
              if (newLineNumber <= currentLineNumber) {
                newLineNumber = currentLineNumber + 1
              }
            }
            
            const indentMatch = lineText.match(/^\d+(\s*)/)
            const indent = indentMatch ? indentMatch[1] : " "
            const newText = `${newLineNumber}${indent}`
            view.dispatch({
              changes: { from: state.selection.main.head, insert: newText },
              selection: { anchor: state.selection.main.head + newText.length }
            })
            event.preventDefault()
          }
        }
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

  // Update document when value prop changes externally
  useEffect(() => {
    if (viewRef.current) {
      const currentDoc = viewRef.current.state.doc.toString()
      if (currentDoc !== props.value) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentDoc.length,
            insert: props.value
          }
        })
      }
    }
  }, [props.value])

  // Update highlighted line when highlightLine prop changes
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: setHighlightEffect.of(props.highlightLine ?? null)
      })
    }
  }, [props.highlightLine])

  // Update breakpoints gutter when breakpoints change externally
  useEffect(() => {
    if (viewRef.current && props.breakpoints) {
      // Reconfigure the gutter to force update
      viewRef.current.dispatch({
        effects: breakpointCompartment.current.reconfigure(
          createBreakpointGutter(handleBreakpointToggle)
        )
      })
    }
  }, [props.breakpoints, handleBreakpointToggle])

  return <div ref={editorRef} style={{
    height: "760px", width: "687px",
    overflowY: "hidden"
  }} />
}

export default BasicEditor
