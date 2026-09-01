/**
 * ===================================================
 * أداة التحضير المتكاملة (توليد تلقائي للأهداف والواجبات والإثراءات)
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
 * دالة التوليد الذكي لرابط الإثراء بحسب اسم الدرس
 */
function generateAutoEnrichmentUrl(lessonName) {
    if (lessonName.includes("طقس") || lessonName.includes("فصول") || lessonName.includes("مادة") || lessonName.includes("خلايا")) {
        return "https://ien.edu.sa/";
    } 
    const cleanName = encodeURIComponent("شرح درس " + lessonName);
    return `https://www.youtube.com/results?search_query=${cleanName}`;
}

/**
 * دالة التوليد الذكي لنص الواجب المنزلي
 */
function generateAutoHomeworkText(lessonName) {
    return `حل أسئلة مراجعة الدرس وتقويم المهارات لدرس (${lessonName}) في كتاب الطالب.`;
}

/**
 * واجهة الجدول الشاملة
 */
function createFullScheduleUI() {
    if (document.getElementById('prep-schedule-ui')) return;

    const uiBox = document.createElement('div');
    uiBox.id = 'prep-schedule-ui';
    uiBox.style.cssText = `
        position: fixed; top: 15px; left: 3%; right: 3%; z-index: 999999;
        background: #ffffff; border: 2px solid #10b981; padding: 15px;
        border-radius: 12px; box-shadow: 0 4px 25px rgba(0,0,0,0.3);
        font-family: system-ui, sans-serif; direction: rtl; max-height: 88vh; overflow-y: auto;
    `;

    let rowsHTML = '';
    for (let i = 1; i <= 7; i++) {
        rowsHTML += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding:6px; font-weight:bold; font-size:11px;">الحصة ${i}</td>
                <td style="padding:4px;">
                    <input type="text" id="lesson_p${i}" placeholder="(تلقائي) سحب الدرس من مدرستي" style="width:95%; padding:4px; font-size:11px; border-radius:4px; border:1px solid #ccc;" />
                </td>
                <td style="padding:4px;">
                    <input type="url" id="enrichment_p${i}" placeholder="توليد تلقائي للإثراء" style="width:95%; padding:4px; font-size:11px; border-radius:4px; border:1px solid #ccc;" />
                </td>
            </tr>
        `;
    }

    uiBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h3 style="margin:0; color:#1e293b; font-size:14px;">⚡ جدول التحضير الشامل (توليد كامل للدرس + واجبات وإثراءات)</h3>
            <button id="btnCloseUI" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">إغلاق ✖</button>
        </div>
        
        <table style="width:100%; border-collapse:collapse; margin-bottom:10px; text-align:right;">
            <thead>
                <tr style="background:#f1f5f9; font-size:11px; color:#475569;">
                    <th style="padding:6px; width:15%;">الحصة</th>
                    <th style="padding:6px; width:45%;">اسم الدرس (اختياري)</th>
                    <th style="padding:6px; width:40%;">رابط الإثراء (توليد تلقائي عند الفراغ)</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHTML}
            </tbody>
        </table>

        <div style="display:flex; gap:10px; align-items:center;">
            <button id="btnStartBulkPrep" style="flex:1; padding:10px; background:#10b981; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
                🚀 بدء التحضير الشامل وتوليد المحتوى الكامل
            </button>
            <button id="btnStopPrep" style="padding:10px; background:#ef4444; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px; display:none;">
                ⏹ إيقاف
            </button>
        </div>
        <div id="prepStatusText" style="margin-top:6px; font-size:10px; color:#64748b; text-align:center;">جاهز للعمل - سيتم إنشاء الدرس كاملاً تلقائياً</div>
    `;

    document.body.appendChild(uiBox);

    document.getElementById('btnCloseUI').addEventListener('click', () => {
        uiBox.style.display = 'none';
    });

    document.getElementById('btnStartBulkPrep').addEventListener('click', () => {
        let scheduleConfig = {};
        for (let i = 1; i <= 7; i++) {
            scheduleConfig[`p${i}`] = {
                lesson: document.getElementById(`lesson_p${i}`).value.trim(),
                enrichment: document.getElementById(`enrichment_p${i}`).value.trim()
            };
        }

        chrome.storage.local.set({
            autoPrepRunning: true,
            scheduleConfig: scheduleConfig,
            currentPeriodIndex: 0
        }, () => {
            if (!window.location.href.includes("/Schedule")) {
                window.location.href = "https://schools.madrasati.sa/Teacher/Schedule";
            } else {
                window.location.reload();
            }
        });
    });

    document.getElementById('btnStopPrep').addEventListener('click', () => {
        chrome.storage.local.set({ autoPrepRunning: false }, () => {
            window.location.reload();
        });
    });

    chrome.storage.local.get(['autoPrepRunning'], (data) => {
        if (data.autoPrepRunning) {
            document.getElementById('btnStartBulkPrep').style.display = 'none';
            document.getElementById('btnStopPrep').style.display = 'block';
            document.getElementById('prepStatusText').innerText = "جاري تحضير الحصص وتوليد الواجبات والإثراءات... ⏳";
        }
    });
}

/**
 * المحرك الآلي
 */
function runAutomationEngine() {
    chrome.storage.local.get(['autoPrepRunning', 'scheduleConfig', 'currentPeriodIndex'], async (data) => {
        if (!data.autoPrepRunning) return;

        const currentUrl = window.location.href;

        // 1. صفحة الجدول
        if (currentUrl.includes("/Schedule") || currentUrl.includes("/Teacher/Schedule")) {
            await delay(2500);

            let prepButtons = Array.from(document.querySelectorAll('a, button, .btn')).filter(el => {
                const text = el.innerText || el.textContent;
                return text.includes("قم بإعداد الدرس") || text.includes("إعداد الدرس");
            });

            let currentIndex = data.currentPeriodIndex || 0;

            if (prepButtons.length > currentIndex) {
                await delay(1000);
                prepButtons[currentIndex].click();
            } else {
                alert("🎉 تم الانتهاء من تحضير جميع الحصص بكامل مكوناتها بنجاح!");
                chrome.storage.local.set({ autoPrepRunning: false, currentPeriodIndex: 0 });
            }
        }
        
        // 2. صفحة التحضير
        else if (currentUrl.includes("/LessonPrep") || currentUrl.includes("/PrepareLesson") || currentUrl.includes("/Lesson")) {
            await delay(2500);

            let periodKey = `p${(data.currentPeriodIndex || 0) + 1}`;
            let periodData = (data.scheduleConfig && data.scheduleConfig[periodKey]) ? data.scheduleConfig[periodKey] : {};

            // أ) قراءة اسم الدرس
            let lessonTitleEl = document.querySelector('.lesson-title, h3, h4, #LessonName, .page-header');
            let autoLessonName = lessonTitleEl ? lessonTitleEl.innerText.trim() : "المقرر الدراسي";
            let finalLessonName = periodData.lesson || autoLessonName;

            // ب) تعبئة الأهداف السلوكية
            let goalInputs = document.querySelectorAll('textarea, input[type="text"]');
            goalInputs.forEach(input => {
                let parentText = input.parentElement ? input.parentElement.innerText : "";
                if (parentText.includes("هدف") || parentText.includes("الأهداف") || input.name.toLowerCase().includes("goal")) {
                    input.value = `أن يتعرف الطالب على مفاهيم درس (${finalLessonName}) ويطبق مهاراته الأساسية.`;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });

            await delay(1000);

            // ج) اختيار الواجبات والإثراءات والاستراتيجيات المتاحة في القوائم المنسدلة
            let homeworkSet = false;
            let enrichmentSet = false;

            let allSelects = document.querySelectorAll('select');
            allSelects.forEach(select => {
                let parentText = select.parentElement ? select.parentElement.innerText : "";
                if (select.options.length > 1) {
                    select.selectedIndex = 1;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    if (parentText.includes("واجب") || select.name.toLowerCase().includes("homework")) {
                        homeworkSet = true;
                    }
                    if (parentText.includes("إثراء") || select.name.toLowerCase().includes("enrichment")) {
                        enrichmentSet = true;
                    }
                }
            });

            await delay(1000);

            // د) توليد الواجب المنزلي تلقائياً في حال عدم وجود قائمة واجبات أو كانت فارغة
            if (!homeworkSet) {
                let homeworkTextInputs = document.querySelectorAll('textarea, input[type="text"]');
                homeworkTextInputs.forEach(input => {
                    let parentText = input.parentElement ? input.parentElement.innerText : "";
                    if (parentText.includes("واجب") || parentText.includes("ملاحظات") || input.name.toLowerCase().includes("homework")) {
                        input.value = generateAutoHomeworkText(finalLessonName);
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            }

            // هـ) توليد رابط الإثراء التلقائي في حال عدم وجود إثراء مدمج
            let finalEnrichmentUrl = periodData.enrichment || generateAutoEnrichmentUrl(finalLessonName);
            if (!enrichmentSet || periodData.enrichment) {
                let urlInputs = document.querySelectorAll('input[type="url"], input[type="text"]');
                urlInputs.forEach(input => {
                    let parentText = input.parentElement ? input.parentElement.innerText : "";
                    if (parentText.includes("رابط") || parentText.includes("إثراء") || input.placeholder.includes("http")) {
                        input.value = finalEnrichmentUrl;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            }

            await delay(1500);

            // زيادة مؤشر الحصة
            chrome.storage.local.set({ currentPeriodIndex: (data.currentPeriodIndex || 0) + 1 });

            // ضغط زر حفظ الدرس
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
