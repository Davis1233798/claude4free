// Vitest 測試環境設置
import { vi } from 'vitest';

// 模擬 FormData 如果不存在
if (!global.FormData) {
  global.FormData = class FormData {
    constructor() {
      this.data = new Map();
    }
    
    append(key, value) {
      this.data.set(key, value);
    }
    
    get(key) {
      return this.data.get(key);
    }
    
    has(key) {
      return this.data.has(key);
    }
  };
}

// 模擬 fetch API
global.fetch = vi.fn();

// 模擬 Response 類別
global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.ok = this.status >= 200 && this.status < 300;
  }
  
  async json() {
    return JSON.parse(this.body);
  }
  
  async text() {
    return this.body;
  }
};

// 模擬 Request 類別 (改進版)
global.Request = class Request {
  constructor(url, init = {}) {
    this.url = url;
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.body = init.body;
    this._formData = null;
    
    // 如果 body 是 FormData，儲存引用
    if (init.body instanceof FormData) {
      this._formData = init.body;
    }
  }
  
  async formData() {
    // 如果有儲存的 FormData，直接返回
    if (this._formData) {
      return this._formData;
    }
    
    // 否則創建新的 FormData
    const formData = new FormData();
    if (this.body && typeof this.body === 'string') {
      const params = new URLSearchParams(this.body);
      for (const [key, value] of params) {
        formData.append(key, value);
      }
    }
    return formData;
  }
};

// 模擬 Headers 類別
if (!global.Headers) {
  global.Headers = Map;
}

// 模擬 URL 類別 (通常已存在，但確保可用)
if (!global.URL) {
  global.URL = class URL {
    constructor(url) {
      const parsed = new globalThis.URL(url);
      this.pathname = parsed.pathname;
      this.search = parsed.search;
      this.searchParams = parsed.searchParams;
    }
  };
}

// 模擬 Blob 類別用於文件上傳測試
if (!global.Blob) {
  global.Blob = class Blob {
    constructor(content, options = {}) {
      this.content = content;
      this.type = options.type || '';
      this.size = content.reduce((size, chunk) => size + chunk.length, 0);
    }
  };
}

console.log('測試環境設置完成 - Cloudflare Workers 環境模擬'); 