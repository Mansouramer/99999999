/**
 * ===================================================
 * أداة تعبئة (التهيئة + الإثراءات + الواجبات + الاختبارات + الخطة)
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStep2Panel);
} else {
    initStep2Panel();
}

function initStep2Panel() {
    createStep2ControlUI();
}

function createStep2ControlUI() {
    if (document.getElementById('step2-automation-ui')) return;

    const uiBox = document.createElement('div');
    uiBox.id = 'step2-automation-ui';
    uiBox.style.cssText = `
        position: fixed; top: 15px; left: 3%; right: 3%; z-index: 999999;
        background: #ffffff; border: 2px solid #0284c7; padding: 12px;
        border-radius: 12px; box-shadow: 0 4px 25px rgba(0,0,0,0.3);
        font-family: system-ui, sans-serif; direction: rtl;
    `;

    uiBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h3 style="margin:0; color:#0369a1; font-size:13px;">⚡ أداة التعبئة الشاملة (المكونات والخطة)</h3>
            <button id="btnCloseStep2UI" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">إغلاق ✖</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:8px;">
            <button id="btnFillAllComponents" style="padding:10px; background:#10b981; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
                🚀 تعبئة (التهيئة + الإثراء + الواجب + الملاحظات) والحفظ
            </button>
            <button id="btnPublishWeeklyPlan" style="padding:8px; background:#8b5cf6; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">
                📢 نشر الخطة الأسبوعية للإعلانات
            </button>
        </div>
        <div id="step2StatusText" style="margin-top:4px; font-size:10px; color:#64748b; text-align:center;">جاهز لتعبئة كافة الأيقونات المطلوب إكمالها</div>
    `;

    document.body.appendChild(uiBox);

    document.getElementById('btnCloseStep2UI').addEventListener('click', () => {
        uiBox.style.display = 'none';
    });

    document.getElementById('btnFillAllComponents').addEventListener('click', () => {
        autoFillAllPrepComponents();
    });

    document.getElementById('btnPublishWeeklyPlan').addEventListener('click', () => {
        publishWeeklyPlanDirect();
    });
}

/**
 * تعبئة عناصر التحضير (التهيئة، الإثراءات، الواجبات، الاختبارات، الملاحظات)
 */
async function autoFillAllPrepComponents() {
    let statusText = document.getElementById('step2StatusText');
    if (statusText) statusText.innerText = "جاري تعبئة العناصر المطلوبة... ⏳";

    // 1. تعبئة حقل التهيئة / التمهيد
    let warmupInput = document.querySelector('textarea[name*="Warmup"], textarea[id*="Warmup"], textarea[name*="Intro"]');
    if (warmupInput) {
        warmupInput.value = "التمهيد للدرس باستخدام الصور التفاعلية وعرض العينات الاستكشافية.";
        warmupInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // 2. إضافة إثراء
    let addEnrichmentBtn = document.querySelector('button[id*="Enrichment"], .btn-add-enrichment, a[href*="Enrichment"]');
    if (addEnrichmentBtn) {
        addEnrichmentBtn.click();
        await delay(1000);
    }

    // 3. اختيار/إضافة واجب أو تطبيق
    let addHomeworkBtn = document.querySelector('button[id*="Homework"], .btn-add-homework, a[href*="Homework"]');
    if (addHomeworkBtn) {
        addHomeworkBtn.click();
        await delay(1000);
    }

    // 4. اختيار/إضافة اختبار قصير
    let addExamBtn = document.querySelector('button[id*="Exam"], .btn-add-exam, a[href*="Exam"]');
    if (addExamBtn) {
        addExamBtn.click();
        await delay(1000);
    }

    // 5. تعبئة صندوق الملاحظات والتعليمات للطلاب
    let noteTextarea = document.querySelector('textarea:not([name*="Warmup"])') || document.querySelector('textarea');
    if (noteTextarea) {
        noteTextarea.value = "متابعة حل الأنشطة والتطبيقات المحددة لمادة العلوم في كتاب الطالب.";
        noteTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        noteTextarea.dispatchEvent(new Event('change', { bubbles: true }));
    }

    await delay(1500);

    // 6. الضغط المباشر على زر "حفظ وإنهاء"
    let saveBtn = Array.from(document.querySelectorAll('button, input[type="submit"], a.btn')).find(b => {
        const text = (b.innerText || b.textContent || "").trim();
        return text.includes("حفظ") || text.includes("إنهاء");
    });

    if (saveBtn) {
        if (statusText) statusText.innerText = "✅ تم تعبئة جميع الأيقونات! جاري الحفظ النهائي...";
        await delay(800);
        saveBtn.click();
    } else {
        if (statusText) statusText.innerText = "⚠️ اكتملت التعبئة! يرجى الضغط على زر (حفظ وإنهاء).";
    }
}

/**
 * نشر الخطة الأسبوعية مباشرة
 */
async function publishWeeklyPlanDirect() {
    let statusText = document.getElementById('step2StatusText');
    const currentUrl = window.location.href;

    if (!currentUrl.includes("/Announcements") && !currentUrl.includes("/Announcement")) {
        if (statusText) statusText.innerText = "جاري الانتقال لصفحة الإعلانات... ⏳";
        chrome.storage.local.set({ autoPublishPlan: true }, () => {
            window.location.href = "https://schools.madrasati.sa/Teacher/Announcements";
        });
        return;
    }

    await delay(2000);
    let titleInput = document.querySelector('input[name*="Title"], input[id*="Title"], #Title');
    let detailsInput = document.querySelector('textarea[name*="Details"], textarea[id*="Details"], #Details');

    if (titleInput && detailsInput) {
        titleInput.value = "📌 خطة التعلم الأسبوعية - مادة العلوم (الصف الأول الابتدائي)";
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));

        detailsInput.value = "أولياء الأمور والطلاب الكرام، مرفق لكم خطة التعلم الأسبوعية لمادة العلوم للصف الأول الابتدائي.";
        detailsInput.dispatchEvent(new Event('input', { bubbles: true }));

        await delay(1000);
        let publishBtn = document.querySelector('button[type="submit"], #btnSave, .btn-primary');
        if (publishBtn) {
            chrome.storage.local.set({ autoPublishPlan: false });
            publishBtn.click();
            alert("✅ تم نشر الخطة الأسبوعية بنجاح!");
        }
    }
}

