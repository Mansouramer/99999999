// ==UserScript==
// @name         جدول التحضير الشامل - علوم الصف الأول (مع الواجبات والخطة)
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  تحضير آلي لمادة العلوم مع إدارة الواجبات وطباعة الخطة الأسبوعية
// @match        https://madrasati.sa/*
// @grant        none
// ==UserScript==

(function () {
  'use strict';

  const existingModal = document.getElementById('prep-modal-overlay');
  if (existingModal) existingModal.remove();

  let savedPlan = JSON.parse(localStorage.getItem('prep_curriculum_plan')) || [
    { week: 'الأسبوع 1', date: '2026-10-04', lesson: 'الخلايا', homework: 'حل أسئلة كتاب الطالب ص 24' },
    { week: 'الأسبوع 2', date: '2026-10-17', lesson: 'الفصول', homework: 'نشاط تفاعلي عبر المنصة ص 40' }
  ];

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
        max-width: 460px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.9);
        color: #ffffff;
        box-sizing: border-box;
      }

      .prep-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .header-actions {
        display: flex;
        gap: 6px;
        align-items: center;
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

      .icon-btn {
        background: #2a2a2a;
        color: #ffffff;
        border: 1px solid #3d3d3d;
        padding: 6px 8px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.8rem;
      }

      .print-btn {
        background: #0288d1;
        color: #ffffff;
        border: none;
        padding: 6px 10px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: bold;
      }

      .close-btn {
        background: #ff4d4d;
        color: #ffffff;
        border: none;
        padding: 6px 10px;
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
        grid-template-columns: 1fr 1fr 1.2fr 65px;
        gap: 5px;
        align-items: center;
        margin-bottom: 8px;
      }

      .header-row {
        font-size: 0.72rem;
        color: #a0a0a0;
        text-align: center;
        margin-bottom: 10px;
      }

      .period-label {
        text-align: center;
        font-weight: 700;
        font-size: 0.82rem;
      }

      .input-field {
        background: #222222;
        border: 1px solid #3d3d3d;
        color: #ffffff;
        padding: 8px 5px;
        border-radius: 8px;
        font-size: 0.72rem;
        text-align: center;
        width: 100%;
        box-sizing: border-box;
      }

      .disabled-row {
        opacity: 0.35;
        pointer-events: none;
      }

      #settingsPanel {
        display: none;
        background: #222222;
        border: 1px solid #00e676;
        border-radius: 12px;
        padding: 12px;
        margin-bottom: 12px;
      }

      .settings-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        margin-bottom: 8px;
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
        margin-top: 10px;
      }

      .status-text {
        text-align: center;
        font-size: 0.75rem;
        color: #a0a0a0;
        margin-top: 10px;
      }
    </style>

    <div id="prep-modal-overlay">
      <div class="prep-card">
        <div class="prep-header">
          <div class="header-actions">
            <button id="closePrepModal" class="close-btn">إغلاق &#10005;</button>
            <button id="printPlanBtn" class="print-btn" title="طباعة الخطة والواجبات">🖨️ طباعة الخطة</button>
            <button id="toggleSettingsBtn" class="icon-btn" title="إعداد الخطة والواجبات">⚙️</button>
          </div>
          <div class="prep-title-group">
            <h2>⚡ تحضير علوم الصف الأول</h2>
            <span class="sub-title">(الدروس + الواجبات + الخطة الأسبوعية)</span>
          </div>
        </div>

        <div class="divider"></div>

        <div id="settingsPanel">
          <div style="font-size: 0.8rem; font-weight: bold; margin-bottom: 8px; color: #00e676;">➕ إضافة درس وتاريخ وواجب:</div>
          <div class="settings-row">
            <input type="text" id="newLessonName" class="input-field" placeholder="اسم الدرس (مثال: الخلايا)" />
            <input type="date" id="newLessonDate" class="input-field" />
          </div>
          <input type="text" id="newLessonHomework" class="input-field" placeholder="تفاصيل الواجب (مثال: ص 24)" style="margin-bottom: 8px;" />
          <button id="saveLessonBtn" class="btn-submit" style="padding: 8px; font-size: 0.85rem;">حفظ في الخطة الأسبوعية</button>
        </div>

        <div id="alertBox" class="alert-box">جاري مطابقة التواريخ والدروس والواجبات...</div>

        <div class="table-grid header-row">
          <div>الواجب المدرسي</div>
          <div>رابط الإثراء</div>
          <div>اسم الدرس</div>
          <div>الحصة</div>
        </div>

        <div id="periodsContainer"></div>

        <button id="startPrepBtn" class="btn-submit">
          🚀 بدء التحضير والتوليد الشامل (مع الواجبات)
        </button>
        
        <p id="statusText" class="status-text">جاهز للعمل - سيتم إسناد الواجبات تلقائياً مع الدرس</p>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = modalHtml;
  document.body.appendChild(container);

  function getAutoLessonByDate() {
    const today = new Date();
    for (let item of savedPlan) {
      const lessonDate = new Date(item.date);
      const allowPrepDate = new Date(lessonDate);
      allowPrepDate.setDate(lessonDate.getDate() - 3);

      const endDate = new Date(lessonDate);
      endDate.setDate(lessonDate.getDate() + 6);

      if (today >= allowPrepDate && today <= endDate) {
        return item;
      }
    }
    return null;
  }

  function buildSchedule() {
    const periodsContainer = document.getElementById('periodsContainer');
    periodsContainer.innerHTML = '';
    
    const activeItem = getAutoLessonByDate();
    const activeLesson = activeItem ? activeItem.lesson : null;
    const activeHomework = activeItem ? (activeItem.homework || 'حل نشاط الصفحة المحددة') : 'تحديد الواجب من الكتاب';
    const alertBox = document.getElementById('alertBox');
    let assignedCount = 0;

    for (let i = 1; i <= 7; i++) {
      let isAssignedScience = false;

      document.querySelectorAll('*').forEach(el => {
        const text = el.innerText || "";
        if (text.includes(`الحصة ${i}`) && text.includes('علوم') && (text.includes('الأول') || text.includes('أول'))) {
          isAssignedScience = true;
        }
      });

      const row = document.createElement('div');
      row.className = 'table-grid';

      if (isAssignedScience) {
        assignedCount++;
        row.innerHTML = `
          <input type="text" id="homework_${i}" class="input-field" value="${activeHomework}" placeholder="الواجب..." />
          <input type="text" id="enrich_${i}" class="input-field" value="https://ien.edu.sa" />
          <input type="text" id="lesson_${i}" class="input-field" value="${activeLesson || 'علوم - الصف الأول'}" placeholder="اسم الدرس..." />
          <div class="period-label">الحصة ${i}</div>
        `;
      } else {
        row.classList.add('disabled-row');
        row.innerHTML = `
          <input type="text" class="input-field" placeholder="-" disabled />
          <input type="text" class="input-field" placeholder="غير مسندة" disabled />
          <input type="text" class="input-field" placeholder="حصة غير مسندة" disabled />
          <div class="period-label">الحصة ${i}</div>
        `;
      }

      periodsContainer.appendChild(row);
    }

    if (activeLesson) {
      alertBox.style.background = 'rgba(0, 230, 118, 0.15)';
      alertBox.style.borderColor = '#00e676';
      alertBox.style.color = '#00e676';
      alertBox.innerHTML = `📅 الدرس: <b>${activeLesson}</b> | 📝 الواجب: <b>${activeHomework}</b>`;
    } else {
      alertBox.style.background = 'rgba(255, 171, 0, 0.15)';
      alertBox.style.borderColor = '#ffab00';
      alertBox.style.color = '#ffd54f';
      alertBox.innerHTML = `⚠️ لم يأنِ موعد تحضير الدرس القادم (يُتاح قبل التاريخ بـ 3 أيام).`;
    }
  }

  buildSchedule();

  // طباعة الخطة الشاملة للدرس والواجبات
  document.getElementById('printPlanBtn').onclick = () => {
    const activeItem = getAutoLessonByDate();
    const lessonName = activeItem ? activeItem.lesson : 'علوم - الصف الأول الابتدائي';
    const lessonDate = activeItem ? activeItem.date : 'محدد بحسب الجدول الأسبوعي';
    const lessonHomework = activeItem ? (activeItem.homework || 'حل أسئلة المراجعة كتاب الطالب') : 'واجب المادة المحدد';

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>خطة التنفيذ والواجبات الأسبوعية - ${lessonName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; direction: rtl; color: #000; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { margin: 5px 0; font-size: 1.5rem; }
          .header h3 { margin: 5px 0; font-size: 1.1rem; color: #444; }
          .meta-table, .plan-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .meta-table td, .plan-table th, .plan-table td { border: 1px solid #000; padding: 8px; text-align: center; font-size: 0.9rem; }
          .plan-table th { background-color: #f2f2f2; font-weight: bold; }
          .section-title { font-weight: bold; background: #e0e0e0; text-align: right; padding-right: 10px; }
          .footer { margin-top: 30px; display: flex; justify-content: space-between; padding: 0 20px; font-weight: bold; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>خطة تنفيذ الدرس والواجبات الأسبوعية</h1>
          <h3>المادة: العلوم | الصف: الأول الابتدائي</h3>
        </div>

        <table class="meta-table">
          <tr>
            <td><b>عنوان الدرس:</b> ${lessonName}</td>
            <td><b>تاريخ التنفيذ:</b> ${lessonDate}</td>
            <td><b>الواجب المقرّر:</b> ${lessonHomework}</td>
          </tr>
        </table>

        <table class="plan-table">
          <thead>
            <tr>
              <th style="width: 22%;">المجال / الأسبوع</th>
              <th>خطة الإجراءات والمهام التعليمية</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="section-title">1. التهيئة والاستكشاف</td>
              <td style="text-align: right;">طرح أسئلة تمهيدية مصورة لاستثارة التفكير، وعرض الفكرة العامة للدرس (${lessonName}).</td>
            </tr>
            <tr>
              <td class="section-title">2. استراتيجيات التدريس</td>
              <td style="text-align: right;">التعلم باللعب، العصف الذهني، التفكير الناقد، والملاحظة المباشرة.</td>
            </tr>
            <tr>
              <td class="section-title">3. خطة الواجبات والمهام</td>
              <td style="text-align: right;">
                <b>الواجب الأساسي:</b> ${lessonHomework}<br>
                <b>طريقة التسليم:</b> إلكترونياً عبر منصة مدرستي / متابعة كتاب الطالب.
              </td>
            </tr>
            <tr>
              <td class="section-title">4. الوسائل والإثراءات</td>
              <td style="text-align: right;">منصة مدرستي، بوابة عين التعليمية، مجسمات معملية، أوراق قياس المهارات.</td>
            </tr>
            <tr>
              <td class="section-title">5. أساليب التقويم</td>
              <td style="text-align: right;">تقويم تشخيصي، الملاحظة أثناء النشاط، تقييم الواجب الأسبوعي.</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div>معلم المادة: ....................</div>
          <div>اعتماد المدير: ....................</div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  document.getElementById('toggleSettingsBtn').onclick = () => {
    const panel = document.getElementById('settingsPanel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  };

  document.getElementById('saveLessonBtn').onclick = () => {
    const lessonName = document.getElementById('newLessonName').value.trim();
    const lessonDate = document.getElementById('newLessonDate').value;
    const lessonHomework = document.getElementById('newLessonHomework').value.trim();

    if (!lessonName || !lessonDate) {
      alert('يرجى إدخال اسم الدرس وتحديد التاريخ بشكل صحيح.');
      return;
    }

    savedPlan.push({ 
      week: `أسبوع جديد`, 
      date: lessonDate, 
      lesson: lessonName,
      homework: lessonHomework || 'حل التدريبات الصفية'
    });
    
    localStorage.setItem('prep_curriculum_plan', JSON.stringify(savedPlan));

    alert(`✅ تم حفظ الدرس والواجب بنجاح!`);
    document.getElementById('newLessonName').value = '';
    document.getElementById('newLessonDate').value = '';
    document.getElementById('newLessonHomework').value = '';
    document.getElementById('settingsPanel').style.display = 'none';

    buildSchedule();
  };

  document.getElementById('closePrepModal').onclick = () => container.remove();

  document.getElementById('startPrepBtn').onclick = () => {
    const statusText = document.getElementById('statusText');
    statusText.style.color = '#00e676';
    statusText.textContent = 'جاري التحضير وإسناد الواجبات تلقائياً...';
  };
})();

