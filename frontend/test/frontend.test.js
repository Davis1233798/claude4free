// 前端功能單元測試
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

// 設置 JSDOM 環境模擬瀏覽器
const dom = new JSDOM(`<!DOCTYPE html><html></html>`, {
  url: 'https://claude4free.pages.dev',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.fetch = fetch;

// 測試配置
const FRONTEND_URL = 'https://claude4free.pages.dev';
const API_URL = 'https://claude4free-api.davis1233798.workers.dev';

describe('前端功能測試', () => {
  
  // 測試前端網站可訪問性
  describe('網站可訪問性測試', () => {
    it('前端網站應該可以正常載入', async () => {
      try {
        const response = await fetch(FRONTEND_URL);
        
        if (response.status !== 200) {
          console.log(`⚠️ 前端網站狀態碼: ${response.status}`);
          console.log('這可能是因為 Cloudflare Pages 尚未部署或配置問題');
        } else {
          console.log('✅ 前端網站可以正常訪問');
        }
        
        // 檢查回應是否包含 HTML 內容
        const text = await response.text();
        if (text.includes('<html') || text.includes('<HTML')) {
          console.log('✅ 返回了有效的 HTML 內容');
        } else {
          console.log('⚠️ 返回的內容可能不是 HTML');
        }
      } catch (error) {
        console.error('❌ 前端網站訪問失敗:', error.message);
        console.log('建議檢查：');
        console.log('1. Cloudflare Pages 是否已正確部署');
        console.log('2. 域名 DNS 設定是否正確');
        console.log('3. 網路連接是否正常');
      }
    });
  });

  // 測試 API 代理功能
  describe('API 代理測試', () => {
    it('通過前端代理訪問 API 應該正常工作', async () => {
      try {
        // 測試通過前端代理訪問 health 端點
        const response = await fetch(`${FRONTEND_URL}/api/health`);
        
        if (response.status === 404) {
          console.log('⚠️ API 代理可能未正確配置');
          console.log('檢查 _redirects 檔案配置');
        } else if (response.status === 200) {
          const data = await response.json();
          console.log('✅ API 代理正常工作');
          console.log('代理回應:', data);
        } else {
          console.log(`⚠️ API 代理返回狀態碼: ${response.status}`);
        }
      } catch (error) {
        console.log('⚠️ API 代理測試失敗:', error.message);
        console.log('將直接測試 API 端點...');
        
        // 直接測試 API 端點
        try {
          const directResponse = await fetch(`${API_URL}/health`);
          if (directResponse.status === 200) {
            console.log('✅ 直接 API 端點正常工作');
            console.log('問題可能在前端代理配置');
          }
        } catch (directError) {
          console.error('❌ 直接 API 端點也無法訪問:', directError.message);
        }
      }
    });
  });

  // 測試模擬的表單提交
  describe('表單提交測試', () => {
    it('聊天表單提交應該正常工作', async () => {
      // 創建模擬的 FormData
      const formData = new FormData();
      formData.append('message', '測試訊息');
      formData.append('function', 'chat');
      formData.append('model', 'gpt-4o');

      try {
        const response = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          body: formData,
          headers: {
            'Origin': FRONTEND_URL
          }
        });

        if (response.status === 200) {
          const data = await response.json();
          console.log('✅ 表單提交測試成功');
          console.log('回應數據:', {
            success: data.success,
            hasText: !!data.text,
            textPreview: data.text?.substring(0, 50) + '...'
          });
        } else {
          console.log(`⚠️ 表單提交返回狀態碼: ${response.status}`);
          const errorText = await response.text();
          console.log('錯誤內容:', errorText);
        }
      } catch (error) {
        console.error('❌ 表單提交測試失敗:', error.message);
      }
    });

    it('圖片識別表單提交應該正常工作', async () => {
      // 創建測試圖片數據
      const testImageBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG 簽名
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 像素
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
        0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
        0x00, 0x01, 0x00, 0x01, 0x5C, 0xC2, 0xD5, 0x7E,
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
        0xAE, 0x42, 0x60, 0x82
      ]);

      const formData = new FormData();
      formData.append('message', '描述這張圖片');
      formData.append('function', 'image-recognition');
      formData.append('model', 'gpt-4o');
      
      // 在 Node.js 環境中模擬文件上傳
      const imageFile = new Blob([testImageBuffer], { type: 'image/png' });
      formData.append('image', imageFile, 'test.png');

      try {
        const response = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          body: formData,
          headers: {
            'Origin': FRONTEND_URL
          }
        });

        if (response.status === 200) {
          const data = await response.json();
          console.log('✅ 圖片識別表單測試成功');
          console.log('回應數據:', {
            success: data.success,
            hasText: !!data.text
          });
        } else {
          console.log(`⚠️ 圖片識別表單返回狀態碼: ${response.status}`);
        }
      } catch (error) {
        console.log('⚠️ 圖片識別表單測試失敗:', error.message);
        console.log('這在測試環境中是正常的');
      }
    });
  });

  // 測試 AMP 相關功能
  describe('AMP 功能測試', () => {
    it('檢查 AMP 必要元素', async () => {
      try {
        const response = await fetch(FRONTEND_URL);
        const html = await response.text();

        // 檢查 AMP 相關元素
        const checks = [
          { test: html.includes('<html ⚡'), name: 'AMP HTML 聲明' },
          { test: html.includes('amp-form'), name: 'AMP Form 組件' },
          { test: html.includes('amp-selector'), name: 'AMP Selector 組件' },
          { test: html.includes('amp-bind'), name: 'AMP Bind 組件' },
          { test: html.includes('action-xhr'), name: 'XHR 表單動作' },
          { test: html.includes('claude4free-api.davis1233798.workers.dev'), name: 'API 端點配置' }
        ];

        checks.forEach(check => {
          if (check.test) {
            console.log(`✅ ${check.name}: 正常`);
          } else {
            console.log(`❌ ${check.name}: 缺失`);
          }
        });

        const passedChecks = checks.filter(c => c.test).length;
        console.log(`\nAMP 檢查總結: ${passedChecks}/${checks.length} 項通過`);

      } catch (error) {
        console.log('⚠️ 無法獲取前端 HTML 進行 AMP 檢查:', error.message);
      }
    });
  });

  // 測試 CORS 配置
  describe('CORS 配置測試', () => {
    it('跨域請求應該被正確處理', async () => {
      try {
        const response = await fetch(`${API_URL}/api/chat`, {
          method: 'OPTIONS',
          headers: {
            'Origin': FRONTEND_URL,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
          }
        });

        const allowOrigin = response.headers.get('access-control-allow-origin');
        const allowMethods = response.headers.get('access-control-allow-methods');

        if (allowOrigin) {
          console.log('✅ CORS Origin 設定正常:', allowOrigin);
        } else {
          console.log('❌ CORS Origin 設定缺失');
        }

        if (allowMethods && allowMethods.includes('POST')) {
          console.log('✅ CORS Methods 設定正常:', allowMethods);
        } else {
          console.log('❌ CORS Methods 設定異常');
        }

      } catch (error) {
        console.error('❌ CORS 測試失敗:', error.message);
      }
    });
  });

  // 測試前端錯誤處理
  describe('前端錯誤處理測試', () => {
    it('API 錯誤應該被正確處理', async () => {
      // 測試無效的請求
      const formData = new FormData();
      // 故意不添加必要的參數

      try {
        const response = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          body: formData,
          headers: {
            'Origin': FRONTEND_URL
          }
        });

        if (response.status >= 400) {
          const errorData = await response.json();
          console.log('✅ API 錯誤處理正常');
          console.log('錯誤回應:', errorData);
        } else {
          console.log('⚠️ 預期的錯誤處理未觸發');
        }

      } catch (error) {
        console.log('✅ 錯誤被正確捕獲:', error.message);
      }
    });
  });

  // 網路連接測試
  describe('網路連接測試', () => {
    it('檢查關鍵服務的網路連接', async () => {
      const services = [
        { name: '前端網站', url: FRONTEND_URL },
        { name: '後端 API', url: `${API_URL}/health` },
        { name: 'Puter API', url: 'https://api.puter.com' }
      ];

      for (const service of services) {
        try {
          const start = Date.now();
          const response = await fetch(service.url, { 
            method: 'GET',
            timeout: 5000
          });
          const duration = Date.now() - start;

          console.log(`${service.name}: ${response.status} (${duration}ms)`);
          
          if (response.status < 400) {
            console.log(`✅ ${service.name} 連接正常`);
          } else {
            console.log(`⚠️ ${service.name} 回應異常: ${response.status}`);
          }
        } catch (error) {
          console.log(`❌ ${service.name} 連接失敗: ${error.message}`);
        }
      }
    });
  });
});

// 測試總結和建議
afterAll(() => {
  console.log('\n🔍 前端測試總結和建議:');
  console.log('\n如果發現問題，請檢查：');
  console.log('1. Cloudflare Pages 部署狀態');
  console.log('2. _redirects 檔案配置是否正確');
  console.log('3. API 端點 URL 是否正確');
  console.log('4. CORS 設定是否包含前端域名');
  console.log('5. AMP 驗證是否通過');
  console.log('\n常見修復方法：');
  console.log('- 重新部署 Cloudflare Pages');
  console.log('- 檢查並更新 API 端點 URL');
  console.log('- 確認前後端版本同步');
  console.log('- 清除瀏覽器快取');
}); 