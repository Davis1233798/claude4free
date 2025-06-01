# 🤖 Claude4Free - 免費AI多功能助手

一個基於AMP技術的免費AI聊天網站，支援與Claude 4、GPT-4o、Gemini等多種AI模型對話。

## ✨ 特色功能

- 🗨️ **多AI模型對話** - 支援OpenAI、Anthropic、Google、Meta等主流AI模型
- 🖼️ **圖片識別** - OCR文字提取與圖片內容分析
- 🔊 **語音生成** - 文字轉語音功能
- 🎨 **圖片生成** - AI生成圖片功能
- 🌙 **深色模式** - 支援明暗主題切換
- 📱 **響應式設計** - 完美適配手機、平板、桌面
- ⚡ **AMP優化** - 極速載入與SEO友好
- 💰 **Google AdSense** - 內建廣告系統

## 🏗️ 技術架構

### 前端
- **AMP HTML** - 快速載入的網頁框架
- **AMP Components** - 互動元件與表單處理
- **響應式CSS** - 適配各種裝置尺寸

### 後端
- **Node.js + Express** - API伺服器
- **Puter.js Integration** - AI功能整合
- **Multer** - 檔案上傳處理

## 🚀 快速開始

### 1. 克隆專案
```bash
git clone <repository-url>
cd claude4free
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 啟動API伺服器
```bash
# 開發模式
npm run dev

# 生產模式
npm start
```

### 4. 部署前端
將 `index.html` 部署到支援AMP的主機服務商（如Netlify、Vercel等）

## 📋 環境需求

- Node.js 14.0.0 或更高版本
- 支援AMP的網頁主機
- Google AdSense帳戶（用於廣告）

## 🔧 配置設定

### API伺服器配置
在 `api-server.js` 中修改以下設定：

```javascript
const PUTER_API_BASE = 'https://api.puter.com'; // Puter API端點
const PORT = process.env.PORT || 3000; // 伺服器端口
```

### AdSense配置
在 `index.html` 中更新您的AdSense客戶ID：

```html
data-ad-client="ca-pub-YOUR-CLIENT-ID"
```

## 📁 專案結構

```
claude4free/
├── index.html          # AMP網頁主檔案
├── api-server.js       # Node.js API伺服器
├── package.json        # 專案依賴配置
├── README.md          # 專案說明文件
└── docs/              # 文檔資料夾
```

## 🔗 API端點

### POST `/api/chat`
主要聊天API端點

**參數：**
- `message` - 用戶訊息
- `function` - 功能類型（chat、image-recognition、text-to-speech、text-to-image）
- `model` - AI模型名稱
- `image` - 圖片檔案（圖片識別功能）
- `tts-language` - 語音語言
- `img-size` - 圖片尺寸
- `img-style` - 圖片風格

**回應：**
```json
{
  "text": "AI回應內容",
  "success": true,
  "audioUrl": "語音檔案URL（語音功能）",
  "imageUrl": "圖片URL（圖片生成功能）"
}
```

### GET `/health`
健康檢查端點

## 🎨 自訂功能

### 新增AI模型
在 `index.html` 的 AMP State 中新增模型配置：

```json
"modelConfig": {
  "newProvider": {
    "Model Name": "model-id"
  }
}
```

### 修改主題樣式
在 `<style amp-custom>` 中自訂CSS樣式。

## 🐛 問題排除

### 常見問題

1. **AdSense廣告不顯示**
   - 確認AdSense帳戶已啟用
   - 檢查廣告單元ID是否正確
   - 等待Google審核通過

2. **API調用失敗**
   - 檢查Puter.js API端點是否正確
   - 確認網路連接正常
   - 檢查API伺服器是否運行

3. **AMP驗證錯誤**
   - 使用[AMP驗證器](https://validator.ampproject.org/)檢查
   - 確保所有腳本都是AMP允許的

### 錯誤日誌
API伺服器會在控制台輸出詳細的錯誤日誌，便於除錯。

## 📈 性能優化

- 使用CDN加速靜態資源
- 啟用Gzip壓縮
- 優化圖片尺寸與格式
- 使用AMP Cache

## 🔐 安全性

- API端點CORS配置
- 檔案上傳安全檢查
- 輸入驗證與清理
- 錯誤資訊過濾

## 📄 授權條款

MIT License - 請參考LICENSE檔案了解詳細資訊。

## 🤝 貢獻指南

歡迎提交Issue和Pull Request來改善專案！

## 📞 聯繫方式

如有問題或建議，請透過GitHub Issues聯繫我們。

---

⭐ 如果這個專案對您有幫助，請給我們一個星星！

## 🚀 部署指南

### 後端 API（已部署）
- **網址**: https://claude4free-api.davis1233798.workers.dev
- **部署平台**: Cloudflare Workers
- **狀態**: ✅ 已部署完成

### 前端網站部署到 Cloudflare Pages

#### 方法一：通過 Dashboard 上傳（推薦）
1. 進入 [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. 選擇你的現有專案或創建新專案
3. 上傳以下文件：
   - `index.html`
   - `_headers`
   - `_redirects`
4. 等待部署完成

#### 方法二：通過 Git 連接
1. 將檔案推送到 GitHub repository
2. 在 Cloudflare Pages 連接你的 repository
3. 自動部署

### 部署後的網址
- **前端網址**: `https://你的專案名稱.pages.dev`
- **自定義域名**: 可在 Cloudflare Pages 設定

## 🔧 Google AdSense 設定

### 必要步驟：
1. **申請 AdSense 帳戶**
2. **驗證網站所有權**
3. **替換廣告位 ID**：
   ```html
   data-ad-client="ca-pub-5692204516534246"  <!-- 你的廣告客戶端ID -->
   data-ad-slot="1234567890"                  <!-- 替換為真實廣告位ID -->
   ```

### AdSense 配置檢查清單：
- ✅ 添加 `meta` 標籤
- ✅ 配置 `amp-auto-ads`
- ✅ 設置多個廣告位
- ✅ 添加 fallback 內容
- ✅ 使用響應式廣告格式

## 📋 使用流程

1. 用戶訪問前端網站：`https://你的專案名稱.pages.dev`
2. 前端發送請求到後端：`https://claude4free-api.davis1233798.workers.dev/api/chat`
3. 後端處理 AI 請求並返回結果
4. 前端顯示結果給用戶

## 🛠️ 故障排除

### 如果 API 請求失敗：
1. 檢查後端 Worker 是否正常運行
2. 確認 CORS 設定正確
3. 檢查網路連接

### 如果廣告不顯示：
1. 確認 AdSense 帳戶已審核通過
2. 檢查廣告位 ID 是否正確
3. 等待廣告審核完成（可能需要幾小時到幾天） 