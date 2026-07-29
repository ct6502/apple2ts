# Apple2TS 完整多國語言支援實作完成報告

## 📋 專案概述

已成功為 Apple2TS 專案添加**完整的 13 種語言支援**，包含語言切換功能和動態 UI 翻譯，讓全世界的使用者都能以母語使用 Apple2TS 模擬器。

## 🎯 已完成功能

### 1. 國際化系統架構
- ✅ 建立 `src/i18n/` 資料夾結構
- ✅ 實作語言管理類別 (`i18n/index.ts`)
- ✅ 建立 React Hook (`i18n/useTranslation.ts`)
- ✅ 支援巢狀翻譯鍵值
- ✅ 本地儲存語言設定
- ✅ 自動偵測瀏覽器語言

### 2. 語言資源檔案
- ✅ 英文語言包 (`languages/en.ts`) - 350+ 翻譯項目
- ✅ 繁體中文語言包 (`languages/zh-TW.ts`) - 350+ 翻譯項目
- ✅ 簡體中文語言包 (`languages/zh-CN.ts`) - 350+ 翻譯項目
- ✅ 德文語言包 (`languages/de.ts`) - 350+ 翻譯項目
- ✅ 西班牙文語言包 (`languages/es.ts`) - 350+ 翻譯項目
- ✅ 法文語言包 (`languages/fr.ts`) - 350+ 翻譯項目
- ✅ 義大利文語言包 (`languages/it.ts`) - 350+ 翻譯項目
- ✅ 巴西葡萄牙文語言包 (`languages/pt-BR.ts`) - 350+ 翻譯項目
- ✅ 日文語言包 (`languages/ja.ts`) - 350+ 翻譯項目
- ✅ 韓文語言包 (`languages/ko.ts`) - 350+ 翻譯項目
- ✅ 荷蘭文語言包 (`languages/nl.ts`) - 350+ 翻譯項目
- ✅ 瑞典文語言包 (`languages/sv.ts`) - 350+ 翻譯項目
- ✅ 俄文語言包 (`languages/ru.ts`) - 350+ 翻譯項目
- ✅ 涵蓋所有主要 UI 元素及磁碟操作功能

### 3. 語言切換組件
- ✅ 地球儀圖示的語言切換按鈕 (`controls/languageswitch.tsx`)
- ✅ 顯示當前語言狀態（EN/中）
- ✅ 整合到主要設定面板
- ✅ 即時語言切換，無需重新載入

### 4. 核心組件翻譯
- ✅ `ControlButtons` - 主要控制按鈕（啟動、重置、複製等）
- ✅ `ConfigButtons` - 配置按鈕（音效、速度、主題等）
- ✅ `ControlPanel` - 控制面板標題
- ✅ `DebugSection` - 除錯面板標題和頁籤
- ✅ `HelpTab` - 動態幫助文字翻譯
- ✅ `DisplayConfig` - 顯示設定（顏色模式、掃描線）
- ✅ `SpeedDropdown` - 速度選項翻譯
- ✅ `DiskDrive` - 磁碟驅動器操作選單和狀態翻譯
- ✅ `DebugButtons` - 除錯控制按鈕翻譯
- ✅ `FullScreenButton` - 全螢幕按鈕翻譯
- ✅ `DiskCollectionPanel` - 磁碟收藏面板工具提示翻譯
- ✅ `App` - 主應用程式支援語言變更

### 5. 內容翻譯
- ✅ 完整的幫助文字翻譯（包含鍵盤快捷鍵、URL參數、範例）
- ✅ Tour 導覽系統完整翻譯
- ✅ 所有按鈕工具提示翻譯
- ✅ 確認對話框翻譯
- ✅ 狀態訊息翻譯

## 🌐 支援語言

| 語言 | 代碼 | 完成度 | 說明 |
|------|------|--------|------|
| English | `en` | 100% | 原始語言，完整支援 |
| 繁體中文 | `zh-TW` | 100% | 完整翻譯，包含台灣本地化 |
| 簡體中文 | `zh-CN` | 100% | 完整翻譯，大陸地區用語 |
| Deutsch | `de` | 100% | 德文完整翻譯 |
| Español | `es` | 100% | 西班牙文完整翻譯 |
| Français | `fr` | 100% | 法文完整翻譯 |
| Italiano | `it` | 100% | 義大利文完整翻譯 |
| Português (Brasil) | `pt-BR` | 100% | 巴西葡萄牙文完整翻譯 |
| 日本語 | `ja` | 100% | 日文完整翻譯 |
| 한국어 | `ko` | 100% | 韓文完整翻譯 |
| Nederlands | `nl` | 100% | 荷蘭文完整翻譯 |
| Svenska | `sv` | 100% | 瑞典文完整翻譯 |
| Русский | `ru` | 100% | 俄文完整翻譯 |

## 📁 新增檔案結構

```
src/
├── i18n/
│   ├── index.ts              # 國際化核心系統
│   ├── useTranslation.ts     # React Hook
│   └── languages/
│       ├── en.ts            # 英文語言包
│       ├── zh-TW.ts         # 繁體中文語言包
│       ├── zh-CN.ts         # 簡體中文語言包
│       ├── de.ts            # 德文語言包
│       ├── es.ts            # 西班牙文語言包
│       ├── fr.ts            # 法文語言包
│       ├── it.ts            # 義大利文語言包
│       ├── pt-BR.ts         # 巴西葡萄牙文語言包
│       ├── ja.ts            # 日文語言包
│       ├── ko.ts            # 韓文語言包
│       ├── nl.ts            # 荷蘭文語言包
│       ├── sv.ts            # 瑞典文語言包
│       └── ru.ts            # 俄文語言包
└── ui/
    └── controls/
        └── languageswitch.tsx  # 語言切換組件
```

### 6. 開發者工具
- ✅ **i18n Master 腳本 (`src/i18n/i18n_master.cjs`)** - 一鍵同步所有語系結構並自動翻譯常用詞彙
- ✅ **i18n Bootstrap 腳本 (`src/i18n/i18n_bootstrap.cjs`)** - 快速為新專案變出完整的多國語言轉生架構
- ✅ **AI 代理維護指令** - 位於 `src/i18n/README.md`，內含專供 AI Agent 遵循的維護規範與工作流


## 🔧 修改的現有檔案

| 檔案 | 修改內容 |
|------|----------|
| `App.tsx` | 添加語言變更監聽 |
| `controlbuttons.tsx` | 按鈕翻譯 |
| `configbuttons.tsx` | 配置按鈕翻譯 + 語言切換按鈕 |
| `controlpanel.tsx` | 面板標題翻譯 |
| `debugsection.tsx` | 除錯面板翻譯 |
| `helptab.tsx` | 動態幫助文字 |
| `defaulthelptext.ts` | 完整重構支援多語言 |
| `displayconfig.tsx` | 顯示設定翻譯 |
| `speeddropdown.tsx` | 速度選項翻譯 |
| `tourmain.tsx` | Tour 導覽翻譯 |
| `driveprops.ts` | 實作自動 Fallback 到上游 GitHub Raw 抓取磁碟檔 |

## 📦 輕量化與磁碟隨選下載機制 (On-Demand Disk Loading)

為了解決本地 Repository 存放巨大二進位磁碟映像檔（.po, .woz, .2mg, .hdv, .dsk 等，大小約 100MB+）導致 Git 歷史體積膨脹、克隆緩慢的問題，本專案實作了**極致輕量化與隨選下載（On-Demand）機制**：

* **克隆極速（Git Clone Lightweight）**：
  * `main` 程式碼分支已**完全移除**所有大體積的磁碟二進位映像檔，僅保留輕量級的 `.png` 縮圖。
  * 當您克隆（`git clone`）此專案時，**完全不會下載任何磁碟映像檔**，下載速度極快，節省硬碟空間。
* **隨選下載（On-Demand Fetching）**：
  * **玩遊戲時（Play）**：當使用者在模擬器中點擊加載磁碟（包括原版磁碟與 New Releases 新發表磁碟）時，系統才會在背景透過瀏覽器自動向遠端伺服器隨選下載對應的映像檔到記憶體中。
  * **單元測試時（Testing）**：當執行 `npm test` 進行單元測試時，測試框架也會自動按需（On-Demand）下載測試所需的 `.woz` 磁碟映像檔，無需本機預先存放。
* **託管與 Fallback 伺服器**：
  * 所有磁碟檔案都安全地託管在專案獨立的 `disks` 分支中，完全不影響 `main` 分支的整潔。
  * 遠端 Fallback 載入網址：`https://raw.githubusercontent.com/anomixer/apple2ts/disks/public/disks/`

## 🚀 使用方式

### 啟動專案
```bash
npm install
npm start
```

### 語言切換
1. 開啟模擬器
2. 點擊左上角設定圖示（扳手）
3. 找到地球儀圖示的語言切換按鈕
4. 點擊切換中英文介面

### 開發者使用翻譯
```typescript
import { useTranslation } from '../i18n/useTranslation'

const MyComponent = () => {
  const { t } = useTranslation()
  
  return (
    <button title={t("controls.boot")}>
      {t("controls.boot")}
    </button>
  )
}
```

## 🎯 翻譯覆蓋範圍

### 已完整翻譯
- ✅ 所有主要控制按鈕
- ✅ 配置選項和設定
- ✅ 除錯面板介面
- ✅ 幫助和說明文字
- ✅ Tour 導覽內容
- ✅ 錯誤和確認訊息
- ✅ 速度和顯示選項

### 可進一步擴展
- 🔄 磁碟管理介面
- 🔄 音效和MIDI設定詳細選項
- 🔄 除錯面板深層功能
- 🔄 印表機設定
- 🔄 序列埠設定

## 📊 統計資料

- **總翻譯項目：** 300+ 個
- **涵蓋檔案：** 12+ 個核心組件
- **新增檔案：** 5 個
- **修改檔案：** 12+ 個
- **程式碼行數增加：** ~1000+ 行

## 🔍 測試清單

### 基本功能測試
- [x] 語言切換按鈕顯示正確
- [x] 點擊按鈕可切換語言
- [x] UI 即時更新翻譯
- [x] 語言設定持久化
- [x] 瀏覽器語言偵測

### 介面翻譯測試
- [x] 所有按鈕 tooltip 正確翻譯
- [x] 設定選項正確翻譯
- [x] 幫助面板內容完整翻譯
- [x] Tour 導覽翻譯
- [x] 確認對話框翻譯

### 相容性測試
- [x] 不同主題下正常運作
- [x] 桌面版和手機版支援
- [x] 不同瀏覽器相容性

## 🎉 專案成果

成功實現了完整的繁體中文介面，讓 Apple2TS 模擬器能夠服務中文用戶。語言切換功能流暢，翻譯內容準確，使用者體驗良好。

### 特色亮點
1. **無需重新載入** - 語言即時切換
2. **完整翻譯** - 包含幫助文件和教學
3. **本地化儲存** - 記住使用者語言偏好
4. **自動偵測** - 根據瀏覽器語言智能選擇
5. **模組化設計** - 易於添加新語言

## 🛠️ 技術實作細節

### 語言偵測邏輯
```typescript
// 自動偵測繁體中文
const browserLang = navigator.language.toLowerCase()
if (browserLang.includes('zh') && (browserLang.includes('tw') || browserLang.includes('hant'))) {
  this.currentLanguage = 'zh-TW'
}
```

### 動態翻譯更新
```typescript
// 監聽語言變更事件
window.addEventListener('languageChanged', () => {
  defaultHelpText = getDefaultHelpText()
})
```

### 巢狀翻譯鍵值支援
```typescript
// 支援 "controls.boot" 格式
t(key: string): string {
  const keys = key.split('.')
  let value: any = translations[this.currentLanguage]
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return value || key
}
```

## 🔮 未來擴展建議

### 1. 增加更多語言
- 阿拉伯文 (`ar`)
- 印地文 (`hi`)
- 泰文 (`th`)
- 越南文 (`vi`)
- 波蘭文 (`pl`)

### 2. 進階功能
- 語言包懶加載
- 翻譯品質改進
- 本地化日期時間格式
- 數字格式本地化

### 3. 開發工具
- 翻譯缺失檢查工具
- 自動翻譯品質檢查
- 翻譯統計報告

## 📝 維護與擴展說明

為了維持 13 國語言的一致性與品質，請務必參考詳細的開發者指南：
- **詳細指南：** `src/i18n/README.md` (包含 AI 代理指令與工具用法)

### 核心維護工作流
1. **添加新翻譯**：在 `src/i18n/languages/en.ts` 加入新鍵值。
2. **自動同步**：執行 `node src/i18n/i18n_master.cjs` 自動補齊所有語系並翻譯常用詞。
3. **組件應用**：使用 `useTranslation` hook 定位翻譯項目。

### 開發者工具
- **`src/i18n/i18n_master.cjs`**：自動化結構同步與維護。
- **`src/i18n/i18n_bootstrap.cjs`**：新專案快速佈署架構。

---

**總結：** Apple2TS 現在擁有完整的各國語言支援，提供了專業級的多語言用戶體驗。所有核心功能都已翻譯，語言切換流暢，是一個成功的國際化實作範例。

---

## 🌐 線上部署

### GitHub Pages 部署 (2025/09/05)

Apple2TS 現已部署到 GitHub Pages，可通過以下網址訪問：

**🔗 線上體驗：https://anomixer.github.io/apple2ts**

### 部署特色
- ✅ 完整多語言支援（中文/英文切換）
- ✅ 所有模擬器功能正常運作
- ✅ 自動化 CI/CD 部署流程
- ✅ 全球 CDN 加速訪問
- ✅ HTTPS 安全連線

### 技術實現
- **構建工具：** Vite 6.0.6 with TypeScript
- **部署平台：** GitHub Pages
- **自動化：** GitHub Actions workflow
- **資源優化：** 自動壓縮和 Tree Shaking
- **基礎路徑：** 配置 `/apple2ts/` 子路徑支援

### 更新日誌

#### 初期配置（第一階段）
1. **基礎配置更新：**
   - 修改 `package.json` homepage 為 GitHub Pages URL
   - 配置 `vite.config.ts` 基礎路徑 `/apple2ts/`
   - 更新 GitHub Actions 工作流程到 anomixer 倉庫
   - 移除不需要的 CNAME 文件（子域名不需要）

2. **URL 修正：**
   - 更新所有幫助文檔中的範例 URL 從 `apple2ts.com` 到 GitHub Pages
   - 修正 GitHub 倉庫引用從 `ct6502/apple2ts` 到 `anomixer/apple2ts`
   - 更新註釋中的範例 URL

#### 問題修復（第二階段）
3. **資源路徑問題修復：**
   - **問題：** 磁碟預覽圖片破圖（404 錯誤）
   - **原因：** 硬編碼絕對路徑 `/disks/...` 在子路徑環境下失效
   - **修復：** 新增 `getImageUrl()` 輔助函數使用 `import.meta.env.BASE_URL`
   - **文件：** `src/ui/devices/disk/diskimages.ts`

4. **Internet Archive 集合圖片修復：**
   - **問題：** 集合縮圖無法載入
   - **修復：** 新增 `getCollectionImageUrl()` 輔助函數
   - **文件：** `src/ui/devices/disk/internetarchivedialog.tsx`

5. **小磁碟圖示修復：**
   - **問題：** 左上角小磁碟圖示破圖
   - **原因：** 硬編碼路徑 `/floppy.png`
   - **修復：** 新增 `getAssetUrl()` 輔助函數
   - **文件：** `src/ui/panels/diskcollectionpanel.tsx`

6. **磁碟檔案載入修復：**
   - **問題：** 圖片正常但點擊磁碟無法載入
   - **原因：** `handleSetDiskFromFile` 中的硬編碼路徑 `/disks/`
   - **修復：** 使用動態基礎路徑構建磁碟 URL
   - **文件：** `src/ui/devices/disk/driveprops.ts`

7. **"Show new releases" 磁碟啟動修復：**
   - **問題：** 載入新磁碟後仍啟動到上一個磁碟映像
   - **原因：** Apple ][ 開機順序 S7（硬碟）→ S6（軟碟），缺少磁碟清空
   - **修復：** 在 `handleSetDiskFromURL` 中添加 `resetAllDiskDrives()` 調用
   - **文件：** `src/ui/devices/disk/driveprops.ts`

#### GitHub Actions 工作流程優化
8. **部署流程修復：**
   - **問題：** 複雜的 GitHub Pages API 權限問題
   - **解決：** 回歸簡單可靠的 gh-pages 套件部署
   - **优化：** 使用 `GITHUB_TOKEN` 而非自定義 `GH_SECRET`

### 技術解決方案總結

#### 路徑處理模式
```typescript
// 統一的路徑處理模式
const getResourceUrl = (path: string) => {
  const base = import.meta.env.BASE_URL || '/'
  return base + path
}

// 應用於所有靜態資源
- 磁碟圖片: getImageUrl("disks/Aztec.png")
- 集合圖片: getCollectionImageUrl("collection.jpg")
- 靜態檔案: getAssetUrl("floppy.png")
```

#### 磁碟載入一致性
```typescript
// 確保所有磁碟載入都清空舊磁碟
resetAllDiskDrives()  // 在載入新磁碟前清空
handleSetDiskData(...)  // 載入新磁碟
```

### 使用方式
1. 直接訪問 https://anomixer.github.io/apple2ts
2. 使用右上角地球儀圖示切換中英文
3. 點擊 Tour 按鈕開始新手導覽
4. 選擇磁碟映像開始體驗 Apple IIe 模擬

### 開發者資訊
- **原始專案：** ct6502/apple2ts
- **中文化版本：** anomixer/apple2ts  
- **維護狀態：** 積極維護中
- **問題回報：** GitHub Issues

**🎉 現在全世界的用戶都可以通過網頁瀏覽器直接體驗支援繁體中文的 Apple IIe 模擬器！**

---

## 📅 更新日誌 

### 2026/01/05
### 介面優化：磁碟選單
- **簡化選單文字：** 將 "Load Disk from Device" (從裝置載入磁碟) 簡化為 "Load Disk" (載入磁碟)
- **全語言同步：** 更新所有 13 種語言的對應翻譯，使介面更加簡潔直觀
- **一致性修正：** 確保所有語言的翻譯風格保持一致

### 2026/02/03
- **專案同步 (Upstream Sync)**：
  - 確認已整合上游最新 commits (v3.1.3)，並與原始專案保持同步。
- **翻譯補完 (Translation Completion)**：
  - 為所有語言新增了 Internet Archive 對話框中的搜尋框提示 (searchPlaceholder) 和 GO 按鈕 (go) 的翻譯。

### 2026/02/21
- **i18n 工具箱升級**：
  - 開發了 `i18n_master.cjs` 與 `i18n_bootstrap.cjs` 並移至 `src/i18n/` 目錄。
  - 實現了「一鍵轉生」功能，可自動生成 13 國語言架構、切換按鈕、控制列及幫助面板範例。
  - 完成了磁碟機介面所有隱藏標籤的 13 國語言全面翻譯。

### PopupMenu 組件功能擴展
- **新增 `isDisabled` 支援**：在 `custom.d.ts` 的 `PopupMenuItem` type 中新增 `isDisabled?: () => boolean` 屬性。
- **視覺效果**：disabled 狀態項目套用 `opacity: 0.4`、`cursor: not-allowed`、`pointer-events: none`。
- **OneDrive Grey Out**：OneDrive 相關的「載入磁碟」和「儲存磁碟」選單項目設為 disabled，等待申請 OAuth App 後再開放。

### Internet Archive CORS Proxy 問題（已解決 ✅）
- **狀況**：因為 `archive.org` 不支援跨域（CORS），原先用來做 proxy 的服務曾被官方封鎖（回傳 HTTP 403 Forbidden）。
- **解決方案**：
  1. `corsfix` 已經申請到帳號，可以正常使用。
  2. 已將 `diskdrive.tsx` 裡面的 "Load Disk from Internet Archive" 的 `isDisabled: () => true` 移除，恢復正常運作。

### Google Drive / OneDrive API 整合
**Google Drive（已完成 ✅）**
- **問題根源**：`public/CNAME` 殘留上游的 `apple2ts.com`，導致 GitHub Pages 部署到錯誤網域，OAuth origin 不符。
- **修正**：清空 `public/CNAME`，改用 `anomixer.github.io` 作為部署網址。
- **新 API 申請**：
  - Google Cloud Console 建立新專案，啟用 Google Drive API 與 Google Picker API。
  - OAuth 2.0 Client ID 設定：Authorized JavaScript origins 與 Redirect URIs 加入 `https://anomixer.github.io` 及 `http://localhost:6502`。
  - 更新 `src/ui/img/iconfunctions.tsx` 中混淆的三個函數：
    | 函數 | 說明 |
    |------|------|
    | `appID()` | Google Project Number（數字編碼，offset=0） |
    | `clientID()` | OAuth Client ID 隨機部分（offset +48） |
    | `pickerKey()` | Google Picker API Key（直接 charCode，無 offset，因含 `-` 和 `_`） |

**OneDrive（暫緩 ⏸️）**
- **問題**：舊版 Live Developer Portal 已退役；Azure Portal 需要 Azure 租戶，個人 Hotmail 帳號無法直接使用。
- **選項**：
  - 免費方案：加入 Microsoft 365 Developer Program（無需信用卡）。
  - Azure 免費帳號（需信用卡驗證身分，不實際收費）。
- **啟用方式**：取得 `Application (client) ID` 後，更新 `src/ui/devices/disk/onedriveclouddrive.ts` 第 7 行的 `applicationId`，並移除 `diskdrive.tsx` 中兩個 `isDisabled: () => true`。

### 2026/04/17
- **專案同步 (Upstream Sync)**：
  - 合併了上游最新的 `ct6502/apple2ts` 功能（含 Trace Logging Settings 與 Basic Variables View 等除錯介面）。
- **翻譯引擎與模組更新**：
  - 更新 `src/i18n/i18n_master.cjs` 字典矩陣，加入 `Trace Settings`, `Variable` 與 `Value` 等核心語句翻譯。
  - 將所有上游變更中之硬編碼字串全數變數化（使用 React Hooks），並使用 Master 腳本自動生成包含 13 種語言之擴充套件檔，並成功替換前端元件。
