// Cloudflare Workers API for Claude4Free
// 替代 Node.js Express 服務器

// CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Puter API 基礎配置
const PUTER_API_BASE = 'https://api.puter.com';

// 主要事件監聽器
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// 主要請求處理函數
async function handleRequest(request) {
  // 處理 CORS 預檢請求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  try {
    // 路由處理
    switch (path) {
      case '/api/chat':
        if (request.method === 'POST') {
          return await handleChatRequest(request);
        }
        break;
      case '/health':
        return await handleHealthCheck();
      case '/':
        return await handleIndexPage();
      default:
        return new Response('端點不存在', { 
          status: 404,
          headers: corsHeaders 
        });
    }
  } catch (error) {
    console.error('Worker 錯誤:', error);
    return new Response(JSON.stringify({ 
      error: '內部伺服器錯誤',
      message: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

// 處理聊天請求
async function handleChatRequest(request) {
  try {
    const contentType = request.headers.get('content-type');
    let formData, body;

    // 處理不同的請求格式
    if (contentType && contentType.includes('multipart/form-data')) {
      formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      body = await request.json();
    }

    const { 
      message, 
      function: chatFunction = 'chat', 
      model, 
      'tts-language': ttsLanguage = 'zh-TW',
      'img-size': imgSize = '512x512',
      'img-style': imgStyle 
    } = body;

    // 驗證必要參數
    if (!message && chatFunction !== 'image-recognition') {
      return new Response(JSON.stringify({ 
        error: '請輸入訊息' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    if (!model) {
      return new Response(JSON.stringify({ 
        error: '請選擇 AI 模型' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    let response = {};

    // 根據功能類型處理請求
    switch (chatFunction) {
      case 'chat':
        response = await handleChat(message, model);
        break;
      case 'image-recognition':
        const imageFile = formData ? formData.get('image') : null;
        if (!imageFile) {
          return new Response(JSON.stringify({ 
            error: '請上傳圖片' 
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
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
        return new Response(JSON.stringify({ 
          error: '不支援的功能' 
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('聊天請求錯誤:', error);
    return new Response(JSON.stringify({ 
      error: error.message || '處理請求時發生錯誤' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

// 調用 Puter API 的輔助函數
async function callPuterAPI(endpoint, data, options = {}) {
  try {
    let body, headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (data instanceof FormData) {
      body = data;
      delete headers['Content-Type']; // 讓瀏覽器自動設置
    } else {
      body = JSON.stringify(data);
    }

    const response = await fetch(`${PUTER_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: body
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Puter API 錯誤 ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Puter API 調用失敗:', error);
    throw error;
  }
}

// 處理一般聊天
async function handleChat(message, model) {
  try {
    const response = await callPuterAPI('/ai/chat', {
      message: message,
      model: model
    });

    return {
      text: response.message?.content || response.content || String(response),
      success: true
    };
  } catch (error) {
    throw new Error(`聊天失敗: ${error.message}`);
  }
}

// 處理圖片識別
async function handleImageRecognition(message, model, imageFile) {
  try {
    // 創建 FormData 進行 OCR
    const formData = new FormData();
    formData.append('image', imageFile);

    const ocrResponse = await callPuterAPI('/ai/img2txt', formData);
    const ocrText = ocrResponse.text || '';

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
async function handleTextToSpeech(text, language) {
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
async function handleTextToImage(prompt, size, style) {
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

// 健康檢查
async function handleHealthCheck() {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Claude4Free Cloudflare Worker'
  }), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// 處理首頁（可選）
async function handleIndexPage() {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Claude4Free API</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🤖 Claude4Free API</h1>
    <p>Cloudflare Workers 版本 AI API 服務</p>
    
    <h2>📍 可用端點</h2>
    <div class="endpoint">
        <strong>POST /api/chat</strong><br>
        主要 AI 聊天端點
    </div>
    <div class="endpoint">
        <strong>GET /health</strong><br>
        健康檢查端點
    </div>
    
    <h2>🚀 狀態</h2>
    <p>✅ API 服務正常運行</p>
    <p>⏰ 時間: ${new Date().toISOString()}</p>
    
    <h2>📖 使用說明</h2>
    <p>請參考 <a href="https://github.com/your-repo/claude4free">GitHub 文檔</a> 了解詳細使用方法。</p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      ...corsHeaders,
    },
  });
} 