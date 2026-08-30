import { createRoot } from "react-dom/client"
import App from "./App"
import { i18n, synchronizeDocumentLanguage } from "../i18n"
import { isOneDriveMsalAuthCallback } from "./devices/disk/onedrive_authredirect"

if (isOneDriveMsalAuthCallback()) {
    import("@azure/msal-browser/redirect-bridge")
        .then(({ broadcastResponseToMainFrame }) => broadcastResponseToMainFrame())
        .catch(error => console.error("OneDrive authentication callback failed", error))
} else {
    const container = document.getElementById("root")
    synchronizeDocumentLanguage(i18n)
    const root = createRoot(container)
    root.render(
        <App/>
    )
}
// StrictMode turns on additional debugging
// root.render(
//   <React.StrictMode>
//     <App/>
//   </React.StrictMode>
// );
