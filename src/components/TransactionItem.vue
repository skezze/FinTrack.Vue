<template>
    <div class="transaction-item">
      <div class="top-line">
        <div class="description">{{ transaction.description }}</div>
        <div class="amount" :class="{ negative: transaction.amount < 0, positive: transaction.amount > 0 }">
          {{ formatAmount(transaction.amount) }} ₴
        </div>
      </div>
      <div class="details">
        <span class="date">{{ formattedDate }}</span>
        <span v-if="transaction.comment">· {{ transaction.comment }}</span>
        <span v-if="transaction.cashbackAmount" class="cashback">
          · Кешбек: {{ transaction.cashbackAmount / 100 }}₴
        </span>
      </div>
      <div class="meta">
        {{ transaction.counterName }} | {{ transaction.counterIban }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  const props = defineProps({
    transaction: Object
  })
  
  const formattedDate = computed(() => {
    const date = new Date(props.transaction.time * 1000)
    return date.toLocaleDateString()
  })
  
  function formatAmount(amount) {
    return (amount / 100).toFixed(2)
  }
  </script>
  
  <style scoped>
  .transaction-item {
    background-color: #fff;
    border: 1px solid #ecd9d3;
    border-radius: 12px;
    padding: 14px 18px;
    margin-bottom: 14px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
    transition: box-shadow 0.2s ease;
  }
  
  .transaction-item:hover {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  }
  
  .top-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }
  
  .description {
    font-weight: 600;
    font-size: 1rem;
    color: #333;
  }
  
  .amount {
    font-weight: bold;
    font-size: 1rem;
  }
  
  .amount.negative {
    color: #d94d3f;
  }
  
  .amount.positive {
    color: #3aa655;
  }
  
  .details {
    font-size: 0.88rem;
    color: #666;
    margin-bottom: 6px;
  }
  
  .cashback {
    color: #e18877;
    font-weight: 500;
  }
  
  .meta {
    font-size: 0.75rem;
    color: #999;
  }
  </style>
  