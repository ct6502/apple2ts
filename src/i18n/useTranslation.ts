import { useState, useEffect } from "react"
import { i18n, Language } from "./index"

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>(i18n.getLanguage())
  
  useEffect(() => {
    const unsubscribe = i18n.subscribe((lang) => {
      setLanguage(lang)
    })
    
    return () => {
      unsubscribe()
    }
  }, [])
  
  const changeLanguage = (lang: Language) => {
    i18n.setLanguage(lang)
  }
  
  return {
    t: i18n.t.bind(i18n),
    language,
    changeLanguage
  }
}
