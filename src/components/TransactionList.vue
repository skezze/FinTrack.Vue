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
  
      <TransactionItem
        v-for="tx in paginatedTransactions"
        :key="tx.id"
        :transaction="tx"
      />
  
      <div class="pagination">
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
  import TransactionItem from './TransactionItem.vue'
  
  const props = defineProps({
    transactions: {
      type: Array,
      required: true
    }
  })
  
  const searchQuery = ref('')
  const startDate = ref('')
  const endDate = ref('')
  const sortOrder = ref('desc')
  const currentPage = ref(1)
  const itemsPerPage = 5
  
  const filteredTransactions = computed(() => {
    return [...props.transactions]
      .filter(tx => {
        const date = new Date(tx.time * 1000)
        const matchesQuery =
          tx.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          (tx.comment && tx.comment.toLowerCase().includes(searchQuery.value.toLowerCase()))
        const matchesStart = !startDate.value || date >= new Date(startDate.value)
        const matchesEnd = !endDate.value || date <= new Date(endDate.value)
        return matchesQuery && matchesStart && matchesEnd
      })
      .sort((a, b) => {
        return sortOrder.value === 'desc'
          ? b.amount - a.amount
          : a.amount - b.amount
      })
  })
  
  const totalPages = computed(() =>
    Math.ceil(filteredTransactions.value.length / itemsPerPage)
  )
  
  const paginatedTransactions = computed(() => {
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
  .transaction-list {
    padding: 1.5rem;
    background-color: #fff8f5;
    border-radius: 12px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    max-width: 900px;
    margin: auto;
  }
  
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
    justify-content: center;
  }
  
  .input {
    padding: 8px 12px;
    border: 1px solid #dcb7ae;
    border-radius: 6px;
    font-size: 0.95rem;
    background-color: #fff;
  }
  
  .input:focus {
    outline: none;
    border-color: #e18877;
    box-shadow: 0 0 0 2px rgba(225, 136, 119, 0.2);
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 14px;
    margin-top: 24px;
  }
  
  .page-info {
    font-weight: 500;
    font-size: 0.95rem;
    color: #333;
  }
  
  .btn {
    background-color: #e18877;
    color: white;
    border: none;
    padding: 6px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s ease-in-out;
  }
  
  .btn:disabled {
    background-color: #f0c3bd;
    cursor: not-allowed;
  }
  
  .btn:hover:not(:disabled) {
    background-color: #d46b5b;
  }
  </style>
  