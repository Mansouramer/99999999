/**
 * ===================================================
 * أداة التحضير الذكية - التفعيل اليدوي المباشر حسب الطلب
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createManualTriggerUI);
} else {
    createManualTriggerUI();
}

/**
 * إنشاء لوحة تفعيل الأداة اليدوية
 */
function createManualTriggerUI() {
    if (document.getElementById('prep-schedule-ui')) return;

    const uiBox = document.createElement('div');
    uiBox.id = 'prep-schedule-ui';
    uiBox.style.cssText = `
        position: fixed; top: 15px; left: 3%; right: 3%; z-index: 999999;
        background: #ffffff; border: 2px solid #0284c7; padding: 12px;
        border-radius: 12px; box-shadow: 0 4px 25px rgba(0,0,0,0.3);
        font-family: system-ui, sans-serif; direction: rtl;
    `;

    uiBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h3 style="margin:0; color:#0369a1; font-size:13px;">🔬 أداة التحضير بالطلب (علوم الصف الأول)</h3>
            <button id="btnCloseUI" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">إغلاق ✖</button>
        </div>

        <div style="margin-bottom:8px;">
            <input type="text" id="manualLessonInput" placeholder="اكتب اسم الدرس هنا (أو اتركه فارغاً للسحب)..." style="width:96%; padding:6px; font-size:11px; border-radius:4px; border:1px solid #cbd5e1; background:#fff;" />
        </div>

        <div style="display:flex; gap:6px;">
            <button id="btnExecuteCurrentPage" style="flex:2; padding:10px; background:#10b981; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
                🚀 تعبئة وتحضير هذه الصفحة الآن
            </button>
            <button id="btnSendWeeklyPlan" style="flex:1; padding:10px; background:#8b5cf6; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">
                📢 نشر الخطة الأسبوعية
            </button>
        </div>
        <div id="prepStatusText" style="margin-top:6px; font-size:10px; color:#64748b; text-align:center;">افتح صفحة تحضير الدرس في المنصة واضغط الزر للتعبئة</div>
    `;

    document.body.appendChild(uiBox);

    document.getElementById('btnCloseUI').addEventListener('click', () => {
        uiBox.style.display = 'none';
    });

    document.getElementById('btnExecuteCurrentPage').addEventListener('click', () => {
        executePrepForCurrentPage();
    });

    document.getElementById('btnSendWeeklyPlan').addEventListener('click', () => {
        sendWeeklyPlanToAnnouncements();
    });
}

/**
 * تنفيذ التعبئة المباشرة عند الضغط على الزر
 */
async function executePrepForCurrentPage() {
    let statusText = document.getElementById('prepStatusText');
    let lessonNameInput = document.getElementById('manualLessonInput').value.trim();

    // 1. الشاشة الأولى (تحديد القوائم والمسار)
    if (document.querySelector('select') && !document.querySelector('#btnSave, button[type="submit"]')) {
        if (statusText) statusText.innerText = "جاري تعبئة القوائم والمسار التعليمي... ⏳";

        let selects = document.querySelectorAll('select');
        let detectedLesson = lessonNameInput;

        for (let i = 0; i < selects.length; i++) {
            let sel = selects[i];
            if (lessonNameInput) {
                Array.from(sel.options).forEach((opt, idx) => {
                    if (opt.text.includes(lessonNameInput)) {
                        sel.selectedIndex = idx;
                        sel.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            } else if (sel.options.length > 1 && sel.selectedIndex === 0) {
                sel.selectedIndex = 1;
                sel.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (i === selects.length - 1 && sel.selectedIndex >= 0) {
                detectedLesson = sel.options[sel.selectedIndex].text.trim();
            }
            await delay(500);
        }

        let asyncRadio = document.querySelector('input[type="radio"][value*="غير متزامن"], input[type="radio"][id*="Async"]');
        if (asyncRadio) asyncRadio.click();

        await delay(1000);

        let nextBtn = Array.from(document.querySelectorAll('button, input[type="submit"], a.btn')).find(b => {
            const text = (b.innerText || b.textContent || "").trim();
            return text.includes("التالي");
        });

        if (nextBtn) {
            chrome.storage.local.set({ activeLessonName: detectedLesson || "العلوم" });
            nextBtn.click();
        }
    }

    // 2. الشاشة الثانية (إضافة الإثراءات والتكليفات والحفظ)
    else if (document.querySelector('textarea') || document.querySelector('button[type="submit"]') || document.querySelector('#btnSave')) {
        if (statusText) statusText.innerText = "جاري إضافة التكليفات والملاحظات والحفظ... ⏳";

        chrome.storage.local.get(['activeLessonName'], async (stored) => {
            let finalLesson = lessonNameInput || stored.activeLessonName || "العلوم";

            let addEnrichmentBtn = document.querySelector('button[id*="Enrichment"], .btn-add-enrichment');
            if (addEnrichmentBtn) {
                addEnrichmentBtn.click();
                await delay(1000);
            }

            let noteTextarea = document.querySelector('textarea');
            if (noteTextarea) {
                noteTextarea.value = `متابعة حل تطبيقات وأنشطة درس (${finalLesson}) في كتاب الطالب.`;
                noteTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                noteTextarea.dispatchEvent(new Event('change', { bubbles: true }));
            }

            await delay(1200);

            let saveBtn = Array.from(document.querySelectorAll('button, input[type="submit"], a.btn')).find(b => {
                const text = (b.innerText || b.textContent || "").trim();
                return text.includes("حفظ") || text.includes("إنهاء");
            });

            if (saveBtn) {
                saveBtn.click();
                if (statusText) statusText.innerText = "✅ تم التحضير والحفظ بنجاح!";
            }
        });
    } else {
        alert("يرجى فتح صفحة إعداد الدرس في المنصة أولاً لتعبئتها.");
    }
}

/**
 * دالة نشر الخطة الأسبوعية بضغطة زر
 */
async function sendWeeklyPlanToAnnouncements() {
    let statusText = document.getElementById('prepStatusText');
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

