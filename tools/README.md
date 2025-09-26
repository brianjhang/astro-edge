# Scripts 工具說明

本目錄包含專案開發用的工具腳本，僅供本地開發使用。

## 📋 工具清單

### simple-png-generator.js

**用途**: 批量生成文章的 PNG 格式 Open Graph 圖片（智慧增量版）

**功能特色**:
- 支援中文字體 (PingFang TC, Microsoft YaHei)
- 智慧標題分行處理
- 三大主題系列配色支援 (AI/Crypto/創業)
- ImageMagick 高品質 PNG 轉換
- 保持目錄結構完全對應
- **智慧增量更新**：只生成新的或修改過的文章圖片
- **文件時間戳比較**：自動跳過已是最新的檔案

**使用方法**:
```bash
# 智慧增量更新（推薦）：只生成新的或變更的檔案
node scripts/simple-png-generator.js

# 強制重新生成所有系列 OG 圖片
node scripts/simple-png-generator.js --all
node scripts/simple-png-generator.js -f
```

**輸出位置**: `public/images/og/{series}/*.png`

**系統需求**:
- Node.js 18+
- ImageMagick (magick 命令)
- gray-matter 套件

**主題配色**:
- AI小百科: 藍色 (#60a5fa)
- 幣圈筆記: 黃色 (#fbbf24)  
- 創業筆記: 綠色 (#10b981)

## 🔧 故障排除

### ImageMagick 未安裝
```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick
```

### 權限問題
確保腳本有執行權限：
```bash
chmod +x scripts/simple-png-generator.js
```

### 字體缺失
系統需要支援中文字體，腳本會依序嘗試：
1. PingFang TC (macOS)
2. Microsoft YaHei (Windows)
3. Arial (備用)

## 📝 開發記錄

- **2025-08-28**: 初版創建，支援三大主題系列
- **2025-08-29**: 修正檔案命名邏輯，統一路徑結構
- **2025-08-29**: 清理舊版腳本，保留單一工具
- **2025-08-30**: 新增智慧增量更新功能，避免重複生成已存在的檔案

## 🚫 注意事項

**此檔案不會上傳到 GitHub** (.gitignore 設定)，僅供本地開發參考使用。