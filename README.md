# Claude4Free - 免費AI多功能助手

🚀 **免費使用各種頂級AI模型**：Claude 4、GPT-4o、Gemini、Llama等，支援對話、圖片識別、語音生成、圖片生成等功能。

## 🌟 特色功能

- **多模型支援**: OpenAI、Anthropic、Google、Meta、Mistral、DeepSeek等頂級AI模型
- **多功能整合**: 
  - 💬 智能對話
  - 🖼️ 圖片識別與分析
  - 🔊 文字轉語音
  - 🎨 文字轉圖片
- **響應式設計**: 完美支援桌面和移動設備
- **深色/淺色主題**: 自適應護眼模式
- **純前端架構**: 基於 Puter.js，無需後端服務器
- **完全免費**: 無需註冊，無使用限制

## 🚀 技術架構

### 新架構 (2024)
- **前端**: 純 HTML5 + JavaScript + Puter.js
- **AI服務**: 直接集成 Puter.js SDK
- **部署**: Cloudflare Pages 靜態託管
- **特點**: 無服務器，完全前端化

### 支援的AI模型

#### OpenAI 系列
- GPT-4o / GPT-4o Mini
- GPT-4.5 Preview
- o1 / o1 Mini / o3 Mini

#### Anthropic 系列
- Claude 3.5 Sonnet
- Claude 3.7 Sonnet

#### Google 系列
- Gemini 2.0 Flash
- Gemini 1.5 Flash

#### Meta 系列
- Llama 3.1 405B / 70B

#### 其他模型
- Mistral Large / Medium
- DeepSeek V3 / Coder
- xAI Grok Beta

## 🛠️ 快速開始

### 方式一：直接訪問
訪問線上版本：[https://claude4free.pages.dev](https://claude4free.pages.dev)

### 方式二：本地運行
```bash
# 克隆專案
git clone https://github.com/your-username/claude4free.git
cd claude4free

# 使用任何HTTP服務器運行
# 方法1: 使用Python
python -m http.server 8000

# 方法2: 使用Node.js
npx serve .

# 方法3: 使用Live Server (VS Code擴展)
# 直接右鍵index.html -> Open with Live Server
```

然後訪問 `http://localhost:8000`

## 📂 項目結構

```
claude4free/
├── index.html              # 主頁面文件
├── README.md              # 項目說明
├── DEPLOYMENT.md          # 部署指南  
├── frontend/              # 前端資源 (備用)
│   ├── index.html
│   ├── _headers
│   └── _redirects
└── cloudflare-pages.toml  # Cloudflare Pages 配置
```

## 🎯 使用方法

1. **選擇AI模型**
   - 從模型類型下拉選單選擇提供商
   - 再選擇具體的模型版本

2. **選擇功能**
   - 💬 對話：與AI進行文字對話
   - 🖼️ 圖片識別：上傳圖片並提問
   - 🔊 語音生成：將文字轉換為語音
   - 🎨 圖片生成：用文字描述生成圖片

3. **開始使用**
   - 輸入您的問題或需求
   - 點擊發送按鈕
   - 等待AI回應

## 🔧 技術細節

### Puter.js 集成

本項目使用 Puter.js SDK 直接在前端調用AI服務：

```javascript
// 基本對話
const response = await puter.ai.chat(message, {
    model: 'gpt-4o'
});

// 圖片識別
const response = await puter.ai.chat([
    { type: 'text', text: question },
    { type: 'image', image: imageFile }
], { model: 'gpt-4o' });

// 語音生成
const response = await puter.ai.textToSpeech(text, {
    voice: 'zh-TW-HsiaoChenNeural'
});

// 圖片生成
const response = await puter.ai.textToImage(prompt, {
    size: '1024x1024',
    style: 'vivid'
});
```

### 特色功能

- **響應式設計**: 自適應不同螢幕尺寸
- **深色模式**: 護眼的深色主題
- **圖片預覽**: 上傳圖片即時預覽
- **錯誤處理**: 友善的錯誤提示和重試機制
- **載入狀態**: 清晰的處理進度指示

## 🚀 部署指南

### Cloudflare Pages 部署

1. **準備**
   ```bash
   git clone https://github.com/your-username/claude4free.git
   cd claude4free
   ```

2. **Cloudflare Pages**
   - 登入 Cloudflare Dashboard
   - 進入 Pages 服務
   - 連接 GitHub 倉庫
   - 設置構建配置：
     - 構建命令：留空
     - 輸出目錄：`/`
     - 根目錄：`/`

3. **自定義域名**（可選）
   - 在 Cloudflare Pages 設置中添加自定義域名
   - 配置DNS記錄

### 其他託管平台

- **Vercel**: 連接 GitHub 倉庫直接部署
- **Netlify**: 拖拽文件夾到 Netlify 或連接 Git
- **GitHub Pages**: 啟用 Pages 功能，選擇主分支

## 🔧 自定義配置

### 修改模型列表
在 `index.html` 中的 `modelConfig` 對象：

```javascript
const modelConfig = {
    openai: {
        'gpt-4o': 'GPT-4o',
        'new-model': '新模型名稱'  // 添加新模型
    }
    // ... 其他分類
};
```

### 修改界面主題
在 `<style>` 標籤中修改CSS變數：

```css
:root {
    --primary-color: #007bff;
    --background-color: white;
    --text-color: black;
}
```

## 🤝 貢獻指南

1. Fork 本倉庫
2. 創建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m '新增驚人的功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📝 開發注意事項

- 本項目使用 Puter.js SDK，需要網路連接
- 所有AI功能依賴 Puter 的免費服務
- 圖片上傳有大小限制（通常為10MB以內）
- 建議在HTTPS環境下使用以確保所有功能正常

## 📄 許可證

本項目採用 MIT 許可證 - 查看 [LICENSE](LICENSE) 文件了解詳情

## 🙏 致謝

- [Puter.js](https://puter.com) - 提供免費的AI API服務
- [Cloudflare Pages](https://pages.cloudflare.com) - 免費的靜態網站託管
- 各大AI模型提供商的技術支持

## 📞 支持與反饋

- 問題報告：[GitHub Issues](https://github.com/your-username/claude4free/issues)
- 功能建議：[GitHub Discussions](https://github.com/your-username/claude4free/discussions)

---

**免責聲明**: 本項目僅供學習和研究用途。請遵守各AI服務提供商的使用條款和當地法律法規。 