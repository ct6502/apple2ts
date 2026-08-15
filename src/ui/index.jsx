import { createRoot } from "react-dom/client"
import App from "./App"
import { i18n, synchronizeDocumentLanguage } from "../i18n"

const container = document.getElementById("root")
synchronizeDocumentLanguage(i18n)
const root = createRoot(container)
root.render(
    <App/>
)
// StrictMode turns on additional debugging
// root.render(
//   <React.StrictMode>
//     <App/>
//   </React.StrictMode>
// );
