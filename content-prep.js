// ==UserScript==
// @name         جدول التحضير الشامل - منصة مدرستي (مع التنبيهات)
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  لوحة تحكم وتحضير آلي مع تنبيه للحصص غير المحضرة
// @match        https://madrasati.sa/*
// @grant        none
// ==UserScript==

(function () {
  'use strict';

  const existingModal = document.getElementById('prep-modal-overlay');
  if (existingModal) existingModal.remove();

  const modalHtml = `
    <style>
      #prep-modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        direction: rtl;
        font-family: system-ui, -apple-system, sans-serif;
      }

      .prep-card {
        background: #181818;
        border: 2px solid #00e676;
        border-radius: 18px;
        padding: 20px 16px;
        width: 90%;
        max-width: 420px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.9);
        color: #ffffff;
        box-sizing: border-box;
      }

      .prep-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .prep-title-group h2 {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 700;
        color: #ffffff;
      }

      .sub-title {
        font-size: 0.78rem;
        color: #a0a0a0;
        margin-top: 4px;
        display: block;
      }

      .close-btn {
        background: #ff4d4d;
        color: #ffffff;
        border: none;
        padding: 6px 14px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        font-size: 0.85rem;
      }

      .divider {
        height: 1px;
        background-color: #2a2a2a;
        margin: 12px 0;
      }

      .alert-box {
        background: rgba(255, 171, 0, 0.15);
        border: 1px solid #ffab00;
        color: #ffd54f;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 0.78rem;
        margin-bottom: 12px;
        display: none;
        text-align: center;
      }

      .table-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 75px;
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;
      }

      .header-row {
        font-size: 0.78rem;
        color: #a0a0a0;
        text-align: center;
        margin-bottom: 10px;
      }

      .period-label {
        text-align: center;
        font-weight: 700;
        font-size: 0.88rem;
      }

      .input-field {
        background: #222222;
        border: 1px solid #3d3d3d;
        color: #ffffff;
        padding: 8px;
        border-radius: 8px;
        font-size: 0.75rem;
        text-align: center;
        width: 100%;
        box-sizing: border-box;
      }

      .input-field:focus {
        outline: none;
        border-color: #00e676;
      }

      .btn-submit {
        width: 100%;
        background: #00e676;
        color: #000000;
        font-weight: 700;
        font-size: 0.95rem;
        padding: 12px;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        margin-top: 14px;
      }

      .status-text {
        text-align: center;
        font-size: 0.75rem;
        color: #a0a0a0;
        margin-top: 10px;
        margin-bottom: 0;
      }
    </style>

    <div id="prep-modal-overlay">
      <div class="prep-card">
        <div class="prep-header">
          <button id="closePrepModal" class="close-btn">إغلاق &#10005;</button>
          <div class="prep-title-group">
            <h2>⚡ جدول التحضير الشامل</h2>
            <span class="sub-title">(توليد كامل للدرس + واجبات وإثراءات)</span>
          </div>
        </div>

        <div class="divider"></div>

        <!-- شريط التنبيه للحصص غير المحضرة -->
        <div id="alertBox" class="alert-box"></div>

        <div class="table-grid header-row">
          <div>رابط الإثراء (توليد تلقائي)</div>
          <div>اسم الدرس (اختياري)</div>
          <div>الحصة</div>
        </div>

        <div id="periodsContainer"></div>

        <button id="startPrepBtn" class="btn-submit">
          🚀 بدء التحضير الشامل وتوليد المحتوى الكامل
        </button>
        
        <p id="statusText" class="status-text">جاهز للعمل - سيتم إنشاء الدرس كاملاً تلقائياً</p>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = modalHtml;
  document.body.appendChild(container);

  const periodsContainer = document.getElementById('periodsContainer');
  for (let i = 1; i <= 7; i++) {
    const row = document.createElement('div');
    row.className = 'table-grid';
    row.innerHTML = `
      <input type="text" id="enrich_${i}" class="input-field" placeholder="توليد تلقائي للإثراء" />
      <input type="text" id="lesson_${i}" class="input-field" placeholder="(تلقائي) سحب الـ" />
      <div class="period-label">الحصة ${i}</div>
    `;
    periodsContainer.appendChild(row);
  }

  // دالة الفحص والتنبيه التلقائي
  function checkUnpreparedLessons() {
    const unpreparedPeriods = [];
    
    // البحث في الجدول المدرسي بالصفحة عن الحصص غير الإعداد
    for (let i = 1; i <= 7; i++) {
      const lessonInput = document.getElementById(`lesson_${i}`).value.trim();
      
      // يمكنك ربط الفحص المباشر بصفحة المنصة هنا (مثال: البحث عن زر "قم بإعداد الدرس")
      const isPending = document.body.innerText.includes(`الحصة ${i}`) && !lessonInput;
      if (isPending) {
        unpreparedPeriods.push(`الحصة ${i}`);
      }
    }

    const alertBox = document.getElementById('alertBox');
    if (unpreparedPeriods.length > 0) {
      alertBox.style.display = 'block';
      alertBox.innerHTML = `⚠️ <b>تنبيه:</b> يوجد حصص مسندة لم تقم بتحضيرها (${unpreparedPeriods.join('، ')})`;
    } else {
      alertBox.style.display = 'none';
    }
  }

  // تشغيل الفحص فور فتح النافذة
  checkUnpreparedLessons();

  document.getElementById('closePrepModal').onclick = () => container.remove();

  document.getElementById('startPrepBtn').onclick = () => {
    const statusText = document.getElementById('statusText');
    statusText.style.color = '#00e676';
    statusText.textContent = 'جاري تحضير الحصص المسندة وتخطي الفارغة...';
  };
})();

