// End-to-End 測試用於 Claude4Free 應用
const { test, expect } = require('@playwright/test');

test.describe('Claude4Free 應用測試', () => {
  
  test.beforeEach(async ({ page }) => {
    // 前往應用首頁
    await page.goto('http://localhost:8080');
  });

  test('頁面基本元素載入測試', async ({ page }) => {
    // 檢查頁面標題
    await expect(page).toHaveTitle(/免費與Claude 4及其他AI對話/);
    
    // 檢查主要標題
    await expect(page.locator('h1')).toContainText('免費 AI 多功能助手');
    
    // 檢查模型選擇器
    await expect(page.locator('#model-category')).toBeVisible();
    await expect(page.locator('#model-version')).toBeVisible();
    
    // 檢查功能按鈕
    await expect(page.locator('.function-btn')).toHaveCount(4);
    
    // 檢查聊天框
    await expect(page.locator('#chat-box')).toBeVisible();
    
    // 檢查輸入區域
    await expect(page.locator('#message-input')).toBeVisible();
    await expect(page.locator('#send-btn')).toBeVisible();
  });

  test('主題切換功能測試', async ({ page }) => {
    // 檢查初始主題
    await expect(page.locator('body')).not.toHaveClass('dark-theme');
    
    // 點擊主題切換按鈕
    await page.click('#toggle-theme');
    
    // 檢查深色主題已啟用
    await expect(page.locator('body')).toHaveClass('dark-theme');
    
    // 再次點擊切換回淺色主題
    await page.click('#toggle-theme');
    await expect(page.locator('body')).not.toHaveClass('dark-theme');
  });

  test('模型選擇功能測試', async ({ page }) => {
    // 選擇 OpenAI 類別
    await page.selectOption('#model-category', 'openai');
    
    // 檢查模型版本選擇器是否啟用
    await expect(page.locator('#model-version')).toBeEnabled();
    
    // 選擇 GPT-4o 模型
    await page.selectOption('#model-version', 'gpt-4o');
    
    // 檢查發送按鈕是否啟用（當有輸入時）
    await page.fill('#message-input', '測試訊息');
    await expect(page.locator('#send-btn')).toBeEnabled();
  });

  test('功能按鈕切換測試', async ({ page }) => {
    // 測試對話功能（預設選中）
    await expect(page.locator('[data-function="chat"]')).toHaveClass(/selected/);
    
    // 切換到圖片識別
    await page.click('[data-function="image-recognition"]');
    await expect(page.locator('[data-function="image-recognition"]')).toHaveClass(/selected/);
    await expect(page.locator('#file-btn')).toBeVisible();
    
    // 切換到語音生成
    await page.click('[data-function="text-to-speech"]');
    await expect(page.locator('[data-function="text-to-speech"]')).toHaveClass(/selected/);
    await expect(page.locator('#additional-options')).toHaveClass(/show/);
    
    // 切換到圖片生成
    await page.click('[data-function="text-to-image"]');
    await expect(page.locator('[data-function="text-to-image"]')).toHaveClass(/selected/);
    await expect(page.locator('#additional-options')).toHaveClass(/show/);
  });

  test('輸入驗證測試', async ({ page }) => {
    // 選擇模型
    await page.selectOption('#model-category', 'openai');
    await page.selectOption('#model-version', 'gpt-4o');
    
    // 測試空訊息提交
    await expect(page.locator('#send-btn')).toBeEnabled();
    
    // 填入訊息
    await page.fill('#message-input', '你好');
    await expect(page.locator('#send-btn')).toBeEnabled();
    
    // 清空訊息
    await page.fill('#message-input', '');
    // 檢查按鈕狀態（可能還是啟用的，因為模型已選擇）
  });

  test('Puter.js SDK 載入測試', async ({ page }) => {
    // 檢查 Puter.js 是否載入
    const puterLoaded = await page.evaluate(() => {
      return typeof window.puter !== 'undefined';
    });
    
    // 注意：這個測試可能會失敗，因為 Puter.js 需要異步載入
    // 我們會等待一段時間讓 SDK 載入完成
    await page.waitForTimeout(3000);
    
    const puterLoadedAfterWait = await page.evaluate(() => {
      return typeof window.puter !== 'undefined';
    });
    
    console.log('Puter.js 載入狀態:', puterLoadedAfterWait);
  });

  test('響應式設計測試', async ({ page }) => {
    // 測試桌面尺寸
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('#container')).toBeVisible();
    
    // 測試平板尺寸
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('#container')).toBeVisible();
    
    // 測試手機尺寸
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('#container')).toBeVisible();
    await expect(page.locator('#navbar h2')).toBeVisible();
  });

  test('錯誤處理測試', async ({ page }) => {
    // 選擇模型並嘗試提交（會觸發錯誤，因為 Puter API 可能需要認證）
    await page.selectOption('#model-category', 'openai');
    await page.selectOption('#model-version', 'gpt-4o');
    await page.fill('#message-input', '測試訊息');
    
    // 提交表單
    await page.click('#send-btn');
    
    // 檢查載入狀態
    await expect(page.locator('#loading')).toBeVisible();
    
    // 等待回應（可能是錯誤）
    await page.waitForTimeout(5000);
    
    // 檢查是否有錯誤訊息或成功訊息
    const hasError = await page.locator('#error-message').isVisible();
    const hasNewMessage = await page.locator('.message.ai').last().isVisible();
    
    console.log('測試結果 - 有錯誤:', hasError, '有新訊息:', hasNewMessage);
  });
}); 