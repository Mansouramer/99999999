/**
 * ===================================================
 * أداة علوم الصف الأول - تعبئة الحقول بالنقر أو بضغطة زر
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initManualFiller);
} else {
    initManualFiller();
}

function initManualFiller() {
    createTriggerBar();
    enableClickToFillListener();
}

/**
 * شريط تعبئة أعلى الصفحة بضغطة واحدة
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
        <span>✍️ مساعد التعبئة: اضغط على أي حقل لتعبئته أو تعبئة الصفحة كاملاً</span>
        <button id="btnFillEntirePage" style="background:#10b981; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:11px; font-weight:bold;">
            ⚡ تعبئة كل خانات الصفحة الآن
        </button>
    `;

    document.body.appendChild(bar);

    document.getElementById('btnFillEntirePage').addEventListener('click', () => {
        fillAllEditorsOnPage();
    });
}

/**
 * الكتابة المباشرة في محررات مدرستي المتقدمة
 */
function injectTextToTarget(targetElement, defaultText) {
    if (!targetElement) return false;

    // 1. التعامل مع محررات contenteditable المتقدمة
    let editableDiv = targetElement.isContentEditable ? targetElement : 
                      targetElement.querySelector('[contenteditable="true"]') || targetElement.querySelector('.ck-editor__editable');
    if (editableDiv) {
        editableDiv.innerHTML = `<p>${defaultText}</p>`;
        editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
        editableDiv.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }

    // 2. التعامل مع محررات iframe
    let iframe = targetElement.tagName === 'IFRAME' ? targetElement : targetElement.querySelector('iframe');
    if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
        iframe.contentDocument.body.innerHTML = `<p>${defaultText}</p>`;
        iframe.contentDocument.body.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
    }

    // 3. التعامل مع textarea المباشرة
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
 * ميزة التعبئة بالنقر المباشر على الحقل
 */
function enableClickToFillListener() {
    document.addEventListener('click', (e) => {
        let clickedEl = e.target;
        
        // البحث عن الحاوية أو الحقل المهرّر
        let container = clickedEl.closest('div, section, td, .form-group') || clickedEl;
        let titleText = (container.innerText || container.textContent || "").trim();

        if (titleText.includes("التهيئة")) {
            injectTextToTarget(container, "التمهيد للدرس بعرض الصور التفاعلية والعينات الاستكشافية لمادة العلوم.");
        } else if (titleText.includes("مفردات الدرس")) {
            injectTextToTarget(container, "المخلوقات الحية، الأشياء غير الحية، النمو، التغذية.");
        } else if (titleText.includes("مهارات التفكير")) {
            injectTextToTarget(container, "الملاحظة، المقارنة، والتصنيف للتمييز بين الكائنات الحية والغير حية.");
        } else if (titleText.includes("إغلاق الدرس")) {
            injectTextToTarget(container, "مراجعة المفاهيم الأساسية للدرس وتأكيد تحقيق أهداف الحصة.");
        } else if (clickedEl.isContentEditable || clickedEl.tagName === 'TEXTAREA') {
            injectTextToTarget(clickedEl, "متابعة تطبيق المهارات والحلول المحددة لدرس العلوم في كتاب الطالب.");
        }
    }, true);
}

/**
 * تعبئة كافة الحقول المفتوحة في الصفحة دفعة واحدة
 */
function fillAllEditorsOnPage() {
    let sections = Array.from(document.querySelectorAll('div, section, td, .form-group'));
    let count = 0;

    sections.forEach(sec => {
        let txt = (sec.innerText || sec.textContent || "").trim();

        if (txt.includes("التهيئة") && !txt.includes("مكتمل")) {
            if (injectTextToTarget(sec, "التمهيد للدرس بعرض الصور التفاعلية والعينات الاستكشافية لمادة العلوم.")) count++;
        }
        if (txt.includes("مفردات الدرس")) {
            if (injectTextToTarget(sec, "المخلوقات الحية، الأشياء غير الحية، النمو، التغذية.")) count++;
        }
        if (txt.includes("مهارات التفكير")) {
            if (injectTextToTarget(sec, "الملاحظة، المقارنة، والتصنيف للتمييز بين الكائنات الحية والغير حية.")) count++;
        }
        if (txt.includes("إغلاق الدرس")) {
            if (injectTextToTarget(sec, "مراجعة المفاهيم الأساسية للدرس وتأكيد تحقيق أهداف الحصة.")) count++;
        }
    });

    // تحديد خيارات الوسائط إذا وجدت
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        if (!cb.checked) {
            cb.click();
            cb.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    const btn = document.getElementById('btnFillEntirePage');
    if (btn) {
        btn.innerText = "✅ تم تعبئة الصفحة بنجاح!";
        btn.style.background = "#059669";
        setTimeout(() => {
            btn.innerText = "⚡ تعبئة كل خانات الصفحة الآن";
            btn.style.background = "#10b981";
        }, 2000);
    }
}

