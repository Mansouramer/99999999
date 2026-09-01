/**
 * ===================================================
 * أداة التحضير الذكية الشاملة (الصفوف 1-6 ابتدائي)
 * لوحة عائمة قابلة للتحريك مع قوائم الدروس الثابتة
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

window.addEventListener('load', async () => {
    
    // 1. إنشاء الواجهة العائمة القابلة للتحريك
    createFloatingControlUI();

    // 2. قراءة حالة الأتمتة
    chrome.storage.local.get(['autoPrepRunning', 'defaultStrategy', 'selectedLesson', 'customEnrichmentUrl'], async (data) => {
        
        if (!data.autoPrepRunning) return;

        const currentUrl = window.location.href;

        // المرحلة الأولى: صفحة الجدول الدراسي
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

        // المرحلة الثانية: صفحة تحضير الدرس
        else if (currentUrl.includes("/LessonPrep") || currentUrl.includes("/PrepareLesson") || currentUrl.includes("/Lesson")) {
            await delay(2000);

            let lessonTitleEl = document.querySelector('.lesson-title, h3, h4, #LessonName, .page-header');
            let autoLessonName = lessonTitleEl ? lessonTitleEl.innerText.trim() : "المقرر الدراسي";
            let finalLessonName = data.selectedLesson || autoLessonName;

            console.log("جاري التحضير لـ:", finalLessonName);

            // أ) اختيار الاستراتيجية
            let strategySelect = document.querySelector('select[name*="Strategy"], select[id*="Strategy"]');
            if (strategySelect && strategySelect.options.length > 1) {
                strategySelect.value = data.defaultStrategy || strategySelect.options[1]?.value;
                strategySelect.dispatchEvent(new Event('change', { bubbles: true }));
            }

            await delay(800);

            // ب) تعبئة الهدف السلوكي
            let goalInput = document.querySelector('textarea[name*="Goal"], textarea[id*="Goal"], input[name*="Goal"], textarea[name*="Objective"]');
            if (goalInput) {
                goalInput.value = `أن يتعرف الطالب على المفاهيم المحددة لدرس (${finalLessonName}) ويطبق مهاراتها الأساسية بنجاح.`;
                goalInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            await delay(800);

            // ج) إضافة رابط الإثراء التلقائي
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

            // د) اختيار الواجب
            let homeworkSelect = document.querySelector('select[name*="Homework"], select[id*="Homework"]');
            if (homeworkSelect && homeworkSelect.options.length > 1) {
                homeworkSelect.selectedIndex = 1;
                homeworkSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }

            await delay(1500);

            // هـ) الحفظ والعودة للجدول
            let saveButton = document.querySelector('button[type="submit"], #btnSave, .btn-primary, input[type="submit"]');
            if (saveButton) {
                saveButton.click();
            }
        }
    });
});

/**
 * بناء الواجهة العائمة المباشرة والقابلة للتحريك
 */
function createFloatingControlUI() {
    if (document.getElementById('prep-floating-ui')) return;

    const uiBox = document.createElement('div');
    uiBox.id = 'prep-floating-ui';
    uiBox.style.cssText = `
        position: fixed; top: 80px; left: 15px; z-index: 999999;
        background: #ffffff; border: 2px solid #10b981; padding: 12px;
        border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        font-family: system-ui, sans-serif; direction: rtl; width: 280px; text-align: center;
        touch-action: none;
    `;

    uiBox.innerHTML = `
        <div id="uiHeader" style="cursor: move; background: #e2e8f0; padding: 6px; border-radius: 8px; margin-bottom: 8px; font-weight: bold; color: #1e293b; font-size: 12px;">
            🖐️ اضغط وسحب لتحريك اللوحة
        </div>
        
        <!-- اختيار الدرس المباشر -->
        <select id="uiLessonSelect" style="width:100%; padding:6px; margin-bottom:6px; border-radius:6px; border:1px solid #ccc; font-size:11px; background:#fff;">
            <option value="">-- (تلقائي) قراءة الدرس من مدرستي --</option>
            <optgroup label="📘 علوم (الصفوف 1-6)">
                <option value="الطقس وفصول السنة">الطقس وفصول السنة</option>
                <option value="المخلوقات الحية">المخلوقات الحية</option>
                <option value="المادة وحالاتها">المادة وحالاتها</option>
                <option value="الأرض والموارد">الأرض والموارد</option>
                <option value="الخلايا والأجهزة">الخلايا والأجهزة</option>
                <option value="الأنظمة البيئية">الأنظمة البيئية</option>
                <option value="القوى والحركة">القوى والحركة</option>
            </optgroup>
            <optgroup label="📐 رياضيات (الصفوف 1-6)">
                <option value="القيمة المنزلية">القيمة المنزلية</option>
                <option value="الجمع والطرح">الجمع والطرح</option>
                <option value="الضرب والقسمة">الضرب والقسمة</option>
                <option value="الكسور والنسب">الكسور والنسب</option>
                <option value="الأشكال الهندسية">الأشكال الهندسية</option>
                <option value="القياس والمساحة">القياس والمساحة</option>
            </optgroup>
            <optgroup label="📗 لغتي الجميلة (الصفوف 1-6)">
                <option value="حروفي وكلماتي">حروفي وكلماتي</option>
                <option value="أسرتي ومدرستي">أسرتي ومدرستي</option>
                <option value="أخلاقي وآدابي">أخلاقي وآدابي</option>
                <option value="صحتي وغذائي">صحتي وغذائي</option>
                <option value="قيم إسلامية ووطنية">قيم إسلامية ووطنية</option>
                <option value="الظواهر الإملائية">الظواهر الإملائية</option>
            </optgroup>
        </select>

        <!-- حقل إضافة رابط إثراء خارجي -->
        <input type="url" id="uiEnrichmentUrl" placeholder="🔗 رابط الإثراء (يوتيوب/عين/Drive)" style="width:94%; padding:5px; margin-bottom:6px; border-radius:6px; border:1px solid #ccc; font-size:11px;" />

        <!-- زر إضافة دروس دفعة واحدة -->
        <button id="btnAddBulkLessons" style="width:100%; padding:5px; background:#0284c7; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px; margin-bottom:6px;">
            ➕ إضافة دروس مخصصة دفعة واحدة
        </button>

        <!-- اختيار الاستراتيجية -->
        <select id="uiStrategySelect" style="width:100%; padding:6px; margin-bottom:8px; border-radius:6px; border:1px solid #ccc; font-size:11px;">
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

    // تفعيل التحريك
    makeElementDraggable(uiBox, document.getElementById('uiHeader'));

    const lessonSelect = document.getElementById('uiLessonSelect');

    // زر إضافة مجموعة دروس
    document.getElementById('btnAddBulkLessons').addEventListener('click', () => {
        const bulkInput = prompt("أدخل أسماء الدروس تفصل بينها فاصلة (,):");
        if (bulkInput) {
            const lessonsList = bulkInput.split(',').map(l => l.trim()).filter(l => l.length > 0);
            lessonsList.forEach(lesson => {
                const opt = document.createElement('option');
                opt.value = lesson;
                opt.innerText = `📌 ${lesson}`;
                lessonSelect.appendChild(opt);
            });
            alert(`✅ تم إضافة ${lessonsList.length} درس جديد بنجاح!`);
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

// دالة سحب وتحريك اللوحة
function makeElementDraggable(elmnt, dragHandler) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    dragHandler.onmousedown = dragMouseDown;
    dragHandler.ontouchstart = dragTouchStart;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function dragTouchStart(e) {
        let touch = e.touches[0];
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        document.ontouchend = closeDragElement;
        document.ontouchmove = elementTouchMove;
    }

    function elementTouchMove(e) {
        let touch = e.touches[0];
        pos1 = pos3 - touch.clientX;
        pos2 = pos4 - touch.clientY;
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchmove = null;
    }
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
