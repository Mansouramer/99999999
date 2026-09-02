/**
 * ===================================================
 * أداة التحضير الذكية الشاملة - محرك التنقل وتسلسل الصفحات
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
 * إنشاء الواجهة العائمة
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
            <h3 style="margin:0; color:#0369a1; font-size:13px;">🔬 أداة التحضير الذكية (مدرستي)</h3>
            <button id="btnCloseUI" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">إغلاق ✖</button>
        </div>

        <div style="display:flex; gap:6px; margin-bottom:8px;">
            <button id="btnStartBulkPrep" style="flex:1; padding:10px; background:#10b981; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
                🚀 بدء التحضير التلقائي المباشر
            </button>
            <button id="btnStopPrep" style="padding:10px; background:#ef4444; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px; display:none;">
                ⏹ إيقاف
            </button>
        </div>
        <div id="prepStatusText" style="margin-top:6px; font-size:10px; color:#64748b; text-align:center;">جاهز للعمل ومتابعة تسلسل الصفحات</div>
    `;

    document.body.appendChild(uiBox);

    document.getElementById('btnCloseUI').addEventListener('click', () => {
        uiBox.style.display = 'none';
    });

    document.getElementById('btnStartBulkPrep').addEventListener('click', () => {
        chrome.storage.local.set({ autoPrepRunning: true, currentPeriodIndex: 0 }, () => {
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

    chrome.storage.local.get(['autoPrepRunning'], (data) => {
        updateUIStatus(data.autoPrepRunning);
    });
}

function updateUIStatus(isRunning) {
    const startBtn = document.getElementById('btnStartBulkPrep');
    const stopBtn = document.getElementById('btnStopPrep');
    const statusText = document.getElementById('prepStatusText');

    if (isRunning) {
        if (startBtn) startBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'block';
        if (statusText) statusText.innerText = "جاري تنفيذ خطوات التحضير آلياً... ⏳";
    } else {
        if (startBtn) startBtn.style.display = 'block';
        if (stopBtn) stopBtn.style.display = 'none';
        if (statusText) statusText.innerText = "متوقف - جاهز للتشغيل";
    }
}

/**
 * محرك الأتمتة الرئيسي لتتبع تسلسل التحضير
 */
function runAutomationEngine() {
    chrome.storage.local.get(['autoPrepRunning', 'currentPeriodIndex'], async (data) => {
        if (!data.autoPrepRunning) return;

        const currentUrl = window.location.href;

        // -------------------------------------------------------------
        // الخطوة 1: صفحة الجدول الرئيسي (اختيار الحصة)
        // -------------------------------------------------------------
        if (currentUrl.includes("/Schedule") || currentUrl.includes("/Teacher/Schedule") || !document.querySelector('select, input[name*="Title"]')) {
            await delay(1500);

            let prepButtons = Array.from(document.querySelectorAll('a, button, div, span')).filter(el => {
                const text = (el.innerText || el.textContent || "").trim();
                return (text.includes("إعداد الدرس الآن") || text.includes("إعداد الدرس")) && el.children.length <= 1;
            });

            let currentIndex = data.currentPeriodIndex || 0;

            if (prepButtons.length > currentIndex) {
                await delay(1000);
                prepButtons[currentIndex].click();
            } else {
                alert("🎉 تم الانتهاء من تحضير كافة الحصص بنجاح!");
                chrome.storage.local.set({ autoPrepRunning: false, currentPeriodIndex: 0 });
                updateUIStatus(false);
            }
        }

        // -------------------------------------------------------------
        // الخطوة 2: الشاشة الأولى من التحضير (المسار والنمط والمصدر) - الصور 1-3
        // -------------------------------------------------------------
        else if (document.querySelector('select') && !document.querySelector('#btnSave, button[type="submit"]')) {
            await delay(2000);

            // اختيار القوائم المنسدلة للمسار التعليمي تلقائياً
            let selects = document.querySelectorAll('select');
            selects.forEach(sel => {
                if (sel.options.length > 1 && sel.selectedIndex === 0) {
                    sel.selectedIndex = 1;
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });

            await delay(1000);

            // اختيار نمط التعليم (افتراضي غير متزامن)
            let asyncRadio = document.querySelector('input[type="radio"][value*="غير متزامن"], input[type="radio"][id*="Async"]');
            if (asyncRadio) asyncRadio.click();

            await delay(1000);

            // الضغط على زر "التالي" للانتهاء من الصفحة الأولى
            let nextBtn = Array.from(document.querySelectorAll('button, input[type="submit"], a.btn')).find(b => {
                const text = (b.innerText || b.textContent || "").trim();
                return text.includes("التالي");
            });

            if (nextBtn) {
                nextBtn.click();
            }
        }

        // -------------------------------------------------------------
        // الخطوة 3: الشاشة الثانية من التحضير (التكليفات والحفظ) - الصور 4-6
        // -------------------------------------------------------------
        else if (document.querySelector('textarea') || document.querySelector('button[type="submit"]') || document.querySelector('#btnSave')) {
            await delay(2000);

            // أ) إضافة واجب أو إثراء إذا كان متاحاً في الشاشة
            let addEnrichmentBtn = document.querySelector('button[id*="Enrichment"], .btn-add-enrichment');
            let addHomeworkBtn = document.querySelector('button[id*="Homework"], .btn-add-homework');

            if (addEnrichmentBtn) {
                addEnrichmentBtn.click();
                await delay(1000);
            } else if (addHomeworkBtn) {
                addHomeworkBtn.click();
                await delay(1000);
            }

            // ب) تعبئة حقل "ملاحظات وتوجيهات المعلم"
            let noteTextarea = document.querySelector('textarea');
            if (noteTextarea) {
                noteTextarea.value = "متابعة المهارات والأنشطة الواردة في كتاب الطالب بانتظام.";
                noteTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            }

            await delay(1500);

            // ج) زيادة مؤشر الحصة للحصة التالية
            chrome.storage.local.set({ currentPeriodIndex: (data.currentPeriodIndex || 0) + 1 });

            // د) الضغط على زر "حفظ وإنهاء"
            let saveBtn = Array.from(document.querySelectorAll('button, input[type="submit"], a.btn')).find(b => {
                const text = (b.innerText || b.textContent || "").trim();
                return text.includes("حفظ") || text.includes("إنهاء");
            });

            if (saveBtn) {
                saveBtn.click();
            }
        }
    });
}

