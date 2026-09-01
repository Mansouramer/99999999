// ==UserScript==
// @name         أداة التحضير التلقائي الموحدة 2.0
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  لوحة تحكم وتحضير آلي لمنصة مدرستي
// @match        https://madrasati.sa/*
// @grant        none
// ==UserScript==

(function() {
    'use strict';

    // إنشاء وحقن الواجهة داخل الصفحة
    const container = document.createElement('div');
    container.id = 'prep-modal-root';
    container.innerHTML = `
    <style>
      :root {
        --bg-main: #121212;
        --card-bg: #1e1e1e;
        --input-bg: #2a2a2a;
        --border-color: #333333;
        --primary-accent: #00e676;
        --danger-color: #ff5252;
        --text-main: #ffffff;
        --text-muted: #a0a0a0;
      }

      #prep-modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        direction: rtl;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .prep-card {
        background: var(--card-bg);
        border: 2px solid var(--primary-accent);
        border-radius: 16px;
        padding: 20px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
        color: var(--text-main);
      }

      .prep-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 10px;
      }

      .prep-header h2 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: bold;
      }

      .sub-title {
        font-size: 0.8rem;
        color: var(--text-muted);
        display: block;
        margin-top: 4px;
      }

      .close-btn {
        background: var(--danger-color);
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
      }

      .table-grid {
        display: grid;
        grid-template-columns: 70px 1fr 1fr;
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;
      }

      .header-row {
        font-weight: bold;
        font-size: 0.75rem;
        color: var(--text-muted);
        text-align: center;
        margin-bottom: 10px;
      }

      .period-label {
        text-align: center;
        font-weight: bold;
        font-size: 0.85rem;
      }

      .input-field {
        background: var(--input-bg);
        border: 1px solid var(--border-color);
        color: var(--text-main);
        padding: 8px;
        border-radius: 6px;
        font-size: 0.75rem;
        width: 100%;
        box-sizing: border-box;
      }

      .btn-submit {
        width: 100%;
        background: var(--primary-accent);
        color: #000;
        font-weight: bold;
        font-size: 1rem;
        padding: 12px;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        margin-top: 14px;
      }

      .status-text {
        text-align: center;
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 8px;
      }
    </style>

    <div id="prep-modal-overlay">
      <div class="prep-card">
        <div class="prep-header">
          <div>
            <h2>⚡ جدول التحضير الشامل</h2>
            <span class="sub-title">(توليد كامل للدرس + واجبات وإثراءات)</span>
          </div>
          <button id="closePrepModal" class="close-btn">إغلاق &#10005;</button>
        </div>

        <div class="table-grid header-row">
          <div>الحصة</div>
          <div>اسم الدرس (اختياري)</div>
          <div>رابط الإثراء (توليد تلقائي)</div>
        </div>

        <div id="periodsContainer"></div>

        <button id="startPrepBtn" class="btn-submit">🚀 بدء التحضير الشامل وتوليد المحتوى الكامل</button>
        <p id="statusText" class="status-text">جاهز للعمل - سيتم إنشاء الدرس كاملاً تلقائياً</p>
      </div>
    </div>
    `;

    document.body.appendChild(container);

    // توليد صفوف الحصص من 1 إلى 7
    const periodsContainer = document.getElementById('periodsContainer');
    for (let i = 1; i <= 7; i++) {
      const row = document.createElement('div');
      row.className = 'table-grid';
      row.innerHTML = `
        <div class="period-label">الحصة ${i}</div>
        <input type="text" id="lesson_${i}" class="input-field" placeholder="(تلقائي) سحب الدرس من الخطة" />
        <input type="text" id="enrich_${i}" class="input-field" placeholder="توليد تلقائي للإثراء" />
      `;
      periodsContainer.appendChild(row);
    }

    // إغلاق النافذة
    document.getElementById('closePrepModal').onclick = () => {
      container.remove();
    };

    // تشغيل التحضير
    document.getElementById('startPrepBtn').onclick = () => {
      const statusText = document.getElementById('statusText');
      statusText.style.color = '#00e676';
      statusText.textContent = 'جاري التحضير التلقائي...';
      
      // هنا تضع أكواد التعامل مع عناصر منصة مدرستي مباشرة
    };

})();
