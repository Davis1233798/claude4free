# 部署指南

## 📁 專案結構
```
claude4free/
├── frontend/           # 前端代碼 (Cloudflare Pages)
│   ├── index.html     # 主網頁文件
│   ├── _headers       # Cloudflare Pages headers 配置
│   └── _redirects     # 重定向規則
├── backend/           # 後端代碼 (Cloudflare Workers)
│   ├── api-server.js  # Workers 腳本
│   ├── package.json   # 依賴配置
│   └── wrangler.toml  # Workers 配置
├── cloudflare-pages.toml  # Pages 配置
└── DEPLOYMENT.md      # 此文件
```

## 🚀 部署步驟

### 1. 前端部署 (Cloudflare Pages)

#### 選項 A：通過 Git 自動部署（推薦）
1. 將代碼推送到你的 GitHub repository
2. 在 [Cloudflare Dashboard](https://dash.cloudflare.com/pages) 中：
   - 點擊現有的 Pages 專案
   - 進入 "Settings" → "Builds & deployments"
   - 設置 "Build output directory" 為 `frontend`
   - 儲存設置
3. 觸發新的部署

#### 選項 B：手動上傳
1. 進入 [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. 選擇你的專案或創建新專案
3. 上傳 `frontend/` 目錄中的所有文件
4. 等待部署完成

### 2. 後端部署 (Cloudflare Workers)

後端已經部署到 Workers，無需重複部署。如需更新：

```bash
cd backend
npx wrangler deploy
```

## 🔗 部署後的網址

- **前端**: `https://你的專案名稱.pages.dev`
- **後端**: `https://claude4free-api.davis1233798.workers.dev`
- **API端點**: `https://claude4free-api.davis1233798.workers.dev/api/chat`

## ⚙️ Cloudflare Pages 設置

### 在 Dashboard 中設置：
1. **Build settings**:
   - Build command: (留空)
   - Build output directory: `frontend`
   - Root directory: (留空，使用根目錄)

2. **Environment variables** (如需要):
   - 無需設置，前端為純靜態文件

3. **Custom domains** (可選):
   - 設置你的自定義域名

## 📋 驗證部署

1. **前端檢查**:
   - 訪問你的 Pages 網址
   - 檢查網頁是否正常載入
   - 測試黑暗模式切換

2. **後端檢查**:
   - 測試 AI 對話功能
   - 檢查網路請求是否正常
   - 查看瀏覽器控制台是否有錯誤

3. **Google AdSense 檢查**:
   - 確認廣告位是否顯示
   - 檢查 AdSense 控制台

## 🛠️ 故障排除

### 前端部署失敗
- 檢查 `cloudflare-pages.toml` 配置
- 確認 `frontend` 目錄存在且包含 `index.html`
- 查看 Pages 部署日誌

### API 調用失敗
- 確認後端 Worker 正常運行
- 檢查 CORS 設置
- 驗證 API 端點 URL

### 廣告不顯示
- 確認 AdSense 帳戶已審核通過
- 檢查廣告單元 ID
- 等待廣告審核（可能需要數小時到數天）

## 📝 更新部署

### 更新前端
1. 修改 `frontend/` 中的文件
2. 推送到 Git repository（如使用 Git 部署）
3. 或手動上傳新文件到 Pages

### 更新後端
1. 修改 `backend/` 中的文件
2. 運行 `npx wrangler deploy`

## 🔒 安全注意事項

- 定期檢查 Workers 日誌
- 監控 API 使用量
- 確保環境變量安全
- 定期更新依賴包 