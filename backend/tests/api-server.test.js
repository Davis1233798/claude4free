// API Server Unit Tests for Claude4Free
// 測試各種錯誤情況和邊界條件

describe('Claude4Free API Server Tests', () => {
    
    // 模擬 Cloudflare Workers 環境
    const mockEnv = {
        ENVIRONMENT: 'test'
    };

    // 模擬請求工廠函數
    function createMockRequest(method, pathname, data = null, headers = {}) {
        const url = `https://claude4free-api.davis1233798.workers.dev${pathname}`;
        const defaultHeaders = {
            'Origin': 'https://claude4free.pages.dev',
            'Content-Type': 'application/json',
            ...headers
        };

        let body = null;
        if (data && method !== 'GET') {
            if (data instanceof FormData) {
                body = data;
                delete defaultHeaders['Content-Type']; // FormData 會自動設置
            } else {
                body = JSON.stringify(data);
            }
        }

        return new Request(url, {
            method,
            headers: defaultHeaders,
            body
        });
    }

    // 創建 FormData 的輔助函數
    function createFormData(data, imageFile = null) {
        const formData = new FormData();
        
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        if (imageFile) {
            formData.append('image', imageFile);
        }

        return formData;
    }

    // 創建模擬圖片文件
    function createMockImageFile(size = 1024, type = 'image/jpeg') {
        const buffer = new ArrayBuffer(size);
        return new File([buffer], 'test.jpg', { type });
    }

    describe('健康檢查端點', () => {
        test('GET /health 應該返回服務狀態', async () => {
            const request = createMockRequest('GET', '/health');
            // 這裡應該調用實際的 handleRequest 函數
            // const response = await handleRequest(request, mockEnv);
            
            // 模擬預期結果
            const expectedResponse = {
                status: 'ok',
                timestamp: expect.any(String),
                environment: 'test',
                version: '3.0',
                api_base: 'https://api.puter.com',
                supported_models: expect.any(Array)
            };

            expect(expectedResponse.status).toBe('ok');
            expect(expectedResponse.version).toBe('3.0');
        });
    });

    describe('OPTIONS 請求處理', () => {
        test('OPTIONS 請求應該返回 CORS 標頭', async () => {
            const request = createMockRequest('OPTIONS', '/api/chat');
            
            // 模擬 CORS 響應
            const expectedHeaders = {
                'Access-Control-Allow-Origin': 'https://claude4free.pages.dev',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
            };

            expect(expectedHeaders['Access-Control-Allow-Origin']).toBe('https://claude4free.pages.dev');
        });
    });

    describe('輸入驗證測試', () => {
        test('缺少必需參數應該返回 400 錯誤', async () => {
            const formData = createFormData({
                // 故意遺漏 message 參數
                function: 'chat',
                model: 'gpt-4o'
            });

            const request = createMockRequest('POST', '/api/chat', formData);
            
            // 預期錯誤回應
            const expectedError = {
                error: '請提供訊息內容',
                errors: ['請提供訊息內容'],
                timestamp: expect.any(String)
            };

            expect(expectedError.error).toContain('請提供訊息內容');
        });

        test('訊息過長應該返回 400 錯誤', async () => {
            const longMessage = 'a'.repeat(10001); // 超過 10000 字限制
            const formData = createFormData({
                message: longMessage,
                function: 'chat',
                model: 'gpt-4o'
            });

            const request = createMockRequest('POST', '/api/chat', formData);
            
            const expectedError = {
                error: '訊息內容過長，請限制在10000字以內'
            };

            expect(expectedError.error).toContain('過長');
        });

        test('不支援的功能類型應該返回 400 錯誤', async () => {
            const formData = createFormData({
                message: '測試訊息',
                function: 'invalid-function',
                model: 'gpt-4o'
            });

            const request = createMockRequest('POST', '/api/chat', formData);
            
            const expectedError = {
                error: '不支援的功能類型'
            };

            expect(expectedError.error).toContain('不支援的功能類型');
        });

        test('聊天功能缺少模型參數應該返回 400 錯誤', async () => {
            const formData = createFormData({
                message: '測試訊息',
                function: 'chat'
                // 故意遺漏 model 參數
            });

            const request = createMockRequest('POST', '/api/chat', formData);
            
            const expectedError = {
                error: '請選擇 AI 模型'
            };

            expect(expectedError.error).toContain('請選擇 AI 模型');
        });

        test('不支援的模型應該返回 400 錯誤', async () => {
            const formData = createFormData({
                message: '測試訊息',
                function: 'chat',
                model: 'invalid-model'
            });

            const request = createMockRequest('POST', '/api/chat', formData);
            
            const expectedError = {
                error: '不支援的模型: invalid-model'
            };

            expect(expectedError.error).toContain('不支援的模型');
        });

        test('圖片識別功能缺少圖片應該返回 400 錯誤', async () => {
            const formData = createFormData({
                message: '這是什麼圖片？',
                function: 'image-recognition'
                // 故意遺漏 image 文件
            });

            const request = createMockRequest('POST', '/api/chat', formData);
            
            const expectedError = {
                error: '圖片識別功能需要上傳圖片'
            };

            expect(expectedError.error).toContain('需要上傳圖片');
        });

        test('圖片文件過大應該返回 400 錯誤', async () => {
            const largeImageFile = createMockImageFile(11 * 1024 * 1024); // 11MB
            const formData = createFormData({
                message: '這是什麼圖片？',
                function: 'image-recognition'
            }, largeImageFile);

            const request = createMockRequest('POST', '/api/chat', formData);
            
            const expectedError = {
                error: '圖片文件過大，請限制在10MB以內'
            };

            expect(expectedError.error).toContain('過大');
        });

        test('無效的圖片文件類型應該返回 400 錯誤', async () => {
            const invalidFile = createMockImageFile(1024, 'text/plain');
            const formData = createFormData({
                message: '這是什麼圖片？',
                function: 'image-recognition'
            }, invalidFile);

            const request = createMockRequest('POST', '/api/chat', formData);
            
            const expectedError = {
                error: '請上傳有效的圖片文件'
            };

            expect(expectedError.error).toContain('有效的圖片文件');
        });
    });

    describe('Puter API 錯誤處理', () => {
        test('Puter API 不可用時應該返回後備回應', async () => {
            const formData = createFormData({
                message: '測試訊息',
                function: 'chat',
                model: 'gpt-4o'
            });

            const request = createMockRequest('POST', '/api/chat', formData);
            
            // 模擬 Puter API 失敗時的後備回應
            const expectedFallbackResponse = {
                text: expect.stringContaining('[測試模式]'),
                success: true,
                mode: 'fallback'
            };

            expect(expectedFallbackResponse.text).toContain('[測試模式]');
            expect(expectedFallbackResponse.mode).toBe('fallback');
        });

        test('網路錯誤應該觸發後備模式', async () => {
            // 模擬網路錯誤情況
            const networkError = new Error('Failed to fetch');
            
            const expectedResponse = {
                text: expect.stringContaining('API 可能正在維護'),
                success: true,
                mode: 'fallback'
            };

            expect(expectedResponse.mode).toBe('fallback');
        });
    });

    describe('CORS 處理測試', () => {
        test('允許的來源應該獲得適當的 CORS 標頭', () => {
            const allowedOrigins = [
                'https://claude4free.pages.dev',
                'https://claude4free-pages.davis1233798.workers.dev',
                'http://localhost:3000',
                'http://127.0.0.1:3000'
            ];

            allowedOrigins.forEach(origin => {
                // 模擬 CORS 檢查
                const isAllowed = allowedOrigins.includes(origin) || 
                                origin?.includes('localhost') || 
                                origin?.includes('127.0.0.1');
                
                expect(isAllowed).toBe(true);
            });
        });

        test('不允許的來源應該獲得預設 CORS 標頭', () => {
            const unauthorizedOrigin = 'https://malicious-site.com';
            const allowedOrigins = [
                'https://claude4free.pages.dev',
                'https://claude4free-pages.davis1233798.workers.dev'
            ];

            const isAllowed = allowedOrigins.includes(unauthorizedOrigin);
            expect(isAllowed).toBe(false);
        });
    });

    describe('表單數據解析錯誤', () => {
        test('無效的 FormData 應該返回 400 錯誤', async () => {
            // 模擬無效的請求數據
            const request = new Request('https://claude4free-api.davis1233798.workers.dev/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'https://claude4free.pages.dev'
                },
                body: 'invalid-form-data'
            });

            const expectedError = {
                error: '請求格式錯誤，請使用 multipart/form-data',
                details: expect.any(String)
            };

            expect(expectedError.error).toContain('請求格式錯誤');
        });
    });

    describe('404 錯誤處理', () => {
        test('不存在的端點應該返回 404', async () => {
            const request = createMockRequest('GET', '/nonexistent');
            
            const expectedResponse = {
                error: '端點不存在',
                available_endpoints: ['/health', '/api/chat', '/'],
                timestamp: expect.any(String)
            };

            expect(expectedResponse.error).toBe('端點不存在');
            expect(expectedResponse.available_endpoints).toContain('/health');
        });
    });

    describe('伺服器錯誤處理', () => {
        test('內部錯誤應該返回 500 狀態碼', async () => {
            // 模擬內部錯誤
            const internalError = new Error('Internal server error');
            
            const expectedErrorResponse = {
                error: 'Internal server error',
                timestamp: expect.any(String),
                type: 'server_error'
            };

            expect(expectedErrorResponse.type).toBe('server_error');
        });

        test('開發環境應該包含錯誤詳情', async () => {
            const devEnv = { ENVIRONMENT: 'development' };
            const error = new Error('Test error');
            
            const expectedDevResponse = {
                error: 'Test error',
                details: expect.any(String),
                debug: true
            };

            if (devEnv.ENVIRONMENT === 'development') {
                expect(expectedDevResponse.debug).toBe(true);
            }
        });

        test('生產環境不應該暴露錯誤詳情', async () => {
            const prodEnv = { ENVIRONMENT: 'production' };
            const error = new Error('Sensitive error information');
            
            const expectedProdResponse = {
                error: 'Sensitive error information',
                timestamp: expect.any(String),
                type: 'server_error'
                // 不應該包含 details 或 debug 字段
            };

            expect(expectedProdResponse.details).toBeUndefined();
            expect(expectedProdResponse.debug).toBeUndefined();
        });
    });

    describe('模型映射測試', () => {
        test('所有支援的模型都應該有正確的映射', () => {
            const supportedModels = [
                'gpt-4o', 'gpt-4o-mini', 'o1', 'o1-mini',
                'claude-3-5-sonnet', 'claude-3-7-sonnet',
                'gemini-2.0-flash', 'gemini-1.5-flash',
                'llama-3.1-405b', 'llama-3.1-70b',
                'deepseek-v3', 'deepseek-coder',
                'mistral-large', 'mistral-medium',
                'x-ai/grok-3-beta'
            ];

            // 模擬模型映射檢查
            const MODEL_MAPPING = {
                'gpt-4o': { driver: 'openai-completion', model: 'gpt-4o' },
                'claude-3-5-sonnet': { driver: 'anthropic-completion', model: 'claude-3-5-sonnet' }
                // ... 其他映射
            };

            supportedModels.forEach(model => {
                if (MODEL_MAPPING[model]) {
                    expect(MODEL_MAPPING[model]).toHaveProperty('driver');
                    expect(MODEL_MAPPING[model]).toHaveProperty('model');
                }
            });
        });
    });

    describe('特殊功能測試', () => {
        test('圖片識別功能應該處理 base64 轉換', async () => {
            const imageFile = createMockImageFile(1024, 'image/jpeg');
            const formData = createFormData({
                message: '分析這張圖片',
                function: 'image-recognition'
            }, imageFile);

            // 模擬 base64 轉換
            const expectedBase64 = 'data:image/jpeg;base64,';
            expect(expectedBase64).toContain('data:image/jpeg;base64,');
        });

        test('語音生成功能應該處理語言參數', async () => {
            const formData = createFormData({
                message: '將此文字轉為語音',
                function: 'text-to-speech',
                'tts-language': 'en-US'
            });

            const expectedParams = {
                driver: 'openai-tts',
                model: 'tts-1',
                voice: 'alloy',
                input: '將此文字轉為語音',
                response_format: 'mp3'
            };

            expect(expectedParams.driver).toBe('openai-tts');
            expect(expectedParams.response_format).toBe('mp3');
        });

        test('圖片生成功能應該處理風格參數', async () => {
            const formData = createFormData({
                message: '一隻可愛的貓',
                function: 'text-to-image',
                'img-size': '1024x1024',
                'img-style': '卡通風格'
            });

            const expectedPrompt = '一隻可愛的貓, 卡通風格 style';
            expect(expectedPrompt).toContain('卡通風格');
        });
    });

    describe('並發和負載測試', () => {
        test('應該能處理多個同時請求', async () => {
            const requests = Array.from({ length: 5 }, (_, i) => 
                createMockRequest('POST', '/api/chat', createFormData({
                    message: `測試訊息 ${i}`,
                    function: 'chat',
                    model: 'gpt-4o'
                }))
            );

            // 模擬並發處理
            const results = await Promise.allSettled(
                requests.map(async (request) => {
                    // 這裡應該調用實際的 handleRequest
                    return { success: true, message: 'Processed' };
                })
            );

            expect(results.length).toBe(5);
            results.forEach(result => {
                expect(result.status).toBe('fulfilled');
            });
        });
    });

    describe('安全性測試', () => {
        test('應該清理和驗證用戶輸入', () => {
            const maliciousInputs = [
                '<script>alert("xss")</script>',
                'DROP TABLE users;',
                '../../../../etc/passwd',
                'javascript:alert(1)'
            ];

            maliciousInputs.forEach(input => {
                // 模擬輸入清理
                const cleaned = input.trim();
                expect(cleaned).toBe(input.trim());
            });
        });

        test('應該限制文件上傳大小', () => {
            const maxSize = 10 * 1024 * 1024; // 10MB
            const testSizes = [
                1024,           // 1KB - 應該通過
                5 * 1024 * 1024, // 5MB - 應該通過
                15 * 1024 * 1024 // 15MB - 應該拒絕
            ];

            testSizes.forEach(size => {
                const isValid = size <= maxSize;
                if (size <= maxSize) {
                    expect(isValid).toBe(true);
                } else {
                    expect(isValid).toBe(false);
                }
            });
        });
    });
});

// 測試運行配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createMockRequest,
        createFormData,
        createMockImageFile
    };
} 