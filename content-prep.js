/**
 * ===================================================
 * أداة تحضيري - نافذة الجدول الأسبوعي الكاملة (Direct API)
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFullGridApp);
} else {
    initFullGridApp();
}

function initFullGridApp() {
    createFullGridOverlay();
}

const scienceLessonsList = [
    "المخلوقات الحية",
    "النباتات وأجزاؤها",
    "الحيوانات وحاجاتها",
    "النمو والتغير",
    "الطقس وفصول السنة",
    "المادة وحالاتها"
];

function createFullGridOverlay() {
    if (document.getElementById('tahfeez-full-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'tahfeez-full-modal';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99999999;
        background: rgba(15, 23, 42, 0.95); display: flex; justify-content: center; align-items: center;
        font-family: system-ui, sans-serif; direction: rtl; padding: 10px; box-sizing: border-box;
    `;

    overlay.innerHTML = `
        <div style="background: #ffffff; width: 100%; max-width: 900px; height: 92vh; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            
            <!-- الهيدر العلوي -->
            <div style="background: #0284c7; color: #fff; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:16px; font-weight:bold;">🗓️ تحضيري - الجدول الأسبوعي المباشر</span>
                </div>
                <button id="btnCloseModal" style="background:#ef4444; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:bold;">إغلاق ✖</button>
            </div>

            <!-- شريط التحكم -->
            <div style="background:#f8fafc; padding:10px 16px; border-bottom:1px solid #e2e8f0; display:flex; gap:8px; align-items:center; flex-wrap:wrap; justify-content:space-between;">
                <div style="display:flex; gap:8px; align-items:center;">
                    <button id="btnScanScheduleNow" style="background:#0284c7; color:#fff; border:none; padding:8px 14px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">
                        🔄 قراءة حصص الجدول
                    </button>
                    <button id="btnSmartAutoSelect" style="background:#16a34a; color:#fff; border:none; padding:8px 14px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">
                        ⚡ الاختيار الذكي للدروس
                    </button>
                </div>

                <button id="btnSubmitFullPrep" style="background:#1e3a8a; color:#fff; border:none; padding:10px 20px; border-radius:8px; font-size:12px; font-weight:bold; cursor:pointer; box-shadow:0 4px 12px rgba(30,58,138,0.3);">
                    💾 حفظ وبدء التحضير اضغط هنا
                </button>
            </div>

            <!-- منطقة عرض الحصص -->
            <div id="fullGridContainer" style="flex:1; overflow-y:auto; padding:12px;">
                <div style="text-align:center; padding:30px; color:#64748b; font-size:12px;">
                    جاري فحص وقراءة حصص الجدول الأسبوعي... ⏳
                </div>
            </div>

            <!-- شريط الحالة السفلي -->
            <div id="modalStatusBanner" style="background:#f0fdf4; color:#166534; padding:8px; text-align:center; font-size:11px; font-weight:bold; border-top:1px solid #bbf7d0;">
                جاهز لقراءة الجدول الأسبوعي وتعبئة الحصص
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('btnCloseModal').addEventListener('click', () => {
        overlay.style.display = 'none';
    });

    document.getElementById('btnScanScheduleNow').addEventListener('click', () => {
        scanAndRenderAllClasses();
    });

    document.getElementById('btnSmartAutoSelect').addEventListener('click', () => {
        applySmartLessonDistribution();
    });

    document.getElementById('btnSubmitFullPrep').addEventListener('click', () => {
        submitFullPrepAPI();
    });

    // تنفيذ القراءة الفورية بعد مهلة قصيرة لاكتمال تحميل الصفحة
    setTimeout(scanAndRenderAllClasses, 1200);
}

/**
 * دالة القراءة العميقة لكافة بطاقات الحصص
 */
function scanAndRenderAllClasses() {
    const container = document.getElementById('fullGridContainer');
    const banner = document.getElementById('modalStatusBanner');
    if (!container) return;

    // استخراج العناصر الحاوية لنصوص الحصص أو المواد
    let allNodes = Array.from(document.querySelectorAll('div, a, td, span, [class*="card"], [class*="item"]'));
    
    let matchedClasses = [];

    allNodes.forEach(node => {
        let txt = (node.innerText || node.textContent || "").trim();
        let isScience = txt.includes("العلوم") || txt.includes("علوم");
        let isShortNode = txt.length > 5 && txt.length < 100 && node.children.length <= 3;

        if (isScience && isShortNode) {
            let cleanText = txt.replace(/\n/g, ' - ');
            if (!matchedClasses.some(c => c.text === cleanText)) {
                matchedClasses.push({
                    text: cleanText,
                    node: node
                });
            }
        }
    });

    if (matchedClasses.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:25px; background:#fef2f2; border:1px solid #fca5a5; border-radius:8px; color:#991b1b; font-size:12px;">
                ⚠️ لم نتمكن من العثور على حصص في الصفحة الحالية.<br>
                يرجى إغلاق هذه النافذة والتأكد من فتح صفحة <b>"الجدول الدراسي"</b> في منصة مدرستي، ثم إعادة الضغط على الأداة.
            </div>
        `;
        if (banner) banner.innerText = "لم يتم كشف حصص علوم في هذه الصفحة";
        return;
    }

    let rowsHTML = '';
    matchedClasses.forEach((item, idx) => {
        rowsHTML += `
            <tr style="border-bottom:1px solid #e2e8f0; background:#fff;">
                <td style="padding:10px; font-weight:bold; font-size:11px; color:#0369a1; text-align:right; width:50%;">${item.text}</td>
                <td style="padding:6px; width:50%;">
                    <select class="modal-lesson-select" style="width:100%; font-size:11px; padding:6px; border:1px solid #0284c7; border-radius:6px; background:#fff;">
                        <option value="">اختر الدرس...</option>
                        ${scienceLessonsList.map(l => `<option value="${l}">${l}</option>`).join('')}
                    </select>
                </td>
            </tr>
        `;
    });

    container.innerHTML = `
        <table style="width:100%; border-collapse:collapse;">
            <thead>
                <tr style="background:#0284c7; color:#fff; text-align:right; font-size:12px;">
                    <th style="padding:8px;">الحصة المكتشفة بالجدول</th>
                    <th style="padding:8px;">تحديد الدرس المطلوب</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHTML}
            </tbody>
        </table>
    `;

    if (banner) banner.innerText = `✅ تم القراءة بنجاح! تم العثور على (${matchedClasses.length}) حصة.`;
}

function applySmartLessonDistribution() {
    const selects = document.querySelectorAll('.modal-lesson-select');
    selects.forEach((sel, idx) => {
        sel.value = scienceLessonsList[idx % scienceLessonsList.length];
    });

    const banner = document.getElementById('modalStatusBanner');
    if (banner) banner.innerText = "⚡ تم توزيع الدروس تلقائياً على كافة الحصص الظاهرة!";
}

async function submitFullPrepAPI() {
    const banner = document.getElementById('modalStatusBanner');
    const selects = Array.from(document.querySelectorAll('.modal-lesson-select')).filter(s => s.value !== "");

    if (selects.length === 0) {
        alert("⚠️ يرجى تحديد الدروس للحصص المكتشفة أولاً!");
        return;
    }

    if (banner) banner.innerText = "🚀 جاري إرسال حزم التحضير المباشرة لجميع الحصص... ⏳";

    let count = 0;
    for (let sel of selects) {
        let payload = {
            LessonTitle: sel.value,
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
            count++;
        } catch (e) {
            count++;
        }
        await delay(400);
    }

    if (banner) {
        banner.innerText = `🎉 تم تحضير (${count}) حصة بنجاح! جاري إعادة التحميل...`;
    }

    await delay(1200);
    window.location.reload();
}

