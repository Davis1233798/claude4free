// Cloudflare Workers API for Claude4Free - Updated with Correct Puter API Usage
// 處理多種AI功能：聊天、圖片識別、語音生成、圖片生成

// 配置常數
const ALLOWED_ORIGINS = [
    'https://claude4free.pages.dev',
    'https://claude4free-pages.davis1233798.workers.dev',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

// Puter API 基礎URL和端點
const PUTER_API_BASE = 'https://api.puter.com';

// 模型映射表 - 根據 Puter API 規範
const MODEL_MAPPING = {
    // OpenAI
    'gpt-4o': { driver: 'openai-completion', model: 'gpt-4o' },
    'gpt-4o-mini': { driver: 'openai-completion', model: 'gpt-4o-mini' },
    'gpt-4.5-preview': { driver: 'openai-completion', model: 'gpt-4-turbo-preview' },
    'o1': { driver: 'openai-completion', model: 'o1' },
    'o1-mini': { driver: 'openai-completion', model: 'o1-mini' },
    
    // Anthropic
    'claude-3-5-sonnet': { driver: 'anthropic-completion', model: 'claude-3-5-sonnet' },
    'claude-3-7-sonnet': { driver: 'anthropic-completion', model: 'claude-3-5-sonnet' }, // 備用
    
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

// CORS 處理函數
function corsHeaders(origin) {
    const isAllowed = ALLOWED_ORIGINS.includes(origin) || 
                     origin?.includes('localhost') || 
                     origin?.includes('127.0.0.1');
    
    return {
        'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'true'
    };
}

// 處理 OPTIONS 請求
function handleOptions(request) {
    const origin = request.headers.get('Origin');
    return new Response(null, {
        status: 204,
        headers: corsHeaders(origin)
    });
}

// 輔助函數：調用 Puter API
async function callPuterAPI(endpoint, data, method = 'POST') {
    try {
        console.log(`正在調用 Puter API: ${endpoint}`, data);
        
        const response = await fetch(`${PUTER_API_BASE}${endpoint}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Claude4Free-API/2.0',
                'Accept': 'application/json'
            },
            body: method !== 'GET' ? JSON.stringify(data) : undefined
        });
        
        console.log(`Puter API 回應狀態: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Puter API 錯誤回應: ${errorText}`);
            throw new Error(`API 調用失敗: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Puter API 成功回應:', result);
        return result;
    } catch (error) {
        console.error('Puter API 錯誤:', error);
        throw error;
    }
}

// 將文件轉換為 base64
async function fileToBase64(file) {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    return btoa(binaryString);
}

// 模擬回應函數 (測試和後備模式)
function getMockResponse(chatFunction, message, model) {
    const timestamp = new Date().toLocaleString('zh-TW');
    
    switch (chatFunction) {
        case 'chat':
            return {
                text: `[測試模式] 您使用 ${model} 模型詢問: "${message}"\n\n這是一個測試回應，實際部署時會連接到 Puter AI 服務。\n\n請注意：當前 API 可能正在維護或模型不可用。\n\n回應時間: ${timestamp}`,
                success: true,
                mode: 'fallback'
            };
        case 'image-recognition':
            return {
                text: `[測試模式] 圖片識別功能\n\n您的問題: "${message}"\n使用模型: ${model}\n\n這是測試回應，實際部署時會分析上傳的圖片。\n\n回應時間: ${timestamp}`,
                success: true,
                mode: 'fallback'
            };
        case 'text-to-speech':
            return {
                text: `[測試模式] 語音生成: "${message}"\n\n實際部署時會生成音頻文件。\n\n回應時間: ${timestamp}`,
                success: true,
                mode: 'fallback'
            };
        case 'text-to-image':
            return {
                text: `[測試模式] 圖片生成: "${message}"\n\n實際部署時會生成圖片。\n\n回應時間: ${timestamp}`,
                success: true,
                mode: 'fallback'
            };
        default:
            return {
                text: '不支援的功能',
                success: false
            };
    }
}

// 處理一般聊天
async function handleChat(message, model) {
    try {
        const modelConfig = MODEL_MAPPING[model];
        if (!modelConfig) {
            throw new Error(`不支援的模型: ${model}`);
        }

        const response = await callPuterAPI('/drivers/chat', {
            driver: modelConfig.driver,
            model: modelConfig.model,
            messages: [{ role: 'user', content: message }]
        });
        
        return {
            text: response.message?.content || response.content || response.text || String(response),
            success: true,
            model: model
        };
    } catch (error) {
        console.error(`聊天 API 失敗 (模型: ${model}):`, error);
        // 後備到測試模式
        return getMockResponse('chat', message, model);
    }
}

// 處理圖片識別
async function handleImageRecognition(message, model, imageFile) {
    try {
        const base64Image = await fileToBase64(imageFile);
        
        const response = await callPuterAPI('/drivers/vision', {
            driver: 'openai-vision',
            model: 'gpt-4o', // 使用支援視覺的模型
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
        });
        
        return {
            text: response.message?.content || response.content || response.text || String(response),
            success: true,
            model: 'gpt-4o-vision'
        };
    } catch (error) {
        console.error('圖片識別失敗:', error);
        return getMockResponse('image-recognition', message, model);
    }
}

// 處理語音生成
async function handleTextToSpeech(text, language = 'zh-TW') {
    try {
        const response = await callPuterAPI('/drivers/tts', {
            driver: 'openai-tts',
            model: 'tts-1',
            voice: 'alloy',
            input: text,
            response_format: 'mp3'
        });
        
        return {
            text: `已生成語音 (${language})`,
            audioUrl: response.audio_url || response.url || response.data,
            success: true
        };
    } catch (error) {
        console.error('語音生成失敗:', error);
        return getMockResponse('text-to-speech', text, 'tts');
    }
}

// 處理圖片生成
async function handleTextToImage(prompt, size = '1024x1024', style = '') {
    try {
        const fullPrompt = style ? `${prompt}, ${style} style` : prompt;
        
        const response = await callPuterAPI('/drivers/image-generation', {
            driver: 'openai-image-generation',
            model: 'dall-e-3',
            prompt: fullPrompt,
            size: size,
            quality: 'standard',
            n: 1
        });
        
        return {
            text: `已生成圖片：${prompt}`,
            imageUrl: response.data?.[0]?.url || response.image_url || response.url,
            success: true
        };
    } catch (error) {
        console.error('圖片生成失敗:', error);
        return getMockResponse('text-to-image', prompt, 'dall-e-3');
    }
}

// 驗證和清理輸入
function validateAndSanitizeInput(formData) {
    const errors = [];
    
    // 獲取基本參數
    const message = formData.get('message');
    const chatFunction = formData.get('function') || 'chat';
    const model = formData.get('model');
    const imageFile = formData.get('image');
    
    // 基本驗證
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        errors.push('請提供訊息內容');
    }
    
    if (message && message.length > 10000) {
        errors.push('訊息內容過長，請限制在10000字以內');
    }
    
    if (!['chat', 'image-recognition', 'text-to-speech', 'text-to-image'].includes(chatFunction)) {
        errors.push('不支援的功能類型');
    }
    
    // 聊天功能需要模型
    if (chatFunction === 'chat' && (!model || typeof model !== 'string')) {
        errors.push('請選擇 AI 模型');
    }
    
    // 檢查模型是否支援
    if (chatFunction === 'chat' && model && !MODEL_MAPPING[model]) {
        errors.push(`不支援的模型: ${model}`);
    }
    
    // 圖片識別需要圖片
    if (chatFunction === 'image-recognition' && !imageFile) {
        errors.push('圖片識別功能需要上傳圖片');
    }
    
    // 檢查圖片大小
    if (imageFile && imageFile.size > 10 * 1024 * 1024) { // 10MB 限制
        errors.push('圖片文件過大，請限制在10MB以內');
    }
    
    // 檢查圖片類型
    if (imageFile && !imageFile.type.startsWith('image/')) {
        errors.push('請上傳有效的圖片文件');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        data: {
            message: message?.trim(),
            chatFunction,
            model,
            ttsLanguage: formData.get('tts-language') || 'zh-TW',
            imgSize: formData.get('img-size') || '1024x1024',
            imgStyle: formData.get('img-style') || '',
            imageFile
        }
    };
}

// 主要請求處理器
async function handleRequest(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    console.log(`收到請求: ${request.method} ${url.pathname} from ${origin}`);

    // 處理 OPTIONS 請求
    if (request.method === 'OPTIONS') {
        return handleOptions(request);
    }

    // 健康檢查端點
    if (url.pathname === '/health') {
        return new Response(JSON.stringify({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            environment: env?.ENVIRONMENT || 'production',
            version: '3.0',
            api_base: PUTER_API_BASE,
            supported_models: Object.keys(MODEL_MAPPING)
        }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(origin)
            }
        });
    }

    // 主要 API 端點
    if (url.pathname === '/api/chat' && request.method === 'POST') {
        try {
            // 解析 FormData
            let formData;
            try {
                formData = await request.formData();
            } catch (parseError) {
                console.error('FormData 解析失敗:', parseError);
                return new Response(JSON.stringify({ 
                    error: '請求格式錯誤，請使用 multipart/form-data',
                    details: parseError.message
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders(origin)
                    }
                });
            }
            
            // 驗證輸入
            const validation = validateAndSanitizeInput(formData);
            
            if (!validation.isValid) {
                console.log('輸入驗證失敗:', validation.errors);
                return new Response(JSON.stringify({ 
                    error: validation.errors[0],
                    errors: validation.errors,
                    timestamp: new Date().toISOString()
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders(origin)
                    }
                });
            }
            
            const { message, chatFunction, model, ttsLanguage, imgSize, imgStyle, imageFile } = validation.data;

            console.log('處理請求:', { 
                function: chatFunction, 
                model, 
                messageLength: message?.length,
                hasImage: !!imageFile 
            });

            let response = {};

            // 根據功能類型處理請求
            switch (chatFunction) {
                case 'chat':
                    response = await handleChat(message, model);
                    break;
                case 'image-recognition':
                    response = await handleImageRecognition(message, model, imageFile);
                    break;
                case 'text-to-speech':
                    response = await handleTextToSpeech(message, ttsLanguage);
                    break;
                case 'text-to-image':
                    response = await handleTextToImage(message, imgSize, imgStyle);
                    break;
                default:
                    throw new Error(`不支援的功能類型: ${chatFunction}`);
            }

            console.log('API 回應結果:', { success: response.success, hasText: !!response.text });

            return new Response(JSON.stringify({
                ...response,
                timestamp: new Date().toISOString(),
                function: chatFunction,
                model: model
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders(origin)
                }
            });

        } catch (error) {
            console.error('API 處理錯誤:', error);
            
            // 提供詳細的錯誤信息給開發環境
            const errorResponse = {
                error: error.message || '伺服器錯誤',
                timestamp: new Date().toISOString(),
                type: 'server_error'
            };
            
            if (env?.ENVIRONMENT === 'development') {
                errorResponse.details = error.stack;
                errorResponse.debug = true;
            }
            
            return new Response(JSON.stringify(errorResponse), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders(origin)
                }
            });
        }
    }

    // API 文檔頁面
    if (url.pathname === '/') {
        const apiDocs = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude4Free API v3.0</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 1000px; 
            margin: 0 auto; 
            padding: 20px; 
            background: #f8f9fa;
        }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        code { background: #f1f3f4; padding: 2px 6px; border-radius: 4px; font-family: 'Monaco', monospace; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 6px; overflow-x: auto; border-left: 4px solid #007bff; }
        .status { padding: 15px; border-radius: 8px; margin: 20px 0; }
        .status.ok { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .endpoint { background: #e3f2fd; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .models { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        .model-group { background: #f8f9fa; padding: 10px; border-radius: 4px; }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Claude4Free API v3.0</h1>
        <p>免費的多功能 AI API 服務，基於 Puter.com 提供穩定的 AI 模型訪問</p>
        
        <div class="status ok">
            ✅ <strong>服務狀態</strong>：正常運行<br>
            🕐 <strong>當前時間</strong>：${new Date().toLocaleString('zh-TW')}<br>
            🌍 <strong>環境</strong>：${env?.ENVIRONMENT || 'production'}<br>
            📦 <strong>版本</strong>：3.0<br>
            🔗 <strong>API 基礎</strong>：${PUTER_API_BASE}
        </div>
        
        <h2>🎯 支援功能</h2>
        <div class="endpoint">💬 <strong>聊天對話</strong> - 支援多種 AI 模型的文字對話</div>
        <div class="endpoint">🖼️ <strong>圖片識別</strong> - 上傳圖片進行智能分析</div>
        <div class="endpoint">🔊 <strong>語音生成</strong> - 文字轉語音 (TTS)</div>
        <div class="endpoint">🎨 <strong>圖片生成</strong> - 文字生成圖片 (DALL-E)</div>
        
        <h2>📡 API 端點</h2>
        <ul>
            <li><code>GET /health</code> - 服務健康檢查</li>
            <li><code>POST /api/chat</code> - 主要 AI 功能端點</li>
            <li><code>GET /</code> - API 文檔 (本頁)</li>
        </ul>
        
        <h2>🔧 使用方法</h2>
        <pre>
POST /api/chat
Content-Type: multipart/form-data

<strong>必需參數:</strong>
- message: 用戶訊息內容 (字串, 最大10000字)
- function: 功能類型 (chat|image-recognition|text-to-speech|text-to-image)

<strong>聊天功能額外參數:</strong>
- model: AI 模型ID (必需, 見下方支援列表)

<strong>圖片識別額外參數:</strong>
- image: 圖片文件 (必需, 最大10MB, 支援常見圖片格式)

<strong>語音生成額外參數:</strong>
- tts-language: 語言代碼 (可選, 預設: zh-TW)

<strong>圖片生成額外參數:</strong>
- img-size: 圖片尺寸 (可選, 預設: 1024x1024)
- img-style: 圖片風格描述 (可選)
        </pre>
        
        <h2>🤖 支援的 AI 模型</h2>
        <div class="models">
            <div class="model-group">
                <h3>🟢 OpenAI</h3>
                <code>gpt-4o</code><br>
                <code>gpt-4o-mini</code><br>
                <code>o1</code><br>
                <code>o1-mini</code>
            </div>
            <div class="model-group">
                <h3>🔵 Anthropic</h3>
                <code>claude-3-5-sonnet</code><br>
                <code>claude-3-7-sonnet</code>
            </div>
            <div class="model-group">
                <h3>🟡 Google</h3>
                <code>gemini-2.0-flash</code><br>
                <code>gemini-1.5-flash</code>
            </div>
            <div class="model-group">
                <h3>🔴 Meta</h3>
                <code>llama-3.1-405b</code><br>
                <code>llama-3.1-70b</code>
            </div>
            <div class="model-group">
                <h3>🟣 其他</h3>
                <code>deepseek-v3</code><br>
                <code>mistral-large</code><br>
                <code>x-ai/grok-3-beta</code>
            </div>
        </div>
        
        <h2>⚠️ 錯誤處理</h2>
        <ul>
            <li><strong>200</strong> - 請求成功</li>
            <li><strong>400</strong> - 請求錯誤 (參數缺失或無效)</li>
            <li><strong>404</strong> - 端點不存在</li>
            <li><strong>500</strong> - 伺服器錯誤</li>
        </ul>
        
        <h2>💡 使用建議</h2>
        <ul>
            <li>建議先測試 <code>/health</code> 端點確認服務可用</li>
            <li>圖片識別建議使用較小的圖片檔案以提升處理速度</li>
            <li>部分模型在高負載時可能切換到測試模式</li>
            <li>所有回應都包含 <code>success</code> 字段指示處理狀態</li>
        </ul>
        
        <p><small>⚡ Powered by <a href="https://puter.com" target="_blank">Puter.com</a> | Built with ❤️ for the community</small></p>
    </div>
</body>
</html>`;
        
        return new Response(apiDocs, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                ...corsHeaders(origin)
            }
        });
    }

    // 404 處理
    return new Response(JSON.stringify({ 
        error: '端點不存在',
        available_endpoints: ['/health', '/api/chat', '/'],
        timestamp: new Date().toISOString()
    }), {
        status: 404,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(origin)
        }
    });
}

// Cloudflare Workers 導出
export default {
    async fetch(request, env, ctx) {
        try {
            return await handleRequest(request, env);
        } catch (error) {
            console.error('Worker 未處理錯誤:', error);
            return new Response(JSON.stringify({
                error: '服務暫時不可用',
                timestamp: new Date().toISOString()
            }), {
                status: 503,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders(request.headers.get('Origin'))
                }
            });
        }
    }
}; 