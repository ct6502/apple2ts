import { basicSetup } from "codemirror"
import { EditorView, ViewUpdate } from "@codemirror/view"
import {json} from "@codemirror/lang-json"
import { useEffect, useRef } from "react"
import { oneDark } from "@codemirror/theme-one-dark"

interface EditorProps {
  value: string;
  setValue: (v: string) => void;
}

const CodeMirrorEditor = (props: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current) {
      const fixedHeightEditor = EditorView.theme({
        "&": {height: "100%"}
      })
      const view = new EditorView({
        doc: props.value,
        parent: editorRef.current,
        extensions: [basicSetup,
          oneDark,
          fixedHeightEditor,
          json(),
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

  return <div ref={editorRef} style={{ height: "90%", width: "100%",
    overflowY: "hidden" }} />
}

export default CodeMirrorEditor
