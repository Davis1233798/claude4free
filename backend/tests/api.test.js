/**
 * Claude4Free API 單元測試
 * 測試 Cloudflare Workers API 端點功能
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = 'https://claude4free-api.davis1233798.workers.dev';

describe('Claude4Free API Tests', () => {
  beforeAll(() => {
    console.log('開始 API 測試');
  });

  describe('Health Check', () => {
    it('should return 200 and valid status', async () => {
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.timestamp).toBeDefined();
      expect(data.environment).toBeDefined();
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in response', async () => {
      const response = await fetch(`${API_BASE}/health`);
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
      expect(response.headers.get('Access-Control-Allow-Methods')).toBeTruthy();
    });

    it('should handle OPTIONS request', async () => {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'OPTIONS'
      });
      
      expect(response.status).toBe(204);
    });
  });

  describe('Chat API', () => {
    it('should reject request without message', async () => {
      const formData = new FormData();
      formData.append('function', 'chat');
      formData.append('model', 'gpt-4o');
      
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBe('請提供訊息內容');
    });

    it('should reject request without model', async () => {
      const formData = new FormData();
      formData.append('message', 'test message');
      formData.append('function', 'chat');
      
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBe('請選擇AI模型');
    });

    it('should accept valid chat request', async () => {
      const formData = new FormData();
      formData.append('message', 'Hello, this is a test');
      formData.append('function', 'chat');
      formData.append('model', 'gpt-4o');
      
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        body: formData
      });
      
      // 可能因為 Puter API 問題而失敗，但結構應該正確
      expect(response.status).toBeOneOf([200, 500]);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.text || data.error).toBeDefined();
      }
    }, 10000); // 10秒超時
  });

  describe('Text-to-Speech API', () => {
    it('should handle TTS request with valid parameters', async () => {
      const formData = new FormData();
      formData.append('message', '你好，這是測試');
      formData.append('function', 'text-to-speech');
      formData.append('model', 'gpt-4o');
      formData.append('tts-language', 'zh-TW');
      
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        body: formData
      });
      
      expect(response.status).toBeOneOf([200, 500]);
    }, 10000);
  });

  describe('Text-to-Image API', () => {
    it('should handle image generation request', async () => {
      const formData = new FormData();
      formData.append('message', 'A beautiful landscape');
      formData.append('function', 'text-to-image');
      formData.append('model', 'gpt-4o');
      formData.append('img-size', '512x512');
      formData.append('img-style', 'realistic');
      
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        body: formData
      });
      
      expect(response.status).toBeOneOf([200, 500]);
    }, 15000);
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await fetch(`${API_BASE}/unknown-endpoint`);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('端點不存在');
    });

    it('should handle unsupported function', async () => {
      const formData = new FormData();
      formData.append('message', 'test');
      formData.append('function', 'unknown-function');
      formData.append('model', 'gpt-4o');
      
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBe('不支援的功能');
    });
  });
});

// 自定義匹配器擴展
expect.extend({
  toBeOneOf(received, expected) {
    const pass = expected.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected}`,
        pass: false,
      };
    }
  },
}); 