import { basicSetup } from "codemirror"
import { EditorView, ViewUpdate } from "@codemirror/view"
import {json} from "@codemirror/lang-json"
import {jsonLanguage} from "@codemirror/lang-json"
import { useEffect, useRef } from "react"
import { oneDark } from "@codemirror/theme-one-dark"
import {CompletionContext} from "@codemirror/autocomplete"
import {syntaxTree} from "@codemirror/language"

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

      const cmds = [ "commands", "emulator", "expect", "match", "send", "sleep", "disconnect" ]
      const details = [ "An array of Apple exPectin commands",
        "An emulator command (like boot or reset)",
        "An array of match/command pairs",
        "Regular expression to match against the Apple II text",
        "A text string to send to the Apple II",
        "Time to sleep in milliseconds",
        "Disconnect from the Apple II" ]
      const labelOptions = cmds.map((label, i) => ({
        label: ("\"" + label + "\" - "),
        type: "",
        detail: details[i], apply: label + "\": \""}))

      const completeJSON = (context: CompletionContext) => {
        const tree = syntaxTree(context.state)
        // Debug: print out syntax tree from current cursor position upwards
        // let pos = context.pos
        // while (pos > 0) {
        //   const tmpNode = tree.resolveInner(pos, -1)
        //   pos = tmpNode.from
        //   console.log(`${tmpNode.name} ${tmpNode.from} ${tmpNode.to} ${context.state.sliceDoc(tmpNode.from, tmpNode.to)}`)
        // }
        const nodeBefore = tree.resolveInner(context.pos, -1)
        if (nodeBefore.name != "PropertyName" ||
            context.state.sliceDoc(nodeBefore.from, nodeBefore.from + 1) != "\"")
          return null
        const textBefore = context.state.sliceDoc(nodeBefore.from, context.pos)
        const tagBefore = /\w*$/.exec(textBefore)
        if (!tagBefore && !context.explicit) return null
        return {
          from: tagBefore ? nodeBefore.from + tagBefore.index : context.pos,
          options: labelOptions,
          validFor: /^(@\w*)?$/
        }
      }

      const completions = jsonLanguage.data.of({
        autocomplete: completeJSON
      })

      const view = new EditorView({
        doc: props.value,
        parent: editorRef.current,
        extensions: [basicSetup,
          oneDark,
          fixedHeightEditor,
          json(),
          completions,
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

  return <div ref={editorRef} style={{ height: "760px", width: "685px",
    overflowY: "hidden" }} />
}

export default CodeMirrorEditor
