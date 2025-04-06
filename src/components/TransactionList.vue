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
import { ref, computed, watch, onMounted } from 'vue'; // Добавляем onMounted
import TransactionItem from './TransactionItem.vue'; // Убедитесь, что путь правильный
import apiClient from '@/api/client'; // Убедитесь, что путь правильный

// Ref для хранения ВСЕХ транзакций с сервера
const allTransactions = ref([]);
// Refs для состояния загрузки и ошибок
const isLoading = ref(false);
const error = ref(null);

// Refs для фильтров и пагинации
const searchQuery = ref('');
const startDate = ref('');
const endDate = ref('');
const sortOrder = ref('desc'); // По умолчанию сортируем по убыванию
const currentPage = ref(1);
const itemsPerPage = 5; // Количество элементов на странице

// Debounce для поля поиска
const debouncedSearchQuery = ref('');
let debounceTimer = null;

watch(searchQuery, (newValue) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedSearchQuery.value = newValue;
    currentPage.value = 1; // Сброс на первую страницу при изменении поиска
  }, 350); // Задержка debounce в мс
});

// Функция сброса фильтров
function clearFilters() {
  searchQuery.value = '';
  startDate.value = '';
  endDate.value = '';
  sortOrder.value = 'desc';
  currentPage.value = 1;
}

// Функция для асинхронной загрузки ВСЕХ транзакций с бэкенда
async function fetchTransactions() {
  isLoading.value = true;
  error.value = null;
  allTransactions.value = []; // Очищаем массив перед загрузкой

  try {
    // Используем GET-запрос к вашему эндпоинту, который возвращает ВСЕ транзакции
    // Предполагается, что эндпоинт '/Monobank/GetTransactionsAsync' возвращает массив объектов MonobankTransaction
    const response = await apiClient.get('/Monobank/GetTransactions');

    // Сохраняем полученные данные в allTransactions
    // Добавляем проверку, что response.data существует и является массивом
    allTransactions.value = Array.isArray(response.data) ? response.data : [];

    // Опционально: первоначальная сортировка при загрузке (например, по времени по убыванию)
    allTransactions.value.sort((a, b) => b.time - a.time);

  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    error.value = "Не вдалося завантажити транзакції."; // Сообщение об ошибке для пользователя
    // Добавляем детали ошибки, если они есть
     if (err.response) {
         error.value += ` (Помилка сервера: ${err.response.status})`;
     } else if (err.request) {
         error.value += ` (Сервер не відповідає)`;
     }
  } finally {
    isLoading.value = false; // В любом случае убираем индикатор загрузки
  }
}

// Вызываем функцию загрузки данных один раз при монтировании компонента
onMounted(() => {
  fetchTransactions();
});

// Computed property для фильтрации и сортировки массива allTransactions
const filteredTransactions = computed(() => {
  // Начинаем с полного массива загруженных транзакций
  let transactionsToFilter = [...allTransactions.value];

  // --- Фильтрация ---
  const lowerQuery = debouncedSearchQuery.value.toLowerCase().trim();
  if (lowerQuery) {
    transactionsToFilter = transactionsToFilter.filter(tx =>
      // Проверяем наличие свойств перед вызовом toLowerCase()
      tx.description?.toLowerCase().includes(lowerQuery) ||
      tx.comment?.toLowerCase().includes(lowerQuery) ||
      tx.counterName?.toLowerCase().includes(lowerQuery)
    );
  }

  if (startDate.value) {
    try {
      const startDt = new Date(startDate.value);
      startDt.setHours(0, 0, 0, 0); // Устанавливаем время на начало дня
      const startTimestamp = Math.floor(startDt.getTime() / 1000); // Конвертируем в Unix timestamp (секунды)
      transactionsToFilter = transactionsToFilter.filter(tx => tx.time >= startTimestamp);
    } catch (e) { console.error("Invalid start date format", e); } // Ловим ошибку некорректной даты
  }

  if (endDate.value) {
     try {
      const endDt = new Date(endDate.value);
      endDt.setHours(23, 59, 59, 999); // Устанавливаем время на конец дня
      const endTimestamp = Math.floor(endDt.getTime() / 1000); // Конвертируем в Unix timestamp (секунды)
      transactionsToFilter = transactionsToFilter.filter(tx => tx.time <= endTimestamp);
     } catch (e) { console.error("Invalid end date format", e); } // Ловим ошибку некорректной даты
  }

  // --- Сортировка ---
  transactionsToFilter.sort((a, b) => {
      // Пример сортировки по сумме (amount)
      // Вы можете изменить поле или добавить другие условия сортировки
      if (sortOrder.value === 'desc') {
         return b.amount - a.amount; // По убыванию суммы
     } else {
         return a.amount - b.amount; // По возрастанию суммы
     }
     // Если нужно сортировать по времени:
     // return sortOrder.value === 'desc' ? b.time - a.time : a.time - b.time;
  });

  // Возвращаем отфильтрованный и отсортированный массив
  return transactionsToFilter;
});

// Computed property для вычисления общего количества страниц
const totalPages = computed(() => {
    // Используем filteredTransactions для расчета страниц на основе отфильтрованных данных
    if (!filteredTransactions.value || filteredTransactions.value.length === 0) return 1; // Минимум 1 страница
    return Math.ceil(filteredTransactions.value.length / itemsPerPage);
});

// Computed property для получения транзакций текущей страницы
const paginatedTransactions = computed(() => {
  // Проверяем наличие filteredTransactions
  if (!filteredTransactions.value) return [];

  // Корректируем currentPage, если он выходит за пределы после фильтрации
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value;
  } else if (currentPage.value < 1) {
      currentPage.value = 1;
  }

  // Вычисляем начальный индекс для slice
  const start = (currentPage.value - 1) * itemsPerPage;
  // Возвращаем срез массива для текущей страницы
  return filteredTransactions.value.slice(start, start + itemsPerPage);
})

// Функции для переключения страниц
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

// Наблюдатель для сброса текущей страницы на 1 при изменении фильтров или сортировки
// (DebouncedSearchQuery уже обрабатывается в своем watch)
watch([startDate, endDate, sortOrder], () => {
    currentPage.value = 1;
});

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