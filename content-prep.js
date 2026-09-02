/**
 * ===================================================
 * أداة علوم الصف الأول - عرض الحصص المتاحة فقط
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrepTool);
} else {
    initPrepTool();
}

function initPrepTool() {
    createGrade1ScienceUI();
    runAutomationEngine();
}

/**
 * البحث عن أزرار إعداد الدرس لعلوم الصف الأول
 */
function getGrade1ScienceButtons() {
    let allPrepButtons = Array.from(document.querySelectorAll('a, button, div, span')).filter(el => {
        const text = (el.innerText || el.textContent || "").trim();
        const hasPrepText = text === "إعداد الدرس الآن" || (text.includes("إعداد الدرس الآن") && el.children.length <= 1);
        const isVisible = el.offsetWidth > 0 && el.offsetHeight > 0 && window.getComputedStyle(el).display !== 'none';
        return hasPrepText && isVisible;
    });

    return allPrepButtons.filter(btn => {
        let card = btn.closest('.card') || btn.closest('[class*="card"]') || btn.parentElement?.parentElement || btn.parentElement;
        if (card) {
            let cardText = card.innerText || card.textContent || "";
            let isScience = cardText.includes("العلوم") || cardText.includes("علوم");
            let isGrade1 = cardText.includes("الصف الأول") || cardText.includes("الأول") || cardText.includes("1");
            return isScience && isGrade1;
        }
        return false;
    });
}

/**
 * إنشاء الواجهة ديناميكياً لعرض الحصص المطلوبة فقط
 */
function createGrade1ScienceUI() {
    if (document.getElementById('prep-schedule-ui')) return;

    const uiBox = document.createElement('div');
    uiBox.id = 'prep-schedule-ui';
    uiBox.style.cssText = `
        position: fixed; top: 15px; left: 3%; right: 3%; z-index: 999999;
        background: #ffffff; border: 2px solid #0284c7; padding: 12px;
        border-radius: 12px; box-shadow: 0 4px 25px rgba(0,0,0,0.3);
        font-family: system-ui, sans-serif; direction: rtl; max-height: 88vh; overflow-y: auto;
    `;

    uiBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h3 style="margin:0; color:#0369a1; font-size:13px;">🔬 علوم الصف الأول الابتدائي</h3>
            <button id="btnCloseUI" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">إغلاق ✖</button>
        </div>

        <div style="margin-bottom:8px; display:flex; gap:6px;">
            <button id="btnFetchSchedule" style="flex:1; padding:6px; background:#0284c7; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">
                🔄 تحديث الحصص المتاحة
            </button>
            <button id="btnSendWeeklyPlan" style="flex:1; padding:6px; background:#8b5cf6; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">
                📢 نشر الخطة الأسبوعية
            </button>
        </div>

        <div id="dynamicScheduleContainer">
            <div style="text-align:center; padding:10px; font-size:11px; color:#64748b;">جاري البحث عن الحصص المتاحة للتحضير...</div>
        </div>

        <div style="display:flex; gap:6px; align-items:center; margin-top:10px;">
            <button id="btnStartBulkPrep" style="flex:1; padding:10px; background:#10b981; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
                🚀 اعتماد الدرس وبدء التحضير
            </button>
            <button id="btnStopPrep" style="padding:10px; background:#ef4444; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px; display:none;">
                ⏹ إيقاف
            </button>
        </div>
        <div id="prepStatusText" style="margin-top:6px; font-size:10px; color:#64748b; text-align:center;">اختر الدرس للحصة المتاحة ثم اضغط بدء التحضير</div>
    `;

    document.body.appendChild(uiBox);

    document.getElementById('btnCloseUI').addEventListener('click', () => {
        uiBox.style.display = 'none';
    });

    document.getElementById('btnFetchSchedule').addEventListener('click', () => {
        renderAvailableClasses();
    });

    document.getElementById('btnSendWeeklyPlan').addEventListener('click', () => {
        sendWeeklyPlanToAnnouncements();
    });

    document.getElementById('btnStartBulkPrep').addEventListener('click', () => {
        let scheduleConfig = {};
        let activeSelects = document.querySelectorAll('.dynamic-lesson-select');
        let selectedAny = false;

        activeSelects.forEach((sel, index) => {
            if (sel.value) selectedAny = true;
            scheduleConfig[`p${index + 1}`] = { lesson: sel.value };
        });

        if (!selectedAny && activeSelects.length > 0) {
            alert("⚠️ يرجى اختيار درس للحصة المتاحة أولاً!");
            return;
        }

        chrome.storage.local.set({
            autoPrepRunning: true,
            scheduleConfig: scheduleConfig,
            currentPeriodIndex: 0
        }, () => {
            updateUIStatus(true);
            runAutomationEngine();
        });
    });

    document.getElementById('btnStopPrep').addEventListener('click', () => {
        chrome.storage.local.set({ autoPrepRunning: false }, () => {
            updateUIStatus(false);
            window.location.reload();
        });
    });

    renderAvailableClasses();
}

/**
 * بناء جدول الحصص المتاحة فقط
 */
function renderAvailableClasses() {
    const container = document.getElementById('dynamicScheduleContainer');
    const statusText = document.getElementById('prepStatusText');
    if (!container) return;

    let availableButtons = getGrade1ScienceButtons();

    if (availableButtons.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:15px; background:#fef2f2; border:1px solid #fca5a5; border-radius:6px; color:#991b1b; font-size:11px;">
                ⚠️ لا توجد حصص لعلوم الصف الأول بحاجة للتحضير حالياً في هذه الصفحة.
            </div>
        `;
        if (statusText) statusText.innerText = "لم يتم العثور على حصص متاحة";
        return;
    }

    const grade1ScienceLessons = [
        "المخلوقات الحية وحاجاتها",
        "النباتات وأجزاؤها",
        "الفيزيائية والحركة",
        "الطقس وفصول السنة",
        "المادة وحالاتها",
        "الأرض ومواردها"
    ];

    let optionsHTML = `<option value="">-- اختر درس العلوم للحصة --</option>`;
    grade1ScienceLessons.forEach(lesson => {
        optionsHTML += `<option value="${lesson}">${lesson}</option>`;
    });

    let rowsHTML = '';
    availableButtons.forEach((btn, idx) => {
        let card = btn.closest('.card') || btn.closest('[class*="card"]') || btn.parentElement?.parentElement;
        let titleText = `حصة علوم مجهزة (${idx + 1})`;
        if (card) {
            let infoText = card.innerText.split('\n').filter(t => t.trim().length > 0).slice(0, 2).join(' - ');
            if (infoText) titleText = infoText;
        }

        rowsHTML += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding:6px; font-weight:bold; font-size:10px; color:#0369a1; width:35%;">${titleText}</td>
                <td style="padding:4px; width:65%;">
                    <select class="dynamic-lesson-select" id="lesson_p${idx + 1}" style="width:100%; padding:4px; font-size:11px; border-radius:4px; border:1px solid #ccc; background:#fff;">
                        ${optionsHTML}
                    </select>
                </td>
            </tr>
        `;
    });

    container.innerHTML = `
        <table style="width:100%; border-collapse:collapse; margin-bottom:5px; text-align:right;">
            <thead>
                <tr style="background:#f0f9ff; font-size:11px; color:#0369a1;">
                    <th style="padding:6px;">الحصة المتاحة</th>
                    <th style="padding:6px;">درس العلوم المطلوب</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHTML}
            </tbody>
        </table>
    `;

    if (statusText) statusText.innerText = `تم العثور على (${availableButtons.length}) حصص متاحة للتحضير`;
}

function updateUIStatus(isRunning) {
    const startBtn = document.getElementById('btnStartBulkPrep');
    const stopBtn = document.getElementById('btnStopPrep');
    const statusText = document.getElementById('prepStatusText');

    if (isRunning) {
        if (startBtn) startBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'block';
        if (statusText) statusText.innerText = "جاري تنفيذ التحضير آلياً للحصص المحددة... ⏳";
    } else {
        if (startBtn) startBtn.style.display = 'block';
        if (stopBtn) stopBtn.style.display = 'none';
    }
}

async function sendWeeklyPlanToAnnouncements() {
    let statusText = document.getElementById('prepStatusText');
    const currentUrl = window.location.href;

    if (!currentUrl.includes("/Announcements") && !currentUrl.includes("/Announcement")) {
        if (statusText) statusText.innerText = "جاري الانتقال لصفحة الإعلانات لإرسال الخطة... ⏳";
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
            alert("✅ تم نشر خطة التعلم الأسبوعية بنجاح!");
        }
    }
}

function runAutomationEngine() {
    chrome.storage.local.get(['autoPrepRunning', 'scheduleConfig', 'currentPeriodIndex'], async (data) => {
        if (!data.autoPrepRunning) return;

        const currentUrl = window.location.href;

        if (currentUrl.includes("/Schedule") || currentUrl.includes("/Teacher/Schedule") || !document.querySelector('select')) {
            await delay(1500);

            let scienceButtons = getGrade1ScienceButtons();
            let currentIndex = data.currentPeriodIndex || 0;

            if (scienceButtons.length > currentIndex) {
                await delay(1000);
                scienceButtons[currentIndex].click();
            } else {
                alert("🎉 تم الانتهاء من تحضير الحصص المتاحة بنجاح!");
                chrome.storage.local.set({ autoPrepRunning: false, currentPeriodIndex: 0 });
                updateUIStatus(false);
            }
        } else if (document.querySelector('select') && !document.querySelector('#btnSave, button[type="submit"]')) {
            await delay(2000);

            let periodKey = `p${(data.currentPeriodIndex || 0) + 1}`;
            let periodData = (data.scheduleConfig && data.scheduleConfig[periodKey]) ? data.scheduleConfig[periodKey] : {};

            let selects = document.querySelectorAll('select');
            for (let sel of selects) {
                if (periodData.lesson) {
                    Array.from(sel.options).forEach((opt, idx) => {
                        if (opt.text.includes(periodData.lesson)) {
                            sel.selectedIndex = idx;
                            sel.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    });
                } else if (sel.options.length > 1 && sel.selectedIndex === 0) {
                    sel.selectedIndex = 1;
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                }
                await delay(400);
            }

            let asyncRadio = document.querySelector('input[type="radio"][value*="غير متزامن"], input[type="radio"][id*="Async"]');
            if (asyncRadio) asyncRadio.click();

            await delay(1000);

            let nextBtn = Array.from(document.querySelectorAll('button, input[type="submit"], a.btn')).find(b => {
                const text = (b.innerText || b.textContent || "").trim();
                return text.includes("التالي");
            });

            if (nextBtn) nextBtn.click();
        } else if (document.querySelector('textarea') || document.querySelector('button[type="submit"]') || document.querySelector('#btnSave')) {
            await delay(2000);

            let addEnrichmentBtn = document.querySelector('button[id*="Enrichment"], .btn-add-enrichment');
            if (addEnrichmentBtn) {
                addEnrichmentBtn.click();
                await delay(1000);
            }

            let noteTextarea = document.querySelector('textarea');
            if (noteTextarea) {
                noteTextarea.value = "متابعة المهارات والتطبيقات العملية لدرس العلوم.";
                noteTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            }

            await delay(1500);

            chrome.storage.local.set({ currentPeriodIndex: (data.currentPeriodIndex || 0) + 1 });

            let saveBtn = Array.from(document.querySelectorAll('button, input[type="submit"], a.btn')).find(b => {
                const text = (b.innerText || b.textContent || "").trim();
                return text.includes("حفظ") || text.includes("إنهاء");
            });

            if (saveBtn) saveBtn.click();
        }
    });
}

