<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>جدول التحضير الشامل</title>
  <style>
    :root {
      --bg-main: #121212;
      --card-bg: #1e1e1e;
      --input-bg: #2a2a2a;
      --border-color: #333333;
      --primary-accent: #00e676;
      --danger-color: #ff5252;
      --text-main: #ffffff;
      --text-muted: #a0a0a0;
    }

    body {
      background-color: var(--bg-main);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 15px;
      box-sizing: border-box;
    }

    .prep-card {
      background: var(--card-bg);
      border: 2px solid var(--primary-accent);
      border-radius: 16px;
      padding: 20px;
      max-width: 550px;
      width: 100%;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      color: var(--text-main);
    }

    .prep-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 12px;
    }

    .prep-header h2 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: bold;
    }

    .sub-title {
      font-size: 0.85rem;
      font-weight: normal;
      color: var(--text-muted);
      display: block;
      margin-top: 4px;
    }

    .close-btn {
      background: var(--danger-color);
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      font-size: 0.85rem;
    }

    .table-grid {
      display: grid;
      grid-template-columns: 80px 1fr 1fr;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
    }

    .header-row {
      font-weight: bold;
      font-size: 0.8rem;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 12px;
    }

    .period-label {
      text-align: center;
      font-weight: bold;
      font-size: 0.85rem;
    }

    .input-field {
      background: var(--input-bg);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 8px 10px;
      border-radius: 8px;
      font-size: 0.8rem;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      width: 100%;
      box-sizing: border-box;
    }

    .input-field:focus {
      outline: none;
      border-color: var(--primary-accent);
    }

    .btn-submit {
      width: 100%;
      background: var(--primary-accent);
      color: #000;
      font-weight: bold;
      font-size: 1rem;
      padding: 12px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      margin-top: 15px;
      transition: opacity 0.2s, transform 0.1s;
    }

    .btn-submit:hover {
      opacity: 0.9;
    }

    .btn-submit:active {
      transform: scale(0.99);
    }

    .status-text {
      text-align: center;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 8px;
      margin-bottom: 0;
    }
  </style>
</head>
<body>

  <div class="prep-card">
    
    <div class="prep-header">
      <div>
        <h2>⚡ جدول التحضير الشامل</h2>
        <span class="sub-title">(توليد كامل للدرس + واجبات وإثراءات)</span>
      </div>
      <button class="close-btn">إغلاق &#10005;</button>
    </div>

    <div class="table-grid header-row">
      <div>الحصة</div>
      <div>اسم الدرس (اختياري)</div>
      <div>رابط الإثراء (توليد تلقائي)</div>
    </div>

    <div class="table-body">
      
      <div class="table-grid">
        <div class="period-label">الحصة 1</div>
        <input type="text" class="input-field" placeholder="(تلقائي) سحب الدرس من الخطة" />
        <input type="text" class="input-field" placeholder="توليد تلقائي للإثراء" />
      </div>

      <div class="table-grid">
        <div class="period-label">الحصة 2</div>
        <input type="text" class="input-field" placeholder="(تلقائي) سحب الدرس من الخطة" />
        <input type="text" class="input-field" placeholder="توليد تلقائي للإثراء" />
      </div>

      <div class="table-grid">
        <div class="period-label">الحصة 3</div>
        <input type="text" class="input-field" placeholder="(تلقائي) سحب الدرس من الخطة" />
        <input type="text" class="input-field" placeholder="توليد تلقائي للإثراء" />
      </div>

      <div class="table-grid">
        <div class="period-label">الحصة 4</div>
        <input type="text" class="input-field" placeholder="(تلقائي) سحب الدرس من الخطة" />
        <input type="text" class="input-field" placeholder="توليد تلقائي للإثراء" />
      </div>

      <div class="table-grid">
        <div class="period-label">الحصة 5</div>
        <input type="text" class="input-field" placeholder="(تلقائي) سحب الدرس من الخطة" />
        <input type="text" class="input-field" placeholder="توليد تلقائي للإثراء" />
      </div>

      <div class="table-grid">
        <div class="period-label">الحصة 6</div>
        <input type="text" class="input-field" placeholder="(تلقائي) سحب الدرس من الخطة" />
        <input type="text" class="input-field" placeholder="توليد تلقائي للإثراء" />
      </div>

      <div class="table-grid">
        <div class="period-label">الحصة 7</div>
        <input type="text" class="input-field" placeholder="(تلقائي) سحب الدرس من الخطة" />
        <input type="text" class="input-field" placeholder="توليد تلقائي للإثراء" />
      </div>

    </div>

    <div class="prep-footer">
      <button class="btn-submit">🚀 بدء التحضير الشامل وتوليد المحتوى الكامل</button>
      <p class="status-text">جاهز للعمل - سيتم إنشاء الدرس كاملاً تلقائياً</p>
    </div>

  </div>

</body>
</html>

