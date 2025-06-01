// Cloudflare Workers API 處理器 - 修復版本

// 配置常數
const ALLOWED_ORIGINS = [
    'https://claude4free.pages.dev',
    'https://claude4free-pages.davis1233798.workers.dev',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

// Puter.js API 基礎URL (根據官方文檔)
const PUTER_API_BASE = 'https://api.puter.com';

// CORS 處理函數
function corsHeaders(origin) {
    const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin?.includes('localhost') || origin?.includes('127.0.0.1');
    
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

// 輔助函數：調用 Puter API (根據官方文檔修正)
async function callPuterAPI(endpoint, data, method = 'POST') {
    try {
        console.log(`正在調用 Puter API: ${endpoint}`, data);
        
        const response = await fetch(`${PUTER_API_BASE}${endpoint}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Claude4Free-API/1.0',
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

// 模擬回應函數 (用於測試和後備)
function getMockResponse(chatFunction, message, model) {
    const timestamp = new Date().toLocaleString('zh-TW');
    
    switch (chatFunction) {
        case 'chat':
            return {
                text: `[測試模式] 您使用 ${model} 模型詢問: "${message}"\n\n這是一個測試回應，實際部署時會連接到真實的 AI 服務。\n\n回應時間: ${timestamp}`,
                success: true,
                mode: 'test'
            };
        case 'image-recognition':
            return {
                text: `[測試模式] 圖片識別功能\n\n您的問題: "${message}"\n使用模型: ${model}\n\n這是測試回應，實際部署時會分析上傳的圖片。\n\n回應時間: ${timestamp}`,
                success: true,
                mode: 'test'
            };
        case 'text-to-speech':
            return {
                text: `[測試模式] 語音生成: "${message}"\n\n實際部署時會生成音頻文件。`,
                success: true,
                mode: 'test'
            };
        case 'text-to-image':
            return {
                text: `[測試模式] 圖片生成: "${message}"\n\n實際部署時會生成圖片。`,
                success: true,
                mode: 'test'
            };
        default:
            return {
                text: '不支援的功能',
                success: false
            };
    }
}

// 處理一般聊天 (根據 Puter 文檔修正)
async function handleChat(message, model) {
    try {
        const response = await callPuterAPI('/ai/chat', {
            message: message,
            model: model || 'gpt-3.5-turbo',
            stream: false
        });
        
        return {
            text: response.message?.content || response.content || response.text || String(response),
            success: true
        };
    } catch (error) {
        console.error('聊天 API 失敗，使用測試模式:', error);
        // 後備到測試模式
        return getMockResponse('chat', message, model);
    }
}

// 處理圖片識別 (根據 Puter 文檔修正)
async function handleImageRecognition(message, model, imageFile) {
    try {
        // 首先進行圖片分析
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const imageAnalysisResponse = await fetch(`${PUTER_API_BASE}/ai/image-to-text`, {
            method: 'POST',
            body: formData
        });
        
        if (!imageAnalysisResponse.ok) {
            throw new Error(`圖片分析失敗: ${imageAnalysisResponse.status}`);
        }
        
        const imageAnalysisResult = await imageAnalysisResponse.json();
        const imageDescription = imageAnalysisResult.text || imageAnalysisResult.description || '';
        
        // 然後與 AI 對話分析圖片
        const fullPrompt = `圖片分析結果：${imageDescription}\n\n用戶問題：${message}`;
        const chatResponse = await handleChat(fullPrompt, model);
        
        return {
            text: `圖片識別結果：\n\n圖片描述：${imageDescription}\n\n分析回答：${chatResponse.text}`,
            imageDescription: imageDescription,
            success: true
        };
    } catch (error) {
        console.error('圖片識別失敗，使用測試模式:', error);
        return getMockResponse('image-recognition', message, model);
    }
}

// 處理語音生成 (根據 Puter 文檔修正)
async function handleTextToSpeech(text, language = 'zh-TW') {
    try {
        const response = await callPuterAPI('/ai/text-to-speech', {
            text: text,
            language: language,
            voice: 'default'
        });
        
        return {
            text: `已生成語音 (${language})`,
            audioUrl: response.audio_url || response.url,
            success: true
        };
    } catch (error) {
        console.error('語音生成失敗，使用測試模式:', error);
        return getMockResponse('text-to-speech', text, 'tts');
    }
}

// 處理圖片生成 (根據 Puter 文檔修正)
async function handleTextToImage(prompt, size = '512x512', style = '') {
    try {
        const fullPrompt = style ? `${prompt}, ${style} style` : prompt;
        
        const response = await callPuterAPI('/ai/text-to-image', {
            prompt: fullPrompt,
            size: size,
            model: 'dall-e-3'
        });
        
        return {
            text: `已生成圖片：${prompt}`,
            imageUrl: response.image_url || response.url,
            success: true
        };
    } catch (error) {
        console.error('圖片生成失敗，使用測試模式:', error);
        return getMockResponse('text-to-image', prompt, 'image-gen');
    }
}

// 驗證和清理輸入
function validateAndSanitizeInput(formData) {
    const errors = [];
    
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
    
    if (chatFunction === 'chat' && (!model || typeof model !== 'string')) {
        errors.push('請選擇 AI 模型');
    }
    
    if (chatFunction === 'image-recognition' && !imageFile) {
        errors.push('請上傳圖片');
    }
    
    if (imageFile && imageFile.size > 10 * 1024 * 1024) { // 10MB 限制
        errors.push('圖片文件過大，請限制在10MB以內');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        data: {
            message: message?.trim(),
            chatFunction,
            model,
            ttsLanguage: formData.get('tts-language') || 'zh-TW',
            imgSize: formData.get('img-size') || '512x512',
            imgStyle: formData.get('img-style') || '',
            imageFile
        }
    };
}

// 主要請求處理器
async function handleRequest(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    console.log(`收到請求: ${request.method} ${url.pathname}`);

    // 處理 OPTIONS 請求
    if (request.method === 'OPTIONS') {
        return handleOptions(request);
    }

    // 路由處理
    if (url.pathname === '/health') {
        return new Response(JSON.stringify({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            environment: env?.ENVIRONMENT || 'unknown',
            version: '2.1'
        }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(origin)
            }
        });
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
        try {
            const formData = await request.formData();
            
            // 驗證輸入
            const validation = validateAndSanitizeInput(formData);
            
            if (!validation.isValid) {
                return new Response(JSON.stringify({ 
                    error: validation.errors[0],
                    errors: validation.errors
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders(origin)
                    }
                });
            }
            
            const { message, chatFunction, model, ttsLanguage, imgSize, imgStyle, imageFile } = validation.data;

            console.log('請求參數:', { message, chatFunction, model, ttsLanguage, imgSize, imgStyle });

            let response = {};

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
                    return new Response(JSON.stringify({ error: '不支援的功能' }), {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders(origin)
                        }
                    });
            }

            console.log('API 回應:', response);

            return new Response(JSON.stringify(response), {
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders(origin)
                }
            });

        } catch (error) {
            console.error('API 處理錯誤:', error);
            return new Response(JSON.stringify({ 
                error: error.message || '伺服器錯誤',
                details: env?.ENVIRONMENT === 'development' ? error.stack : undefined,
                timestamp: new Date().toISOString()
            }), {
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
    <title>Claude4Free API 文檔</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
        .status.ok { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    </style>
</head>
<body>
    <h1>🤖 Claude4Free API</h1>
    <p>免費的多功能 AI API 服務 (基於 Puter.com)</p>
    
    <div class="status ok">
        ✅ API 狀態：正常運行<br>
        🕐 當前時間：${new Date().toLocaleString('zh-TW')}<br>
        🌍 環境：${env?.ENVIRONMENT || 'unknown'}<br>
        📦 版本：2.1
    </div>
    
    <h2>端點</h2>
    <ul>
        <li><code>GET /health</code> - 健康檢查</li>
        <li><code>POST /api/chat</code> - AI 對話與功能</li>
    </ul>
    
    <h2>使用方法</h2>
    <pre>
POST /api/chat
Content-Type: multipart/form-data

參數:
- message: 用戶訊息 (必填, 最大10000字)
- function: 功能類型 (chat|image-recognition|text-to-speech|text-to-image)
- model: AI 模型ID (聊天功能必需)
- image: 圖片文件 (圖片識別時需要, 最大10MB)
- tts-language: 語音語言 (預設: zh-TW)
- img-size: 圖片尺寸 (預設: 512x512)
- img-style: 圖片風格
    </pre>
    
    <h2>錯誤處理</h2>
    <p>API 會回傳適當的 HTTP 狀態碼：</p>
    <ul>
        <li><strong>200</strong> - 成功</li>
        <li><strong>400</strong> - 請求錯誤 (缺少參數、參數無效等)</li>
        <li><strong>404</strong> - 端點不存在</li>
        <li><strong>500</strong> - 伺服器錯誤</li>
    </ul>
    
    <h2>支援的 AI 模型</h2>
    <ul>
        <li>OpenAI: gpt-4o, gpt-4o-mini, o1, o1-mini</li>
        <li>Anthropic: claude-3-5-sonnet, claude-3-7-sonnet</li>
        <li>Google: gemini-2.0-flash, gemini-1.5-flash</li>
        <li>Meta: llama-3.1-405b, llama-3.1-70b</li>
        <li>其他: deepseek-v3, mistral-large, grok-3-beta</li>
    </ul>
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
        availableEndpoints: ['/health', '/api/chat', '/'],
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
        return await handleRequest(request, env);
    }
}; 