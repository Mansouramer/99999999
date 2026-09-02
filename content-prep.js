/**
 * ===================================================
 * أداة علوم الصف الأول - التعبئة الآلية المستمرة عند التنقل
 * ===================================================
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoObserver);
} else {
    initAutoObserver();
}

function initAutoObserver() {
    createMiniStatusUI();
    // بدء فحص وتعبئة محتوى الصفحة الحالية فور تحميلها
    autoProcessCurrentPage();
}

/**
 * شريط حالة علوي صامت ومباشر
 */
function createMiniStatusUI() {
    if (document.getElementById('prep-mini-ui')) return;

    const uiBox = document.createElement('div');
    uiBox.id = 'prep-mini-ui';
    uiBox.style.cssText = `
        position: fixed; top: 10px; left: 3%; right: 3%; z-index: 999999;
        background: #0284c7; color: #ffffff; padding: 8px 14px;
        border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        font-family: system-ui, sans-serif; font-size: 11px; font-weight: bold;
        display: flex; justify-content: space-between; align-items: center; direction: rtl;
    `;

    uiBox.innerHTML = `
        <span>🔬 أداة التعبئة الآلية (تراقب التنقل بين الصفحات)</span>
        <span id="autoStatusLabel" style="background:#0369a1; padding:3px 8px; border-radius:4px;">جاهز للتعبئة...</span>
    `;

    document.body.appendChild(uiBox);
}

function updateStatusLabel(text, bgColor = "#0369a1") {
    const label = document.getElementById('autoStatusLabel');
    if (label) {
        label.innerText = text;
        label.style.background = bgColor;
    }
}

/**
 * المحرك الأساسي: قراءة مكونات الصفحة الحالية والتعبئة الفورية
 */
async function autoProcessCurrentPage() {
    await delay(1200); // مهلة قصيرة لاكتمال تحميل عناصر الصفحة

    // 1. الشاشة الأولى: المسار التعليمي والقوائم المنسدلة
    const hasSelects = document.querySelector('select');
    const isStep1 = hasSelects && !document.querySelector('#btnSave, button[type="submit"]');

    if (isStep1) {
        updateStatusLabel("جاري سحب المسار وقوائم الدرس... ⏳", "#d97706");

        let selects = Array.from(document.querySelectorAll('select'));

        for (let i = 0; i < selects.length; i++) {
            let sel = selects[i];
            if (sel.options.length > 1 && sel.selectedIndex === 0) {
                sel.selectedIndex = 1; // اختيار المستوى التلقائي المتاح
                sel.dispatchEvent(new Event('focus', { bubbles: true }));
                sel.dispatchEvent(new Event('change', { bubbles: true }));
                sel.dispatchEvent(new Event('blur', { bubbles: true }));
                await delay(800);
            }
        }

        // تحديد نمط التعليم غير المتزامن
        let asyncRadio = document.querySelector('input[type="radio"][value*="غير متزامن"], input[type="radio"][id*="Async"]');
        if (asyncRadio) {
            asyncRadio.click();
            asyncRadio.dispatchEvent(new Event('change', { bubbles: true }));
        }

        updateStatusLabel("✅ تم تعبئة المسار التعليمي بنجاح!", "#059669");
        return;
    }

    // 2. الشاشة الثانية: الوسائط، مهارات التفكير، إغلاق الدرس، والتكليفات
    const hasTextareas = document.querySelector('textarea');
    const isStep2 = hasTextareas || document.innerText?.includes("مهارات التفكير") || document.innerText?.includes("الوسائط");

    if (isStep2) {
        updateStatusLabel("جاري تعبئة الوسائط والمهارات والتكليفات... ⏳", "#d97706");

        // تحديد الوسائط الاجتماعية
        let mediaCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
        if (mediaCheckboxes.length > 0 && !mediaCheckboxes[0].checked) {
            mediaCheckboxes[0].click();
            mediaCheckboxes[0].dispatchEvent(new Event('change', { bubbles: true }));
        }

        // تعبئة مهارات التفكير
        let thinkingArea = Array.from(document.querySelectorAll('textarea')).find(t => {
            let p = t.placeholder || "";
            let parent = t.parentElement?.innerText || "";
            return p.includes("التفكير") || parent.includes("مهارات التفكير");
        });
        if (thinkingArea && !thinkingArea.value) {
            thinkingArea.value = "الملاحظة، المقارنة، والاستنتاج؛ للتمييز بين الكائنات الحية وغير الحية.";
            thinkingArea.dispatchEvent(new Event('input', { bubbles: true }));
            thinkingArea.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // تعبئة إغلاق الدرس
        let closingArea = Array.from(document.querySelectorAll('textarea')).find(t => {
            let p = t.placeholder || "";
            let parent = t.parentElement?.innerText || "";
            return p.includes("إغلاق") || parent.includes("إغلاق الدرس");
        });
        if (closingArea && !closingArea.value) {
            closingArea.value = "تلخيص المفاهيم الأساسية للدرس والتأكد من تحقيق أهداف التعلم.";
            closingArea.dispatchEvent(new Event('input', { bubbles: true }));
            closingArea.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // تعبئة الملاحظات والتكليفات العامة
        let generalAreas = document.querySelectorAll('textarea');
        generalAreas.forEach(ta => {
            if (!ta.value) {
                ta.value = "متابعة حل الأنشطة والتطبيقات المحددة لمادة العلوم في كتاب الطالب.";
                ta.dispatchEvent(new Event('input', { bubbles: true }));
                ta.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        // إضافة الإثراء التلقائي
        let addEnrichmentBtn = document.querySelector('button[id*="Enrichment"], .btn-add-enrichment, a[href*="Enrichment"]');
        if (addEnrichmentBtn) {
            addEnrichmentBtn.click();
            await delay(1000);
        }

        updateStatusLabel("✅ تم تعبئة جميع الأيقونات! يمكنك الحفظ الآن.", "#059669");
        return;
    }

    updateStatusLabel("جاهز للتعبئة فور الانتقال لصفحة إعداد...", "#0369a1");
}

