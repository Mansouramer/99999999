/**
 * ===================================================
 * أداة علوم الصف الأول الابتدائي + إرسال الخطة الأسبوعية
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
 * دالة قراءة وتصفية حصص علوم الصف الأول الابتدائي فقط
 */
async function extractGrade1ScienceSchedule() {
    let statusText = document.getElementById('prepStatusText');
    if (statusText) statusText.innerText = "جاري الفحص لعلوم الصف الأول الابتدائي... ⏳";

    await delay(1200);

    // تجهيز الدروس الخاصة بمنهج علوم الصف الأول الابتدائي
    const grade1ScienceLessons = [
        "المخلوقات الحية وحاجاتها",
        "النباتات وأجزاؤها",
        "الفيزيائية والحركة",
        "الطقس وفصول السنة",
        "المادة وحالاتها",
        "الأرض ومواردها"
    ];

    for (let i = 1; i <= 7; i++) {
        let lessonSelect = document.getElementById(`lesson_p${i}`);
        if (lessonSelect) {
            let optionsHTML = `<option value="">-- اختر درس علوم (الصف الأول) --</option>`;
            grade1ScienceLessons.forEach(lesson => {
                optionsHTML += `<option value="${lesson}">${lesson}</option>`;
            });
            lessonSelect.innerHTML = optionsHTML;
        }
    }

    // البحث عن أزرار الإعداد للعلوم والصف الأول حصراً
    let allPrepButtons = Array.from(document.querySelectorAll('a, button, div, span')).filter(el => {
        const text = (el.innerText || el.textContent || "").trim();
        const hasPrepText = text === "إعداد الدرس الآن" || (text.includes("إعداد الدرس الآن") && el.children.length <= 1);
        const isVisible = el.offsetWidth > 0 && el.offsetHeight > 0 && window.getComputedStyle(el).display !== 'none';
        return hasPrepText && isVisible;
    });

    let grade1ScienceButtons = allPrepButtons.filter(btn => {
        let card = btn.closest('.card') || btn.closest('[class*="card"]') || btn.parentElement?.parentElement || btn.parentElement;
        if (card) {
            let cardText = card.innerText || card.textContent || "";
            // اشتراط وجود "العلوم" و "الصف الأول" أو "الأول" معاً
            let isScience = cardText.includes("العلوم") || cardText.includes("علوم");
            let isGrade1 = cardText.includes("الصف الأول") || cardText.includes("الأول") || cardText.includes("1");
            return isScience && isGrade1;
        }
        return false;
    });

    if (grade1ScienceButtons.length === 0) {
        if (statusText) statusText.innerText = "⚠️ لم يتم العثور على حصص (علوم الصف الأول) بحاجة للتحضير الآن.";
        return 0;
    }

    grade1ScienceButtons.forEach((btn, index) => {
        if (index < 7) {
            let lessonSelect = document.getElementById(`lesson_p${index + 1}`);
            if (lessonSelect) {
                let opt = document.createElement('option');
                opt.value = "علوم - الصف الأول";
                opt.innerText = `📌 [حصة جاهزة]: علوم الصف الأول`;
                opt.selected = true;
                lessonSelect.appendChild(opt);
            }
        }
    });

    if (statusText) statusText.innerText = `✅ تم التعرف على (${grade1ScienceButtons.length}) حصة لعلوم الصف الأول!`;
    return grade1ScienceButtons.length;
}

/**
 * دالة إرسال خطة التعلم الأسبوعية إلى صفحة الإعلانات
 */
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

    if (statusText) statusText.innerText = "جاري تعبئة ونشر خطة التعلم الأسبوعية... ⏳";
    await delay(2000);

    let titleInput = document.querySelector('input[name*="Title"], input[id*="Title"], #Title');
    let detailsInput = document.querySelector('textarea[name*="Details"], textarea[id*="Details"], #Details');

    if (titleInput && detailsInput) {
        titleInput.value = "📌 خطة التعلم الأسبوعية - مادة العلوم (الصف الأول الابتدائي)";
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));

        detailsInput.value = "أعزائي أولياء الأمور والطلاب، مرفق لكم خطة التعلم الأسبوعية لمادة العلوم للصف الأول الابتدائي. نأمل متابعة الدروس والأنشطة المحددة.";
        detailsInput.dispatchEvent(new Event('input', { bubbles: true }));

        await delay(1000);

        let publishBtn = document.querySelector('button[type="submit"], #btnSave, .btn-primary');
        if (publishBtn) {
            chrome.storage.local.set({ autoPublishPlan: false });
            publishBtn.click();
            alert("✅ تم نشر خطة التعلم الأسبوعية في الإعلانات بنجاح!");
        }
    } else {
        alert("يرجى فتح صفحة إضافة إعلان جديد بنشاط في منصة مدرستي لتمرير الخطة.");
    }
}

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

    let rowsHTML = '';
    for (let i = 1; i <= 7; i++) {
        rowsHTML += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding:6px; font-weight:bold; font-size:11px;">الحصة ${i}</td>
                <td style="padding:4px;">
                    <select id="lesson_p${i}" style="width:100%; padding:4px; font-size:11px; border-radius:4px; border:1px solid #ccc; background:#fff;">
                        <option value="">-- علوم الصف الأول --</option>
                    </select>
                </td>
                <td style="padding:4px;">
                    <input type="url" id="enrichment_p${i}" placeholder="إثراء العلوم" style="width:95%; padding:4px; font-size:11px; border-radius:4px; border:1px solid #ccc;" />
                </td>
            </tr>
        `;
    }

    uiBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h3 style="margin:0; color:#0369a1; font-size:13px;">🔬 علوم الصف الأول الابتدائي</h3>
            <button id="btnCloseUI" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">إغلاق ✖</button>
        </div>

        <div style="display:flex; gap:6px; margin-bottom:8px;">
            <button id="btnFetchSchedule" style="flex:1; padding:6px; background:#0284c7; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">
                🔄 قراءة حصص علوم الصف الأول
            </button>
            <button id="btnSendWeeklyPlan" style="flex:1; padding:6px; background:#8b5cf6; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">
                📢 نشر خطة التعلم الأسبوعية
            </button>
        </div>
        
        <table style="width:100%; border-collapse:collapse; margin-bottom:10px; text-align:right;">
            <thead>
                <tr style="background:#f0f9ff; font-size:11px; color:#0369a1;">
                    <th style="padding:6px; width:15%;">الحصة</th>
                    <th style="padding:6px; width:50%;">درس العلوم</th>
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
        <div id="prepStatusText" style="margin-top:6px; font-size:10px; color:#64748b; text-align:center;">جاهز للعمل</div>
    `;

    document.body.appendChild(uiBox);

    document.getElementById('btnCloseUI').addEventListener('click', () => {
        uiBox.style.display = 'none';
    });

    document.getElementById('btnFetchSchedule').addEventListener('click', () => {
        extractGrade1ScienceSchedule();
    });

    document.getElementById('btnSendWeeklyPlan').addEventListener('click', () => {
        sendWeeklyPlanToAnnouncements();
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

    extractGrade1ScienceSchedule();

    // التحقق من حالة النشر التلقائي لخطة الإعلانات
    chrome.storage.local.get(['autoPublishPlan'], (data) => {
        if (data.autoPublishPlan) {
            sendWeeklyPlanToAnnouncements();
        }
    });
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

            let grade1ScienceButtons = allPrepButtons.filter(btn => {
                let card = btn.closest('.card') || btn.closest('[class*="card"]') || btn.parentElement?.parentElement || btn.parentElement;
                if (card) {
                    let cardText = card.innerText || card.textContent || "";
                    let isScience = cardText.includes("العلوم") || cardText.includes("علوم");
                    let isGrade1 = cardText.includes("الصف الأول") || cardText.includes("الأول") || cardText.includes("1");
                    return isScience && isGrade1;
                }
                return false;
            });

            let currentIndex = data.currentPeriodIndex || 0;

            if (grade1ScienceButtons.length > currentIndex) {
                await delay(1000);
                grade1ScienceButtons[currentIndex].click();
            } else {
                alert("🎉 تم الانتهاء من تحضير جميع حصص علوم الصف الأول الابتدائي بنجاح!");
                chrome.storage.local.set({ autoPrepRunning: false, currentPeriodIndex: 0 });
            }
        } else {
            await delay(2500);

            let periodKey = `p${(data.currentPeriodIndex || 0) + 1}`;
            let periodData = (data.scheduleConfig && data.scheduleConfig[periodKey]) ? data.scheduleConfig[periodKey] : {};

            let lessonTitleEl = document.querySelector('.lesson-title, h3, h4, #LessonName, .page-header');
            let autoLessonName = lessonTitleEl ? lessonTitleEl.innerText.trim() : "علوم الصف الأول الابتدائي";
            let finalLessonName = periodData.lesson || autoLessonName;

            let goalInputs = document.querySelectorAll('textarea, input[type="text"]');
            goalInputs.forEach(input => {
                let parentText = input.parentElement ? input.parentElement.innerText : "";
                if (parentText.includes("هدف") || parentText.includes("الأهداف") || input.name.toLowerCase().includes("goal")) {
                    input.value = `أن يتعرف طالب الصف الأول الابتدائي على المفاهيم والمهارات العلمية الأساسية لدرس (${finalLessonName}).`;
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

