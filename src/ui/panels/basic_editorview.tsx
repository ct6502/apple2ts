import { basicSetup } from "codemirror"
import { EditorView, ViewUpdate } from "@codemirror/view"
import { basic } from "./basic_codemirror_lang"
import { useEffect, useRef } from "react"
import { oneDark } from "@codemirror/theme-one-dark"

interface EditorProps {
  value: string;
  setValue: (v: string) => void;
}

const BasicEditor = (props: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current) {
      const fixedHeightEditor = EditorView.theme({
        "&": { height: "100%" }
      })

      const view = new EditorView({
        doc: props.value,
        parent: editorRef.current,
        extensions: [basicSetup,
          oneDark,
          fixedHeightEditor,
          basic(),
          EditorView.updateListener.of((update: ViewUpdate) => {
            if (update.docChanged) {
              // Call props.setValue with the updated content
              const newValue = update.state.doc.toString()
              props.setValue(newValue)
            }
          })
        ],
      })

      // Cleanup on unmount
      return () => {
        view.destroy()
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

  return <div ref={editorRef} style={{
    height: "760px", width: "687px",
    overflowY: "hidden"
  }} />
}

export default BasicEditor
