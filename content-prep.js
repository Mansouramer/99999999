/**
 * ===================================================
 * أداة علوم الصف الأول - دعم المحررات المتقدمة (CKEditor / contenteditable)
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoObserver);
} else {
    initAutoObserver();
}

function initAutoObserver() {
    createMiniStatusUI();
    autoProcessCurrentPage();
}

function createMiniStatusUI() {
    if (document.getElementById('prep-mini-ui')) return;

    const uiBox = document.createElement('div');
    uiBox.id = 'prep-mini-ui';
    uiBox.style.cssText = `
        position: fixed; top: 10px; left: 3%; right: 3%; z-index: 999999;
        background: #0284c7; color: #ffffff; padding: 8px 14px;
        border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        font-family: system-ui, sans-serif; font-size: 11px; font-weight: bold;
        display: flex; justify-content: space-between; align-items: center; direction: rtl;
    `;

    uiBox.innerHTML = `
        <span>🔬 أداة التعبئة المباشرة (محررات مدرستي)</span>
        <button id="btnManualTrigger" style="background:#10b981; color:#fff; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:11px; font-weight:bold;">⚡ اضغط للتعبئة الفورية</button>
    `;

    document.body.appendChild(uiBox);

    document.getElementById('btnManualTrigger').addEventListener('click', () => {
        autoProcessCurrentPage(true);
    });
}

function updateStatusLabel(text, bgColor = "#0369a1") {
    const btn = document.getElementById('btnManualTrigger');
    if (btn) {
        btn.innerText = text;
        btn.style.background = bgColor;
    }
}

/**
 * الكتابة داخل المحررات المتقدمة (CKEditor / contenteditable / iframe)
 */
function writeToRichEditor(targetContainer, textValue) {
    if (!targetContainer) return false;

    // 1. فحص وجود عنصر contenteditable داخل المنطقة
    let editableDiv = targetContainer.querySelector('[contenteditable="true"]') || targetContainer.querySelector('.ck-editor__editable');
    if (editableDiv) {
        editableDiv.innerHTML = `<p>${textValue}</p>`;
        editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
        editableDiv.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }

    // 2. فحص وجود iframe (المحررات التقليدية)
    let iframe = targetContainer.querySelector('iframe');
    if (iframe && iframe.contentDocument) {
        let body = iframe.contentDocument.body;
        if (body) {
            body.innerHTML = `<p>${textValue}</p>`;
            body.dispatchEvent(new Event('input', { bubbles: true }));
            return true;
        }
    }

    // 3. فحص وجود textarea عادي
    let textarea = targetContainer.querySelector('textarea');
    if (textarea) {
        textarea.value = textValue;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }

    return false;
}

/**
 * المحرك الرئيسي لتعبئة صفحة المكونات والوسائط
 */
async function autoProcessCurrentPage(isManual = false) {
    await delay(1000);
    updateStatusLabel("جاري التعبئة... ⏳", "#d97706");

    let filledCount = 0;

    // البحث عن جميع الأقسام الحاوية للخانات
    let allSections = Array.from(document.querySelectorAll('div, section, td, .form-group'));

    allSections.forEach(sec => {
        let titleText = (sec.innerText || sec.textContent || "").trim();

        // 1. تعبئة التهيئة
        if (titleText.includes("التهيئة") && !titleText.includes("مكتمل")) {
            if (writeToRichEditor(sec, "التمهيد للدرس بعرض الصور التفاعلية والعينات الاستكشافية لمادة العلوم.")) filledCount++;
        }

        // 2. تعبئة مفردات الدرس
        if (titleText.includes("مفردات الدرس")) {
            if (writeToRichEditor(sec, "المخلوقات الحية، الأشياء غير الحية، النمو، التغذية.")) filledCount++;
        }

        // 3. تعبئة مهارات التفكير
        if (titleText.includes("مهارات التفكير")) {
            if (writeToRichEditor(sec, "الملاحظة، المقارنة، والتصنيف للتمييز بين الكائنات الحية والغير حية.")) filledCount++;
        }

        // 4. تعبئة إغلاق الدرس
        if (titleText.includes("إغلاق الدرس")) {
            if (writeToRichEditor(sec, "مراجعة المفاهيم الأساسية وتأكيد تحقيق أهداف الحصة.")) filledCount++;
        }
    });

    // 5. تحديد خيار الوسائط الاجتماعية إذا كان متاحاً
    let mediaCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
    if (mediaCheckboxes.length > 0) {
        mediaCheckboxes.forEach(cb => {
            if (!cb.checked) {
                cb.click();
                cb.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }

    // 6. الضغط على زر إضافة إثراء أو واجب إن وجد
    let addBtn = Array.from(document.querySelectorAll('button, a')).find(b => {
        let txt = b.innerText || "";
        return txt.includes("إضافة إثراء") || txt.includes("إضافة واجب") || txt.includes("اختيار إثراء");
    });
    if (addBtn) {
        addBtn.click();
        await delay(1000);
    }

    if (filledCount > 0 || isManual) {
        updateStatusLabel("✅ تم كتابة النماذج بنجاح!", "#059669");
    } else {
        updateStatusLabel("⚡ اضغط للتعبئة الفورية", "#10b981");
    }
}

