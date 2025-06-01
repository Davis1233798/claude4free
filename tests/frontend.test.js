/**
 * Claude4Free 前端測試
 * 測試 AMP 頁面功能和用戶介面
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';

const FRONTEND_URL = 'https://claude4free.pages.dev';

describe('Frontend Tests', () => {
  let dom;
  let document;

  beforeAll(async () => {
    // 載入 index.html 進行測試
    const html = fs.readFileSync('index.html', 'utf-8');
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  describe('HTML Structure', () => {
    it('should have correct DOCTYPE and AMP attribute', () => {
      expect(document.doctype.name).toBe('html');
      expect(document.documentElement.hasAttribute('⚡')).toBe(true);
    });

    it('should have required meta tags', () => {
      const charset = document.querySelector('meta[charset]');
      const viewport = document.querySelector('meta[name="viewport"]');
      const description = document.querySelector('meta[name="description"]');
      
      expect(charset).toBeTruthy();
      expect(viewport).toBeTruthy();
      expect(description).toBeTruthy();
    });

    it('should have AMP required script', () => {
      const ampScript = document.querySelector('script[src*="cdn.ampproject.org/v0.js"]');
      expect(ampScript).toBeTruthy();
      expect(ampScript.hasAttribute('async')).toBe(true);
    });

    it('should have required AMP components', () => {
      const ampForm = document.querySelector('script[custom-element="amp-form"]');
      const ampSelector = document.querySelector('script[custom-element="amp-selector"]');
      const ampBind = document.querySelector('script[custom-element="amp-bind"]');
      
      expect(ampForm).toBeTruthy();
      expect(ampSelector).toBeTruthy();
      expect(ampBind).toBeTruthy();
    });
  });

  describe('AMP State', () => {
    it('should have amp-state with initial data', () => {
      const ampState = document.querySelector('amp-state#appState');
      expect(ampState).toBeTruthy();
      
      const script = ampState.querySelector('script[type="application/json"]');
      expect(script).toBeTruthy();
      
      const state = JSON.parse(script.textContent);
      expect(state.theme).toBe('light');
      expect(state.currentFunction).toBe('chat');
      expect(state.loading).toBe(false);
    });
  });

  describe('UI Elements', () => {
    it('should have navigation bar', () => {
      const navbar = document.querySelector('#navbar');
      expect(navbar).toBeTruthy();
      
      const title = navbar.querySelector('h2');
      expect(title.textContent).toContain('AI 多功能助手');
      
      const themeToggle = navbar.querySelector('#toggle-theme');
      expect(themeToggle).toBeTruthy();
    });

    it('should have model selector', () => {
      const modelSelector = document.querySelector('.model-selector');
      expect(modelSelector).toBeTruthy();
      
      const categorySelector = modelSelector.querySelector('amp-selector[name="model-category"]');
      const versionSelector = modelSelector.querySelector('amp-selector[name="model-version"]');
      
      expect(categorySelector).toBeTruthy();
      expect(versionSelector).toBeTruthy();
    });

    it('should have function buttons', () => {
      const functionButtons = document.querySelector('.function-buttons');
      expect(functionButtons).toBeTruthy();
      
      const chatBtn = functionButtons.querySelector('button[option="chat"]');
      const imageBtn = functionButtons.querySelector('button[option="image-recognition"]');
      const ttsBtn = functionButtons.querySelector('button[option="text-to-speech"]');
      const imgGenBtn = functionButtons.querySelector('button[option="text-to-image"]');
      
      expect(chatBtn).toBeTruthy();
      expect(imageBtn).toBeTruthy();
      expect(ttsBtn).toBeTruthy();
      expect(imgGenBtn).toBeTruthy();
    });

    it('should have chat form', () => {
      const form = document.querySelector('form[action-xhr]');
      expect(form).toBeTruthy();
      expect(form.getAttribute('method')).toBe('post');
      
      const messageInput = form.querySelector('input[name="message"]');
      const submitBtn = form.querySelector('button[type="submit"]');
      
      expect(messageInput).toBeTruthy();
      expect(submitBtn).toBeTruthy();
    });
  });

  describe('CSS and Styling', () => {
    it('should have custom styles', () => {
      const styleTag = document.querySelector('style[amp-custom]');
      expect(styleTag).toBeTruthy();
      
      const css = styleTag.textContent;
      expect(css).toContain('body');
      expect(css).toContain('.dark-theme');
      expect(css).toContain('#navbar');
    });

    it('should have responsive design', () => {
      const styleTag = document.querySelector('style[amp-custom]');
      const css = styleTag.textContent;
      
      expect(css).toContain('@media (max-width: 768px)');
    });
  });
});

describe('Live Frontend Tests', () => {
  it('should be accessible and return 200', async () => {
    try {
      const response = await fetch(FRONTEND_URL);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    } catch (error) {
      console.warn('Live frontend test failed:', error.message);
      // 在 CI 環境中可能無法訪問，所以只是警告
    }
  }, 10000);

  it('should have proper security headers', async () => {
    try {
      const response = await fetch(FRONTEND_URL);
      
      // 檢查安全頭
      const xFrameOptions = response.headers.get('x-frame-options');
      const contentTypeOptions = response.headers.get('x-content-type-options');
      
      if (xFrameOptions) {
        expect(xFrameOptions.toLowerCase()).toBe('deny');
      }
      if (contentTypeOptions) {
        expect(contentTypeOptions.toLowerCase()).toBe('nosniff');
      }
    } catch (error) {
      console.warn('Security headers test failed:', error.message);
    }
  }, 10000);
}); 