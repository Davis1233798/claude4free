// API 單元測試
import { describe, it, expect, beforeEach, vi } from 'vitest';
import apiServer from '../api-server.js';

// 輔助函數：創建模擬的 Request with FormData
function createFormRequest(url, formDataEntries, method = 'POST') {
  const formData = new FormData();
  for (const [key, value] of Object.entries(formDataEntries)) {
    formData.append(key, value);
  }
  
  return new Request(url, {
    method: method,
    body: formData
  });
}

describe('Claude4Free API Tests', () => {
  let mockEnv;
  
  beforeEach(() => {
    mockEnv = {
      ENVIRONMENT: 'test',
      ALLOWED_ORIGINS: 'http://localhost:3000,https://claude4free.pages.dev'
    };
    
    // 重置 fetch mock
    vi.clearAllMocks();
  });

  describe('健康檢查端點', () => {
    it('應該回應健康狀態', async () => {
      const request = new Request('https://api.test.com/health', {
        method: 'GET'
      });

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.environment).toBe('test');
      expect(data.version).toBe('2.0');
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('CORS 處理', () => {
    it('應該處理 OPTIONS 請求', async () => {
      const request = new Request('https://api.test.com/api/chat', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://claude4free.pages.dev'
        }
      });

      const response = await apiServer.fetch(request, mockEnv);

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://claude4free.pages.dev');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });

    it('應該為未授權的來源設定預設 CORS', async () => {
      const request = new Request('https://api.test.com/health', {
        method: 'GET',
        headers: {
          'Origin': 'https://malicious-site.com'
        }
      });

      const response = await apiServer.fetch(request, mockEnv);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://claude4free.pages.dev');
    });
  });

  describe('聊天功能', () => {
    it('應該處理聊天請求 (測試模式)', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '你好',
        function: 'chat',
        model: 'gpt-4o'
      });

      // 模擬 fetch 失敗，觸發測試模式
      global.fetch.mockRejectedValue(new Error('API unavailable'));

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.mode).toBe('test');
      expect(data.text).toContain('測試模式');
      expect(data.text).toContain('你好');
      expect(data.text).toContain('gpt-4o');
    });

    it('應該要求訊息內容', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        function: 'chat',
        model: 'gpt-4o'
      });

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('請提供訊息內容');
    });

    it('應該要求選擇模型', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '你好',
        function: 'chat'
      });

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('請選擇 AI 模型');
    });
  });

  describe('圖片識別功能', () => {
    it('應該處理圖片識別請求 (測試模式)', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '這張圖片是什麼？',
        function: 'image-recognition',
        model: 'gpt-4o',
        image: new Blob(['fake image data'], { type: 'image/jpeg' })
      });

      // 模擬 fetch 失敗，觸發測試模式
      global.fetch.mockRejectedValue(new Error('API unavailable'));

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.mode).toBe('test');
      expect(data.text).toContain('圖片識別功能');
    });

    it('應該要求上傳圖片', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '分析這張圖片',
        function: 'image-recognition',
        model: 'gpt-4o'
      });

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('請上傳圖片');
    });
  });

  describe('語音生成功能', () => {
    it('應該處理語音生成請求 (測試模式)', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '你好世界',
        function: 'text-to-speech',
        'tts-language': 'zh-TW'
      });

      // 模擬 fetch 失敗，觸發測試模式
      global.fetch.mockRejectedValue(new Error('API unavailable'));

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.mode).toBe('test');
      expect(data.text).toContain('語音生成');
      expect(data.text).toContain('你好世界');
    });
  });

  describe('圖片生成功能', () => {
    it('應該處理圖片生成請求 (測試模式)', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '一隻可愛的貓',
        function: 'text-to-image',
        'img-size': '512x512',
        'img-style': '卡通'
      });

      // 模擬 fetch 失敗，觸發測試模式
      global.fetch.mockRejectedValue(new Error('API unavailable'));

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.mode).toBe('test');
      expect(data.text).toContain('圖片生成');
      expect(data.text).toContain('一隻可愛的貓');
    });
  });

  describe('錯誤處理和驗證', () => {
    it('應該回傳400錯誤：空白訊息', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '',
        function: 'chat',
        model: 'gpt-4o'
      });

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('請提供訊息內容');
      expect(data.errors).toContain('請提供訊息內容');
    });

    it('應該回傳400錯誤：訊息過長', async () => {
      const longMessage = 'a'.repeat(10001);
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: longMessage,
        function: 'chat',
        model: 'gpt-4o'
      });

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('訊息內容過長，請限制在10000字以內');
    });

    it('應該回傳400錯誤：不支援的功能類型', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '測試',
        function: 'invalid-function',
        model: 'gpt-4o'
      });

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('不支援的功能類型');
    });

    it('應該回傳400錯誤：聊天功能缺少模型', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '你好',
        function: 'chat'
      });

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('請選擇 AI 模型');
    });

    it('應該回傳400錯誤：圖片識別缺少圖片', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '分析這張圖片',
        function: 'image-recognition',
        model: 'gpt-4o'
      });

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('請上傳圖片');
    });

    it('應該回傳400錯誤：圖片文件過大', async () => {
      // 創建大於10MB的模擬圖片
      const largeFile = new Blob(['x'.repeat(11 * 1024 * 1024)], { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });
      
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '分析這張圖片',
        function: 'image-recognition',
        model: 'gpt-4o',
        image: largeFile
      });

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('圖片文件過大，請限制在10MB以內');
    });

    it('應該處理表單數據解析錯誤', async () => {
      const request = new Request('https://api.test.com/api/chat', {
        method: 'POST',
        body: 'invalid-form-data',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const response = await apiServer.fetch(request, mockEnv);
      
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('應該處理網路超時和連接失敗', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '測試網路失敗',
        function: 'chat',
        model: 'gpt-4o'
      });

      // 模擬網路超時
      global.fetch.mockRejectedValue(new Error('Network timeout'));

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.mode).toBe('test');
      expect(data.text).toContain('測試模式');
    });

    it('應該處理Puter API錯誤回應', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '測試API錯誤',
        function: 'chat',
        model: 'gpt-4o'
      });

      // 模擬Puter API回傳錯誤
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      });

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.mode).toBe('test');
    });

    it('應該處理JSON解析錯誤', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '測試JSON錯誤',
        function: 'chat',
        model: 'gpt-4o'
      });

      // 模擬Puter API回傳無效JSON
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.mode).toBe('test');
    });

    it('應該正確清理和驗證輸入', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '  測試訊息  ',  // 包含前後空格
        function: 'chat',
        model: 'gpt-4o'
      });

      global.fetch.mockRejectedValue(new Error('API unavailable'));

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.text).toContain('測試訊息');  // 應該去除空格
    });

    it('應該處理缺少Content-Type標頭的請求', async () => {
      const request = new Request('https://api.test.com/api/chat', {
        method: 'POST',
        body: new FormData()
      });

      const response = await apiServer.fetch(request, mockEnv);
      
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('API回復性測試', () => {
    it('應該在多次失敗後恢復正常', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '測試恢復性',
        function: 'chat',
        model: 'gpt-4o'
      });

      // 第一次請求失敗
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      let response1 = await apiServer.fetch(request, mockEnv);
      let data1 = await response1.json();
      
      expect(data1.mode).toBe('test');

      // 第二次請求也失敗
      global.fetch.mockRejectedValueOnce(new Error('Server error'));
      let response2 = await apiServer.fetch(request, mockEnv);
      let data2 = await response2.json();
      
      expect(data2.mode).toBe('test');

      // 第三次請求成功（模擬恢復）
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: '正常回應' })
      });
      let response3 = await apiServer.fetch(request, mockEnv);
      let data3 = await response3.json();
      
      expect(response3.status).toBe(200);
      expect(data3.success).toBe(true);
    });

    it('應該處理部分功能失敗的情況', async () => {
      // 語音生成功能失敗，但回退到測試模式
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '測試語音',
        function: 'text-to-speech',
        'tts-language': 'zh-TW'
      });

      global.fetch.mockRejectedValue(new Error('TTS service unavailable'));

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.mode).toBe('test');
      expect(data.text).toContain('語音生成');
    });
  });

  describe('API 文檔頁面', () => {
    it('應該提供 API 文檔', async () => {
      const request = new Request('https://api.test.com/', {
        method: 'GET'
      });

      const response = await apiServer.fetch(request, mockEnv);
      const content = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/html');
      expect(content).toContain('Claude4Free API');
      expect(content).toContain('/health');
      expect(content).toContain('/api/chat');
      expect(content).toContain('test'); // 環境資訊
    });
  });

  describe('真實 API 調用 (成功情況)', () => {
    it('應該處理成功的 Puter API 回應', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '你好',
        function: 'chat',
        model: 'gpt-4o'
      });

      // 模擬成功的 fetch 回應
      global.fetch.mockResolvedValue(new Response(JSON.stringify({
        content: '你好！我是AI助手，很高興為您服務。'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.text).toBe('你好！我是AI助手，很高興為您服務。');
      expect(data.mode).toBeUndefined(); // 不是測試模式
    });
  });

  describe('路由和端點測試', () => {
    it('應該回應 404 對於不存在的端點', async () => {
      const request = new Request('https://api.test.com/nonexistent', {
        method: 'GET'
      });

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('端點不存在');
      expect(data.availableEndpoints).toContain('/health');
      expect(data.availableEndpoints).toContain('/api/chat');
    });

    it('應該回應API文檔頁面', async () => {
      const request = new Request('https://api.test.com/', {
        method: 'GET'
      });

      const response = await apiServer.fetch(request, mockEnv);
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/html');
      expect(html).toContain('Claude4Free API');
      expect(html).toContain('基於 Puter.com');
      expect(html).toContain('版本：2.1');
    });

    it('應該只接受POST請求到/api/chat', async () => {
      const request = new Request('https://api.test.com/api/chat', {
        method: 'GET'
      });

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('端點不存在');
    });
  });
}); 