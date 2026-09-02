/**
 * ===================================================
 * أداة علوم الصف الأول - الاختيار اليدوي للدرس قبل البدء
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrepTool);
} else {
    initPrepTool();
}

function initPrepTool() {
    createManualLessonScienceUI();
    runAutomationEngine();
}

/**
 * جلب كروت حصص علوم الصف الأول الظاهرة في الشاشة
 */
function getGrade1ScienceCards() {
    const uiBox = document.getElementById('prep-schedule-ui');
    let allCards = Array.from(document.querySelectorAll('div, a, button, td, .card, [class*="card"]'));

    let matchingCards = allCards.filter(el => {
        if (uiBox && uiBox.contains(el)) return false;

        let text = (el.innerText || el.textContent || "").trim();

        let hasScience = text.includes("العلوم") || text.includes("علوم");
        let hasGrade1 = text.includes("الصف الأول") || text.includes("الأول");
        let isSystemText = text.includes("إغلاق") || text.includes("جاري") || text.includes("خطة التعلم");

        const rect = el.getBoundingClientRect();
        let isVisibleOnScreen = rect.width > 0 && rect.height > 0 && rect.top >= -100 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 300;
        let isDirectCardNode = text.length < 120 && el.children.length <= 4;

        return hasScience && hasGrade1 && !isSystemText && isDirectCardNode && isVisibleOnScreen;
    });

    let uniqueCards = [];
    matchingCards.forEach(card => {
        if (!uniqueCards.some(existing => existing.contains(card) || card.contains(existing))) {
            uniqueCards.push(card);
        }
    });

    return uniqueCards;
}

/**
 * واجهة اختيار الدرس لكل حصة فارغة افتراضياً
 */
function createManualLessonScienceUI() {
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
                🔄 قراءة الحصص المتاحة
            </button>
            <button id="btnSendWeeklyPlan" style="flex:1; padding:6px; background:#8b5cf6; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">
                📢 نشر الخطة الأسبوعية
            </button>
        </div>

        <div id="dynamicScheduleContainer">
            <div style="text-align:center; padding:10px; font-size:11px; color:#64748b;">جاري جلب الحصص المتاحة لتعيين الدروس...</div>
        </div>

        <div style="display:flex; gap:6px; align-items:center; margin-top:10px;">
            <button id="btnStartBulkPrep" style="flex:1; padding:10px; background:#10b981; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
                🚀 اعتماد الدرس وبدء التحضير
            </button>
            <button id="btnStopPrep" style="padding:10px; background:#ef4444; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px; display:none;">
                ⏹ إيقاف
            </button>
        </div>
        <div id="prepStatusText" style="margin-top:6px; font-size:10px; color:#64748b; text-align:center;">اختر الدرس أولاً ثم اضغط بدء التحضير</div>
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
        let activeInputs = document.querySelectorAll('.dynamic-lesson-input');
        let selectedAny = false;

        activeInputs.forEach((input, index) => {
            let val = input.value.trim();
            if (val) selectedAny = true;
            scheduleConfig[`p${index + 1}`] = { lesson: val };
        });

        if (!selectedAny && activeInputs.length > 0) {
            alert("⚠️ يرجى اختيار/كتابة اسم الدرس أولاً للحصة المطلوبة قبل البدء!");
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

function renderAvailableClasses() {
    const container = document.getElementById('dynamicScheduleContainer');
    const statusText = document.getElementById('prepStatusText');
    if (!container) return;

    let cards = getGrade1ScienceCards();

    if (cards.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:12px; background:#fef2f2; border:1px solid #fca5a5; border-radius:6px; color:#991b1b; font-size:11px;">
                ⚠️ لا توجد حصص لعلوم الصف الأول في الصفحة الحالية.
            </div>
        `;
        if (statusText) statusText.innerText = "لم يتم العثور على حصص متاحة";
        return;
    }

    let rowsHTML = '';
    cards.forEach((card, idx) => {
        let cardText = card.innerText.replace(/\n/g, ' - ').trim();

        rowsHTML += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding:6px; font-weight:bold; font-size:10px; color:#0369a1; width:45%;">${cardText}</td>
                <td style="padding:4px; width:55%;">
                    <input type="text" class="dynamic-lesson-input" id="lesson_input_p${idx + 1}" placeholder="اكتب أو اختر اسم الدرس..." style="width:95%; padding:5px; font-size:11px; border-radius:4px; border:1px solid #cbd5e1; background:#fff;" />
                </td>
            </tr>
        `;
    });

    container.innerHTML = `
        <table style="width:100%; border-collapse:collapse; margin-bottom:5px; text-align:right;">
            <thead>
                <tr style="background:#f0f9ff; font-size:11px; color:#0369a1;">
                    <th style="padding:6px;">الحصة المتاحة</th>
                    <th style="padding:6px;">حدد اسم الدرس للبدء</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHTML}
            </tbody>
        </table>
    `;

    if (statusText) statusText.innerText = `تم العثور على (${cards.length}) حصص! حدد الدرس المطلوب للبدء.`;
}

function updateUIStatus(isRunning) {
    const startBtn = document.getElementById('btnStartBulkPrep');
    const stopBtn = document.getElementById('btnStopPrep');
    const statusText = document.getElementById('prepStatusText');

    if (isRunning) {
        if (startBtn) startBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'block';
        if (statusText) statusText.innerText = "جاري تنفيذ التحضير بناءً على الدرس المحدد... ⏳";
    } else {
        if (startBtn) startBtn.style.display = 'block';
        if (stopBtn) stopBtn.style.display = 'none';
    }
}

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

function runAutomationEngine() {
    chrome.storage.local.get(['autoPrepRunning', 'scheduleConfig', 'currentPeriodIndex'], async (data) => {
        if (!data.autoPrepRunning) return;

        const currentUrl = window.location.href;

        // 1. الشاشة الرئيسية: فتح بطاقة الحصة المحددة
        if (currentUrl.includes("/Schedule") || currentUrl.includes("/Teacher/Schedule") || !document.querySelector('select')) {
            await delay(1500);

            let cards = getGrade1ScienceCards();
            let currentIndex = data.currentPeriodIndex || 0;

            if (cards.length > currentIndex) {
                await delay(1000);
                let innerInteractive = cards[currentIndex].querySelector('a, button, div, span');
                if (innerInteractive) innerInteractive.click();
                else cards[currentIndex].click();
            } else {
                alert("🎉 تم الانتهاء من تحضير جميع الحصص المحددة بنجاح!");
                chrome.storage.local.set({ autoPrepRunning: false, currentPeriodIndex: 0 });
                updateUIStatus(false);
            }
        } 
        
        // 2. الشاشة الأولى: مطابقة واختيار اسم الدرس الذي أدخلته في القائمة المنسدلة
        else if (document.querySelector('select') && !document.querySelector('#btnSave, button[type="submit"]')) {
            await delay(2000);

            let periodKey = `p${(data.currentPeriodIndex || 0) + 1}`;
            let periodData = (data.scheduleConfig && data.scheduleConfig[periodKey]) ? data.scheduleConfig[periodKey] : {};
            let userLessonName = periodData.lesson || "";

            let selects = document.querySelectorAll('select');
            
            for (let sel of selects) {
                if (userLessonName) {
                    let matched = false;
                    Array.from(sel.options).forEach((opt, idx) => {
                        if (opt.text.includes(userLessonName)) {
                            sel.selectedIndex = idx;
                            sel.dispatchEvent(new Event('change', { bubbles: true }));
                            matched = true;
                        }
                    });
                    if (!matched && sel.options.length > 1 && sel.selectedIndex === 0) {
                        sel.selectedIndex = 1;
                        sel.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } else if (sel.options.length > 1 && sel.selectedIndex === 0) {
                    sel.selectedIndex = 1;
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
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

            if (nextBtn) nextBtn.click();
        } 
        
        // 3. الشاشة الثانية: التكليفات والتعبئة بناءً على الدرس الذي اخترته ثم الحفظ
        else if (document.querySelector('textarea') || document.querySelector('button[type="submit"]') || document.querySelector('#btnSave')) {
            await delay(2000);

            let periodKey = `p${(data.currentPeriodIndex || 0) + 1}`;
            let periodData = (data.scheduleConfig && data.scheduleConfig[periodKey]) ? data.scheduleConfig[periodKey] : {};
            let lessonName = periodData.lesson || "العلوم";

            let addEnrichmentBtn = document.querySelector('button[id*="Enrichment"], .btn-add-enrichment');
            if (addEnrichmentBtn) {
                addEnrichmentBtn.click();
                await delay(1000);
            }

            let noteTextarea = document.querySelector('textarea');
            if (noteTextarea) {
                noteTextarea.value = `متابعة حل تطبيقات وأنشطة درس (${lessonName}) في كتاب الطالب.`;
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

