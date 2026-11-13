# Apple IIgs 硬體架構與模擬器開發指南

這份文件梳理了 Apple IIgs 複雜的硬體架構，解析 **Mega II**、**FPI** 以及其他 IIgs 專屬晶片的職責與協同運作機制，為打造或擴充 IIgs 模擬器（如 `apple2ts`、`web-a2e`）提供架構藍圖與實作路徑。

---

## 一、 核心哲學：一體雙魂的硬體架構

Apple IIgs 在硬體設計上最根本的特色，就是**「一台機器，兩個世界」**：
1. **高速世界（Fast World, ~2.8 MHz）**：由 16-bit 的 **65C816** CPU、**FPI** 匯流排仲裁器、**VGC** 超高解析度視訊晶片、**Ensoniq DOC** 聲音晶片與高速 RAM 組成。
2. **慢速世界（Slow World, 1.023 MHz）**：由 **Mega II** 晶片掌控，直接提供一台完整的、原汁原味的 Apple //e 硬體環境與 128KB 慢速 RAM（Bank `$E0`/`$E1`）。

兩者之間的橋樑是 **FPI 晶片**。要讓 IIgs 能夠跑起來，絕對不能只把它當成「升級版 65816 的 Apple II」，而是必須把這套「雙頻同步＋影子記憶體鏡像」的架構完整建立起來。

```
                    ┌───────────────────────────────────┐
                    │          WDC 65C816 CPU           │
                    │        (2.8 MHz / 16-bit)         │
                    └─────────────────┬─────────────────┘
                                      │ 24-bit Bus
                                      ▼
                    ┌───────────────────────────────────┐
                    │    FPI (Fast Processor Interface)  │
                    │    - 高低速時鐘展延 (Wait-States)   │
                    │    - 記憶體影子鏡像 (Shadowing)     │
                    └─────────┬───────────────────────┬─┘
       高速匯流排 (2.8 MHz)    │                       │  慢速匯流排 (1.023 MHz)
   ┌──────────────────────────┴───────┐      ┌────────┴───────────────────────────┐
   │                                  │      │                                    │
   ▼                                  ▼      ▼                                    ▼
┌──────────────┐             ┌─────────────┐┌────────────────┐            ┌──────────────┐
│  Fast RAM    │             │     VGC     ││    Mega II     │            │   Slow RAM   │
│ (Banks $00+) │             │ (SuperHiRes)││  (Apple //e)   │            │(Banks $E0/$E1│
└──────────────┘             └─────────────┘└────────┬───────┘            └──────────────┘
                                                     │
                                                     ▼
                                      ┌──────────────────────────────┐
                                      │ 傳統周邊 (Slots 1-7, Clicker) │
                                      └──────────────────────────────┘
```

---

## 二、 關鍵核心元件拆解

### 1. Mega II 晶片（Apple 344-0010）
* **定位**：將 Apple //e 主機板所有客製 IC 與膠水邏輯做成單一 84-pin ASIC。
* **內部整合的組件**：
  * **MMU**：傳統 128KB Bank Switching（`RAMRD`, `RAMWRT`, `ALTZP`, Language Card `$D000–$FFFF` Bank 1/2）。
  * **IOU**：傳統顯示軟開關（`TEXT`, `MIXED`, `PAGE2`, `HIRES`, `80STORE`, `DHIRES`）、傳統遊戲埠（Paddles/Buttons/Annunciators）、鍵盤 Latch/Strobe（`$C000/$C010`）、單音喇叭 Clicker（`$C030`）。
  * **視訊掃描產生器**：產生 1.023 MHz $\phi_0$ 時鐘、每行 65 cycles、每場 262 掃描線、HBL/VBL、傳統 40/80 欄文字與高解析度畫素輸出。
  * **擴充槽解碼器**：解碼 Slot 1–7 的 `$C080–$C0FF`、`$Cn00`、`$C800–$CFFF`，確保插入插槽的傳統 Apple II 卡永遠跑在 1.023 MHz。
* **管轄的記憶體空間**：
  * **Bank `$E0`**：對應傳統 //e 的 Main 64KB RAM。
  * **Bank `$E1`**：對應傳統 //e 的 Auxiliary 64KB RAM。

---

### 2. FPI 晶片（Fast Processor Interface）
FPI 是讓 2.8MHz 65816 能與 1.023MHz Mega II 和平共處的核心仲裁者：

#### A. 時鐘展延（Wait-States / Cycle Stretching）
* 當 65816 存取高速 RAM 時，全速 2.8 MHz（每個 cycle 約 350ns）。
* 當 CPU 存取以下區域時，FPI 會強制暫停 CPU，直到下一個 **1.023 MHz 的 $\phi_2$ 時鐘邊緣**（每個 cycle 展延至 ~977ns）：
  1. 存取 Bank `$E0` 或 `$E1`（Mega II 慢速 RAM）。
  2. 存取 `$C000–$CFFF`（I/O 與擴充槽空間）。
  3. 寫入開啟了「影子功能（Shadowing）」的高速記憶體區域。

#### B. 影子記憶體機制（Shadowing Engine）
* **暫存器**：`$C035` (`SHADOW`) 控制各區域的影子功能開關。
* **運作原理**：
  * 65816 通常在 Bank `$00`（Main）或 Bank `$01`（Aux）高速運作。
  * 若開啟了影子功能，當 CPU 寫入 Bank `$00`/`$01` 特定位址時，FPI 會在背景**自動同步寫入一份到 Mega II 的 `$E0`/`$E1`**：
    * **Text 頁面 1**：`$00/0400–$00/07FF` $\rightarrow$ `$E0/0400–$E0/07FF`
    * **Text 頁面 2**：`$00/0800–$00/0BFF` $\rightarrow$ `$E0/0800–$E0/0BFF`
    * **Hi-Res 頁面 1**：`$00/2000–$00/3FFF` $\rightarrow$ `$E0/2000–$E0/3FFF`
    * **Hi-Res 頁面 2**：`$00/4000–$00/5FFF` $\rightarrow$ `$E0/4000–$E0/5FFF`
    * **Super Hi-Res**：`$01/2000–$01/9FFF` $\rightarrow$ `$E1/2000–$E1/9FFF`
* **讀取特性**：CPU 讀取時永遠只讀取高速 Bank，不產生等待；只有**寫入**時會觸發影子拷貝並等待慢速時鐘。

---

### 3. CPU：WDC 65C816
* **24-bit 位址匯流排**：可定址 16MB（Bank `$00` 至 `$FF`，每個 Bank 64KB）。
* **雙模式運作**：
  * **Emulation Mode (`E=1`)**：開機預設。行為類似 65C02，暫存器為 8-bit，Stack 限制在 `$00/0100–$00/01FF`，中斷向量位於 `$00/FFFE`。
  * **Native Mode (`E=0`)**：透過 `CLC` + `XCE` 切換。A/X/Y 暫存器可切換為 16-bit（`M`、`X` 旗標），Stack 可置於 64KB 內任意位置，原生中斷向量移至 `$00/FFE4–$00/FFEE`。
* **直接分頁暫存器（Direct Page, DP）**：取代 6502 固定的 Zero Page，可將零頁映射至 64KB 任意記憶體位址。

---

### 4. VGC（Video Graphics Controller）
* **視訊切換**：`$C029`（NEWVIDEO）的 bit 7 控制切換：
  * `0`：由 **Mega II** 輸出傳統 Apple II 畫面（40/80 欄文字、Lo-Res、Hi-Res、DHIRES）。
  * `1`：由 **VGC** 輸出 **Super Hi-Res (SHR)**。
* **Super Hi-Res 記憶體佈局（固定在 Bank `$E1`）**：
  * `$2000–$7CF0`：畫素資料（Pixel Data，每條掃描線 160 或 320 bytes）。
  * `$7D00–$7DC7`：掃描線控制字節（Scanline Control Bytes, SCB，共 200 條線，每線 1 byte）。
    * 控制該行是 320 模式（4-bit/pixel，16 色）還是 640 模式（2-bit/dithered）。
    * 指定該行使用 16 組調色盤中的哪一組。
    * 控制 Color Fill（填色）模式開關。
  * `$7E00–$7FFF`：16 組自訂調色盤（每組 16 色，每色 2 bytes，支援 4096 色 RGB 各 4-bit）。
* **外框顏色暫存器**：`$C034` 控制非顯示區域的螢幕外框顏色（0–15）。

---

### 5. 音效：Ensoniq 5503 DOC + Sound GLU
* **規格**：專業級 32 軌波表振盪器（Oscillators），配備專屬的 **64KB Sound RAM**。
* **介面**：
  * CPU 無法直接定址 Sound RAM，必須透過 `$C03C`（控制暫存器）與 `$C03D`（資料暫存器）進行讀寫視窗轉移。
  * 振盪器成對配對（Pairs）進行音色調變與波表迴圈（Looping / Halt）。
* **中斷同步**：DOC 在波表播放結束時會觸發中斷，許多 IIgs 遊戲與音樂播放器（如 SynthLAB、NoiseTracker）對這個中斷時序極度敏感。

---

### 6. ADB（Apple Desktop Bus）微控制器
* **晶片**：使用獨立的微控制器（8042 或 50740）管理鍵盤與滑鼠。
* **暫存器**：`$C026`（ADB Data）與 `$C027`（ADB Status/Command）。
* **功能**：
  * 接收鍵盤掃描碼（含修飾鍵狀態、自動重複）。
  * 接收滑鼠封包（X/Y 移動量與按鍵）。
  * **內存電池 RAM（Battery RAM / BRAM, 256 bytes）**：保存控制台（Control Panel）設定（開機速度、Slot 映射設定、時區等），需透過 ADB 命令讀寫。

---

### 7. 其他關鍵周邊
* **IWM（Integrated Woz Machine）**：除了原本的 5.25" 軟碟外，IIgs 在 `$C031` 擴充了 3.5" Sony 磁碟機切換訊號，支援 800KB 3.5 吋軟碟。
* **SCC（Zilog 8530）**：提供 Slot 1/2 的高速序列通訊（Modem、Printer、LocalTalk 網路）。
* **即時時鐘（RTC）**：透過 `$C033/$C034` 位元翻轉串列存取即時時間與電池設定。

---

## 三、 IIgs 模擬器實作路線圖（Roadmap）

如果是要為現有的 Apple II 模擬器（如 `apple2ts`）擴充 IIgs 支援，建議按照以下優先級逐步推進：

### 階段一：CPU 與基礎記憶體（能進 Reset 向量）
1. 實作 **65C816** CPU（支援 24-bit 位址、Native/Emulation 模式切換、16-bit 暫存器）。
2. 配置 24-bit 記憶體定址空間（至少支援 Bank `$00`、`$01`、`$E0`、`$E1` 以及 ROM Bank `$FE/$FF`）。
3. 實作 Mega II 慢速 Bank（`$E0`/`$E1`）與基本的 ROM 載入（ROM 01 或 ROM 03）。

### 階段二：FPI 核心機制（能跑開機自我檢測）
1. 實作 **`$C035` (`SHADOW`)** 影子記憶體鏡像邏輯（CPU 寫入 Bank `$00/$01` 時鏡像到 `$E0/$E1`）。
2. 實作基礎的 **Wait-States 時鐘展延**（當 CPU 碰觸 `$C0xx` 與 `$E0/$E1` 時，補足等待週期）。
3. 實作 `$C036` (`SPEED`) 速度開關（1 MHz / 2.8 MHz 切換）。

### 階段三：ADB 與開機螢幕（看見 Apple IIgs 蘋果畫面）
1. 實作基礎 **ADB 控制器**（響應鍵盤與基本命令，滿足 ROM 開機檢測）。
2. 實作 **RTC / Battery RAM**（提供預設的 256 bytes BRAM，讓 ROM 知道預設開機槽位）。
3. 讓 Mega II 文字模式輸出正常，此時應該能看見開機自我檢測與「Waiting for AppleTalk...」或「Check startup device」。

### 階段四：VGC 超高解析度（進入 GS/OS 桌面）
1. 實作 `$C029` 切換 Super Hi-Res。
2. 實作 SHR 掃描線渲染（讀取 `$E1/2000` 畫素、`$E1/7D00` SCB 判定 320/640 與調色盤、`$E1/7E00` 4096 色色彩轉換）。
3. 實作 ADB 滑鼠封包回傳。

### 階段五：磁碟與音效（載入遊戲與系統）
1. 擴充 IWM 支援 3.5" 磁碟讀取（支援 `.2mg` 映像檔）。
2. 支援 SmartPort 硬碟開機（Slot 5 / Slot 7）。
3. 實作 Ensoniq 5503 DOC 音效合成器（初版可先實作基本的波表迴圈播放）。

---

> **結語**：
> IIgs 模擬的核心難點不在於單一晶片有多難寫，而是在於 **FPI 把 2.8MHz 的 65816 與 1.023MHz 的 Mega II 綁死在一起**。只要「影子記憶體」與「慢速等待時鐘」這兩個底層齒輪咬合正確，上層的 GS/OS 與遊戲就會一個接一個順利跑通！
