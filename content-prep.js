// ==UserScript==
// @name         جدول التحضير الشامل - علوم الصف الأول
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  تحضير آلي لمادة العلوم للصف الأول الابتدائي فقط
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
        background: rgba(0, 0, 0, 0.85);
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
        width: 92%;
        max-width: 430px;
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
        font-size: 1.1rem;
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
        background: rgba(0, 230, 118, 0.15);
        border: 1px solid #00e676;
        color: #00e676;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 0.78rem;
        margin-bottom: 12px;
        text-align: center;
      }

      .table-grid {
        display: grid;
        grid-template-columns: 1fr 1.3fr 70px;
        gap: 6px;
        align-items: center;
        margin-bottom: 8px;
      }

      .header-row {
        font-size: 0.75rem;
        color: #a0a0a0;
        text-align: center;
        margin-bottom: 10px;
      }

      .period-label {
        text-align: center;
        font-weight: 700;
        font-size: 0.85rem;
      }

      .input-field {
        background: #222222;
        border: 1px solid #3d3d3d;
        color: #ffffff;
        padding: 8px 6px;
        border-radius: 8px;
        font-size: 0.75rem;
        text-align: center;
        width: 100%;
        box-sizing: border-box;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
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
            <h2>⚡ تحضير علوم الصف الأول</h2>
            <span class="sub-title">(توليد آلي للدروس والإثراءات - علوم أول)</span>
          </div>
        </div>

        <div class="divider"></div>

        <div id="alertBox" class="alert-box">جاري فحص حصص العلوم للصف الأول...</div>

        <div class="table-grid header-row">
          <div>رابط الإثراء</div>
          <div>درس العلوم (الصف الأول)</div>
          <div>الحصة</div>
        </div>

        <div id="periodsContainer"></div>

        <button id="startPrepBtn" class="btn-submit">
          🚀 بدء التحضير التلقائي لعلوم الصف الأول
        </button>
        
        <p id="statusText" class="status-text">جاهز للعمل - سيتم تحضير حصص علوم أول فقط</p>
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
      <input type="text" id="enrich_${i}" class="input-field" placeholder="توليد إثراء العلوم" />
      <input type="text" id="lesson_${i}" class="input-field" placeholder="سحب درس العلوم..." />
      <div class="period-label">الحصة ${i}</div>
    `;
    periodsContainer.appendChild(row);
  }

  // دالة البحث المخصصة لمادة "علوم - الصف الأول"
  function fetchScienceFirstGrade() {
    const alertBox = document.getElementById('alertBox');
    let scienceCount = 0;

    for (let i = 1; i <= 7; i++) {
      const lessonInput = document.getElementById(`lesson_${i}`);
      const enrichInput = document.getElementById(`enrich_${i}`);
      let scienceLesson = "";

      // البحث عن العناصر التي تحتوي على كلمة "علوم" و "أول" المرتبطة برقم الحصة
      document.querySelectorAll('*').forEach(el => {
        const text = el.innerText || "";
        if (text.includes(`الحصة ${i}`) && text.includes('علوم') && (text.includes('الأول') || text.includes('أول'))) {
          // جلب اسم الدرس بعد الكلمات المفتاحية
          const match = text.match(/(?:درس|موضوع|عنوان):\s*([^\n]+)/);
          scienceLesson = match ? match[1] : "علوم - الصف الأول الابتدائي";
        }
      });

      if (scienceLesson) {
        lessonInput.value = scienceLesson;
        enrichInput.value = "https://ien.edu.sa"; // رابط عين/إثراء علوم أول
        scienceCount++;
      } else {
        lessonInput.value = "";
        lessonInput.placeholder = "ليس علوم أول";
        enrichInput.placeholder = "تجاهل";
      }
    }

    if (scienceCount > 0) {
      alertBox.style.background = 'rgba(0, 230, 118, 0.15)';
      alertBox.style.borderColor = '#00e676';
      alertBox.style.color = '#00e676';
      alertBox.innerHTML = `✅ تم العثور على (${scienceCount}) حصة علوم للصف الأول الابتدائي.`;
    } else {
      alertBox.style.background = 'rgba(255, 171, 0, 0.15)';
      alertBox.style.borderColor = '#ffab00';
      alertBox.style.color = '#ffd54f';
      alertBox.innerHTML = `⚠️ تنبيه: لا توجد حصص علوم مسندة للصف الأول اليوم.`;
    }
  }

  // تشغيل الفحص
  fetchScienceFirstGrade();

  document.getElementById('closePrepModal').onclick = () => container.remove();

  document.getElementById('startPrepBtn').onclick = () => {
    const statusText = document.getElementById('statusText');
    statusText.style.color = '#00e676';
    statusText.textContent = 'جاري تنفيذ تحضير حصص علوم الصف الأول...';
  };
})();

