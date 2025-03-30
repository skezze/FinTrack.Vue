<template>
  <div class="transaction-list">
    <div class="filters">
      <input
        v-model="searchQuery"
        placeholder="Поиск (описание, коммент, контрагент)"
        class="input search-input"
      />
      <input type="date" v-model="startDate" class="input" />
      <input type="date" v-model="endDate" class="input" />
      <select v-model="sortOrder" class="input">
        <option value="desc">Сначала больше</option>
        <option value="asc">Сначала меньше</option>
      </select>
      <button @click="clearFilters" class="btn clear-btn" title="Сбросить все фильтры">
        ✕ Сбросить
      </button>
    </div>

    <div class="results-info" v-if="!isLoading && (debouncedSearchQuery || startDate || endDate)">
         Найдено транзакций: {{ filteredTransactions.length }}
     </div>

     <div v-if="!isLoading && !error && paginatedTransactions.length === 0" class="no-results">
       Нет транзакций, соответствующих вашим фильтрам.
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
      <span class="page-info">Страница {{ currentPage }} из {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="btn">
        Вперед
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
// Убедитесь, что TransactionItem.vue находится в той же папке
import TransactionItem from './TransactionItem.vue'

// --- Статические данные для предпросмотра ---
// В реальном приложении замените на загрузку данных
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
// --- Конец статических данных ---

// Состояния для реальной загрузки (пример)
const isLoading = ref(false); // Установите в true при начале загрузки
const error = ref(null);     // Установите сообщение об ошибке при неудаче

// Фильтры и пагинация
const searchQuery = ref('');
const startDate = ref('');
const endDate = ref('');
const sortOrder = ref('desc'); // Сортировка по умолчанию
const currentPage = ref(1);
const itemsPerPage = 5; // Можно сделать настраиваемым

// Debounce для поиска
const debouncedSearchQuery = ref('');
let debounceTimer = null;

watch(searchQuery, (newValue) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        debouncedSearchQuery.value = newValue;
        currentPage.value = 1; // Сброс на первую страницу при изменении поискового запроса
    }, 350); // Задержка в 350 мс перед применением поиска
});

// Функция сброса фильтров
function clearFilters() {
  searchQuery.value = '';
  // debouncedSearchQuery.value = ''; // Обновится через watch searchQuery
  startDate.value = '';
  endDate.value = '';
  sortOrder.value = 'desc';
  currentPage.value = 1;
}

// Отфильтрованные транзакции (с использованием debouncedSearchQuery)
const filteredTransactions = computed(() => {
  // В реальном приложении здесь будет ref с загруженными данными
  let transactionsToFilter = [...sampleTransactions.value];

  // Применяем поиск (после debounce)
  const lowerQuery = debouncedSearchQuery.value.toLowerCase().trim();
  if (lowerQuery) {
    transactionsToFilter = transactionsToFilter.filter(tx =>
      tx.description.toLowerCase().includes(lowerQuery) ||
      (tx.comment && tx.comment.toLowerCase().includes(lowerQuery)) ||
      (tx.counterName && tx.counterName.toLowerCase().includes(lowerQuery))
    );
  }

  // Применяем фильтр по датам
  if (startDate.value) {
    try {
        const startDt = new Date(startDate.value);
        startDt.setHours(0, 0, 0, 0);
        transactionsToFilter = transactionsToFilter.filter(tx => new Date(tx.time * 1000) >= startDt);
    } catch (e) { console.error("Invalid start date", e); } // Обработка некорректной даты
  }
  if (endDate.value) {
     try {
        const endDt = new Date(endDate.value);
        endDt.setHours(23, 59, 59, 999);
        transactionsToFilter = transactionsToFilter.filter(tx => new Date(tx.time * 1000) <= endDt);
     } catch (e) { console.error("Invalid end date", e); } // Обработка некорректной даты
  }

  // Применяем сортировку
  transactionsToFilter.sort((a, b) => {
    return sortOrder.value === 'desc'
      ? b.amount - a.amount
      : a.amount - b.amount;
  });

  return transactionsToFilter;
});

// Общее количество страниц
const totalPages = computed(() => {
    if (filteredTransactions.value.length === 0) return 1; // Показываем "Страница 1 из 1", даже если пусто
    return Math.ceil(filteredTransactions.value.length / itemsPerPage);
});

// Транзакции для текущей страницы
const paginatedTransactions = computed(() => {
  // Сброс на последнюю доступную страницу, если текущая стала невалидной
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
     currentPage.value = totalPages.value;
  }

  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredTransactions.value.slice(start, start + itemsPerPage);
})

// Функции пагинации
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

// Если бы данные грузились, здесь был бы onMounted с вызовом fetch
// onMounted(() => { /* fetch data */ })

</script>

<style scoped>
.transaction-list {
  /* Убраны background-color, max-width и margin: auto */
  /* Добавлены отступы только сверху/снизу/внутри */
  padding: 1.5rem 1rem; /* Внутренние отступы, по бокам меньше */
  margin-bottom: 2rem; /* Отступ снизу компонента */
  /* width: 100%; */ /* Это обычно не нужно, блочные элементы и так занимают всю ширину */
  box-sizing: border-box; /* Чтобы padding не увеличивал общую ширину */
  font-family: sans-serif;
}

.filters {
  display: flex;
  flex-wrap: wrap; /* Разрешаем перенос на новую строку */
  gap: 10px; /* Промежутки между элементами */
  margin-bottom: 25px;
  justify-content: flex-start; /* Выравнивание по началу строки */
  padding-bottom: 20px;
  border-bottom: 1px solid #eee; /* Сделал разделитель светлее */
}

.input {
  padding: 8px 12px; /* Уменьшил padding для компактности */
  border: 1px solid #ccc; /* Стандартная рамка */
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.input.search-input {
    flex-grow: 1; /* Позволяем полю поиска занимать доступное пространство */
    min-width: 200px; /* Минимальная ширина поиска */
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
  box-shadow: 0 0 0 2px rgba(225, 136, 119, 0.2); /* Тень при фокусе */
}

.btn {
  background-color: #e18877;
  color: white;
  border: none;
  padding: 8px 16px; /* Согласовал padding */
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease;
  white-space: nowrap; /* Предотвращаем перенос текста на кнопках */
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
    background-color: #f8f9fa; /* Светлый фон */
    color: #6c757d; /* Серый текст */
    border: 1px solid #dee2e6; /* Светлая рамка */
    font-size: 0.85rem; /* Меньший шрифт */
    padding: 7px 12px; /* Меньшие отступы */
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
    text-align: right; /* Выравниваем по правому краю */
}

.no-results {
    text-align: center;
    padding: 3rem 1rem; /* Увеличил отступы */
    color: #888;
    font-style: italic;
    border: 1px dashed #eee; /* Легкая рамка для пустого состояния */
    border-radius: 8px;
    margin-top: 10px;
}

.items-container {
    /* Контейнер для элементов списка, если нужны будут доп. стили */
    margin-top: 10px; /* Небольшой отступ сверху */
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee; /* Сделал разделитель светлее */
}

.page-info {
  font-weight: 500;
  font-size: 1rem;
  color: #555;
}
</style>