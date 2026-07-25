# Apple2TS i18n 開發者指南 (Developer Guide)

本目錄包含 Apple2TS 的國際化（i18n）核心引擎及維護工具。當您從上游專案合併（Merge）新功能或需要新增翻譯項目時，請參考以下流程。

## 🛠️ 維護工具箱 (Maintenance Tools)

### 1. `i18n_master.cjs` - 語系同步與維護
當您在 `en.ts` 中新增了鍵值，或從上游合併了包含新翻譯項目的代碼時，執行此腳本。
- **功能**：以 `en.ts` 為藍本，自動補齊其餘 12 種語言缺少的鍵值。
- **特色**：保留現有翻譯，對新鍵值使用內建字典自動翻譯常見技術名詞（如 Load, Save, Disk）。
- **執行方式**：
  ```bash
  node src/i18n/i18n_master.cjs
  ```

### 2. `i18n_bootstrap.cjs` - 跨專案轉生工具
如果您有另一個 React 專案需要支援同樣的 13 國語言架構。
- **功能**：快速生成 i18n 引擎、切換按鈕、13 國語言結構包以及範例面板。
- **執行方式**：
  ```bash
  node src/i18n/i18n_bootstrap.cjs
  ```

---

## 🔄 合併與新增翻譯流程 (Workflow)

當您需要新增翻譯項目（例如新增了一個「印表機選單」功能）時：

1. **更新英文原檔**：
   編輯 `src/i18n/languages/en.ts`，加入新的鍵值對（Key-Value）。
   ```typescript
   printer: {
     print: "Print Now",
     clear: "Clear Buffer"
   }
   ```

2. **一鍵同步所有語系**：
   在終端機執行 `i18n_master.cjs`。此時所有語言的 `.ts` 檔案都會自動長出同樣的結構。
   ```bash
   node src/i18n/i18n_master.cjs
   ```

3. **優化特定語系翻譯（選擇性）**：
   如果您發現 `i18n_master.cjs` 自動補齊的預設值（英文）或自動翻譯不夠精準，可以手動編輯如 `zh-TW.ts` 或 `ja.ts` 進行微調。

4. **在組件中使用**：
   ```tsx
   import { useTranslation } from "../../i18n/useTranslation";
   // ...
   const { t } = useTranslation();
   return <button title={t("printer.print")}>{t("printer.print")}</button>;
   ```

## 📁 目錄結構說明

- `index.ts`: i18n 核心管理類別，負責語系偵測、儲存與翻譯匹配。
- `useTranslation.ts`: React Hook，讓前端組件能即時響應語系變更。
- `languages/`: 存放 13 國語系的實體資料檔（`.ts` 格式以支援類型檢查）。
- `*.cjs`: 維護用的自動化工具腳本。

---

## 🤖 AI 代理維護指令 (Instructions for AI Agents)

如果你是正在協助維護此專案的 AI 助手，在處理國際化（i18n）相關任務時，請**務必**遵守以下規則：

1.  **優先讀取 `en.ts`**：始終將 `src/i18n/languages/en.ts` 視為唯一的結構標準（Source of Truth）。
2.  **新增翻譯的標準動作**：
    *   先在 `en.ts` 中定義新的 Key 與英文內容。
    *   **緊接著**執行指令：`node src/i18n/i18n_master.cjs`。
    *   不要手動逐一去修改 13 個語言檔，除非是要進行特定語言的精確翻譯調整。
3.  **偵測結構不一致**：如果你發現其他語言檔（如 `zh-TW.ts`）缺少某些在 `en.ts` 中存在的鍵，請立即執行 `node src/i18n/i18n_master.cjs` 來同步。
4.  **UI 組件修改**：在修改任何 UI 組件（`.tsx`）時，若看到硬編碼的字串，請將其轉換為 `t("category.key")` 格式。
5.  **插值語法**：翻譯字串中若有動態變數，請使用 `{{variable}}` 語法，並在呼叫 `t` 時傳入變數，例：`t("disk.syncedAt", { date: "2024-01-01" })`。

當使用者要求「新增功能」或「修復翻譯」時，請主動檢查並執行上述同步流程，確保 13 國語言的完整性。
