/**
 * ===================================================
 * أداة التحضير الذكية - حصر القراءة على أزرار الإعداد المتاحة فقط
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrepTool);
} else {
    initPrepTool();
}

function initPrepTool() {
    createFullScheduleUI();
    runAutomationEngine();
}

/**
 * قراءة ودعم الحصص التي تحتوي زر "إعداد الدرس الآن" فعلياً فقط
 */
async function extractScheduleFromPage() {
    let statusText = document.getElementById('prepStatusText');
    if (statusText) statusText.innerText = "جاري البحث عن الحصص غير المحضرة... ⏳";

    await delay(1200);

    // إعادة تعيين جميع القوائم في اللوحة للافتراضي أولاً
    for (let i = 1; i <= 7; i++) {
        let lessonSelect = document.getElementById(`lesson_p${i}`);
        if (lessonSelect) {
            lessonSelect.innerHTML = `<option value="">-- (تلقائي) قراءة من مدرستي --</option>
                <optgroup label="🔬 علوم"><option value="الطقس وفصول السنة">الطقس وفصول السنة</option></optgroup>`;
        }
    }

    // البحث الدقيق عن أزرار "إعداد الدرس الآن" الظاهرة فقط
    let prepButtons = Array.from(document.querySelectorAll('a, button, div, span')).filter(el => {
        const text = (el.innerText || el.textContent || "").trim();
        // التأكد من وجود نص "إعداد الدرس الآن" تحديداً وأن العنصر عبارة عن زر
        const hasPrepText = text === "إعداد الدرس الآن" || (text.includes("إعداد الدرس الآن") && el.children.length <= 1);
        const isVisible = el.offsetWidth > 0 && el.offsetHeight > 0 && window.getComputedStyle(el).display !== 'none';
        return hasPrepText && isVisible;
    });

    if (prepButtons.length === 0) {
        if (statusText) statusText.innerText = "🎉 جميع حصص اليوم محضرة مسبقاً أو لا توجد حصص لإعدادها.";
        return 0;
    }

    // ربط الأزرار المتاحة فقط بالحصص بترتيب ظهورها
    prepButtons.forEach((btn, index) => {
        if (index < 7) {
            let card = btn.closest('.card') || btn.closest('[class*="card"]') || btn.parentElement?.parentElement;
            let subjectName = "العلوم";

            if (card) {
                let cardText = card.innerText || card.textContent || "";
                if (cardText.includes("العلوم")) subjectName = "العلوم";
                else if (cardText.includes("الرياضيات")) subjectName = "الرياضيات";
                else if (cardText.includes("لغتي")) subjectName = "لغتي";
            }

            let lessonSelect = document.getElementById(`lesson_p${index + 1}`);
            if (lessonSelect) {
                let opt = document.createElement('option');
                opt.value = subjectName;
                opt.innerText = `📌 [تحضير متاح]: ${subjectName}`;
                opt.selected = true;
                lessonSelect.appendChild(opt);
            }
        }
    });

    if (statusText) statusText.innerText = `✅ تم التعرف على (${prepButtons.length}) حصص فقط بحاجة للتحضير الآن!`;
    return prepButtons.length;
}

function createFullScheduleUI() {
    if (document.getElementById('prep-schedule-ui')) return;

    const uiBox = document.createElement('div');
    uiBox.id = 'prep-schedule-ui';
    uiBox.style.cssText = `
        position: fixed; top: 15px; left: 3%; right: 3%; z-index: 999999;
        background: #ffffff; border: 2px solid #10b981; padding: 12px;
        border-radius: 12px; box-shadow: 0 4px 25px rgba(0,0,0,0.3);
        font-family: system-ui, sans-serif; direction: rtl; max-height: 88vh; overflow-y: auto;
    `;

    let rowsHTML = '';
    for (let i = 1; i <= 7; i++) {
        rowsHTML += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding:6px; font-weight:bold; font-size:11px;">الحصة ${i}</td>
                <td style="padding:4px;">
                    <select id="lesson_p${i}" style="width:100%; padding:4px; font-size:11px; border-radius:4px; border:1px solid #ccc; background:#fff;">
                        <option value="">-- (تلقائي) قراءة من مدرستي --</option>
                    </select>
                </td>
                <td style="padding:4px;">
                    <input type="url" id="enrichment_p${i}" placeholder="إثراء تلقائي" style="width:95%; padding:4px; font-size:11px; border-radius:4px; border:1px solid #ccc;" />
                </td>
            </tr>
        `;
    }

    uiBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h3 style="margin:0; color:#1e293b; font-size:13px;">⚡ لوحة تحضير الحصص المتاحة فقط</h3>
            <button id="btnCloseUI" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">إغلاق ✖</button>
        </div>

        <div style="margin-bottom:8px; text-align:right;">
            <button id="btnFetchSchedule" style="padding:6px 12px; background:#0284c7; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">
                🔄 قراءة الحصص غير المحضرة الآن
            </button>
        </div>
        
        <table style="width:100%; border-collapse:collapse; margin-bottom:10px; text-align:right;">
            <thead>
                <tr style="background:#f1f5f9; font-size:11px; color:#475569;">
                    <th style="padding:6px; width:15%;">الحصة</th>
                    <th style="padding:6px; width:50%;">المادة / الحالة</th>
                    <th style="padding:6px; width:35%;">الإثراء</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHTML}
            </tbody>
        </table>

        <div style="display:flex; gap:10px; align-items:center;">
            <button id="btnStartBulkPrep" style="flex:1; padding:10px; background:#10b981; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
                🚀 بدء التحضير التلقائي
            </button>
        </div>
        <div id="prepStatusText" style="margin-top:6px; font-size:10px; color:#64748b; text-align:center;">جاهز للتحضير</div>
    `;

    document.body.appendChild(uiBox);

    document.getElementById('btnCloseUI').addEventListener('click', () => {
        uiBox.style.display = 'none';
    });

    document.getElementById('btnFetchSchedule').addEventListener('click', () => {
        extractScheduleFromPage();
    });

    document.getElementById('btnStartBulkPrep').addEventListener('click', () => {
        let scheduleConfig = {};
        for (let i = 1; i <= 7; i++) {
            scheduleConfig[`p${i}`] = {
                lesson: document.getElementById(`lesson_p${i}`).value,
                enrichment: document.getElementById(`enrichment_p${i}`).value.trim()
            };
        }

        chrome.storage.local.set({
            autoPrepRunning: true,
            scheduleConfig: scheduleConfig,
            currentPeriodIndex: 0
        }, () => {
            runAutomationEngine();
        });
    });

    extractScheduleFromPage();
}

function runAutomationEngine() {
    chrome.storage.local.get(['autoPrepRunning', 'scheduleConfig', 'currentPeriodIndex'], async (data) => {
        if (!data.autoPrepRunning) return;

        const currentUrl = window.location.href;

        if (!currentUrl.includes("/LessonPrep") && !currentUrl.includes("/PrepareLesson") && !currentUrl.includes("/Lesson")) {
            await delay(1200);

            // اختيار أزرار الإعداد المتاحة فقط
            let prepButtons = Array.from(document.querySelectorAll('a, button, div, span')).filter(el => {
                const text = (el.innerText || el.textContent || "").trim();
                const hasPrepText = text === "إعداد الدرس الآن" || (text.includes("إعداد الدرس الآن") && el.children.length <= 1);
                const isVisible = el.offsetWidth > 0 && el.offsetHeight > 0 && window.getComputedStyle(el).display !== 'none';
                return hasPrepText && isVisible;
            });

            let currentIndex = data.currentPeriodIndex || 0;

            if (prepButtons.length > currentIndex) {
                await delay(1000);
                prepButtons[currentIndex].click();
            } else {
                alert("🎉 تم الانتهاء من تحضير الحصص غير المحضرة اليوم بنجاح!");
                chrome.storage.local.set({ autoPrepRunning: false, currentPeriodIndex: 0 });
            }
        } else {
            await delay(2500);

            let periodKey = `p${(data.currentPeriodIndex || 0) + 1}`;
            let periodData = (data.scheduleConfig && data.scheduleConfig[periodKey]) ? data.scheduleConfig[periodKey] : {};

            let lessonTitleEl = document.querySelector('.lesson-title, h3, h4, #LessonName, .page-header');
            let autoLessonName = lessonTitleEl ? lessonTitleEl.innerText.trim() : "المقرر الدراسي";
            let finalLessonName = periodData.lesson || autoLessonName;

            let goalInputs = document.querySelectorAll('textarea, input[type="text"]');
            goalInputs.forEach(input => {
                let parentText = input.parentElement ? input.parentElement.innerText : "";
                if (parentText.includes("هدف") || parentText.includes("الأهداف") || input.name.toLowerCase().includes("goal")) {
                    input.value = `أن يتعرف الطالب على مفاهيم درس (${finalLessonName}) ويطبق مهاراته.`;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });

            await delay(1000);

            let allSelects = document.querySelectorAll('select');
            allSelects.forEach(select => {
                if (select.options.length > 1) {
                    select.selectedIndex = 1;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });

            await delay(1500);

            chrome.storage.local.set({ currentPeriodIndex: (data.currentPeriodIndex || 0) + 1 });

            let saveButtons = Array.from(document.querySelectorAll('button, input[type="submit"], a.btn')).filter(btn => {
                const text = btn.innerText || btn.textContent || btn.value;
                return text.includes("حفظ") || text.includes("إنهاء");
            });

            if (saveButtons.length > 0) {
                saveButtons[0].click();
            }
        }
    });
}

