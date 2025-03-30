<template>
  <div class="transaction-list">
    <div class="filters">
      <input
        v-model="searchQuery"
        placeholder="Пошук (опис, коммент, контрагент)"
        class="input search-input"
      />
      <input type="date" v-model="startDate" class="input" />
      <input type="date" v-model="endDate" class="input" />
      <select v-model="sortOrder" class="input">
        <option value="desc">Спочатку більше</option>
        <option value="asc">Спочатку меньше</option>
      </select>
      <button @click="clearFilters" class="btn clear-btn" title="Скинути всі фільтри">
        ✕ Скинути
      </button>
    </div>

    <div class="results-info" v-if="!isLoading && (debouncedSearchQuery || startDate || endDate)">
         Знайдено транзакцій: {{ filteredTransactions.length }}
     </div>

     <div v-if="!isLoading && !error && paginatedTransactions.length === 0" class="no-results">
       Не знайдено транзакцій, згідно з вашими фільтрами.
    </div>

     <div v-if="!isLoading && !error && paginatedTransactions.length > 0" class="items-container">
        <TransactionItem
            v-for="tx in paginatedTransactions"
            :key="tx.id"
            :transaction="tx"
        />
    </div>


    <div v-if="!isLoading && !error && filteredTransactions.length > 0 && totalPages > 1" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1" class="btn">
        Назад
      </button>
      <span class="page-info">Сторінка {{ currentPage }} из {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="btn">
        Наступна
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import TransactionItem from './TransactionItem.vue'

const sampleTransactions = ref([
  { id: 1, time: Math.floor(new Date('2024-03-25T10:00:00Z').getTime() / 1000), description: 'Супермаркет "Сільпо"', comment: 'Молоко, хліб, овочі', amount: -15050, cashbackAmount: 150, counterName: 'Сільпо #123', counterIban: 'UAXXXXXXXXXXXXXXXXXXXXXXXXX' },
  { id: 2, time: Math.floor(new Date('2024-03-26T15:30:00Z').getTime() / 1000), description: 'Зарплата', comment: 'За березень', amount: 5000000, cashbackAmount: null, counterName: 'ТОВ "Рога та Копита"', counterIban: 'UAXXXXXXXXXXXXXXXXXXXXXXXXY' },
  { id: 3, time: Math.floor(new Date('2024-03-27T09:00:00Z').getTime() / 1000), description: 'Кав\'ярня "Aroma Kava"', comment: 'Капучино', amount: -8500, cashbackAmount: 85, counterName: 'Aroma Kava', counterIban: 'UAXXXXXXXXXXXXXXXXXXXXXXXXZ' },
  { id: 4, time: Math.floor(new Date('2024-03-27T18:00:00Z').getTime() / 1000), description: 'Ресторан "Уют"', comment: 'Вечеря з друзями', amount: -350075, cashbackAmount: null, counterName: 'Ресторан Уют', counterIban: 'UAXXXXXXXXXXXXXXXXXXXXXXXXA' },
  { id: 5, time: Math.floor(new Date('2024-03-28T11:00:00Z').getTime() / 1000), description: 'Онлайн підписка (Spotify)', comment: 'Музичний сервіс', amount: -15000, cashbackAmount: null, counterName: 'Spotify AB', counterIban: 'SEXXXXXXXXXXXXXXXXXXXXXXXXX' },
  { id: 6, time: Math.floor(new Date('2024-03-29T14:00:00Z').getTime() / 1000), description: 'Оплата за фріланс', comment: 'Проект "Альфа"', amount: 1500000, cashbackAmount: null, counterName: 'John Doe', counterIban: 'GBXXXXXXXXXXXXXXXXXXXXXXXXX' },
  { id: 7, time: Math.floor(new Date('2024-03-29T20:00:00Z').getTime() / 1000), description: 'Кінотеатр "Multiplex"', comment: 'Квитки на новий фільм', amount: -48000, cashbackAmount: 480, counterName: 'Multiplex Cinema', counterIban: 'UAXXXXXXXXXXXXXXXXXXXXXXXXB' },
  { id: 8, time: Math.floor(new Date('2024-03-30T08:30:00Z').getTime() / 1000), description: 'Аптека "Доброго Дня"', comment: 'Ліки', amount: -55020, cashbackAmount: null, counterName: 'Аптека Доброго Дня #5', counterIban: 'UAXXXXXXXXXXXXXXXXXXXXXXXXC' },
  { id: 9, time: Math.floor(new Date('2024-03-30T12:00:00Z').getTime() / 1000), description: 'Переказ Олені П.', comment: 'Повернення боргу', amount: -100000, cashbackAmount: null, counterName: 'Олена Петренко', counterIban: 'UAXXXXXXXXXXXXXXXXXXXXXXXXD' },
  { id: 10, time: Math.floor(new Date('2024-03-31T09:00:00Z').getTime() / 1000), description: 'Сніданок у кафе "Львівські Круасани"', comment: '', amount: -21000, cashbackAmount: 210, counterName: 'Львівські Круасани', counterIban: 'UAXXXXXXXXXXXXXXXXXXXXXXXXE' },
]);

const isLoading = ref(false);
const error = ref(null);

const searchQuery = ref('');
const startDate = ref('');
const endDate = ref('');
const sortOrder = ref('desc');
const currentPage = ref(1);
const itemsPerPage = 5;

const debouncedSearchQuery = ref('');
let debounceTimer = null;

watch(searchQuery, (newValue) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        debouncedSearchQuery.value = newValue;
        currentPage.value = 1;
    }, 350);
});

function clearFilters() {
  searchQuery.value = '';
  startDate.value = '';
  endDate.value = '';
  sortOrder.value = 'desc';
  currentPage.value = 1;
}

const filteredTransactions = computed(() => {
  let transactionsToFilter = [...sampleTransactions.value];

  const lowerQuery = debouncedSearchQuery.value.toLowerCase().trim();
  if (lowerQuery) {
    transactionsToFilter = transactionsToFilter.filter(tx =>
      tx.description.toLowerCase().includes(lowerQuery) ||
      (tx.comment && tx.comment.toLowerCase().includes(lowerQuery)) ||
      (tx.counterName && tx.counterName.toLowerCase().includes(lowerQuery))
    );
  }

  if (startDate.value) {
    try {
        const startDt = new Date(startDate.value);
        startDt.setHours(0, 0, 0, 0);
        transactionsToFilter = transactionsToFilter.filter(tx => new Date(tx.time * 1000) >= startDt);
    } catch (e) { console.error("Invalid start date", e); }
  }
  if (endDate.value) {
     try {
        const endDt = new Date(endDate.value);
        endDt.setHours(23, 59, 59, 999);
        transactionsToFilter = transactionsToFilter.filter(tx => new Date(tx.time * 1000) <= endDt);
     } catch (e) { console.error("Invalid end date", e); }
  }

  transactionsToFilter.sort((a, b) => {
    return sortOrder.value === 'desc'
      ? b.amount - a.amount
      : a.amount - b.amount;
  });

  return transactionsToFilter;
});

const totalPages = computed(() => {
    if (filteredTransactions.value.length === 0) return 1;
    return Math.ceil(filteredTransactions.value.length / itemsPerPage);
});

const paginatedTransactions = computed(() => {
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
     currentPage.value = totalPages.value;
  }

  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredTransactions.value.slice(start, start + itemsPerPage);
})

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

</script>

<style scoped>
.transaction-list {
  padding: 1.5rem 1rem;
  margin-bottom: 2rem;
  box-sizing: border-box;
  font-family: sans-serif;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 25px;
  justify-content: flex-start;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.input.search-input {
    flex-grow: 1;
    min-width: 200px;
}
.input[type="date"] {
    min-width: 140px;
}
select.input {
    min-width: 160px;
}


.input:focus {
  outline: none;
  border-color: #e18877;
  box-shadow: 0 0 0 2px rgba(225, 136, 119, 0.2);
}

.btn {
  background-color: #e18877;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease;
  white-space: nowrap;
}

.btn:disabled {
  background-color: #f0c3bd;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn:hover:not(:disabled) {
  background-color: #d46b5b;
  transform: translateY(-1px);
}
.btn:active:not(:disabled) {
    transform: translateY(0px);
}

.clear-btn {
    background-color: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
    font-size: 0.85rem;
    padding: 7px 12px;
}
.clear-btn:hover:not(:disabled) {
    background-color: #e9ecef;
    color: #495057;
    border-color: #ced4da;
    transform: translateY(-1px);
}
.clear-btn:active:not(:disabled) {
    transform: translateY(0px);
}


.results-info {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 15px;
    text-align: right;
}

.no-results {
    text-align: center;
    padding: 3rem 1rem;
    color: #888;
    font-style: italic;
    border: 1px dashed #eee;
    border-radius: 8px;
    margin-top: 10px;
}

.items-container {
    margin-top: 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.page-info {
  font-weight: 500;
  font-size: 1rem;
  color: #555;
}
</style>