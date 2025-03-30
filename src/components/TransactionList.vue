<template>
  <div class="transaction-list">
    <div class="filters">
      <input
        v-model="searchQuery"
        placeholder="Поиск по комменту или названию"
        class="input"
      />
      <input type="date" v-model="startDate" class="input" />
      <input type="date" v-model="endDate" class="input" />
      <select v-model="sortOrder" class="input">
        <option value="desc">Сначала больше</option>
        <option value="asc">Сначала меньше</option>
      </select>
    </div>

    <div v-if="paginatedTransactions.length === 0" class="no-results">
       Нет транзакций, соответствующих вашим фильтрам.
    </div>

     <TransactionItem
      v-else
      v-for="tx in paginatedTransactions"
      :key="tx.id"
      :transaction="tx"
    />

    <div v-if="filteredTransactions.length > 0 && totalPages > 1" class="pagination">
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
import { ref, computed } from 'vue'
// Make sure TransactionItem.vue (the code you provided) is in the same folder
import TransactionItem from './TransactionItem.vue'

// --- Updated Static Data for Preview ---
// Amounts are now in kopiykas/cents (integer)
// Added optional cashbackAmount, counterName, counterIban fields
const sampleTransactions = ref([
  {
    id: 1,
    time: Math.floor(new Date('2024-03-25T10:00:00Z').getTime() / 1000),
    description: 'Супермаркет "Сільпо"',
    comment: 'Молоко, хліб, овочі',
    amount: -15050, // -150.50 ₴
    cashbackAmount: 150, // 1.50 ₴ cashback
    counterName: 'Сільпо #123',
    counterIban: 'UAXXXXXXXXXXXXXXXXXXXXXXXXX'
  },
  {
    id: 2,
    time: Math.floor(new Date('2024-03-26T15:30:00Z').getTime() / 1000),
    description: 'Зарплата',
    comment: 'За березень',
    amount: 5000000, // 50000.00 ₴
    cashbackAmount: null, // No cashback
    counterName: 'ТОВ "Рога та Копита"',
    counterIban: 'UAXXXXXXXXXXXXXXXXXXXXXXXXY'
   },
  {
    id: 3,
    time: Math.floor(new Date('2024-03-27T09:00:00Z').getTime() / 1000),
    description: 'Кав\'ярня "Aroma Kava"',
    comment: 'Капучино',
    amount: -8500, // -85.00 ₴
    cashbackAmount: 85, // 0.85 ₴ cashback
    counterName: 'Aroma Kava',
    counterIban: 'UAXXXXXXXXXXXXXXXXXXXXXXXXZ'
  },
  {
    id: 4,
    time: Math.floor(new Date('2024-03-27T18:00:00Z').getTime() / 1000),
    description: 'Ресторан "Уют"',
    comment: 'Вечеря з друзями',
    amount: -350075, // -3500.75 ₴
    cashbackAmount: null,
    counterName: 'Ресторан Уют',
    counterIban: 'UAXXXXXXXXXXXXXXXXXXXXXXXXA'
  },
  {
    id: 5,
    time: Math.floor(new Date('2024-03-28T11:00:00Z').getTime() / 1000),
    description: 'Онлайн підписка (Spotify)',
    comment: 'Музичний сервіс',
    amount: -15000, // -150.00 ₴
    cashbackAmount: null,
    counterName: 'Spotify AB',
    counterIban: 'SEXXXXXXXXXXXXXXXXXXXXXXXXX'
   },
  {
    id: 6,
    time: Math.floor(new Date('2024-03-29T14:00:00Z').getTime() / 1000),
    description: 'Оплата за фріланс',
    comment: 'Проект "Альфа"',
    amount: 1500000, // 15000.00 ₴
    cashbackAmount: null,
    counterName: 'John Doe',
    counterIban: 'GBXXXXXXXXXXXXXXXXXXXXXXXXX'
   },
  {
    id: 7,
    time: Math.floor(new Date('2024-03-29T20:00:00Z').getTime() / 1000),
    description: 'Кінотеатр "Multiplex"',
    comment: 'Квитки на новий фільм',
    amount: -48000, // -480.00 ₴
    cashbackAmount: 480, // 4.80 ₴ cashback
    counterName: 'Multiplex Cinema',
    counterIban: 'UAXXXXXXXXXXXXXXXXXXXXXXXXB'
  },
  {
    id: 8,
    time: Math.floor(new Date('2024-03-30T08:30:00Z').getTime() / 1000),
    description: 'Аптека "Доброго Дня"',
    comment: 'Ліки',
    amount: -55020, // -550.20 ₴
    cashbackAmount: null,
    counterName: 'Аптека Доброго Дня #5',
    counterIban: 'UAXXXXXXXXXXXXXXXXXXXXXXXXC'
  },
  {
    id: 9,
    time: Math.floor(new Date('2024-03-30T12:00:00Z').getTime() / 1000),
    description: 'Переказ Олені П.',
    comment: 'Повернення боргу',
    amount: -100000, // -1000.00 ₴
    cashbackAmount: null,
    counterName: 'Олена Петренко',
    counterIban: 'UAXXXXXXXXXXXXXXXXXXXXXXXXD'
   },
  {
    id: 10,
    time: Math.floor(new Date('2024-03-31T09:00:00Z').getTime() / 1000),
    description: 'Сніданок у кафе "Львівські Круасани"',
    comment: '', // Empty comment
    amount: -21000, // -210.00 ₴
    cashbackAmount: 210, // 2.10 ₴ cashback
    counterName: 'Львівські Круасани',
    counterIban: 'UAXXXXXXXXXXXXXXXXXXXXXXXXE'
  },
]);
// ---------------------------------------

// Props definition is removed/commented as we use static data
/*
const props = defineProps({
  transactions: {
    type: Array,
    required: true
  }
})
*/

const searchQuery = ref('')
const startDate = ref('')
const endDate = ref('')
const sortOrder = ref('desc') // Default sort: highest amount first
const currentPage = ref(1)
const itemsPerPage = 5

const filteredTransactions = computed(() => {
  // Use sampleTransactions instead of props.transactions
  let transactionsToFilter = [...sampleTransactions.value];

  // Apply search filter
  if (searchQuery.value) {
    const lowerQuery = searchQuery.value.toLowerCase();
    transactionsToFilter = transactionsToFilter.filter(tx =>
      tx.description.toLowerCase().includes(lowerQuery) ||
      (tx.comment && tx.comment.toLowerCase().includes(lowerQuery)) ||
      (tx.counterName && tx.counterName.toLowerCase().includes(lowerQuery)) // Added search by counterName
    );
  }

  // Apply date filters
  if (startDate.value) {
    const startDt = new Date(startDate.value);
    startDt.setHours(0, 0, 0, 0); // Set to start of the day
    transactionsToFilter = transactionsToFilter.filter(tx => new Date(tx.time * 1000) >= startDt);
  }
  if (endDate.value) {
    const endDt = new Date(endDate.value);
    endDt.setHours(23, 59, 59, 999); // Set to end of the day
    transactionsToFilter = transactionsToFilter.filter(tx => new Date(tx.time * 1000) <= endDt);
  }

  // Apply sorting (works correctly with integer amounts)
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
  // Reset to page 1 if filters reduce results below current page
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
     currentPage.value = totalPages.value;
  } else if (totalPages.value === 0) {
      currentPage.value = 1; // Stay on page 1 if no results
  }

  const start = (currentPage.value - 1) * itemsPerPage
  return filteredTransactions.value.slice(start, start + itemsPerPage)
})

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
</script>

<style scoped>
/* Styles are identical to the previous version, including them for completeness */
.transaction-list {
  padding: 1.5rem;
  background-color: #fff8f5; /* Light peach background */
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); /* Slightly softer shadow */
  max-width: 900px;
  margin: 2rem auto; /* Added top/bottom margin */
  font-family: sans-serif; /* Added basic font */
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 25px; /* Increased spacing */
  justify-content: center; /* Center filters */
  padding-bottom: 20px; /* Add padding below filters */
  border-bottom: 1px solid #f0c3bd; /* Separator line */
}

.input {
  padding: 9px 14px; /* Slightly larger padding */
  border: 1px solid #dcb7ae; /* Peach-toned border */
  border-radius: 8px; /* More rounded corners */
  font-size: 1rem; /* Standard font size */
  background-color: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease; /* Smooth transitions */
}
/* Style specific input types */
.input[type="date"],
input.input, /* Use input.input for text input */
select.input {
  min-width: 150px; /* Ensure decent width */
}


.input:focus {
  outline: none;
  border-color: #e18877; /* Highlight color */
  box-shadow: 0 0 0 3px rgba(225, 136, 119, 0.25); /* Softer focus ring */
}

.no-results {
    text-align: center;
    padding: 2rem;
    color: #888;
    font-style: italic;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px; /* Increased gap */
  margin-top: 30px; /* Increased spacing */
  padding-top: 20px; /* Add padding above pagination */
  border-top: 1px solid #f0c3bd; /* Separator line */
}

.page-info {
  font-weight: 500;
  font-size: 1rem;
  color: #555; /* Darker grey */
}

.btn {
  background-color: #e18877; /* Primary button color */
  color: white;
  border: none;
  padding: 8px 18px; /* Slightly larger button */
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem; /* Slightly larger font */
  font-weight: 500;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease; /* Added transform transition */
}

.btn:disabled {
  background-color: #f0c3bd; /* Lighter disabled color */
  cursor: not-allowed;
  opacity: 0.7; /* Make it slightly transparent */
}

.btn:hover:not(:disabled) {
  background-color: #d46b5b; /* Darker hover color */
  transform: translateY(-1px); /* Slight lift effect */
}
.btn:active:not(:disabled) {
    transform: translateY(0px); /* Press down effect */
}
</style>