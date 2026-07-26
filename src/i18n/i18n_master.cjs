const fs = require('fs');
const path = require('path');

/**
 * Apple2TS i18n Master Tool
 * 
 * Features:
 * 1. Sync: Synchronizes the structure of all 13 languages with en.ts.
 * 2. Translate: Provides a dictionary-based translation for common technical terms.
 * 
 * Usage:
 * node i18n_master.cjs
 */

const LANG_DIR = path.join(__dirname, 'languages');
const SOURCE_FILE = path.join(LANG_DIR, 'en.ts');
const LANGUAGES = ['zh-TW', 'zh-CN', 'es', 'de', 'fr', 'it', 'pt', 'ja', 'ko', 'nl', 'sv', 'ru'];

const EXPORT_NAMES = {
  'zh-TW': 'zhTW', 'zh-CN': 'zhCN', 'es': 'es', 'de': 'de', 'fr': 'fr',
  'it': 'it', 'pt': 'pt', 'ja': 'ja', 'ko': 'ko', 'nl': 'nl', 'sv': 'sv', 'ru': 'ru'
};

// Technical Dictionary for common Apple II / UI terms
const DICT = {
  "Load Disk": {
    "zh-TW": "載入磁碟", "zh-CN": "加载磁盘", "ja": "ディスクを読み込む", "ko": "디스크 로드",
    "es": "Cargar disco", "de": "Disk laden", "fr": "Charger le disque", "it": "Carica disco",
    "pt": "Carregar disco", "nl": "Disk laden", "sv": "Ladda disk", "ru": "Загрузить диск"
  },
  "Eject Disk": {
    "zh-TW": "退出磁碟", "zh-CN": "弹出磁盘", "ja": "ディスクを排出", "ko": "디스크 꺼내기",
    "es": "Expulsar disco", "de": "Disk auswerfen", "fr": "Éjecter le disque", "it": "Espelli disco",
    "pt": "Ejetar disco", "nl": "Disk uitwerpen", "sv": "Mata ut disk", "ru": "Извлечь диск"
  },
  "Save Disk": {
    "zh-TW": "儲存磁碟", "zh-CN": "保存磁盘", "ja": "ディスクを保存", "ko": "디스크 저장",
    "es": "Guardar disco", "de": "Disk speichern", "fr": "Enregistrer le disque", "it": "Salva disco",
    "pt": "Salvar disco", "nl": "Disk opslaan", "sv": "Spara disk", "ru": "Сохранить диск"
  },
  "Main": { "zh-TW": "主要", "zh-CN": "主要", "ja": "メイン", "ko": "메인", "es": "Principal", "de": "Hauptmenü", "fr": "Principal", "it": "Principale", "pt": "Principal", "nl": "Hoofdmenu", "sv": "Huvudmeny", "ru": "Главный" },
  "Settings": { "zh-TW": "設定", "zh-CN": "设置", "ja": "設定", "ko": "설정", "es": "Ajustes", "de": "Einstellungen", "fr": "Paramètres", "it": "Impostazioni", "pt": "Configurações", "nl": "Instellingen", "sv": "Inställningar", "ru": "Настройки" },
  "Debug": { "zh-TW": "除錯", "zh-CN": "调试", "ja": "デバッグ", "ko": "디버그", "es": "Depuración", "de": "Debugging", "fr": "Débogage", "it": "Debug", "pt": "Depuração", "nl": "Debuggen", "sv": "Felsökning", "ru": "Отладка" },
  "New Program": {
    "zh-TW": "新程式", "zh-CN": "新程序", "ja": "新規プログラム", "ko": "새 프로그램",
    "es": "Nuevo programa", "de": "Neues Programm", "fr": "Nouveau programme", "it": "Nuovo programma",
    "pt": "Novo programa", "nl": "Nieuw programma", "sv": "Nytt program", "ru": "Новая программа"
  },
  "Help": {
    "zh-TW": "說明", "zh-CN": "帮助", "ja": "ヘルプ", "ko": "도움말",
    "es": "Ayuda", "de": "Hilfe", "fr": "Aide", "it": "Aiuto",
    "pt": "Ajuda", "nl": "Help", "sv": "Hjälp", "ru": "Помощь"
  },
  "Debugging": {
    "zh-TW": "除錯", "zh-CN": "调试", "ja": "デバッグ", "ko": "디버깅",
    "es": "Depuración", "de": "Fehlersuche", "fr": "Débogage", "it": "Debug",
    "pt": "Depuração", "nl": "Foutopsporing", "sv": "Felsökning", "ru": "Отладка"
  },
  "Guided Tour": { "zh-TW": "引導式導覽", "zh-CN": "引导式导览", "ja": "ガイド付きツアー", "ko": "가이드 투어", "es": "Tour Guiado", "de": "Geführte Tour", "fr": "Visite Guidée", "it": "Tour Guidato", "pt": "Tour Guiado", "nl": "Rondleiding", "sv": "Guidad tur", "ru": "Управляемый тур" },
  "Guided Tour: Main": {
    "zh-TW": "引導式導覽：主要", "zh-CN": "引导式导览：主要", "ja": "ガイド付きツアー：メイン", "ko": "가이드 투어: 메인", "es": "Tour Guiado: Principal", "de": "Geführte Tour: Hauptmenü", "fr": "Visite Guidée : Principal", "it": "Tour Guidato: Principale", "pt": "Tour Guiado: Principal", "nl": "Rondleiding: Hoofdmenu", "sv": "Guidad tur: Huvudmeny", "ru": "Управляемый тур: Главный"
  },
  "Guided Tour: Settings": {
    "zh-TW": "引導式導覽：設定", "zh-CN": "引导式导览：设置", "ja": "ガイド付きツアー：設定", "ko": "가이드 투어: 설정", "es": "Tour Guiado: Ajustes", "de": "Geführte Tour: Einstellungen", "fr": "Visite Guidée : Paramètres", "it": "Tour Guidato: Impostazioni", "pt": "Tour Guiado: Configurações", "nl": "Rondleiding: Instellingen", "sv": "Guidad tur: Inställningar", "ru": "Управляемый тур: Настройки"
  },
  "Guided Tour: Debug": {
    "zh-TW": "引導式導覽：除錯", "zh-CN": "引导式导览：调试", "ja": "ガイド付きツアー：デバッグ", "ko": "가이드 투어: 디버그", "es": "Tour Guiado: Depuración", "de": "Geführte Tour: Debugging", "fr": "Visite Guidée : Débogage", "it": "Tour Guidato: Debug", "pt": "Tour Guiado: Depuração", "nl": "Rondleiding: Debuggen", "sv": "Guidad tur: Felsökning", "ru": "Управляемый тур: Отладка"
  },
  "Next (Step {step} of {steps})": {
    "zh-TW": "下一步 (第 {step} 步，共 {steps} 步)",
    "zh-CN": "下一步 (第 {step} 步，共 {steps} 步)",
    "ja": "次へ ({steps} ステップ中の {step})",
    "ko": "다음 ({steps}단계 중 {step}단계)",
    "es": "Siguiente (Paso {step} de {steps})",
    "fr": "Suivant (Étape {step} sur {steps})",
    "de": "Weiter (Schritt {step} von {steps})",
    "it": "Avanti (Passaggio {step} di {steps})",
    "pt": "Próximo (Passo {step} de {steps})",
    "nl": "Volgende (Stap {step} van {steps})",
    "sv": "Nästa (Steg {step} av {steps})",
    "ru": "Далее (Шаг {step} из {steps})"
  },
  "Variable": {
    "zh-TW": "變數", "zh-CN": "变量", "ja": "変数", "ko": "변수", "es": "Variable", "de": "Variable", "fr": "Variable", "it": "Variabile", "pt": "Variável", "nl": "Variabele", "sv": "Variabel", "ru": "Переменная"
  },
  "Value": {
    "zh-TW": "值", "zh-CN": "值", "ja": "値", "ko": "값", "es": "Valor", "de": "Wert", "fr": "Valeur", "it": "Valore", "pt": "Valor", "nl": "Waarde", "sv": "Värde", "ru": "Значение"
  },
  "Trace Settings": {
    "zh-TW": "追蹤設定", "zh-CN": "追踪设置", "ja": "トレース設定", "ko": "추적 설정", "es": "Ajustes de traza", "de": "Trace-Einstellungen", "fr": "Paramètres de trace", "it": "Impostazioni di tracciamento", "pt": "Configurações de rastreamento", "nl": "Trace-instellingen", "sv": "Spårningsinställningar", "ru": "Настройки трассировки"
  }
};

function parseFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const startIdx = content.indexOf('{');
  const endIdx = content.lastIndexOf('}');
  if (startIdx === -1 || endIdx === -1) return {};
  const objStr = content.substring(startIdx, endIdx + 1);
  try {
    return eval(`(${objStr})`);
  } catch (e) {
    return {};
  }
}

function sync(source, target, langCode) {
  const result = {};
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      result[key] = sync(source[key], target[key] || {}, langCode);
    } else {
      // Priority 1: Existing target translation
      if (target[key] !== undefined && target[key] !== source[key]) {
        result[key] = target[key];
      }
      // Priority 2: Dictionary translation for the exact English phrase
      else if (DICT[source[key]] && DICT[source[key]][langCode]) {
        result[key] = DICT[source[key]][langCode];
      }
      // Priority 3: English fallback
      else {
        result[key] = target[key] || source[key];
      }
    }
  }
  return result;
}

console.log('--- Apple2TS i18n Master Tool ---');
const sourceObj = parseFile(SOURCE_FILE);

LANGUAGES.forEach(lang => {
  const targetPath = path.join(LANG_DIR, `${lang}.ts`);
  const targetObj = parseFile(targetPath);
  const merged = sync(sourceObj, targetObj, lang);
  const output = `export const ${EXPORT_NAMES[lang]} = ${JSON.stringify(merged, null, 2)}\n`;
  fs.writeFileSync(targetPath, output);
  console.log(`\u2705 Synced: ${lang}.ts`);
});

console.log('\nDone! Structure unified and common terms auto-translated.');
