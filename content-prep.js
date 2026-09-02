/**
 * ===================================================
 * أداة التحضير الذكية - المخصصة لمادة العلوم فقط
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrepTool);
} else {
    initPrepTool();
}

function initPrepTool() {
    createScienceScheduleUI();
    runAutomationEngine();
}

/**
 * دالة قراءة وتصفية حصص العلوم فقط من الصفحة
 */
async function extractScienceScheduleFromPage() {
    let statusText = document.getElementById('prepStatusText');
    if (statusText) statusText.innerText = "جاري البحث عن حصص العلوم فقط... ⏳";

    await delay(1200);

    // إعادة تعيين القوائم المنسدلة في اللوحة
    for (let i = 1; i <= 7; i++) {
        let lessonSelect = document.getElementById(`lesson_p${i}`);
        if (lessonSelect) {
            lessonSelect.innerHTML = `<option value="">-- اختر درس العلوم (أو سحب تلقائي) --</option>
                <optgroup label="🔬 علوم الابتدائي">
                    <option value="الطقس وفصول السنة">الطقس وفصول السنة</option>
                    <option value="المخلوقات الحية وحاجاتها">المخلوقات الحية وحاجاتها</option>
                    <option value="المادة وحالاتها">المادة وحالاتها</option>
                    <option value="الأرض ومواردها">الأرض ومواردها</option>
                    <option value="الخلايا والأجهزة">الخلايا والأجهزة</option>
                    <option value="الأنظمة البيئية">الأنظمة البيئية</option>
                    <option value="القوة والحركة">القوة والحركة</option>
                </optgroup>`;
        }
    }

    // البحث فقط عن أزرار إعداد الدرس التابعة لكروت تحتوي كلمة "العلوم"
    let allPrepButtons = Array.from(document.querySelectorAll('a, button, div, span')).filter(el => {
        const text = (el.innerText || el.textContent || "").trim();
        const hasPrepText = text === "إعداد الدرس الآن" || (text.includes("إعداد الدرس الآن") && el.children.length <= 1);
        const isVisible = el.offsetWidth > 0 && el.offsetHeight > 0 && window.getComputedStyle(el).display !== 'none';
        return hasPrepText && isVisible;
    });

    // تصفية أزرار الإعداد واختيار أزرار حصص العلوم فقط
    let scienceButtons = allPrepButtons.filter(btn => {
        let card = btn.closest('.card') || btn.closest('[class*="card"]') || btn.parentElement?.parentElement || btn.parentElement;
        if (card) {
            let cardText = card.innerText || card.textContent || "";
            return cardText.includes("العلوم") || cardText.includes("علوم");
        }
        return false;
    });

    if (scienceButtons.length === 0) {
        if (statusText) statusText.innerText = "⚠️ لم يتم العثور على حصص مادة (العلوم) بحاجة للتحضير الآن.";
        return 0;
    }

    // ربط حصص العلوم بحقول اللوحة
    scienceButtons.forEach((btn, index) => {
        if (index < 7) {
            let lessonSelect = document.getElementById(`lesson_p${index + 1}`);
            if (lessonSelect) {
                let opt = document.createElement('option');
                opt.value = "العلوم";
                opt.innerText = `📌 [حصة علوم متاحة]: العلوم`;
                opt.selected = true;
                lessonSelect.appendChild(opt);
            }
        }
    });

    if (statusText) statusText.innerText = `✅ تم التعرف على (${scienceButtons.length}) حصص لمادة العلوم فقط!`;
    return scienceButtons.length;
}

function createScienceScheduleUI() {
    if (document.getElementById('prep-schedule-ui')) return;

    const uiBox = document.createElement('div');
    uiBox.id = 'prep-schedule-ui';
    uiBox.style.cssText = `
        position: fixed; top: 15px; left: 3%; right: 3%; z-index: 999999;
        background: #ffffff; border: 2px solid #0284c7; padding: 12px;
        border-radius: 12px; box-shadow: 0 4px 25px rgba(0,0,0,0.3);
        font-family: system-ui, sans-serif; direction: rtl; max-height: 88vh; overflow-y: auto;
    `;

    let rowsHTML = '';
    for (let i = 1; i <= 7; i++) {
        rowsHTML += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding:6px; font-weight:bold; font-size:11px;">حصة علوم ${i}</td>
                <td style="padding:4px;">
                    <select id="lesson_p${i}" style="width:100%; padding:4px; font-size:11px; border-radius:4px; border:1px solid #ccc; background:#fff;">
                        <option value="">-- اختر درس العلوم --</option>
                    </select>
                </td>
                <td style="padding:4px;">
                    <input type="url" id="enrichment_p${i}" placeholder="إثراء تلقائي للعلوم" style="width:95%; padding:4px; font-size:11px; border-radius:4px; border:1px solid #ccc;" />
                </td>
            </tr>
        `;
    }

    uiBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h3 style="margin:0; color:#0369a1; font-size:13px;">🔬 لوحة تحضير مادة العلوم فقط</h3>
            <button id="btnCloseUI" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">إغلاق ✖</button>
        </div>

        <div style="margin-bottom:8px; text-align:right;">
            <button id="btnFetchSchedule" style="padding:6px 12px; background:#0284c7; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">
                🔄 قراءة حصص العلوم فقط
            </button>
        </div>
        
        <table style="width:100%; border-collapse:collapse; margin-bottom:10px; text-align:right;">
            <thead>
                <tr style="background:#f0f9ff; font-size:11px; color:#0369a1;">
                    <th style="padding:6px; width:20%;">الحصة</th>
                    <th style="padding:6px; width:45%;">درس العلوم</th>
                    <th style="padding:6px; width:35%;">الإثراء المخصص</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHTML}
            </tbody>
        </table>

        <div style="display:flex; gap:10px; align-items:center;">
            <button id="btnStartBulkPrep" style="flex:1; padding:10px; background:#0284c7; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
                🚀 بدء التحضير التلقائي للعلوم
            </button>
        </div>
        <div id="prepStatusText" style="margin-top:6px; font-size:10px; color:#64748b; text-align:center;">جاهز للتحضير</div>
    `;

    document.body.appendChild(uiBox);

    document.getElementById('btnCloseUI').addEventListener('click', () => {
        uiBox.style.display = 'none';
    });

    document.getElementById('btnFetchSchedule').addEventListener('click', () => {
        extractScienceScheduleFromPage();
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

    extractScienceScheduleFromPage();
}

function runAutomationEngine() {
    chrome.storage.local.get(['autoPrepRunning', 'scheduleConfig', 'currentPeriodIndex'], async (data) => {
        if (!data.autoPrepRunning) return;

        const currentUrl = window.location.href;

        if (!currentUrl.includes("/LessonPrep") && !currentUrl.includes("/PrepareLesson") && !currentUrl.includes("/Lesson")) {
            await delay(1200);

            let allPrepButtons = Array.from(document.querySelectorAll('a, button, div, span')).filter(el => {
                const text = (el.innerText || el.textContent || "").trim();
                const hasPrepText = text === "إعداد الدرس الآن" || (text.includes("إعداد الدرس الآن") && el.children.length <= 1);
                const isVisible = el.offsetWidth > 0 && el.offsetHeight > 0 && window.getComputedStyle(el).display !== 'none';
                return hasPrepText && isVisible;
            });

            // فلترة الحصص المفتوحة للعلوم فقط
            let scienceButtons = allPrepButtons.filter(btn => {
                let card = btn.closest('.card') || btn.closest('[class*="card"]') || btn.parentElement?.parentElement || btn.parentElement;
                if (card) {
                    let cardText = card.innerText || card.textContent || "";
                    return cardText.includes("العلوم") || cardText.includes("علوم");
                }
                return false;
            });

            let currentIndex = data.currentPeriodIndex || 0;

            if (scienceButtons.length > currentIndex) {
                await delay(1000);
                scienceButtons[currentIndex].click();
            } else {
                alert("🎉 تم الانتهاء من تحضير جميع حصص مادة العلوم بنجاح!");
                chrome.storage.local.set({ autoPrepRunning: false, currentPeriodIndex: 0 });
            }
        } else {
            await delay(2500);

            let periodKey = `p${(data.currentPeriodIndex || 0) + 1}`;
            let periodData = (data.scheduleConfig && data.scheduleConfig[periodKey]) ? data.scheduleConfig[periodKey] : {};

            let lessonTitleEl = document.querySelector('.lesson-title, h3, h4, #LessonName, .page-header');
            let autoLessonName = lessonTitleEl ? lessonTitleEl.innerText.trim() : "درس العلوم";
            let finalLessonName = periodData.lesson || autoLessonName;

            let goalInputs = document.querySelectorAll('textarea, input[type="text"]');
            goalInputs.forEach(input => {
                let parentText = input.parentElement ? input.parentElement.innerText : "";
                if (parentText.includes("هدف") || parentText.includes("الأهداف") || input.name.toLowerCase().includes("goal")) {
                    input.value = `أن يتعرف الطالب على المفاهيم والمهارات العلمية الأساسية لدرس العلوم (${finalLessonName}).`;
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

