// Lazy load cloud storage scripts only when needed

let googleScriptsLoaded = false
let onedriveScriptLoaded = false

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = src
    script.type = "text/javascript"
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

export const loadGoogleDriveScripts = async (): Promise<void> => {
  if (googleScriptsLoaded) {
    return
  }

  console.log("Loading Google Drive scripts...")
  
  try {
    await Promise.all([
      loadScript("js/google_api.js"),
      loadScript("js/google_client.js")
    ])
    googleScriptsLoaded = true
    console.log("Google Drive scripts loaded")
  } catch (error) {
    console.error("Failed to load Google Drive scripts:", error)
    throw error
  }
}

export const loadOneDriveScript = async (): Promise<void> => {
  if (onedriveScriptLoaded) {
    return
  }

  console.log("Loading OneDrive script...")
  
  try {
    await loadScript("js/onedrive.js")
    onedriveScriptLoaded = true
    console.log("OneDrive script loaded")
  } catch (error) {
    console.error("Failed to load OneDrive script:", error)
    throw error
  }
}
