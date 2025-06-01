# Puter API 模型使用規範

## Puter API 基礎配置
- 基礎 URL: `https://api.puter.com`
- 所有請求需要 Content-Type: application/json
- 免費使用，無需 API Key

## 支援的 AI 模型和代碼片段

### OpenAI 模型
```javascript
// GPT-4o
const chatResponse = await fetch('https://api.puter.com/drivers/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        driver: 'openai-completion',
        model: 'gpt-4o',
        messages: [{ role: 'user', content: message }]
    })
});

// GPT-4o Mini
const chatResponse = await fetch('https://api.puter.com/drivers/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        driver: 'openai-completion',
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: message }]
    })
});

// o1-mini
const chatResponse = await fetch('https://api.puter.com/drivers/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        driver: 'openai-completion',
        model: 'o1-mini',
        messages: [{ role: 'user', content: message }]
    })
});
```

### Anthropic Claude 模型
```javascript
// Claude 3.5 Sonnet
const chatResponse = await fetch('https://api.puter.com/drivers/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        driver: 'anthropic-completion',
        model: 'claude-3-5-sonnet',
        messages: [{ role: 'user', content: message }]
    })
});

// Claude 3.7 Sonnet (如果可用)
const chatResponse = await fetch('https://api.puter.com/drivers/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        driver: 'anthropic-completion', 
        model: 'claude-3-7-sonnet',
        messages: [{ role: 'user', content: message }]
    })
});
```

### Google Gemini 模型
```javascript
// Gemini 2.0 Flash
const chatResponse = await fetch('https://api.puter.com/drivers/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        driver: 'google-completion',
        model: 'gemini-2.0-flash',
        messages: [{ role: 'user', content: message }]
    })
});

// Gemini 1.5 Flash
const chatResponse = await fetch('https://api.puter.com/drivers/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        driver: 'google-completion',
        model: 'gemini-1.5-flash',
        messages: [{ role: 'user', content: message }]
    })
});
```

### Meta Llama 模型
```javascript
// Llama 3.1 405B
const chatResponse = await fetch('https://api.puter.com/drivers/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        driver: 'meta-completion',
        model: 'llama-3.1-405b',
        messages: [{ role: 'user', content: message }]
    })
});

// Llama 3.1 70B  
const chatResponse = await fetch('https://api.puter.com/drivers/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        driver: 'meta-completion',
        model: 'llama-3.1-70b',
        messages: [{ role: 'user', content: message }]
    })
});
```

### DeepSeek 模型
```javascript
// DeepSeek V3
const chatResponse = await fetch('https://api.puter.com/drivers/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        driver: 'deepseek-completion',
        model: 'deepseek-v3',
        messages: [{ role: 'user', content: message }]
    })
});

// DeepSeek Coder
const chatResponse = await fetch('https://api.puter.com/drivers/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        driver: 'deepseek-completion',
        model: 'deepseek-coder',
        messages: [{ role: 'user', content: message }]
    })
});
```

### Mistral 模型
```javascript
// Mistral Large
const chatResponse = await fetch('https://api.puter.com/drivers/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        driver: 'mistral-completion',
        model: 'mistral-large',
        messages: [{ role: 'user', content: message }]
    })
});
```

### X.AI Grok 模型
```javascript
// Grok Beta
const chatResponse = await fetch('https://api.puter.com/drivers/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        driver: 'xai-completion',
        model: 'grok-3-beta',
        messages: [{ role: 'user', content: message }]
    })
});
```

## 圖片識別功能
```javascript
// 圖片識別 (多模態)
const imageResponse = await fetch('https://api.puter.com/drivers/vision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        driver: 'openai-vision',
        model: 'gpt-4o',
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: message },
                    { 
                        type: 'image_url', 
                        image_url: { 
                            url: `data:${imageFile.type};base64,${base64Image}` 
                        } 
                    }
                ]
            }
        ]
    })
});
```

## 語音生成 (TTS)
```javascript
// Text-to-Speech
const ttsResponse = await fetch('https://api.puter.com/drivers/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        driver: 'openai-tts',
        model: 'tts-1',
        voice: 'alloy',
        input: text,
        response_format: 'mp3'
    })
});
```

## 圖片生成
```javascript
// Text-to-Image (DALL-E)
const imageGenResponse = await fetch('https://api.puter.com/drivers/image-generation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        driver: 'openai-image-generation',
        model: 'dall-e-3',
        prompt: prompt,
        size: size || '1024x1024',
        quality: 'standard',
        n: 1
    })
});
```

## 錯誤處理模式
```javascript
async function callPuterAPI(endpoint, data) {
    try {
        const response = await fetch(`https://api.puter.com${endpoint}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'Claude4Free/1.0'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API 錯誤 ${response.status}: ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Puter API 調用失敗:', error);
        throw error;
    }
}
```

## 模型映射表
```javascript
const MODEL_MAPPING = {
    // OpenAI
    'gpt-4o': { driver: 'openai-completion', model: 'gpt-4o' },
    'gpt-4o-mini': { driver: 'openai-completion', model: 'gpt-4o-mini' },
    'o1': { driver: 'openai-completion', model: 'o1' },
    'o1-mini': { driver: 'openai-completion', model: 'o1-mini' },
    
    // Anthropic
    'claude-3-5-sonnet': { driver: 'anthropic-completion', model: 'claude-3-5-sonnet' },
    'claude-3-7-sonnet': { driver: 'anthropic-completion', model: 'claude-3-7-sonnet' },
    
    // Google
    'gemini-2.0-flash': { driver: 'google-completion', model: 'gemini-2.0-flash' },
    'gemini-1.5-flash': { driver: 'google-completion', model: 'gemini-1.5-flash' },
    
    // Meta
    'llama-3.1-405b': { driver: 'meta-completion', model: 'llama-3.1-405b' },
    'llama-3.1-70b': { driver: 'meta-completion', model: 'llama-3.1-70b' },
    
    // DeepSeek
    'deepseek-v3': { driver: 'deepseek-completion', model: 'deepseek-v3' },
    'deepseek-coder': { driver: 'deepseek-completion', model: 'deepseek-coder' },
    
    // Mistral
    'mistral-large': { driver: 'mistral-completion', model: 'mistral-large' },
    'mistral-medium': { driver: 'mistral-completion', model: 'mistral-medium' },
    
    // X.AI
    'x-ai/grok-3-beta': { driver: 'xai-completion', model: 'grok-3-beta' }
};
```

## 使用建議
1. 所有 API 調用都使用 POST 方法
2. 請求頭必須包含 `Content-Type: application/json`
3. 消息格式統一使用 OpenAI 的 messages 結構
4. 錯誤處理要包含狀態碼和詳細錯誤信息
5. 對於圖片處理，需要將文件轉換為 base64 格式
6. TTS 和圖片生成返回的是 URL 或二進制數據 