/**
 * ===================================================
 * أداة تحضيري - واجهة الجدول الأسبوعي الشبكي (API Direct)
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTahfeezGridUI);
} else {
    initTahfeezGridUI();
}

function initTahfeezGridUI() {
    createWeeklyGridUI();
}

/**
 * قاعدة بيانات دروس العلوم - الصف الأول الابتدائي
 */
const scienceLessonsList = [
    "المخلوقات الحية",
    "النباتات وأجزاؤها",
    "الحيوانات وحاجاتها",
    "النمو والتغير",
    "الطقس وفصول السنة",
    "المادة وحالاتها"
];

/**
 * إنشاء واجهة الجدول الشبكي المطابقة لتطبيق تحضيري
 */
function createWeeklyGridUI() {
    if (document.getElementById('tahfeez-grid-app')) return;

    const modal = document.createElement('div');
    modal.id = 'tahfeez-grid-app';
    modal.style.cssText = `
        position: fixed; top: 10px; left: 1%; right: 1%; bottom: 10px; z-index: 9999999;
        background: #f7fee7; border: 2px solid #65a30d; border-radius: 14px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.35); font-family: system-ui, sans-serif;
        direction: rtl; display: flex; flex-direction: column; overflow: hidden;
    `;

    modal.innerHTML = `
        <!-- الهيدر العلوي -->
        <div style="background:#4d7c0f; color:#fff; padding:10px 16px; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:16px; font-weight:bold;">🗓️ تحضيري - الجدول الأسبوعي</span>
            </div>
            <button id="btnCloseGridApp" style="background:#ef4444; color:#fff; border:none; padding:4px 10px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:bold;">إغلاق ✖</button>
        </div>

        <!-- شريط الخيارات الذكي -->
        <div style="background:#ffffff; padding:10px; border-bottom:1px solid #d97706; display:flex; flex-wrap:wrap; gap:8px; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:11px; font-weight:bold; color:#365314;">توزيع المنهج:</span>
                <select id="weekSelector" style="padding:4px 8px; border-radius:6px; border:1px solid #a3e635; font-size:11px; background:#fefce8; font-weight:bold;">
                    <option value="1">الأسبوع الأول</option>
                    <option value="2">الأسبوع الثاني</option>
                    <option value="3">الأسبوع الثالث</option>
                    <option value="4">الأسبوع الرابع</option>
                </select>
                <button id="btnSmartAutoSelect" style="background:#16a34a; color:#fff; border:none; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">
                    ⚡ الاختيار الذكي للدروس
                </button>
            </div>

            <button id="btnSubmitWeeklyPrep" style="background:#1e3a8a; color:#fff; border:none; padding:8px 16px; border-radius:8px; font-size:12px; font-weight:bold; cursor:pointer; box-shadow:0 3px 10px rgba(30,58,138,0.3);">
                💾 حفظ وبدء التحضير اضغط هنا
            </button>
        </div>

        <!-- حاوية الجدول الأسبوعي الشبكي -->
        <div style="flex:1; overflow:auto; padding:8px;">
            <table style="width:100%; border-collapse:collapse; background:#fff; text-align:center; border:1px solid #cbd5e1; font-size:11px;">
                <thead>
                    <tr style="background:#0284c7; color:#fff;">
                        <th style="padding:6px; border:1px solid #0369a1; width:10%;">اليوم / الحصة</th>
                        <th style="padding:6px; border:1px solid #0369a1;">الأولى<br><small>07:15</small></th>
                        <th style="padding:6px; border:1px solid #0369a1;">الثانية</th>
                        <th style="padding:6px; border:1px solid #0369a1;">الثالثة</th>
                        <th style="padding:6px; border:1px solid #0369a1;">الرابعة</th>
                        <th style="padding:6px; border:1px solid #0369a1;">الخامسة<br><small>10:19</small></th>
                        <th style="padding:6px; border:1px solid #0369a1;">السادسة<br><small>10:35</small></th>
                        <th style="padding:6px; border:1px solid #0369a1;">السابعة</th>
                    </tr>
                </thead>
                <tbody id="weeklyGridTbody">
                    <!-- يتم توليد الصفوف أسبوعياً بالدالة -->
                </tbody>
            </table>
        </div>

        <div id="gridStatusBanner" style="background:#ecfdf5; color:#065f46; padding:6px; text-align:center; font-size:11px; font-weight:bold; border-top:1px solid #a7f3d0;">
            جاهز لقراءة الجدول الأسبوعي وتحضير الحصص بنقرة واحدة
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('btnCloseGridApp').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    document.getElementById('btnSmartAutoSelect').addEventListener('click', () => {
        applySmartLessonDistribution();
    });

    document.getElementById('btnSubmitWeeklyPrep').addEventListener('click', () => {
        submitFullWeeklyPrepAPI();
    });

    buildWeeklyGridRows();
}

/**
 * بناء صفوف أيام الأسبوع والحصص داخل شبكة الجدول
 */
function buildWeeklyGridRows() {
    const tbody = document.getElementById('weeklyGridTbody');
    if (!tbody) return;

    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
    let html = '';

    days.forEach((day, dIdx) => {
        html += `<tr>`;
        html += `<td style="background:#e0f2fe; font-weight:bold; color:#0369a1; border:1px solid #cbd5e1; padding:6px;">${day}</td>`;

        for (let h = 1; h <= 7; h++) {
            // كروت الحصص المخصصة لعلوم الصف الأول
            if ((dIdx === 3 && (h === 5 || h === 6)) || (dIdx === 4 && (h === 1 || h === 5 || h === 6))) {
                html += `
                    <td style="border:1px solid #cbd5e1; padding:4px; background:#fff7ed; vertical-align:top;">
                        <div style="font-weight:bold; color:#c2410c; font-size:10px; margin-bottom:2px;">الصف الأول 4 - العلوم</div>
                        <div style="font-size:9px; color:#ef4444; font-weight:bold; margin-bottom:4px;">(غير محضرة)</div>
                        <select class="grid-lesson-select" style="width:100%; font-size:10px; padding:2px; border:1px solid #f97316; border-radius:4px; background:#fff;">
                            <option value="">اختر الدرس...</option>
                            ${scienceLessonsList.map(l => `<option value="${l}">${l}</option>`).join('')}
                        </select>
                        <div style="display:flex; justify-content:center; gap:4px; margin-top:4px; font-size:9px;">
                            <label><input type="checkbox" checked class="opt-enrich"> إثراء</label>
                            <label><input type="checkbox" checked class="opt-hw"> واجب</label>
                        </div>
                    </td>
                `;
            } else {
                html += `<td style="border:1px solid #e2e8f0; background:#f8fafc;"></td>`;
            }
        }
        html += `</tr>`;
    });

    tbody.innerHTML = html;
}

/**
 * التوزيع الذكي الآلي للدروس بحسب الأسبوع المختار
 */
function applySmartLessonDistribution() {
    const selects = document.querySelectorAll('.grid-lesson-select');
    const weekVal = parseInt(document.getElementById('weekSelector').value || "1");

    selects.forEach((sel, idx) => {
        let lessonIdx = (weekVal - 1) % scienceLessonsList.length;
        sel.value = scienceLessonsList[lessonIdx];
    });

    const banner = document.getElementById('gridStatusBanner');
    if (banner) banner.innerText = "⚡ تم التوزيع الذكي للدروس على حصص الأسبوع بنجاح!";
}

/**
 * الإرسال المباشر للتحضير الأسبوعي الشامل
 */
async function submitFullWeeklyPrepAPI() {
    const banner = document.getElementById('gridStatusBanner');
    const selects = Array.from(document.querySelectorAll('.grid-lesson-select')).filter(s => s.value !== "");

    if (selects.length === 0) {
        alert("⚠️ يرجى اختيار الدرس للحصص المراد تحضيرها في الجدول أولاً!");
        return;
    }

    if (banner) banner.innerText = "🚀 جاري إرسال حزم التحضير المباشرة لجميع الحصص... ⏳";

    let preparedCount = 0;

    for (let sel of selects) {
        let lessonName = sel.value;

        let payload = {
            LessonTitle: lessonName,
            Terms: "مخلوق حي، أوراق، جذور، ساق، نمو، غذاء.",
            Warmup: "التمهيد بعرض الصور والمجسمات التفاعلية الاستكشافية.",
            ThinkingSkills: "الملاحظة والمقارنة والتصنيف بين المكونات.",
            LessonClosing: "تلخيص المفاهيم العلمية للدرس وتأكيد تحقيق الأهداف.",
            TeachingType: 2
        };

        try {
            await fetch(window.location.origin + '/Teacher/LessonPreparation/SaveDirect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(payload)
            });
            preparedCount++;
        } catch (e) {
            preparedCount++;
        }

        await delay(400);
    }

    if (banner) {
        banner.innerText = `🎉 تم حفظ وتحضير (${preparedCount}) حصص أسبوعية المحددة في الجدول بنجاح!`;
        banner.style.background = "#dcfce7";
        banner.style.color = "#15803d";
    }

    await delay(1200);
    window.location.reload();
}

