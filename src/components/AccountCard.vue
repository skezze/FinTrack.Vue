<template>
    <div class="card">
      <div class="card-header">
        💳 {{ maskedPan }}
      </div>
      <div class="card-body">
        <p><strong>IBAN:</strong> {{ account.iban }}</p>
        <p><strong>Тип картки:</strong> {{ account.type }}</p>
        <p><strong>Баланс:</strong> {{ formatCurrency(account.balance) }}</p>
        <p><strong>Ліміт:</strong> {{ formatCurrency(account.creditLimit) }}</p>
        <p><strong>Валюта:</strong> {{ currencyCodeName(account.currencyCode) }}</p>
        <p><strong>Кешбек:</strong> {{ account.cashbackType }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    account: Object
  })
  
  const maskedPan = props.account.maskedPan[0] || '**** **** **** ****'
  
  function formatCurrency(value) {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH'
    }).format(value / 100); // если в копейках
  }
  
  function currencyCodeName(code) {
    const map = {
      980: 'UAH',
      840: 'USD',
      978: 'EUR'
    }
    return map[code] || code
  }
  </script>
  
  <style scoped>
  .card {
    border: 1px solid #ccc;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .card-header {
    font-weight: bold;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }
  </style>
  