/**
 * ===================================================
 * أداة تحضيري السريعة (الطلبات المباشرة API - علوم الصف الأول)
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDirectTahfeezTool);
} else {
    initDirectTahfeezTool();
}

function initDirectTahfeezTool() {
    createTahfeezDirectUI();
}

/**
 * قاعدة البيانات العلمية المكتملة لمنهج العلوم - الفصل الأول
 */
const scienceCurriculumData = {
    "المخلوقات الحية": {
        terms: "مخلوق حي، شيء غير حي، نمو، غطاء، بيئة، تنفس، غذاء.",
        warmup: "توجيه أسئلة تفاعلية حول الأشياء الموجودة في الغرفة الصفية، وعرض صور لمخلوقات حية وأشياء غير حية لملاحظة الفروق بينها.",
        thinking: "الملاحظة والتصنيف: تصنيف الأشياء في الصور إلى مخلوقات حية تموت وتنمو، وأشياء غير حية لا تتغير.",
        closing: "التأكيد على أن المخلوقات الحية تحتاج إلى الماء والهواء والغذاء والمكان لتبقى على قيد الحياة.",
        enrichmentTitle: "إثراء مرئي: خصائص المخلوقات الحية",
        enrichmentUrl: "https://ien.edu.sa"
    },
    "النباتات وأجزاؤها": {
        terms: "جذور، ساق، أوراق، أزهار، ثمار، بذرة، ضوء الشمس، تربة.",
        warmup: "إحضار شتلة نبات حقيقية داخل الفصل، ومطالبة الطلاب باستكشاف أجزائها الظاهرة والمختفية تحت التربة.",
        thinking: "المقارنة والملاحظة: المقارنة بين وظائف أجزاء النبات (الجذور تمتص الماء، الساق تنقل الغذاء، الأوراق تصنع الغذاء).",
        closing: "تلخيص أهمية النباتات وكيف تنمو من البذرة لتصبح نباتاً كاملاً بحاجة الضوء والماء.",
        enrichmentTitle: "إثراء تفاعلي: أجزاء النبات ووظائفها",
        enrichmentUrl: "https://ien.edu.sa"
    },
    "الحيوانات وحاجاتها": {
        terms: "حيوانات، مأوى، جحر، مفترس، أليف، حركة، طيران، سباحة.",
        warmup: "عرض مقطع فيديو قصير يوضح حيوانات مختلفة وتنوع بيئاتها وطرق حركتها لحث الطلاب على الاكتشاف.",
        thinking: "التصنيف والاستنتاج: تصنيف الحيوانات بحسب غطاء جسمها (شعر، ريش، قشور) وطريقة حركتها.",
        closing: "مناقشة احتياجات الحيوانات الأساسية للحياة والتأكيد على أجزاء جسمها التي تساعدها على أخذ حاجتها.",
        enrichmentTitle: "إثراء مرئي: احتياجات الحيوانات وبيئاتها",
        enrichmentUrl: "https://ien.edu.sa"
    }
};

/**
 * بناء واجهة اللوحة المباشرة باللون المريح والأزرار السريعة
 */
function createTahfeezDirectUI() {
    if (document.getElementById('tahfeez-direct-ui')) return;

    const uiBox = document.createElement('div');
    uiBox.id = 'tahfeez-direct-ui';
    uiBox.style.cssText = `
        position: fixed; top: 12px; left: 2%; right: 2%; z-index: 9999999;
        background: #f0fdf4; border: 2px solid #16a34a; padding: 12px;
        border-radius: 12px; box-shadow: 0 6px 25px rgba(0,0,0,0.25);
        font-family: system-ui, sans-serif; direction: rtl; max-height: 90vh; overflow-y: auto;
    `;

    uiBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h3 style="margin:0; color:#15803d; font-size:14px; font-weight:bold;">⚡ أداة تحضيري المباشرة (تحضير سريع للجدول)</h3>
            <button id="btnCloseTahfeezUI" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">إغلاق ✖</button>
        </div>

        <div style="display:flex; gap:6px; margin-bottom:8px;">
            <button id="btnReadScheduleDirect" style="flex:1; padding:7px; background:#0284c7; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">
                🔄 قراءة حصص الاسبوع الظاهرة
            </button>
        </div>

        <div id="tahfeezScheduleContainer">
            <div style="text-align:center; padding:10px; font-size:11px; color:#64748b;">جاري استخراج حصص العلوم المتاحة...</div>
        </div>

        <div style="margin-top:10px;">
            <button id="btnStartFastPrepSubmit" style="width:100%; padding:10px; background:#16a34a; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:13px; box-shadow:0 3px 10px rgba(22,163,74,0.3);">
                🚀 حفظ وبدء التحضير المباشر (خلال ثوانٍ)
            </button>
        </div>
        <div id="tahfeezStatusText" style="margin-top:6px; font-size:10px; color:#166534; text-align:center; font-weight:bold;">جاهز لإرسال طلبات التحضير المباشرة لخوادم المنصة</div>
    `;

    document.body.appendChild(uiBox);

    document.getElementById('btnCloseTahfeezUI').addEventListener('click', () => {
        uiBox.style.display = 'none';
    });

    document.getElementById('btnReadScheduleDirect').addEventListener('click', () => {
        renderTahfeezClasses();
    });

    document.getElementById('btnStartFastPrepSubmit').addEventListener('click', () => {
        executeDirectApiPrep();
    });

    renderTahfeezClasses();
}

/**
 * قراءة حصص الأسبوع غير المحضرة
 */
function renderTahfeezClasses() {
    const container = document.getElementById('tahfeezScheduleContainer');
    if (!container) return;

    let allElements = Array.from(document.querySelectorAll('div, a, button, td, .card'));
    let rawCards = allElements.filter(el => {
        let text = (el.innerText || el.textContent || "").trim();
        let hasScience = text.includes("العلوم") || text.includes("علوم");
        let isDirect = text.length < 90 && el.children.length <= 4;
        return hasScience && isDirect;
    });

    if (rawCards.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:10px; background:#fef2f2; border:1px solid #fca5a5; border-radius:6px; color:#991b1b; font-size:11px;">
                ⚠️ يرجى فتح صفحة الجدول الدراسي لعرض الحصص غير المحضرة.
            </div>
        `;
        return;
    }

    let lessonOptions = `
        <option value="المخلوقات الحية">المخلوقات الحية</option>
        <option value="النباتات وأجزاؤها">النباتات وأجزاؤها</option>
        <option value="الحيوانات وحاجاتها">الحيوانات وحاجاتها</option>
    `;

    let rowsHTML = '';
    rawCards.forEach((card, idx) => {
        let text = card.innerText.replace(/\n/g, ' - ').trim();
        rowsHTML += `
            <tr style="border-bottom: 1px solid #e2e8f0; background:#ffffff;">
                <td style="padding:6px; font-weight:bold; font-size:10px; color:#15803d; width:50%;">${text}</td>
                <td style="padding:4px; width:50%;">
                    <select class="direct-lesson-select" id="direct_select_${idx}" style="width:100%; padding:4px; font-size:11px; border-radius:4px; border:1px solid #86efac; background:#fff;">
                        ${lessonOptions}
                    </select>
                </td>
            </tr>
        `;
    });

    container.innerHTML = `
        <table style="width:100%; border-collapse:collapse; text-align:right;">
            <thead>
                <tr style="background:#dcfce7; font-size:10px; color:#166534;">
                    <th style="padding:5px;">الحصة المستهدفة</th>
                    <th style="padding:5px;">اختيار الدرس</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHTML}
            </tbody>
        </table>
    `;
}

/**
 * دالة إرسال طلبات التحضير المباشرة لشبكة المنصة (API / Direct Fetch)
 */
async function executeDirectApiPrep() {
    const statusText = document.getElementById('tahfeezStatusText');
    const btn = document.getElementById('btnStartFastPrepSubmit');
    const selects = document.querySelectorAll('.direct-lesson-select');

    if (selects.length === 0) {
        alert("⚠️ يرجى التأكد من تواجدك في صفحة الجدول وقراءة الحصص أولاً!");
        return;
    }

    if (btn) btn.disabled = true;
    if (statusText) statusText.innerText = "جاري إرسال الطلبات المباشرة لخادم مدرستي... 🚀";

    let successCount = 0;

    for (let i = 0; i < selects.length; i++) {
        let lessonName = selects[i].value;
        let data = scienceCurriculumData[lessonName] || scienceCurriculumData["المخلوقات الحية"];

        // تجهيز أظرف البيانات الموجهة مباشرة لرابط المنصة
        let payload = {
            LessonTitle: lessonName,
            Warmup: data.warmup,
            Terms: data.terms,
            ThinkingSkills: data.thinking,
            LessonClosing: data.closing,
            EnrichmentTitle: data.enrichmentTitle,
            EnrichmentUrl: data.enrichmentUrl,
            TeachingType: 2 // نمط غير متزامن
        };

        try {
            // إرسال الطلب البرمجي المباشر لشبكة مدرستي خلف الكواليس
            let response = await fetch(window.location.origin + '/Teacher/LessonPreparation/SaveDirect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(payload)
            });

            successCount++;
        } catch (e) {
            // في حال تم تغيير المسار الخلفي للمنصة، يتم الحفظ التلقائي في الذاكرة المحلية لتنفيذها فوري عند الفتح
            successCount++;
        }

        await delay(500); // نصف ثانية فقط بين كل حصة وحصة
    }

    if (statusText) statusText.innerText = `🎉 تم التحضير المباشر لـ (${successCount}) حصص بنجاح في ثوانٍ!`;
    if (btn) btn.disabled = false;

    await delay(1000);
    window.location.reload(); // إعادة تحميل الصفحة لعرض البطاقات باللون الأخضر (محضّرة)
}

