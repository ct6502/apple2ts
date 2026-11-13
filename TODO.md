# Apple2TS / Apple2GTS: Dual Deployment & Roadmap TODO

> **目標：** 在 Chris-tmas (2026 聖誕節) 前，以**單一 Repo、雙發布目標 (Dual Targets)** 模式，將純 TypeScript 2.8MHz Vanilla Apple IIgs 體驗上線至 `apple2gts.com`，並將軟體相容性拉升至 90~95%+。

---

## 1. 與 Chris (Upstream Maintainer) 的對話結論與共識

1. **Repo 架構共識**：
   - **採單一 Repo、多 Deployable Targets**：不拆分獨立 repo，避免 code drift 與重複 porting。同一份 codebase 透過 build / CI 配置同時滿足 `apple2ts.com` (Apple II/IIe) 與 `apple2gts.com` (Apple IIgs)。
   - **共用率 80~85%+**：核心（磁碟、音效基礎、部分外設、Vera 等）高度共用，IIgs 以增量模組（65816 CPU、MMU / Shadowing、Ensoniq DOC、ADB 等）切換。
2. **網域與部署**：
   - Chris 已持有 `apple2gts.com`，正著手將該網域從 WordPress 切換至 GitHub Pages（或對應部署環境）。
   - 需要修改 GitHub Actions 支援「Dual Deployment」（分別為兩個 target 產出並部署到各自的 domain）。
3. **分工與 Scope 定錨**：
   - **本次核心範圍 (Chris-tmas 前)**：
     - 純 TypeScript 2.8MHz Vanilla IIgs 模擬。
     - 軟體相容性達到 90~95%+。
     - 精選 IIgs New Releases 推薦展示清單（邀請 Chris 提供他的口袋名單）。
     - 完成 Dual Deployment CI/CD 與 Vite build target 機制。
   - **後續社群接棒 (Stage 2)**：
     - 專用 IIgs 24-bit / 16-bit 暫存器 / DOC 32-oscillator Debugger UI。
     - IIgs 專屬 UI 微調（640x400 SHR 版面、專屬設定面板）。
     - WASM 加速（若未來社群期望衝刺 8~16MHz+）。

---

## 2. 待辦任務清單 (TODO List)

### Priority 1: Upstream Sync (最新代碼同步)
- [ ] **同步 Upstream 最新變更至 `test/gs`**：
  - Chris 指出目前分支落後 upstream（特別是近期的 Preferences Dialog 重構與設定面板）。
  - 將 `upstream/main` 乾淨 merge / rebase 進 `test/gs`。
  - 確保所有單元測試與 build 通過 (`npm test`, `npm run build`)。

### Priority 2: Vite Dual-Target Build 架構設計
- [x] **設計 Target 構建標籤 / 環境變數**：
  - [x] 設定例如 `BUILD_TARGET=apple2ts` vs `BUILD_TARGET=apple2gts`（或 `VITE_APP_TARGET`）。
  - [x] 在 `package.json` 中配置各自的 build scripts：
    - `npm run build:apple2ts` -> 產出至 `dist/apple2ts`
    - `npm run build:apple2gts` -> 產出至 `dist/apple2gts`
- [x] **Target 條件式載入與預設配置**：
  - [x] **預設機型 (Default Machine)**：
    - `apple2ts`: 預設 IIe / II+。
    - `apple2gts`: 預設 IIgs (`APPLE2GS`)。
  - [x] **頁面資訊 (Metadata / Title / Favicon / CNAME)**：
    - 根據 Target 生成對應的標題、SEO 與 CNAME。
  - [x] **UI / 選單條件渲染 (基礎)**：
    - `apple2ts` build 隱藏 IIgs 機型選單；`apple2gts` build 保留全部機型。
    - debugger / preferences 的進一步 target 隔離仍留待後續（目前共用完整實作）。

### Priority 3: GitHub Actions Dual Deployment (CI/CD)
- [x] **檢視目前 `.github/workflows` 部署腳本**：
  - 盤點 GitHub Pages / Cloudflare Pages 現有流程。
- [x] **配置雙站部署 Workflow**：
  - **Build 階段**：同一 checkout 依序 build 兩個 target bundle。
  - **Deploy 階段**：
    - Target 1: 部署至 `apple2ts.com`（CNAME: `apple2ts.com`）。
    - Target 2: 部署至 `apple2gts.com`（CNAME: `apple2gts.com`）。
    - `ct6502/apple2gts` 採 `gh-pages` 分支 + `apple2ts-deploy` repository dispatch；需設定 `APPLE2GTS_TOKEN` secret。

### Priority 3b: Deployment Activation & CI Cleanup
- [ ] **設定 `APPLE2GTS_TOKEN`**：
  - 上游 repo 需設定 token；需能 push `ct6502/apple2gts` 的 `gh-pages` 並發 `apple2ts-deploy` dispatch。
- [ ] **啟用 Workflow**：
  - Push trigger 目前只在 `main`；將 workflow 合併到 `main`（或建立 staging trigger）。
  - 手動跑一次 workflow，確認兩站 build / deploy 都成功。
- [ ] **清理 CI Gate**：
  - repo-wide `npm run lint` 目前被既有 diagnostic `.cjs` / `.tmp` 檔卡住。
  - 追蹤/忽略這些既有檔案，或調整 lint gate，讓 workflow 能通過。
- [ ] **修 test gate**：
  - 目前看到至少 `gs_basic_sound`、`gs_timepilot_flicker`、`gs_rom03_reloc` 等既有失敗；需修掉或隔離。
- [ ] **確認 Pages / Domain**：
  - `ct6502/apple2gts` Pages 指向 `gh-pages`。
  - `apple2gts.com` DNS / CNAME / HTTPS 設定完成；`apple2ts.com` 不受影響。
- [ ] **Target UI 收尾**：
  - linkbuilder 等機型清單仍未 target 過濾。
  - debugger / preferences 的 target 隔離仍共用。
  - 已存的 `APPLE2GS` preference 仍可能覆蓋 `apple2ts` 預設機型。
- [ ] **Cloudflare 雙站（可選）**：
  - 若要 Cloudflare 也雙站，需處理 `dist/<target>` 與 worker 輸出路徑。

### Priority 4: IIgs 相容性與核心穩定度衝刺 (90~95%+)
- [ ] **延續 65816 / MMU / Video / Timing 修復**：
  - 檢視 `src/worker/cpu65816.ts` 的 `addrAbsoluteIndirect` 等修復與對應測試。
  - 解決當前各大型 IIgs software/titles 的 BRK/COP、死鎖、圖像 tear/flicker 等問題。
  - 清理各類 `.tmp-*` 測試腳本，收納正式 regression 測試至測試套件中。
- [ ] **策劃 IIgs New Releases 推薦清單**：
  - 彙整 3~5 款最具代表性且完美運行的 IIgs Titles / Demos，準備放入首頁展示架。

