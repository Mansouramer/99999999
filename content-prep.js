/**
 * ===================================================
 * أداة علوم الصف الأول الابتدائي - قاعدة بيانات الفصل الأول الشاملة
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
    enableClickToFillListener();
}

/**
 * قاعدة البيانات الشاملة لجميع دروس كتاب العلوم - الصف الأول الابتدائي (الفصل الدراسي الأول)
 */
const fullFirstTermScienceCurriculum = [
    {
        keywords: ["المخلوقات الحية", "الحية والغير حية", "البيئة"],
        warmup: "توجيه أسئلة تفاعلية حول الأشياء الموجودة في الغرفة الصفية، وعرض صور لمخلوقات حية وأشياء غير حية لملاحظة الفروق بينها.",
        terms: "مخلوق حي، شيء غير حي، نمو، غطاء، بيئة، تنفس، غذاء.",
        thinking: "الملاحظة والتصنيف: تصنيف الأشياء في الصور إلى مخلوقات حية تموت وتنمو، وأشياء غير حية لا تتغير.",
        closing: "التأكيد على أن المخلوقات الحية تحتاج إلى الماء والهواء والغذاء والمكان لتبقى على قيد الحياة.",
        notes: "حل أنشطة درس المخلوقات الحية في كتاب الطالب والتأكد من استيعاب مفردات النمو والتغذية."
    },
    {
        keywords: ["النباتات", "أجزاء النبات", "تنباتات تنمو", "النباتات وأجزاؤها"],
        warmup: "إحضار شتلة نبات حقيقية داخل الفصل، ومطالبة الطلاب باستكشاف أجزائها الظاهرة والمختفية تحت التربة.",
        terms: "جذور، ساق، أوراق، أزهار، ثمار، بذرة، ضوء الشمس، تربة.",
        thinking: "المقارنة والملاحظة: المقارنة بين وظائف أجزاء النبات (الجذور تمتص الماء، الساق تنقل الغذاء، الأوراق تصنع الغذاء).",
        closing: "تلخيص أهمية النباتات وكيف تنمو من البذرة لتصبح نباتاً كاملاً بحاجة الضوء والماء.",
        notes: "متابعة حل نشاط استكشف ورسم أجزاء النبات في كتاب الطالب."
    },
    {
        keywords: ["الحيوانات", "حيوانات", "أنواع الحيوانات", "مأوى"],
        warmup: "عرض مقطع فيديو قصير يوضح حيوانات مختلفة وتنوع بيئاتها وطرق حركتها لحث الطلاب على الاكتشاف.",
        terms: "حيوانات، مأوى، جحر، مفترس، أليف، حركة، طيران، سباحة.",
        thinking: "التصنيف والاستنتاج: تصنيف الحيوانات بحسب غطاء جسمها (شعر، ريش، قشور) وطريقة حركتها.",
        closing: "مناقشة احتياجات الحيوانات الأساسية للحياة والتأكيد على أجزاء جسمها التي تساعدها على أخذ حاجتها.",
        notes: "تطبيق نشاط المقارنة بين الحيوانات وحل أسئلة الدرس في الكتاب المدرسي."
    },
    {
        keywords: ["النمو والتغير", "كيف تنمو", "دورات الحياة"],
        warmup: "استعراض صور توضح مراحل نمو الفراشة أو الدجاجة وسؤال الطلاب عن التغيرات التي تطرأ عليها.",
        terms: "نمو، بيضة، صوص، دجاجة، فراشة، صغير، تغير، دورة حياة.",
        thinking: "التسلسل والترتيب: ترتيب مراحل نمو الحيوان والنبات من البداية وحتى مرحلة الإكتمال.",
        closing: "التأكيد على أن جميع صغار الحيوانات تنمو وتتغير لتصبح شبيهة بآبائها.",
        notes: "حل تمارين التسلسل الزمني لمراحل النمو في كتاب الطالب."
    },
    {
        keywords: ["الطقس", "فصول", "الشتاء", "الصيف", "الربيع", "الخريف"],
        warmup: "النظر عبر نافذة الفصل ومناقشة حالة الجو اليوم والمقارنة بين ما نرتديه في الصيف والشتاء.",
        terms: "طقس، درجات الحرارة، رياح، أمطار، مشمس، غائم، فصول السنة.",
        thinking: "الملاحظة والتنبؤ: الاستدلال على الفصل السائد من خلال حالة الطقس ونوع الملابس ونشاط الكائنات.",
        closing: "تلخيص خصائص فصول السنة الأربعة وتأثير الطقس على سلوك النباتات والحيوانات.",
        notes: "متابعة حل جدول الطقس اليومي وأسئلة الفصول في كتاب الطالب."
    },
    {
        keywords: ["المادة", "خصائص المادة", "صلبة", "سائلة", "غازية"],
        warmup: "عرض مجموعة من الأجسام المختلفة (حجر، ماء، بالون) ومطالبة الطلاب بلمسها ووصف ملمسها وشكلها.",
        terms: "مادة، صلبة، سائلة، غازية، حجم، ملمس، كتلة، حواس.",
        thinking: "التفسير والتصنيف: استخدام الحواس الخمس للتمييز بين حالات المادة الثلاث وتصنيف الخصائص.",
        closing: "تأكيد أن كل شيء حولنا يتكون من مادة ولها حالات مختلفة (صلب، سائل، غاز).",
        notes: "حل تطبيقات درس المادة وحالاتها والتأكد من كتابة المفردات في المحرر."
    }
];

/**
 * شريط تعبئة أعلى الصفحة
 */
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
        <span>📘 التعبئة المنهجية لمفردات كتاب العلوم (الصف الأول - ف1)</span>
        <button id="btnFillEntirePage" style="background:#10b981; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:11px; font-weight:bold;">
            ⚡ تعبئة مفردات ونصوص الدرس الآن
        </button>
    `;

    document.body.appendChild(bar);

    document.getElementById('btnFillEntirePage').addEventListener('click', () => {
        fillAllScienceEditorsOnPage();
    });
}

/**
 * دالة المطابقة الذكية للدرس المفتوح بناءً على مفردات الصفحة
 */
function getMatchingLessonData() {
    let pageContent = (document.body.innerText || "").toLowerCase();

    for (let item of fullFirstTermScienceCurriculum) {
        let isMatch = item.keywords.some(kw => pageContent.includes(kw.toLowerCase()));
        if (isMatch) return item;
    }

    // افتراضي لدرس النباتات في حال تعذر التحديد
    return fullFirstTermScienceCurriculum[1];
}

/**
 * كتابة النص المباشر في محررات مدرستي (contenteditable / iframe / textarea)
 */
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

/**
 * ميزة التعبئة بالنقر
 */
function enableClickToFillListener() {
    document.addEventListener('click', (e) => {
        let clickedEl = e.target;
        let container = clickedEl.closest('div, section, td, .form-group') || clickedEl;
        let titleText = (container.innerText || container.textContent || "").trim();
        let lessonData = getMatchingLessonData();

        if (titleText.includes("التهيئة")) {
            injectTextToTarget(container, lessonData.warmup);
        } else if (titleText.includes("مفردات الدرس")) {
            injectTextToTarget(container, lessonData.terms);
        } else if (titleText.includes("مهارات التفكير")) {
            injectTextToTarget(container, lessonData.thinking);
        } else if (titleText.includes("إغلاق الدرس")) {
            injectTextToTarget(container, lessonData.closing);
        } else if (clickedEl.isContentEditable || clickedEl.tagName === 'TEXTAREA') {
            injectTextToTarget(clickedEl, lessonData.notes);
        }
    }, true);
}

/**
 * تعبئة جميع خانات ومفردات الشاشة بضغطة زر
 */
function fillAllScienceEditorsOnPage() {
    let lessonData = getMatchingLessonData();
    let sections = Array.from(document.querySelectorAll('div, section, td, .form-group'));

    sections.forEach(sec => {
        let txt = (sec.innerText || sec.textContent || "").trim();

        if (txt.includes("التهيئة") && !txt.includes("مكتمل")) {
            injectTextToTarget(sec, lessonData.warmup);
        }
        if (txt.includes("مفردات الدرس")) {
            injectTextToTarget(sec, lessonData.terms);
        }
        if (txt.includes("مهارات التفكير")) {
            injectTextToTarget(sec, lessonData.thinking);
        }
        if (txt.includes("إغلاق الدرس")) {
            injectTextToTarget(sec, lessonData.closing);
        }
    });

    // تعبئة حقل الملاحظات العام
    document.querySelectorAll('textarea').forEach(ta => {
        if (!ta.value) {
            ta.value = lessonData.notes;
            ta.dispatchEvent(new Event('input', { bubbles: true }));
            ta.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    // تحديد خيارات التقنيات والوسائط
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        if (!cb.checked) {
            cb.click();
            cb.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    const btn = document.getElementById('btnFillEntirePage');
    if (btn) {
        btn.innerText = "✅ تم جلب وتعبئة مفردات المنهج بنجاح!";
        btn.style.background = "#059669";
        setTimeout(() => {
            btn.innerText = "⚡ تعبئة مفردات ونصوص الدرس الآن";
            btn.style.background = "#10b981";
        }, 2500);
    }
}

