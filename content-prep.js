/**
 * ===================================================
 * أداة التحضير الذكية - محرك سحب الجدول التلقائي
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrepTool);
} else {
    initPrepTool();
}

function initPrepTool() {
    createFullScheduleUI();
    runAutomationEngine();
}

/**
 * دالة سحب وقراءة الحصص والدروس مباشرة من صفحة جدول مدرستي
 */
async function extractScheduleFromPage() {
    let statusText = document.getElementById('prepStatusText');
    if (statusText) statusText.innerText = "جاري قراءة الحصص والدروس من مدرستي... ⏳";

    // انتظار تحميل عناصر الجدول داخل مدرستي
    await delay(3000);

    // البحث عن أزرار الحصص وخانات الدروس في الجدول
    let scheduleCells = document.querySelectorAll('.schedule-table td, table.table td, .day-cell');
    let prepButtons = Array.from(document.querySelectorAll('a, button, .btn')).filter(el => {
        const text = el.innerText || el.textContent;
        return text.includes("قم بإعداد الدرس") || text.includes("إعداد الدرس") || text.includes("تعديل الإعداد");
    });

    if (prepButtons.length === 0) {
        if (statusText) statusText.innerText = "⚠️ لم يتم العثور على حصص بحاجة للتحضير في هذه الصفحة.";
        return 0;
    }

    // قراءة وتحديث الخانات في اللوحة
    prepButtons.forEach((btn, index) => {
        if (index < 7) {
            let parentCell = btn.closest('td') || btn.closest('.card') || btn.parentElement;
            let lessonName = "درس مقرر";

            if (parentCell) {
                let titleEl = parentCell.querySelector('.subject-name, .lesson-title, h5, h6, span');
                if (titleEl) lessonName = titleEl.innerText.trim();
            }

            let lessonSelect = document.getElementById(`lesson_p${index + 1}`);
            if (lessonSelect) {
                // إضافة الدرس المقروء كخيار نشط في القائمة المنسدلة
                let opt = document.createElement('option');
                opt.value = lessonName;
                opt.innerText = `📌 [سحب آلي]: ${lessonName}`;
                opt.selected = true;
                lessonSelect.appendChild(opt);
            }
        }
    });

    if (statusText) statusText.innerText = `✅ تم سحب ${prepButtons.length} حصة بنجاح من الجدول!`;
    return prepButtons.length;
}

function createFullScheduleUI() {
    if (document.getElementById('prep-schedule-ui')) return;

    const uiBox = document.createElement('div');
    uiBox.id = 'prep-schedule-ui';
    uiBox.style.cssText = `
        position: fixed; top: 15px; left: 3%; right: 3%; z-index: 999999;
        background: #ffffff; border: 2px solid #10b981; padding: 15px;
        border-radius: 12px; box-shadow: 0 4px 25px rgba(0,0,0,0.3);
        font-family: system-ui, sans-serif; direction: rtl; max-height: 88vh; overflow-y: auto;
    `;

    let scienceLessonsHTML = `
        <option value="">-- (تلقائي) سحب الدرس من مدرستي --</option>
        <optgroup label="🔬 علوم">
            <option value="الطقس وفصول السنة">الطقس وفصول السنة</option>
            <option value="المخلوقات الحية وحاجاتها">المخلوقات الحية وحاجاتها</option>
            <option value="المادة وحالاتها">المادة وحالاتها</option>
            <option value="الخلايا والأنسجة">الخلايا والأنسجة</option>
        </optgroup>
    `;

    let rowsHTML = '';
    for (let i = 1; i <= 7; i++) {
        rowsHTML += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding:6px; font-weight:bold; font-size:11px;">الحصة ${i}</td>
                <td style="padding:4px;">
                    <input type="date" id="date_p${i}" style="width:90%; padding:4px; font-size:11px; border-radius:4px; border:1px solid #ccc;" />
                </td>
                <td style="padding:4px;">
                    <select id="lesson_p${i}" style="width:100%; padding:4px; font-size:11px; border-radius:4px; border:1px solid #ccc; background:#fff;">
                        ${scienceLessonsHTML}
                    </select>
                </td>
                <td style="padding:4px;">
                    <input type="url" id="enrichment_p${i}" placeholder="توليد تلقائي للإثراء" style="width:95%; padding:4px; font-size:11px; border-radius:4px; border:1px solid #ccc;" />
                </td>
            </tr>
        `;
    }

    uiBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h3 style="margin:0; color:#1e293b; font-size:14px;">⚡ لوحة تحضير الجدول الشامل</h3>
            <button id="btnCloseUI" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">إغلاق ✖</button>
        </div>

        <div style="margin-bottom:8px; text-align:right;">
            <button id="btnFetchSchedule" style="padding:6px 12px; background:#0284c7; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">
                🔄 إعادة سحب الجدول من الصفحة الحالية
            </button>
        </div>
        
        <table style="width:100%; border-collapse:collapse; margin-bottom:10px; text-align:right;">
            <thead>
                <tr style="background:#f1f5f9; font-size:11px; color:#475569;">
                    <th style="padding:6px; width:10%;">الحصة</th>
                    <th style="padding:6px; width:20%;">التاريخ</th>
                    <th style="padding:6px; width:40%;">اختر الدرس</th>
                    <th style="padding:6px; width:30%;">رابط الإثراء</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHTML}
            </tbody>
        </table>

        <div style="display:flex; gap:10px; align-items:center;">
            <button id="btnStartBulkPrep" style="flex:1; padding:10px; background:#10b981; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
                🚀 حفظ وبدء التحضير التلقائي
            </button>
        </div>
        <div id="prepStatusText" style="margin-top:6px; font-size:10px; color:#64748b; text-align:center;">جاهز للسحب والتحضير</div>
    `;

    document.body.appendChild(uiBox);

    document.getElementById('btnCloseUI').addEventListener('click', () => {
        uiBox.style.display = 'none';
    });

    document.getElementById('btnFetchSchedule').addEventListener('click', () => {
        extractScheduleFromPage();
    });

    // سحب آلي عند التحميل إذا كنا في صفحة الجدول
    if (window.location.href.includes("/Schedule") || window.location.href.includes("/Teacher/Schedule")) {
        extractScheduleFromPage();
    }
}

function runAutomationEngine() {
    // محرك الأتمتة للتحضير
}

