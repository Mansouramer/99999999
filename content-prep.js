/**
 * ===================================================
 * أداة التحضير الذكية الشاملة - نسخة الاستقرار
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// تشغيل المحرك فوراً دون إبطاء
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrepTool);
} else {
    initPrepTool();
}

function initPrepTool() {
    createFloatingControlUI();
    runAutomationEngine();
}

/**
 * إنشاء الواجهة العائمة المباشرة
 */
function createFloatingControlUI() {
    if (document.getElementById('prep-floating-ui')) return;

    const uiBox = document.createElement('div');
    uiBox.id = 'prep-floating-ui';
    uiBox.style.cssText = `
        position: fixed; top: 10px; left: 10px; z-index: 999999;
        background: #ffffff; border: 2px solid #10b981; padding: 10px;
        border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        font-family: system-ui, sans-serif; direction: rtl; width: 260px; text-align: center;
    `;

    uiBox.innerHTML = `
        <div style="background: #10b981; color: #fff; padding: 4px; border-radius: 6px; margin-bottom: 8px; font-weight: bold; font-size: 12px;">
            🤖 أداة التحضير الذكية (1-6)
        </div>
        
        <select id="uiLessonSelect" style="width:100%; padding:6px; margin-bottom:6px; border-radius:6px; border:1px solid #ccc; font-size:11px; background:#fff;">
            <option value="">-- (تلقائي) قراءة الدرس من مدرستي --</option>
            <optgroup label="📘 علوم (1-6)">
                <option value="الطقس وفصول السنة">الطقس وفصول السنة</option>
                <option value="المخلوقات الحية">المخلوقات الحية</option>
                <option value="المادة وحالاتها">المادة وحالاتها</option>
                <option value="الخلايا والأجهزة">الخلايا والأجهزة</option>
            </optgroup>
            <optgroup label="📐 رياضيات (1-6)">
                <option value="القيمة المنزلية">القيمة المنزلية</option>
                <option value="الجمع والطرح">الجمع والطرح</option>
                <option value="الضرب والقسمة">الضرب والقسمة</option>
                <option value="الكسور والنسب">الكسور والنسب</option>
            </optgroup>
            <optgroup label="📗 لغتي (1-6)">
                <option value="حروفي وكلماتي">حروفي وكلماتي</option>
                <option value="أسرتي ومدرستي">أسرتي ومدرستي</option>
                <option value="قيم إسلامية ووطنية">قيم إسلامية ووطنية</option>
            </optgroup>
        </select>

        <input type="url" id="uiEnrichmentUrl" placeholder="🔗 رابط الإثراء (يوتيوب/عين/Drive)" style="width:92%; padding:5px; margin-bottom:6px; border-radius:6px; border:1px solid #ccc; font-size:11px;" />

        <button id="btnAddBulkLessons" style="width:100%; padding:5px; background:#0284c7; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px; margin-bottom:6px;">
            ➕ إضافة دروس مخصصة
        </button>

        <select id="uiStrategySelect" style="width:100%; padding:5px; margin-bottom:8px; border-radius:6px; border:1px solid #ccc; font-size:11px;">
            <option value="التعلم التعاوني">التعلم التعاوني</option>
            <option value="العصف الذهني">العصف الذهني</option>
            <option value="التفكير الناقد">التفكير الناقد</option>
        </select>

        <button id="btnTogglePrep" style="width:100%; padding:8px; background:#10b981; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
            بدء التحضير الشامل
        </button>
        
        <div id="prepStatusText" style="margin-top:6px; font-size:10px; color:#64748b;">الحالة: متوقف</div>
    `;

    document.body.appendChild(uiBox);

    // إضافة دروس دفعة واحدة
    document.getElementById('btnAddBulkLessons').addEventListener('click', () => {
        const bulkInput = prompt("أدخل أسماء الدروس تفصل بينها فاصلة (,):");
        if (bulkInput) {
            const lessonSelect = document.getElementById('uiLessonSelect');
            const lessonsList = bulkInput.split(',').map(l => l.trim()).filter(l => l.length > 0);
            lessonsList.forEach(lesson => {
                const opt = document.createElement('option');
                opt.value = lesson;
                opt.innerText = `📌 ${lesson}`;
                lessonSelect.appendChild(opt);
            });
            alert(`✅ تم إضافة ${lessonsList.length} درس جديد!`);
        }
    });

    chrome.storage.local.get(['autoPrepRunning'], (data) => updateUIStatus(data.autoPrepRunning));

    document.getElementById('btnTogglePrep').addEventListener('click', () => {
        chrome.storage.local.get(['autoPrepRunning'], (data) => {
            const nextState = !data.autoPrepRunning;
            const strategy = document.getElementById('uiStrategySelect').value;
            const selectedLesson = document.getElementById('uiLessonSelect').value;
            const enrichmentUrl = document.getElementById('uiEnrichmentUrl').value;

            chrome.storage.local.set({
                autoPrepRunning: nextState,
                defaultStrategy: strategy,
                selectedLesson: selectedLesson,
                customEnrichmentUrl: enrichmentUrl
            }, () => {
                updateUIStatus(nextState);
                if (nextState) {
                    if (!window.location.href.includes("/Schedule")) {
                        window.location.href = "https://schools.madrasati.sa/Teacher/Schedule";
                    } else {
                        window.location.reload();
                    }
                }
            });
        });
    });
}

/**
 * تشغيل محرك الأتمتة
 */
function runAutomationEngine() {
    chrome.storage.local.get(['autoPrepRunning', 'defaultStrategy', 'selectedLesson', 'customEnrichmentUrl'], async (data) => {
        if (!data.autoPrepRunning) return;

        const currentUrl = window.location.href;

        if (currentUrl.includes("/Schedule") || currentUrl.includes("/Teacher/Schedule")) {
            await delay(2500);
            let prepButtons = Array.from(document.querySelectorAll('a, button, .btn')).filter(el => {
                const text = el.innerText || el.textContent;
                return text.includes("قم بإعداد الدرس") || text.includes("إعداد الدرس");
            });

            if (prepButtons.length > 0) {
                await delay(1000);
                prepButtons[0].click();
            } else {
                alert("🎉 تم الانتهاء من تحضير جميع حصص الجدول بنجاح!");
                chrome.storage.local.set({ autoPrepRunning: false });
                updateUIStatus(false);
            }
        }
        else if (currentUrl.includes("/LessonPrep") || currentUrl.includes("/PrepareLesson") || currentUrl.includes("/Lesson")) {
            await delay(2000);

            let lessonTitleEl = document.querySelector('.lesson-title, h3, h4, #LessonName, .page-header');
            let autoLessonName = lessonTitleEl ? lessonTitleEl.innerText.trim() : "المقرر الدراسي";
            let finalLessonName = data.selectedLesson || autoLessonName;

            let strategySelect = document.querySelector('select[name*="Strategy"], select[id*="Strategy"]');
            if (strategySelect && strategySelect.options.length > 1) {
                strategySelect.value = data.defaultStrategy || strategySelect.options[1]?.value;
                strategySelect.dispatchEvent(new Event('change', { bubbles: true }));
            }

            await delay(800);

            let goalInput = document.querySelector('textarea[name*="Goal"], textarea[id*="Goal"], input[name*="Goal"], textarea[name*="Objective"]');
            if (goalInput) {
                goalInput.value = `أن يتعرف الطالب على المفاهيم المحددة لدرس (${finalLessonName}) ويطبق مهاراتها الأساسية بنجاح.`;
                goalInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            await delay(800);

            let enrichmentUrlInput = document.querySelector('input[name*="EnrichmentUrl"], input[id*="EnrichmentUrl"], input[placeholder*="رابط"]');
            if (enrichmentUrlInput && data.customEnrichmentUrl) {
                enrichmentUrlInput.value = data.customEnrichmentUrl;
                enrichmentUrlInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            let enrichmentSelect = document.querySelector('select[name*="Enrichment"], select[id*="Enrichment"]');
            if (enrichmentSelect && enrichmentSelect.options.length > 1) {
                enrichmentSelect.selectedIndex = 1;
                enrichmentSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }

            await delay(800);

            let homeworkSelect = document.querySelector('select[name*="Homework"], select[id*="Homework"]');
            if (homeworkSelect && homeworkSelect.options.length > 1) {
                homeworkSelect.selectedIndex = 1;
                homeworkSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }

            await delay(1500);

            let saveButton = document.querySelector('button[type="submit"], #btnSave, .btn-primary, input[type="submit"]');
            if (saveButton) {
                saveButton.click();
            }
        }
    });
}

function updateUIStatus(isRunning) {
    const btn = document.getElementById('btnTogglePrep');
    const statusText = document.getElementById('prepStatusText');
    if (!btn || !statusText) return;

    if (isRunning) {
        btn.innerText = "إيقاف الأتمتة فوراً";
        btn.style.background = "#ef4444";
        statusText.innerText = "الحالة: جاري التحضير الشامل... ⏳";
        statusText.style.color = "#059669";
    } else {
        btn.innerText = "بدء التحضير الشامل";
        btn.style.background = "#10b981";
        statusText.innerText = "الحالة: متوقف";
        statusText.style.color = "#64748b";
    }
}
