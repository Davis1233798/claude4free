# Claude4Free 部署指南

## 🏗️ 新架構概覽

Claude4Free 已轉換為**純前端架構**，基於 Puter.js SDK，無需後端服務器。

### 架構變更
- ❌ 舊架構：AMP + Cloudflare Workers 後端
- ✅ 新架構：純 HTML5 + JavaScript + Puter.js

### 優勢
- 🚀 更簡單的部署流程
- 💰 完全免費託管
- 🔧 無需維護後端服務器
- ⚡ 更快的響應速度

## 🚀 快速部署

### 方法一：Cloudflare Pages（推薦）

1. **登入 Cloudflare Dashboard**
   - 訪問 [Cloudflare Pages](https://pages.cloudflare.com)
   - 使用您的 Cloudflare 帳號登入

2. **創建新專案**
   ```bash
   # 如果是 Git 連接
   1. 點擊 "Create a project"
   2. 選擇 "Connect to Git"
   3. 授權 GitHub/GitLab 訪問
   4. 選擇您的 claude4free 倉庫
   ```

3. **配置構建設置**
   ```
   Project name: claude4free
   Build command: (留空)
   Build output directory: /
   Root directory: /
   ```

4. **等待部署完成**
   - 部署通常在1-3分鐘內完成
   - 您將獲得 `https://your-project.pages.dev` 網址

### 方法二：Vercel

1. **連接 GitHub**
   - 訪問 [Vercel](https://vercel.com)
   - 點擊 "New Project"
   - 選擇您的 claude4free 倉庫

2. **配置設置**
   ```
   Framework Preset: Other
   Build Command: (留空)
   Output Directory: ./
   Install Command: (留空)
   ```

3. **部署**
   - 點擊 "Deploy"
   - 獲得 `https://your-project.vercel.app` 網址

### 方法三：Netlify

1. **拖拽部署**
   - 訪問 [Netlify](https://netlify.com)
   - 直接拖拽專案資料夾到部署區域

2. **或 Git 連接**
   - 選擇 "New site from Git"
   - 連接您的倉庫
   - 構建設置：
     ```
     Build command: (留空)
     Publish directory: ./
     ```

### 方法四：GitHub Pages

1. **啟用 GitHub Pages**
   ```bash
   # 在您的倉庫設置中
   Settings → Pages → Source → Deploy from a branch
   Branch: main
   Folder: / (root)
   ```

2. **訪問網址**
   - `https://your-username.github.io/claude4free`

## 📁 專案結構

```
claude4free/
├── index.html              # 主要應用文件
├── README.md              # 專案說明
├── DEPLOYMENT.md          # 部署指南
├── cloudflare-pages.toml  # Cloudflare Pages 配置
├── frontend/              # 備用前端資源
│   ├── index.html
│   ├── _headers           # HTTP 標頭配置
│   └── _redirects         # 重定向規則
└── LICENSE                # 授權文件
```

## ⚙️ 環境配置

### Cloudflare Pages 環境變數

目前純前端架構無需環境變數，所有配置都在前端代碼中。

### 自定義域名設置

1. **在 Cloudflare Pages 中**
   ```
   1. 進入您的專案 Dashboard
   2. 點擊 "Custom domains"
   3. 添加您的域名
   4. 配置 DNS 記錄指向 Cloudflare
   ```

2. **DNS 記錄**
   ```
   Type: CNAME
   Name: your-domain.com (或 www)
   Target: your-project.pages.dev
   ```

## 🔧 配置自定義

### 修改 AI 模型列表

在 `index.html` 中找到 `modelConfig` 對象：

```javascript
const modelConfig = {
    openai: {
        'gpt-4o': 'GPT-4o',
        'gpt-4o-mini': 'GPT-4o Mini',
        // 添加新模型
        'new-model-id': '新模型名稱'
    },
    // 添加新分類
    newCategory: {
        'model-id': '模型名稱'
    }
};
```

### 修改界面主題

在 CSS 部分自定義顏色：

```css
:root {
    --primary-color: #007bff;      /* 主色調 */
    --background-light: white;     /* 淺色背景 */
    --background-dark: #1a1a1a;   /* 深色背景 */
    --text-light: black;          /* 淺色文字 */
    --text-dark: white;           /* 深色文字 */
}
```

### 添加新功能

1. **在功能按鈕區域添加新按鈕**：
```html
<button class="function-btn" data-function="new-feature">🆕 新功能</button>
```

2. **在 JavaScript 中添加處理邏輯**：
```javascript
case 'new-feature':
    response = await handleNewFeature(message, model);
    break;
```

3. **實現新功能函數**：
```javascript
async function handleNewFeature(message, model) {
    // 實現新功能邏輯
    return { text: '新功能回應', success: true };
}
```

## 🔍 故障排除

### 常見問題

1. **Puter.js 未載入**
   ```
   錯誤：puter is not defined
   解決：檢查網路連接，確保 https://js.puter.com/v2/ 可訪問
   ```

2. **AI API 調用失敗**
   ```
   錯誤：AI功能暫時不可用
   解決：
   - 檢查網路連接
   - 確認 Puter 服務狀態
   - 重新載入頁面
   ```

3. **圖片上傳問題**
   ```
   錯誤：圖片識別功能無法使用
   解決：
   - 確認圖片文件大小 < 10MB
   - 檢查文件格式（JPG、PNG、GIF）
   - 確保在 HTTPS 環境下使用
   ```

4. **部署後無法訪問**
   ```
   檢查：
   - DNS 設置是否正確
   - CDN 緩存是否已更新
   - 防火牆設置
   ```

### 調試技巧

1. **開啟瀏覽器開發者工具**
   ```
   F12 → Console 查看錯誤訊息
   Network 標籤檢查網路請求
   ```

2. **檢查 Puter.js 狀態**
   ```javascript
   // 在控制台執行
   console.log(typeof puter);  // 應該返回 'object'
   ```

3. **測試 AI 功能**
   ```javascript
   // 在控制台測試
   puter.ai.chat("Hello").then(console.log);
   ```

## 🚀 性能優化

### 1. 啟用壓縮

在 `frontend/_headers` 中：
```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Content-Encoding: gzip
```

### 2. 緩存策略

```
/static/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate
```

### 3. 圖片優化

- 使用 WebP 格式
- 壓縮圖片文件
- 設置適當的圖片尺寸

## 📊 監控與分析

### Cloudflare Analytics

1. **在 Pages Dashboard 中**
   - 查看訪問統計
   - 監控性能指標
   - 檢查錯誤率

### 自定義分析

可以集成 Google Analytics：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔒 安全考慮

### HTTPS 強制

所有部署平台都自動提供 HTTPS，確保：
- Puter.js API 調用安全
- 用戶數據傳輸加密
- 搜索引擎友好

### Content Security Policy

在 `_headers` 中設置：
```
Content-Security-Policy: default-src 'self' https:; script-src 'self' 'unsafe-inline' https://js.puter.com; img-src 'self' data: https:;
```

## 🆕 版本更新

### 自動部署

連接 Git 倉庫後，每次推送代碼都會自動部署：

```bash
git add .
git commit -m "更新功能"
git push origin main
# 自動觸發部署
```

### 手動更新

如果使用拖拽部署，需要重新上傳文件到託管平台。

## 📞 支援與幫助

如遇到部署問題：

1. **查看平台文檔**
   - [Cloudflare Pages 文檔](https://developers.cloudflare.com/pages)
   - [Vercel 文檔](https://vercel.com/docs)
   - [Netlify 文檔](https://docs.netlify.com)

2. **社群支援**
   - GitHub Issues
   - Discord 社群
   - Stack Overflow

3. **聯繫我們**
   - 在 GitHub 提交 Issue
   - 查看疑難排解指南

---

**恭喜！** 您的 Claude4Free 應用現在已經成功部署並運行在純前端架構上！🎉 