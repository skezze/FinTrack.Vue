<template>
  <div class="report-generator-container">
    <h2>Створення Звіту</h2>

    <div class="actions-panel">
       <div class="form-group">
            <label for="report-account">Рахунок:</label>
            <select id="report-account" v-model="selectedAccountId" class="input-select">
                <option disabled value="">Виберіть рахунок</option>
                <option v-for="acc in availableAccounts" :key="acc.id" :value="acc.id">
                    {{ acc.iban || acc.id }} ({{ formatCurrency(acc.balance, acc.currencyCode) }})
                </option>
            </select>
       </div>
        <div class="form-group">
            <label for="report-start-date">З:</label>
            <input type="date" id="report-start-date" v-model="startDate" class="input-date" />
        </div>
         <div class="form-group">
            <label for="report-end-date">По:</label>
            <input type="date" id="report-end-date" v-model="endDate" class="input-date" />
        </div>
        <button @click="handleCreateReport" class="btn-create-report" :disabled="isGenerating || !selectedAccountId">
         <span class="icon">📄</span>
         {{ isGenerating ? 'Генерація...' : 'Сформувати звіт' }}
       </button>
       <div class="sign-option">
         <input type="checkbox" id="signNextReport" v-model="signDocument" :disabled="isGenerating"/>
         <label for="signNextReport">Підписати ЕЦП при створенні</label>
       </div>
     </div>

    <div v-if="isGenerating" class="loading-state">Генерація звіту, зачекайте...</div>
    <div v-if="generationError" class="error-message">Помилка генерації: {{ generationError }}</div>
    <div v-if="generationSuccess" class="success-message">Звіт успішно згенеровано. Відкривається або завантажується...</div>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/client';

const isGenerating = ref(false);
const generationError = ref(null);
const generationSuccess = ref(false);

const selectedAccountId = ref('');
const startDate = ref('');
const endDate = ref('');
const signDocument = ref(true);

const availableAccounts = ref([]);

async function fetchAvailableAccounts() {
     try {
        const response = await apiClient.get('/Monobank/GetClientInfo');
        if (response.data && Array.isArray(response.data.accounts)) {
            availableAccounts.value = response.data.accounts;
        }
     } catch (err) {
         console.error("Failed to fetch accounts for selection:", err);
         generationError.value = "Не вдалося завантажити список рахунків для вибору.";
     }
}

async function handleCreateReport() {
  if (!selectedAccountId.value) {
      generationError.value = "Будь ласка, виберіть рахунок.";
      return;
  }

  isGenerating.value = true;
  generationError.value = null;
  generationSuccess.value = false;

  const requestPayload = {
    accountId: selectedAccountId.value,
    startDate: startDate.value || null,
    endDate: endDate.value || null,
    signDocument: signDocument.value,
    reportType: "TransactionSummary"
  };

  try {
    debugger;
    console.log("Requesting report generation with payload:", requestPayload);
    const response = await apiClient.post('/Report/Generate', requestPayload, {
      responseType: 'blob'
    });

     if (response.data.type !== 'application/pdf') {
        throw new Error('Сервер повернув не PDF файл.');
     }

    const fileBlob = new Blob([response.data], { type: 'application/pdf' });

    const pdfUrl = URL.createObjectURL(fileBlob);

    const downloadFileName = `Report_${selectedAccountId.value}_${new Date().toISOString().slice(0,10)}.pdf`;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', downloadFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);

    generationSuccess.value = true;

  } catch (err) {
    console.error("Failed to generate or download report:", err);
    generationError.value = "Не вдалося згенерувати або завантажити звіт.";
    
     if (err.response && err.response.data && err.response.data instanceof Blob && err.response.data.type === 'application/json') {
          try {
              const errorJson = JSON.parse(await err.response.data.text());
              generationError.value += ` (${errorJson.message || errorJson.title || 'Помилка сервера'})`;
          } catch (parseErr) { /* ignore parsing error */ }
     } else if (err.response) {
         generationError.value += ` (Помилка: ${err.response.status})`;
     }
  } finally {
    isGenerating.value = false;
  }
}

onMounted(() => {
    fetchAvailableAccounts();
});

function formatCurrency(amount, currencyCode) {
    const currencies = { 980: 'UAH', 840: 'USD', 978: 'EUR' };
    const symbol = currencies[currencyCode] || `Code ${currencyCode}`;
    const value = (amount / 100.0).toFixed(2);
    return `${value} ${symbol}`;
}

</script>

<style scoped>
.report-generator-container {
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);
  font-family: sans-serif;
  max-width: 800px;
  margin: 2rem auto;
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.8rem;
  text-align: center;
}

.actions-panel {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.form-group label {
     font-size: 0.85rem;
     color: #555;
     font-weight: 500;
}

.input-select,
.input-date {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: #fff;
  min-width: 150px;
}

.btn-create-report {
  background-color: #5cb85c;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;
  height: 38px;
  align-self: flex-end;
}

.btn-create-report .icon {
  font-size: 1.1em;
}

.btn-create-report:hover:not(:disabled) {
  background-color: #4cae4c;
}
.btn-create-report:disabled {
    background-color: #a3d9a3;
    cursor: not-allowed;
}


.sign-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
   padding-bottom: 8px;
}

.sign-option input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.sign-option label {
  cursor: pointer;
  font-size: 0.9rem;
  color: #555;
}

.loading-state {
  text-align: center; padding: 2rem; color: #666; font-style: italic;
}
.error-message { color: #d9534f; background-color: #f2dede; border: 1px solid #ebccd1; padding: 0.8rem 1rem; border-radius: 6px; margin-top: 1rem; }
.success-message { color: #198754; background-color: #d1e7dd; border: 1px solid #a3cfbb; padding: 0.8rem 1rem; border-radius: 6px; margin-top: 1rem; }

</style>