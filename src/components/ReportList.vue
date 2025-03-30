<template>
    <div class="report-list-container">
      <h2>Звіти та Документи</h2>
  
      <div class="actions-panel">
        <button @click="handleCreateReport" class="btn-create-report">
          <span class="icon">📄</span> Створити звіт
        </button>
        <div class="sign-option">
          <input type="checkbox" id="signNextReport" v-model="signNextReport" />
          <label for="signNextReport">Підписати ЕЦП при створенні</label>
        </div>
      </div>
  
      <div v-if="isLoading" class="loading-state">Завантаження звітів...</div>
      <div v-if="error" class="error-message">Помилка завантаження: {{ error }}</div>
      <div v-if="!isLoading && !error && reports.length === 0" class="no-reports">
        Створених звітів ще немає.
      </div>
  
      <div v-if="!isLoading && !error && reports.length > 0" class="report-items-list">
        <ReportItem
          v-for="report in reports"
          :key="report.id"
          :report="report"
          @view="openPdfPreview"
        />
      </div>
  
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal"> <div class="modal-content">
          <button @click="closeModal" class="modal-close-btn" title="Закрити">×</button>
          <h3>Перегляд документу: {{ pdfPreviewName }}</h3>
          <div class="pdf-viewer">
              <iframe :src="pdfPreviewUrl" width="100%" height="100%" frameborder="0">
                  Ваш браузер не підтримує iframe або не може відобразити PDF.
              </iframe>
               <div v-if="isPdfLoading" class="pdf-loading">Завантаження PDF...</div>
          </div>
        </div>
      </div>
      </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import ReportItem from './ReportItem.vue';
  
  const reports = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const signNextReport = ref(true);
  
  const isModalOpen = ref(false);
  const pdfPreviewUrl = ref('');
  const pdfPreviewName = ref('');
  const isPdfLoading = ref(false);
  
  const mockReports = [
    { id: 'rep123', name: 'Рахунок #102 від 29.03.2025', createdAt: '2025-03-29T14:55:00Z', accountIban: 'UA733220010000026201234567890', isSigned: true, pdfUrl: '/sample.pdf' }, // Используйте реальный URL или путь к PDF
    { id: 'rep124', name: 'Акт виконаних робіт #АВР-015', createdAt: '2025-03-28T10:00:00Z', accountIban: 'UA733220010000026201234567891', isSigned: false, pdfUrl: '/sample.pdf' },
    { id: 'rep125', name: 'Податкова накладна #ПН-050', createdAt: '2025-03-25T09:15:00Z', accountIban: 'UA733220010000026201234567890', isSigned: true, pdfUrl: '/sample.pdf' },
  ];
  
  async function fetchReports() {
    isLoading.value = true; error.value = null;
    console.log("Fetching reports...");
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      reports.value = mockReports;
    } catch (err) { console.error("Failed to fetch reports:", err); error.value = "Не вдалося завантажити звіти."; }
    finally { isLoading.value = false; }
  }
  
  function handleCreateReport() {
    alert(`Запит на створення звіту (Підписати: ${signNextReport.value})`);
  }
  
  function openPdfPreview(report) {
      if (!report.pdfUrl || report.pdfUrl === '#') {
          alert('Немає посилання на PDF для цього звіту.');
          return;
      }
      console.log("Opening PDF preview for:", report.name, report.pdfUrl);
      pdfPreviewUrl.value = report.pdfUrl;
      pdfPreviewName.value = report.name;
      isModalOpen.value = true;
      isPdfLoading.value = true;
  
      setTimeout(() => { isPdfLoading.value = false; }, 2000);
  }
  
  function closeModal() {
    isModalOpen.value = false;
    pdfPreviewUrl.value = '';
    pdfPreviewName.value = '';
    isPdfLoading.value = false;
  }
  
  onMounted(() => { fetchReports(); });
  
  </script>
  
  <style scoped>
  .report-list-container { padding: 1.5rem; background-color: #fff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07); font-family: sans-serif; }
  h2 { margin-top: 0; margin-bottom: 1.5rem; color: #333; font-weight: 600; border-bottom: 1px solid #eee; padding-bottom: 0.8rem; }
  .actions-panel { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; margin-bottom: 2rem; padding: 1rem; background-color: #f8f9fa; border-radius: 8px; }
  .btn-create-report { background-color: #5cb85c; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-size: 0.95rem; font-weight: 500; display: inline-flex; align-items: center; gap: 0.5rem; transition: background-color 0.2s ease; }
  .btn-create-report .icon { font-size: 1.1em; }
  .btn-create-report:hover { background-color: #4cae4c; }
  .sign-option { display: flex; align-items: center; gap: 0.5rem; }
  .sign-option input[type="checkbox"] { cursor: pointer; width: 16px; height: 16px; }
  .sign-option label { cursor: pointer; font-size: 0.9rem; color: #555; }
  .loading-state, .no-reports { text-align: center; padding: 2rem; color: #666; font-style: italic; background-color: #f9f9f9; border: 1px dashed #ddd; border-radius: 8px; margin-top: 1rem; }
  .error-message { color: #d9534f; background-color: #f2dede; border: 1px solid #ebccd1; padding: 0.8rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
    box-sizing: border-box;
  }
  
  .modal-content {
    background-color: #fff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    position: relative;
    width: 90%;
    height: 90%;
    max-width: 900px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
  
  .modal-content h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 1.1rem;
      color: #333;
      padding-right: 30px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
  }
  
  .modal-close-btn {
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 2rem;
    line-height: 1;
    color: #aaa;
    cursor: pointer;
    padding: 5px;
  }
  .modal-close-btn:hover { color: #777; }
  
  .pdf-viewer {
      flex-grow: 1;
      border: 1px solid #ccc;
      position: relative;
  }
  
  .pdf-viewer iframe {
      display: block;
  }
  .pdf-loading {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 500;
      color: #555;
  }
  </style>