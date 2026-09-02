/**
 * ===================================================
 * أداة علوم الصف الأول الابتدائي - دعم إضافة الإثراءات التلقائية والتوزيع الدقيق
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScienceCurriculumFiller);
} else {
    initScienceCurriculumFiller();
}

function initScienceCurriculumFiller() {
    createTriggerBar();
}

/**
 * قاعدة البيانات الشاملة لمنهج العلوم + روابط إثراءات عين التعليمية
 */
const fullFirstTermScienceCurriculum = [
    {
        keywords: ["المخلوقات الحية", "الحية والغير حية"],
        warmup: "توجيه أسئلة تفاعلية حول الأشياء الموجودة في الغرفة الصفية، وعرض صور لمخلوقات حية وأشياء غير حية لملاحظة الفروق بينها.",
        terms: "مخلوق حي، شيء غير حي، نمو، غطاء، بيئة، تنفس، غذاء.",
        thinking: "الملاحظة والتصنيف: تصنيف الأشياء في الصور إلى مخلوقات حية تموت وتنمو، وأشياء غير حية لا تتغير.",
        closing: "التأكيد على أن المخلوقات الحية تحتاج إلى الماء والهواء والغذاء والمكان لتبقى على قيد الحياة.",
        enrichmentTitle: "إثراء مرئي: خصائص المخلوقات الحية - منصة عين",
        enrichmentUrl: "https://ien.edu.sa"
    },
    {
        keywords: ["النباتات", "أجزاء النبات", "تنباتات تنمو", "النباتات وأجزاؤها"],
        warmup: "إحضار شتلة نبات حقيقية داخل الفصل، ومطالبة الطلاب باستكشاف أجزائها الظاهرة والمختفية تحت التربة.",
        terms: "جذور، ساق، أوراق، أزهار، ثمار، بذرة، ضوء الشمس، تربة.",
        thinking: "المقارنة والملاحظة: المقارنة بين وظائف أجزاء النبات (الجذور تمتص الماء، الساق تنقل الغذاء، الأوراق تصنع الغذاء).",
        closing: "تلخيص أهمية النباتات وكيف تنمو من البذرة لتصبح نباتاً كاملاً بحاجة الضوء والماء.",
        enrichmentTitle: "إثراء تفاعلي: أجزاء النبات ووظائفها - منصة عين",
        enrichmentUrl: "https://ien.edu.sa"
    },
    {
        keywords: ["الحيوانات", "حيوانات", "مأوى"],
        warmup: "عرض مقطع فيديو قصير يوضح حيوانات مختلفة وتنوع بيئاتها وطرق حركتها لحث الطلاب على الاكتشاف.",
        terms: "حيوانات، مأوى، جحر، مفترس، أليف، حركة، طيران، سباحة.",
        thinking: "التصنيف والاستنتاج: تصنيف الحيوانات بحسب غطاء جسمها (شعر، ريش، قشور) وطريقة حركتها.",
        closing: "مناقشة احتياجات الحيوانات الأساسية للحياة والتأكيد على أجزاء جسمها التي تساعدها على أخذ حاجتها.",
        enrichmentTitle: "إثراء مرئي: احتياجات الحيوانات وبيئاتها - منصة عين",
        enrichmentUrl: "https://ien.edu.sa"
    }
];

function createTriggerBar() {
    if (document.getElementById('manual-filler-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'manual-filler-bar';
    bar.style.cssText = `
        position: fixed; top: 10px; left: 3%; right: 3%; z-index: 9999999;
        background: #0284c7; color: #ffffff; padding: 8px 14px;
        border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        font-family: system-ui, sans-serif; font-size: 11px; font-weight: bold;
        display: flex; justify-content: space-between; align-items: center; direction: rtl;
    `;

    bar.innerHTML = `
        <span>📘 التعبئة المنهجية وإضافة الإثراءات (علوم الأول الابتدائي)</span>
        <button id="btnFillEntirePage" style="background:#10b981; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:11px; font-weight:bold;">
            ⚡ تعبئة الخانات وإدراج الإثراء الآن
        </button>
    `;

    document.body.appendChild(bar);

    document.getElementById('btnFillEntirePage').addEventListener('click', () => {
        fillAllScienceEditorsAndEnrichments();
    });
}

function getMatchingLessonData() {
    let pageContent = (document.body.innerText || "").toLowerCase();
    for (let item of fullFirstTermScienceCurriculum) {
        if (item.keywords.some(kw => pageContent.includes(kw.toLowerCase()))) {
            return item;
        }
    }
    return fullFirstTermScienceCurriculum[0];
}

function injectTextToTarget(targetElement, defaultText) {
    if (!targetElement) return false;

    let editableDiv = targetElement.isContentEditable ? targetElement : 
                      targetElement.querySelector('[contenteditable="true"]') || targetElement.querySelector('.ck-editor__editable');
    if (editableDiv) {
        editableDiv.innerHTML = `<p>${defaultText}</p>`;
        editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
        editableDiv.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }

    let iframe = targetElement.tagName === 'IFRAME' ? targetElement : targetElement.querySelector('iframe');
    if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
        iframe.contentDocument.body.innerHTML = `<p>${defaultText}</p>`;
        iframe.contentDocument.body.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
    }

    let textarea = targetElement.tagName === 'TEXTAREA' ? targetElement : targetElement.querySelector('textarea');
    if (textarea) {
        textarea.value = defaultText;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }

    return false;
}

function findSectionByTitle(titleKey) {
    let containers = Array.from(document.querySelectorAll('div, section, td, .form-group'));
    return containers.find(el => {
        let text = el.innerText || el.textContent || "";
        return text.includes(titleKey);
    });
}

/**
 * تعبئة كافة الخانات + معالجة إضافة الإثراء التلقائي
 */
async function fillAllScienceEditorsAndEnrichments() {
    let lessonData = getMatchingLessonData();
    const btn = document.getElementById('btnFillEntirePage');
    if (btn) btn.innerText = "جاري تعبئة الخانات وإدراج الإثراء... ⏳";

    // 1. تعبئة "مهارات التفكير"
    let thinkingBox = findSectionByTitle("مهارات التفكير");
    if (thinkingBox) injectTextToTarget(thinkingBox, lessonData.thinking);

    // 2. تعبئة "إغلاق الدرس"
    let closingBox = findSectionByTitle("إغلاق الدرس");
    if (closingBox) injectTextToTarget(closingBox, lessonData.closing);

    // 3. تعبئة "مفردات الدرس"
    let termsBox = findSectionByTitle("مفردات الدرس");
    if (termsBox) injectTextToTarget(termsBox, lessonData.terms);

    // 4. تعبئة "التهيئة"
    let warmupBox = findSectionByTitle("التهيئة");
    if (warmupBox) injectTextToTarget(warmupBox, lessonData.warmup);

    // 5. الضغط على زر إضافة إثراء وإدخال بيانات الإثراء المنهجي
    let addEnrichmentBtn = Array.from(document.querySelectorAll('button, a')).find(b => {
        let txt = b.innerText || "";
        return txt.includes("إضافة إثراء") || txt.includes("اختيار إثراء");
    });

    if (addEnrichmentBtn) {
        addEnrichmentBtn.click();
        await delay(1200); // انتظار فتح النافذة المنبثقة

        // تعبئة حقول الإثراء داخل النافذة
        let nameInput = document.querySelector('input[name*="Name"], input[id*="Name"], input[placeholder*="اسم الإثراء"]');
        let urlInput = document.querySelector('input[name*="Url"], input[id*="Url"], input[placeholder*="رابط"]');

        if (nameInput) {
            nameInput.value = lessonData.enrichmentTitle;
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (urlInput) {
            urlInput.value = lessonData.enrichmentUrl;
            urlInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        await delay(800);

        // الضغط على زر حفظ الإثراء داخل النافذة
        let saveModalBtn = Array.from(document.querySelectorAll('.modal button, .modal input[type="submit"]')).find(b => {
            let txt = b.innerText || "";
            return txt.includes("حفظ") || txt.includes("إضافة");
        });
        if (saveModalBtn) saveModalBtn.click();
    }

    // 6. تحديد الوسائط الاجتماعية
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        if (!cb.checked) {
            cb.click();
            cb.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    if (btn) {
        btn.innerText = "✅ تم تعبئة المكونات وإضافة الإثراء بنجاح!";
        btn.style.background = "#059669";
        setTimeout(() => {
            btn.innerText = "⚡ تعبئة الخانات وإدراج الإثراء الآن";
            btn.style.background = "#10b981";
        }, 2500);
    }
}

