// Jest 測試設置文件
// 配置 Cloudflare Workers 測試環境

// 全局設置
global.fetch = require('node-fetch');
global.FormData = require('form-data');
global.File = class File {
    constructor(chunks, filename, options = {}) {
        this.name = filename;
        this.type = options.type || 'application/octet-stream';
        this.size = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
        this.data = chunks;
    }
    
    arrayBuffer() {
        return Promise.resolve(this.data[0]);
    }
    
    text() {
        return Promise.resolve(new TextDecoder().decode(this.data[0]));
    }
};

// 模擬 Cloudflare Workers 環境
global.Request = class Request {
    constructor(url, options = {}) {
        this.url = url;
        this.method = options.method || 'GET';
        this.headers = new Map(Object.entries(options.headers || {}));
        this.body = options.body;
    }
    
    formData() {
        if (this.body instanceof FormData) {
            return Promise.resolve(this.body);
        }
        return Promise.reject(new Error('Body is not FormData'));
    }
    
    json() {
        if (typeof this.body === 'string') {
            return Promise.resolve(JSON.parse(this.body));
        }
        return Promise.reject(new Error('Body is not JSON'));
    }
};

global.Response = class Response {
    constructor(body, options = {}) {
        this.body = body;
        this.status = options.status || 200;
        this.headers = new Map(Object.entries(options.headers || {}));
        this.ok = this.status >= 200 && this.status < 300;
    }
    
    json() {
        if (typeof this.body === 'string') {
            return Promise.resolve(JSON.parse(this.body));
        }
        return Promise.resolve(this.body);
    }
    
    text() {
        if (typeof this.body === 'object') {
            return Promise.resolve(JSON.stringify(this.body));
        }
        return Promise.resolve(this.body);
    }
};

// 測試超時設置
jest.setTimeout(30000);

// 控制台輸出設置
if (process.env.NODE_ENV === 'test') {
    // 在測試期間降低控制台輸出
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
} 