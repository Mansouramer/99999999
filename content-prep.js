/**
 * ===================================================
 * أداة علوم الصف الأول - سحب التسلسل المكتمل واختيار جزئية الأسبوع
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrepTool);
} else {
    initPrepTool();
}

function initPrepTool() {
    createScienceDynamicUI();
    runAutomationEngine();
}

/**
 * جلب كروت حصص علوم الصف الأول الظاهرة بالصفحة
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
        let isDirectCardNode = text.length < 110 && el.children.length <= 4;

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

function createScienceDynamicUI() {
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
            <h3 style="margin:0; color:#0369a1; font-size:13px;">🔬 سحب تسلسل المنهج والأجزاء الفرعية</h3>
            <button id="btnCloseUI" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">إغلاق ✖</button>
        </div>

        <div style="margin-bottom:8px; display:flex; gap:6px;">
            <button id="btnFetchSchedule" style="flex:1; padding:6px; background:#0284c7; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">
                🔄 قراءة الحصص والمستويات
            </button>
            <button id="btnSendWeeklyPlan" style="flex:1; padding:6px; background:#8b5cf6; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">
                📢 نشر الخطة الأسبوعية
            </button>
        </div>

        <div id="dynamicScheduleContainer">
            <div style="text-align:center; padding:10px; font-size:11px; color:#64748b;">جاري استخراج مستويات الدروس المتاحة...</div>
        </div>

        <div style="display:flex; gap:6px; align-items:center; margin-top:10px;">
            <button id="btnStartBulkPrep" style="flex:1; padding:10px; background:#10b981; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
                🚀 بدء السحب التلقائي وتحديد أجزاء الدرس
            </button>
            <button id="btnStopPrep" style="padding:10px; background:#ef4444; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px; display:none;">
                ⏹ إيقاف
            </button>
        </div>
        <div id="prepStatusText" style="margin-top:6px; font-size:10px; color:#64748b; text-align:center;">جاهز لسحب كافة مستويات شجرة الدرس</div>
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
        let activeSelects = document.querySelectorAll('.subpart-choice');

        activeSelects.forEach((sel, index) => {
            scheduleConfig[`p${index + 1}`] = { partIndex: sel.value || "1" };
        });

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
                ⚠️ لا توجد حصص لعلوم الصف الأول في هذه الصفحة.
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
                    <select class="subpart-choice" id="part_choice_p${idx + 1}" style="width:100%; padding:5px; font-size:11px; border-radius:4px; border:1px solid #cbd5e1; background:#fff;">
                        <option value="1">📌 الجزء الأول من الدرس (تلقائي)</option>
                        <option value="2">📌 الجزء الثاني من الدرس</option>
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
                    <th style="padding:6px;">تحديد جزء الدرس لهذا الأسبوع</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHTML}
            </tbody>
        </table>
    `;

    if (statusText) statusText.innerText = `تم حصر (${cards.length}) حصص! اختر جزء الدرس ثم اضغط لبدء السحب والتحضير.`;
}

function updateUIStatus(isRunning) {
    const startBtn = document.getElementById('btnStartBulkPrep');
    const stopBtn = document.getElementById('btnStopPrep');
    const statusText = document.getElementById('prepStatusText');

    if (isRunning) {
        if (startBtn) startBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'block';
        if (statusText) statusText.innerText = "جاري سحب الشجرة والوصول للجزء المستهدف وحفظه... ⏳";
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

        // 1. فتح كارت الحصة المتاحة
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
                alert("🎉 تم الانتهاء من تحضير كافة الحصص بأجزائها المحددة بنجاح!");
                chrome.storage.local.set({ autoPrepRunning: false, currentPeriodIndex: 0 });
                updateUIStatus(false);
            }
        } 
        
        // 2. الشاشة الأولى: التدرج في القوائم المنسدلة وسحب الجزء الأخير
        else if (document.querySelector('select') && !document.querySelector('#btnSave, button[type="submit"]')) {
            await delay(2500);

            let periodKey = `p${(data.currentPeriodIndex || 0) + 1}`;
            let periodData = (data.scheduleConfig && data.scheduleConfig[periodKey]) ? data.scheduleConfig[periodKey] : {};
            let targetPartIndex = parseInt(periodData.partIndex || "1");

            let selects = Array.from(document.querySelectorAll('select'));
            let extractedLessonTitle = "";

            for (let i = 0; i < selects.length; i++) {
                let sel = selects[i];

                if (sel.options.length > 1) {
                    // إذا وصلنا للمستوى الأخير (الجزء الفرعي للدرس)
                    if (i === selects.length - 1) {
                        let chosenIdx = targetPartIndex <= sel.options.length - 1 ? targetPartIndex : 1;
                        sel.selectedIndex = chosenIdx;
                        extractedLessonTitle = sel.options[chosenIdx].text.trim();
                    } else if (sel.selectedIndex === 0) {
                        sel.selectedIndex = 1; // اختيار المستوى الأعلى (الصف / الوحدة / الفصل)
                    }

                    sel.dispatchEvent(new Event('focus', { bubbles: true }));
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                    sel.dispatchEvent(new Event('blur', { bubbles: true }));
                    await delay(1000);
                }
            }

            chrome.storage.local.set({ lastExtractedLessonTitle: extractedLessonTitle });

            let asyncRadio = document.querySelector('input[type="radio"][value*="غير متزامن"], input[type="radio"][id*="Async"]');
            if (asyncRadio) {
                asyncRadio.click();
                asyncRadio.dispatchEvent(new Event('change', { bubbles: true }));
            }

            await delay(1200);

            let nextBtn = Array.from(document.querySelectorAll('button, input[type="submit"], a.btn')).find(b => {
                const text = (b.innerText || b.textContent || "").trim();
                return text.includes("التالي");
            });

            if (nextBtn) nextBtn.click();
        } 
        
        // 3. الشاشة الثانية: تعبئة الملاحظات والتكليف والحفظ النهائي
        else if (document.querySelector('textarea') || document.querySelector('button[type="submit"]') || document.querySelector('#btnSave')) {
            await delay(2500);

            chrome.storage.local.get(['lastExtractedLessonTitle'], async (stored) => {
                let lessonTitle = stored.lastExtractedLessonTitle || "درس العلوم";

                let addEnrichmentBtn = document.querySelector('button[id*="Enrichment"], .btn-add-enrichment, a[href*="Enrichment"]');
                if (addEnrichmentBtn) {
                    addEnrichmentBtn.click();
                    await delay(1200);
                }

                let noteTextarea = document.querySelector('textarea');
                if (noteTextarea) {
                    noteTextarea.value = `متابعة الأنشطة والتطبيقات الخاصة بـ (${lessonTitle}) في كتاب الطالب.`;
                    noteTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                    noteTextarea.dispatchEvent(new Event('change', { bubbles: true }));
                }

                await delay(1500);

                chrome.storage.local.set({ currentPeriodIndex: (data.currentPeriodIndex || 0) + 1 });

                let saveBtn = Array.from(document.querySelectorAll('button, input[type="submit"], a.btn')).find(b => {
                    const text = (b.innerText || b.textContent || "").trim();
                    return text.includes("حفظ") || text.includes("إنهاء");
                });

                if (saveBtn) saveBtn.click();
            });
        }
    });
}

