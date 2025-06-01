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

  describe('錯誤處理', () => {
    it('應該處理不支援的功能', async () => {
      const request = createFormRequest('https://api.test.com/api/chat', {
        message: '測試',
        function: 'unsupported-function',
        model: 'gpt-4o'
      });

      const response = await apiServer.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('不支援的功能');
    });

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
}); 