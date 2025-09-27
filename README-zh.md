# 🌌 AstroEdge

**讓你的 Astro 網站擁有勝利的優勢**
_誕生於 Brian Jhang's Edge_

**語言**: [English](README.md) | [中文](README-zh.md)

[![NPM 版本](https://img.shields.io/npm/v/astro-edge.svg?style=flat&color=blue)](https://www.npmjs.com/package/astro-edge)
[![GitHub Stars](https://img.shields.io/github/stars/brianjhang/astro-edge.svg?style=social)](https://github.com/brianjhang/astro-edge)
[![許可證](https://img.shields.io/github/license/brianjhang/astro-edge)](LICENSE)
[![下載量](https://img.shields.io/npm/dm/astro-edge.svg?style=flat&color=green)](https://www.npmjs.com/package/astro-edge)

---

厭倦了看著競爭對手的網站比你更快？不再滿足於平庸的 Lighthouse 分數和緩慢的建置？**AstroEdge** 是為你的 Astro 專案量身打造的一站式工具包，讓你獲得終極效能優勢。

AstroEdge 的核心是 `astro-optimizer` 引擎，它能自動化那些區分優秀網站與卓越網站的複雜優化。只需幾分鐘，就能在速度、SEO 和用戶體驗方面獲得決定性優勢。

---

## ✨ 你的競爭優勢

* **🚀 瞬間達到巢峰效能：** 自動壓縮圖片、打包關鍵資源、清除未使用的程式碼，以接近完美的 Lighthouse 分數擊敗競爭對手。
* **⏱️ 光速開發：** 透過智慧快取和並行處理，將建置時間從分鐘縮短到秒級。超越你的開發週期。
* **🩺 無懈可擊的可靠性：** 不僅僅是速度。我們的系統健康檢查監控依賴項、安全性和效能趨勢，確保你的網站不僅快速，還穩定安全。
* **🔌 可插拔與可擴展：** 從強大的預設開始，然後隨著專案成長自訂和擴展最佳化器。AstroEdge 讓你始終保持領先。

---

## 🏆 實戰驗證結果

**來自 Brian Jhang's Edge 的真實世界轉型：**
- ⚡ **效能分數**：79 → 100/100（+21 分）
- 🖼️ **圖片最佳化**：4.2MB → 0.8MB（82% 縮減）
- 🎯 **核心網路指標**：FCP、LCP、TBT、CLS 全部滿分
- 🔧 **建置時間**：3分鐘 → 30秒（83% 提升）

---

## 🚀 三步驟快速開始

**第一步：安裝**

```bash
# 全域安裝以使用 CLI
npm install -g astro-edge

# 或在專案中安裝
npm install astro-edge --save-dev

# 或直接使用 npx
npx astro-edge optimize
```

**第二步：配置 Astro 整合（推薦）**

為了獲得最佳效能，請在 `astro.config.mjs` 中整合 AstroEdge：

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import astroEdge from 'astro-edge';

export default defineConfig({
  integrations: [
    astroEdge({
      optimization: {
        images: { format: 'webp', quality: 80 },
        static: true,
        compression: true
      },
      monitoring: {
        lighthouse: true,
        thresholds: { performance: 95 }
      }
    })
  ],
  output: 'static', // 🚀 關鍵效能最佳化
});
```

**第三步：執行最佳化**

```bash
# 快速 CLI 使用
npx astro-edge optimize

# 或如果全域安裝
astro-edge optimize

# 自動修復常見問題
npx astro-edge optimize --auto-fix
```

---

## 🛠️ 可用工具

**效能最佳化**
```bash
npm run optimize:images      # PNG → WebP 轉換，壓縮資源
npm run optimize:complete    # 完整最佳化流水線
```

**效能監控**
```bash
npm run performance:check    # 快速 Lighthouse 審核
npm run performance:monitor  # 詳細效能分析
npm run performance:trends   # 歷史效能追蹤
```

**系統健康**
```bash
npm run system:health        # 全面系統診斷
npm run project:maintenance  # 自動維護任務
```

**OG 圖片生成**
```bash
npm run og:generate         # 生成社交媒體圖片
npm run og:sync            # 同步 OG 圖片路徑
```

---

## 📊 核心功能

### 🎯 效能最佳化
- **靜態網站生成**：自動 `output: 'static'` 配置
- **圖片壓縮**：智慧 PNG → WebP 轉換，保持 75% 品質
- **資源最佳化**：CSS/JS 壓縮和打包
- **渲染模式最佳化**：智慧預渲染策略

### 📈 智慧監控
- **Lighthouse 整合**：具有閾值的自動效能評分
- **趨勢分析**：歷史效能追蹤和警報
- **自訂指標**：特定專案的 KPI 監控
- **詳細報告**：JSON 匯出，用於 CI/CD 整合

### 🩺 系統健康
- **依賴項審計**：安全漏洞掃描與自動修復
- **建置系統驗證**：配置最佳化檢查
- **資源管理**：自動清理和備份
- **健康評分**：整體專案健康評估

### 🧠 智慧錯誤處理
- **環境診斷**：自動檢測常見配置問題
- **修復建議**：提供明確的解決步驟
- **自動修復**：一鍵解決常見依賴問題
- **友善提示**：清楚的錯誤訊息和指導

---

## 🪐 路線圖：AstroEdge 生態系統

AstroEdge 不僅僅是一個最佳化器，它是專業 Astro 開發者完整生態系統的開始。我們的願景包括：

**v1.0.0**（穩定版本）：在這個公開測試版（v0.9.x）之後，我們將推出第一個穩定版本。

- **進階圖片流水線**：對圖片格式、品質和 CDN 整合的更深層控制
- **Astro 分析器**（`astro-analyzer`）：用於深度程式碼分析和最佳實踐執行的專用套件
- **快取與 CDN 助手**（`astro-cache`）：動態和靜態資源的智慧快取策略
- **安全強化**（`astro-secure`）：自動安全檢查和標頭配置

👉 我們正在建立終極工具包，讓你的 Astro 專案始終處於最前沿。

---

## 📚 文檔

- **[開始使用](docs/getting-started.md)** - 你的第一次 AstroEdge 最佳化
- **[效能指南](docs/performance-optimization.md)** - 最佳化策略深度探討
- **[自動化手冊](docs/automation-handbook.md)** - 完整工具參考
- **[最佳實踐](docs/best-practices.md)** - 經過實戰檢驗的模式和工作流程

---

## 🏗️ 專案結構

```
astro-edge/
├── packages/
│   ├── astro-optimizer/     # 核心最佳化引擎
│   ├── performance-monitor/ # 效能監控與警報
│   ├── health-checker/      # 系統健康與維護
│   └── cli/                # 命令列介面
├── docs/                   # 文檔與指南
├── examples/               # 範例專案與演示
└── tools/                 # 開發與建置工具
```

---

## 🌟 適合中文開發者的特色

### 📱 國內部署友好
- 支援國內 CDN 最佳化建議
- 相容主流國內雲端服務商
- 針對中文內容的 SEO 最佳化

### 🔧 中文開發習慣
- 詳細的中文錯誤提示
- 符合中文開發者習慣的工具命名
- 完整的中文技術文檔

### 🚀 社群支援
- 活躍的中文技術社群
- 定期的中文技術分享
- 中文問題快速回應

---

## 🤝 貢獻

歡迎貢獻、問題回報和功能請求！請隨時查看 [issues 頁面](https://github.com/brianjhang/astro-edge/issues)。

**開發環境設定：**

```bash
git clone https://github.com/brianjhang/astro-edge.git
cd astro-edge
npm install
npm test
```

---

## 💬 社群與支援

- **GitHub**：[Issues](https://github.com/brianjhang/astro-edge/issues) & [Discussions](https://github.com/brianjhang/astro-edge/discussions)
- **起源故事**：源自 [Brian Jhang's Edge](https://brianjhang.com) 的真實最佳化挑戰
- **技術部落格**：[效能最佳化之旅](https://brianjhang.com/build/)
- **中文社群**：歡迎加入我們的中文開發者社群

---

## 🤖 全新的開發範式

`AstroEdge` 不是由單一實體建立，而是由人類指導者和專業 AI 團隊協作的交響樂。這個專案遵循 **「人類主導，AI 驅動」** 的開發哲學，展示了一種以敏捷性和精簡資源建立強大軟體的新方式。

對於初始的 `v0.9.x` 版本，核心 AI 協作者包括：

* **專案領導、策略與願景：**
    * **Brian Jhang** ([Brian Jhang's Edge](https://brianjhang.com))
* **AI 開發團隊：**
    * **首席 AI 程式設計師（程式碼生成）：** Anthropic 的 **Claude Code**
    * **AI 策略顧問（品牌與文檔）：** Google 的 **Gemini**
    * **AI 腦力激盪夥伴（初始概念）：** OpenAI 的 **ChatGPT**

這種協作模式是「一人公司 AI 超個體」的精髓。

---

## 🌐 多語言支援

- **[English](README.md)** - 英文版本
- **[中文](README-zh.md)** - 你正在閱讀的版本

---

## 🎯 為什麼選擇 AstroEdge？

### 🏃‍♂️ **對於個人開發者**
- 零配置，開箱即用
- 一鍵達到 Lighthouse 滿分
- 完全免費的開源工具

### 🏢 **對於企業團隊**
- 企業級效能最佳化
- 完整的監控和報告
- 專業技術支援

### 🌱 **對於初學者**
- 友善的中文文檔
- 詳細的錯誤提示
- 漸進式學習曲線

### 🚀 **對於專家**
- 深度客製化選項
- 擴展性架構設計
- 最新技術整合

---

## 📜 許可證

MIT © 2025 Brian Jhang

---

**🚀 準備好主導你的競爭對手了嗎？用 AstroEdge 獲得優勢。**

**立即開始：`npx astro-edge optimize`**