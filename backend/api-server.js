// Cloudflare Workers API 處理器

// 配置常數
const ALLOWED_ORIGINS = [
    'https://claude4free.pages.dev',
    'https://claude4free-pages.davis1233798.workers.dev',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

// 模擬 Puter.js API 調用
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

// 輔助函數：調用 Puter API
async function callPuterAPI(endpoint, data, method = 'POST') {
    try {
        const response = await fetch(`${PUTER_API_BASE}${endpoint}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Claude4Free-API/1.0'
            },
            body: method !== 'GET' ? JSON.stringify(data) : undefined
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API 調用失敗: ${response.status} - ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Puter API 錯誤:', error);
        throw error;
    }
}

// 處理一般聊天
async function handleChat(message, model) {
    try {
        const response = await callPuterAPI('/ai/chat', {
            message: message,
            model: model || 'gpt-3.5-turbo'
        });
        
        return {
            text: response.message?.content || response.content || response.text || String(response),
            success: true
        };
    } catch (error) {
        throw new Error(`聊天失敗: ${error.message}`);
    }
}

// 處理圖片識別
async function handleImageRecognition(message, model, imageFile) {
    try {
        // 處理圖片上傳和OCR
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const ocrResponse = await fetch(`${PUTER_API_BASE}/ai/img2txt`, {
            method: 'POST',
            body: formData
        });
        
        if (!ocrResponse.ok) {
            throw new Error(`OCR 失敗: ${ocrResponse.status}`);
        }
        
        const ocrResult = await ocrResponse.json();
        const ocrText = ocrResult.text || '';
        
        // 與 AI 對話分析圖片
        const fullPrompt = `圖片中的文字內容：${ocrText}\n\n用戶問題：${message}`;
        const chatResponse = await handleChat(fullPrompt, model);
        
        return {
            text: `圖片識別結果：\n\n提取的文字：${ocrText}\n\n分析回答：${chatResponse.text}`,
            ocrResult: ocrText,
            success: true
        };
    } catch (error) {
        throw new Error(`圖片識別失敗: ${error.message}`);
    }
}

// 處理語音生成
async function handleTextToSpeech(text, language = 'zh-TW') {
    try {
        const response = await callPuterAPI('/ai/txt2speech', {
            text: text,
            language: language
        });
        
        return {
            text: `已生成語音 (${language})`,
            audioUrl: response.audioUrl || response.url,
            success: true
        };
    } catch (error) {
        throw new Error(`語音生成失敗: ${error.message}`);
    }
}

// 處理圖片生成
async function handleTextToImage(prompt, size = '512x512', style = '') {
    try {
        const fullPrompt = style ? `${prompt}, ${style} style` : prompt;
        
        const response = await callPuterAPI('/ai/txt2img', {
            prompt: fullPrompt,
            size: size
        });
        
        return {
            text: `已生成圖片：${prompt}`,
            imageUrl: response.imageUrl || response.url,
            success: true
        };
    } catch (error) {
        throw new Error(`圖片生成失敗: ${error.message}`);
    }
}

// 主要請求處理器
async function handleRequest(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    // 處理 OPTIONS 請求
    if (request.method === 'OPTIONS') {
        return handleOptions(request);
    }

    // 路由處理
    if (url.pathname === '/health') {
        return new Response(JSON.stringify({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            environment: env.ENVIRONMENT || 'unknown'
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
            
            const message = formData.get('message');
            const chatFunction = formData.get('function') || 'chat';
            const model = formData.get('model');
            const ttsLanguage = formData.get('tts-language') || 'zh-TW';
            const imgSize = formData.get('img-size') || '512x512';
            const imgStyle = formData.get('img-style') || '';
            const imageFile = formData.get('image');

            // 驗證必需參數
            if (!message && chatFunction !== 'image-recognition') {
                return new Response(JSON.stringify({ error: '請提供訊息內容' }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders(origin)
                    }
                });
            }

            if (!model) {
                return new Response(JSON.stringify({ error: '請選擇AI模型' }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders(origin)
                    }
                });
            }

            let response = {};

            switch (chatFunction) {
                case 'chat':
                    response = await handleChat(message, model);
                    break;
                case 'image-recognition':
                    if (!imageFile) {
                        return new Response(JSON.stringify({ error: '請上傳圖片' }), {
                            status: 400,
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders(origin)
                            }
                        });
                    }
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

            return new Response(JSON.stringify(response), {
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders(origin)
                }
            });

        } catch (error) {
            console.error('API 錯誤:', error);
            return new Response(JSON.stringify({ 
                error: error.message || '伺服器錯誤',
                details: error.stack
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders(origin)
                }
            });
        }
    }

    // 404 處理
    return new Response(JSON.stringify({ error: '端點不存在' }), {
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