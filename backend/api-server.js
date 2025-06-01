const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 模擬 Puter.js API 調用
// 注意：這裡需要實際的 API 密鑰和端點
const PUTER_API_BASE = 'https://api.puter.com';

// 輔助函數：調用 Puter API
async function callPuterAPI(endpoint, data, headers = {}) {
    try {
        const response = await fetch(`${PUTER_API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`API 調用失敗: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Puter API 錯誤:', error);
        throw error;
    }
}

// 聊天端點
app.post('/api/chat', upload.single('image'), async (req, res) => {
    try {
        const { message, function: chatFunction, model, 'tts-language': ttsLanguage, 'img-size': imgSize, 'img-style': imgStyle } = req.body;
        
        let response = {};
        
        switch (chatFunction) {
            case 'chat':
                response = await handleChat(message, model);
                break;
            case 'image-recognition':
                if (!req.file) {
                    return res.status(400).json({ error: '請上傳圖片' });
                }
                response = await handleImageRecognition(message, model, req.file);
                break;
            case 'text-to-speech':
                response = await handleTextToSpeech(message, ttsLanguage || 'zh-TW');
                break;
            case 'text-to-image':
                response = await handleTextToImage(message, imgSize || '512x512', imgStyle);
                break;
            default:
                return res.status(400).json({ error: '不支援的功能' });
        }
        
        res.json(response);
    } catch (error) {
        console.error('API 錯誤:', error);
        res.status(500).json({ error: error.message || '伺服器錯誤' });
    }
});

// 處理一般聊天
async function handleChat(message, model) {
    try {
        // 模擬 puter.ai.chat() 調用
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
        // 首先進行 OCR
        const formData = new FormData();
        formData.append('image', new Blob([imageFile.buffer]), imageFile.originalname);
        
        const ocrResponse = await callPuterAPI('/ai/img2txt', formData, {
            'Content-Type': 'multipart/form-data'
        });
        
        const ocrText = ocrResponse.text || '';
        
        // 然後與 AI 對話
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

// 健康檢查端點
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 處理
app.use('*', (req, res) => {
    res.status(404).json({ error: '端點不存在' });
});

// 錯誤處理中間件
app.use((error, req, res, next) => {
    console.error('伺服器錯誤:', error);
    res.status(500).json({ error: '內部伺服器錯誤' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 API 伺服器運行在 http://localhost:${PORT}`);
    console.log(`📊 健康檢查: http://localhost:${PORT}/health`);
});

module.exports = app; 