# Apple2TS i18n 開發者指南

Apple2TS 使用 gettext PO 檔案保存供翻譯者編輯的訊息，同時保留現有的執行階段翻譯 API。
完整的維護細節請參閱 [English developer guide](README_en.md)。

## 來源檔案與產生的檔案

- `catalogs/messages.pot` 是英文訊息的權威範本。穩定的翻譯鍵存放在
  `msgctxt`，英文文字存放在 `msgid`。
- `catalogs/<locale>.po` 的 `msgstr` 存放各語系翻譯。
- `languages/*.ts` 是應用程式使用的產生檔案，請勿直接編輯。

`msgstr` 為空時，執行階段會回退至英文。fuzzy 標記表示翻譯仍待人工確認；只要
`msgstr` 不為空，Apple2TS 仍會將該翻譯納入產生的 TypeScript。初次移轉所保留的
非英文翻譯都標記為 fuzzy，翻譯者確認後可逐項清除。

## 指令

```bash
# 將 POT 變更合併到所有 PO 檔案（會修改翻譯者檔案）。
npm run update-i18n-catalogs

# 編輯 POT 或 PO 後重新產生 TypeScript 語系檔案。
npm run generate-i18n-catalogs

# 不修改檔案，確認產生的語系檔案為最新版本。
npm run check-i18n-catalogs

# 測試 PO 解析、驗證、報告、更新及產生流程。
npm run test-po-catalog
```

一般建置與測試會自動執行不修改檔案的同步檢查。`update-i18n-catalogs` 會修改 PO
檔案，並需要 GNU gettext `msgmerge`。

## 新增或修改英文訊息

1. 在 `catalogs/messages.pot` 新增或修改項目。只修改英文措辭時，保留既有的
   `msgctxt`。
2. 執行 `npm run update-i18n-catalogs`。既有翻譯會保留並標記為 fuzzy，先前英文
   也會留供比較。
3. 檢查受影響的 `msgstr`。確認翻譯符合目前英文後再清除 fuzzy。缺少翻譯時保持
   空白，讓執行階段回退至英文。
4. 執行 `npm run generate-i18n-catalogs`，再執行相關專案檢查。

PO 檔案可直接編輯，也可使用 Poedit、Weblate 等標準工具。

## 插值變數

執行階段訊息使用 `{{name}}` 變數；部分元件範本使用 `{name}`。翻譯可調整變數
順序，但必須保留語法、拼寫及出現次數。產生程序會驗證所有非空翻譯，包括 fuzzy
翻譯。

## 目錄結構

- `index.ts` — 語言選擇、儲存、回退及查詢。
- `useTranslation.ts` — 可回應語言變更的 React Hook。
- `catalogs/` — 權威 POT 與 PO 翻譯檔案。
- `languages/` — 應用程式使用的產生 TypeScript 語系檔案。
- `tools/i18n/` — 可重現的產生、報告與驗證工具。
- `archive/` — 歷史啟動素材，不屬於目前維護流程。
