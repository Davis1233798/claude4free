# 🚀 Cloudflare 部署指南

本指南將協助您將 Claude4Free 網站部署到 Cloudflare Workers 和 Pages。

## 📋 部署架構

- **前端**: Cloudflare Pages (托管 AMP 網頁)
- **後端 API**: Cloudflare Workers (處理 AI 請求)
- **廣告**: Google AdSense 集成
- **域名**: Cloudflare DNS 管理

## 🛠️ 前置準備

### 1. 註冊 Cloudflare 帳戶
- 前往 [Cloudflare](https://cloudflare.com) 註冊免費帳戶
- 驗證電子郵件地址

### 2. 安裝 Wrangler CLI
```bash
# 使用 npm 安裝
npm install -g wrangler

# 或使用 yarn
yarn global add wrangler

# 驗證安裝
wrangler --version
```

### 3. 登入 Cloudflare
```bash
wrangler login
```

## 🔧 部署 Workers API

### 步驟 1: 準備 Workers 代碼
確保您有以下檔案：
- `worker.js` - Workers 主要代碼
- `wrangler.toml` - 配置文件

### 步驟 2: 配置 wrangler.toml
編輯 `wrangler.toml` 文件：

```toml
name = "claude4free-api"
main = "worker.js"
compatibility_date = "2024-01-15"

# 修改為您的專案名稱
[env.production]
name = "your-project-name-api"
workers_dev = false

# 如果您有自定義域名
# [[env.production.routes]]
# pattern = "api.yourdomain.com/*"
# zone_name = "yourdomain.com"
```

### 步驟 3: 部署到 Workers
```bash
# 部署到開發環境
wrangler deploy --env development

# 部署到生產環境
wrangler deploy --env production

# 查看部署狀態
wrangler deployments list
```

### 步驟 4: 測試 API
```bash
# 測試健康檢查
curl https://your-worker-name.your-subdomain.workers.dev/health

# 測試聊天 API
curl -X POST https://your-worker-name.your-subdomain.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "你好", "function": "chat", "model": "gpt-4o"}'
```

## 📄 部署 Pages 前端

### 方法 1: 通過 Git 集成（推薦）

#### 步驟 1: 推送代碼到 Git
```bash
# 初始化 Git 倉庫
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub/GitLab
git remote add origin https://github.com/your-username/claude4free.git
git push -u origin main
```

#### 步驟 2: 連接 Cloudflare Pages
1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 點擊 "Pages" → "Create a project"
3. 選擇 "Connect to Git"
4. 授權並選擇您的倉庫
5. 配置構建設定：
   - **框架預設**: None
   - **構建命令**: 留空
   - **構建輸出目錄**: `/`
   - **根目錄**: `/`

#### 步驟 3: 部署設定
```yaml
# pages.yml (可選配置文件)
build:
  command: echo "No build needed"
  output: /
  
environment:
  NODE_VERSION: 18
```

### 方法 2: 直接上傳

#### 步驟 1: 準備檔案
確保 `index.html` 中的 API 端點指向您的 Workers：

```html
<!-- 修改表單 action -->
<form method="post" 
      action-xhr="https://your-worker-name.your-subdomain.workers.dev/api/chat">
```

#### 步驟 2: 上傳到 Pages
1. 在 Cloudflare Dashboard 中選擇 "Pages"
2. 點擊 "Upload assets"
3. 上傳您的 `index.html` 文件
4. 設定專案名稱並發布

## 🌐 自定義域名設定

### 步驟 1: 添加域名到 Cloudflare
1. 在 Cloudflare Dashboard 點擊 "Add site"
2. 輸入您的域名
3. 選擇免費方案
4. 更新域名的 Nameservers

### 步驟 2: 設定 Pages 域名
1. 進入您的 Pages 專案
2. 點擊 "Custom domains"
3. 添加您的域名（例如: `www.yourdomain.com`）

### 步驟 3: 設定 Workers 域名
1. 進入您的 Workers 設定
2. 添加 Route：`api.yourdomain.com/*`
3. 更新 `wrangler.toml`：

```toml
[[env.production.routes]]
pattern = "api.yourdomain.com/*"
zone_name = "yourdomain.com"
```

### 步驟 4: 重新部署
```bash
wrangler deploy --env production
```

## 🔒 SSL/TLS 設定

Cloudflare 自動提供免費 SSL 證書：

1. 前往 "SSL/TLS" → "Overview"
2. 選擇 "Full (strict)" 加密模式
3. 啟用 "Always Use HTTPS"
4. 啟用 "Automatic HTTPS Rewrites"

## 📊 監控和分析

### 1. Workers 分析
```bash
# 查看 Workers 指標
wrangler analytics

# 查看日誌
wrangler tail
```

### 2. Pages 分析
在 Cloudflare Dashboard 的 Pages 部分可以查看：
- 頁面載入時間
- 訪問量統計
- 錯誤率

### 3. Google Analytics（可選）
在 `index.html` 中添加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## 🚨 故障排除

### 常見問題

#### 1. CORS 錯誤
確保 Workers 代碼中包含 CORS 標頭：
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

#### 2. API 調用失敗
檢查 Workers 日誌：
```bash
wrangler tail --env production
```

#### 3. 部署失敗
驗證 `wrangler.toml` 配置：
```bash
wrangler config
```

#### 4. AMP 驗證錯誤
使用 [AMP 驗證器](https://validator.ampproject.org/) 檢查頁面。

### 除錯命令

```bash
# 本地開發
wrangler dev

# 查看配置
wrangler whoami
wrangler config

# 查看 Workers 列表
wrangler list

# 刪除 Worker（小心使用）
wrangler delete your-worker-name
```

## 💰 成本考量

### Cloudflare Workers
- **免費方案**: 每天 100,000 次請求
- **付費方案**: $5/月 起，無限請求

### Cloudflare Pages
- **免費方案**: 無限靜態頁面，每月 500 次構建
- **付費方案**: $20/月 起，進階功能

### 網域名稱
- **新域名**: 約 $10-15/年
- **現有域名**: 免費轉移到 Cloudflare

## 🔄 持續部署

### 自動部署設定
1. 連接 Git 倉庫後，每次推送都會自動部署
2. 設定分支保護：只有 `main` 分支觸發生產部署
3. 使用 GitHub Actions 進行額外的 CI/CD：

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy --env production
```

## 📞 支援和資源

- [Cloudflare Workers 文檔](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages 文檔](https://developers.cloudflare.com/pages/)
- [Wrangler CLI 文檔](https://developers.cloudflare.com/workers/wrangler/)
- [社群論壇](https://community.cloudflare.com/)

---

🎉 **恭喜！** 您的 Claude4Free 網站現在已部署到 Cloudflare 上，享受全球 CDN 加速和高可用性！ 