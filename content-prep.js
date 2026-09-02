/**
 * ===================================================
 * أداة التحضير الفورية (قوائم دروس العلوم المنسدلة)
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

function isMoreThan3DaysAhead(dateString) {
    if (!dateString) return false;
    const classDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((classDate - today) / (1000 * 60 * 60 * 24));
    return diffDays > 3;
}

function generateAutoEnrichmentUrl(lessonName) {
    if (lessonName.includes("طقس") || lessonName.includes("فصول") || lessonName.includes("مادة") || lessonName.includes("خلايا")) {
        return "https://ien.edu.sa/";
    } 
    const cleanName = encodeURIComponent("شرح درس " + lessonName);
    return `https://www.youtube.com/results?search_query=${cleanName}`;
}

function generateAutoHomeworkText(lessonName) {
    return `حل أسئلة مراجعة الدرس وتقويم المهارات لدرس (${lessonName}) في كتاب الطالب.`;
}

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

    // قائمة دروس العلوم والمواد المنسدلة الجاهزة
    let scienceLessonsHTML = `
        <option value="">-- (تلقائي) سحب الدرس من مدرستي --</option>
        <optgroup label="🔬 علوم (الصفوف الأولية 1-3)">
            <option value="الطقس وفصول السنة">الطقس وفصول السنة</option>
            <option value="المخلوقات الحية وحاجاتها">المخلوقات الحية وحاجاتها</option>
            <option value="المادة وحالاتها">المادة وحالاتها</option>
            <option value="الأرض ومواردها">الأرض ومواردها</option>
            <option value="الحركة والقوى">الحركة والقوى</option>
        </optgroup>
        <optgroup label="🧪 علوم (الصفوف العليا 4-6)">
            <option value="الخلايا والأنسجة">الخلايا والأنسجة</option>
            <option value="أجهزة جسم الإنسان">أجهزة جسم الإنسان</option>
            <option value="الأنظمة البيئية">الأنظمة البيئية</option>
            <option value="التغيرات الكيميائية والفيزيائية">التغيرات الكيميائية والفيزيائية</option>
            <option value="الشمس والأرض والقمر">الشمس والأرض والقمر</option>
            <option value="القوة والحركة والآلات البسيطة">القوة والحركة والآلات البسيطة</option>
        </optgroup>
        <optgroup label="📐 رياضيات (1-6)">
            <option value="القيمة المنزلية">القيمة المنزلية</option>
            <option value="الجمع والطرح">الجمع والطرح</option>
            <option value="الضرب والقسمة">الضرب والقسمة</option>
            <option value="الكسور والنسب">الكسور والنسب</option>
        </optgroup>
        <optgroup label="📗 لغتي الجميلة (1-6)">
            <option value="حروفي وكلماتي">حروفي وكلماتي</option>
            <option value="أسرتي ومدرستي">أسرتي ومدرستي</option>
            <option value="قيم إسلامية ووطنية">قيم إسلامية ووطنية</option>
        </optgroup>
    `;

    let rowsHTML = '';
    for (let i = 1; i <= 7; i++) {
        rowsHTML += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding:6px; font-weight:bold; font-size:11px;">الحصة ${i}</td>
                <td style="padding:4px;">
                    <input type="date" id="date_p${i}" style="width:90%; padding:4px; font-size:11px; border-radius:4px; border:1px solid #ccc;" />
                </td>
                <td style="padding:4px;">
                    <select id="lesson_p${i}" style="width:100%; padding:4px; font-size:11px; border-radius:4px; border:1px solid #ccc; background:#fff;">
                        ${scienceLessonsHTML}
                    </select>
                </td>
                <td style="padding:4px;">
                    <input type="url" id="enrichment_p${i}" placeholder="توليد تلقائي للإثراء" style="width:95%; padding:4px; font-size:11px; border-radius:4px; border:1px solid #ccc;" />
                </td>
            </tr>
        `;
    }

    uiBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h3 style="margin:0; color:#1e293b; font-size:14px;">⚡ لوحة التحضير (دروس العلوم والصفوف 1-6)</h3>
            <button id="btnCloseUI" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">إغلاق ✖</button>
        </div>
        
        <table style="width:100%; border-collapse:collapse; margin-bottom:10px; text-align:right;">
            <thead>
                <tr style="background:#f1f5f9; font-size:11px; color:#475569;">
                    <th style="padding:6px; width:10%;">الحصة</th>
                    <th style="padding:6px; width:20%;">التاريخ</th>
                    <th style="padding:6px; width:40%;">اختر الدرس</th>
                    <th style="padding:6px; width:30%;">رابط الإثراء</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHTML}
            </tbody>
        </table>

        <div style="display:flex; gap:10px; align-items:center;">
            <button id="btnStartBulkPrep" style="flex:1; padding:10px; background:#10b981; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
                🚀 حفظ وبدء التحضير التلقائي
            </button>
            <button id="btnStopPrep" style="padding:10px; background:#ef4444; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px; display:none;">
                ⏹ إيقاف
            </button>
        </div>
        <div id="prepStatusText" style="margin-top:6px; font-size:10px; color:#64748b; text-align:center;">اللوحة جاهزة ومفتوحة الآن</div>
    `;

    document.body.appendChild(uiBox);

    document.getElementById('btnCloseUI').addEventListener('click', () => {
        uiBox.style.display = 'none';
    });

    document.getElementById('btnStartBulkPrep').addEventListener('click', () => {
        let scheduleConfig = {};
        for (let i = 1; i <= 7; i++) {
            let pDate = document.getElementById(`date_p${i}`).value;

            if (isMoreThan3DaysAhead(pDate)) {
                let proceed = confirm(`⚠️ تنبيه: الحصة رقم (${i}) تاريخها أبعد من 3 أيام القادمة.\nهل ترغب في استمرار تحضيرها؟`);
                if (!proceed) continue;
            }

            scheduleConfig[`p${i}`] = {
                date: pDate,
                lesson: document.getElementById(`lesson_p${i}`).value,
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
            document.getElementById('prepStatusText').innerText = "جاري التحضير التلقائي للحصص... ⏳";
        }
    });
}

function runAutomationEngine() {
    chrome.storage.local.get(['autoPrepRunning', 'scheduleConfig', 'currentPeriodIndex'], async (data) => {
        if (!data.autoPrepRunning) return;

        const currentUrl = window.location.href;

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
                alert("🎉 تم الانتهاء من تحضير الحصص بنجاح!");
                chrome.storage.local.set({ autoPrepRunning: false, currentPeriodIndex: 0 });
            }
        }
        else if (currentUrl.includes("/LessonPrep") || currentUrl.includes("/PrepareLesson") || currentUrl.includes("/Lesson")) {
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
                    input.value = `أن يتعرف الطالب على مفاهيم درس (${finalLessonName}) ويطبق مهاراته الأساسية.`;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });

            await delay(1000);

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

