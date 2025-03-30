<template>
  <div>
    <h2>Ваші рахунки</h2>
    <AccountCard
      v-for="account in accounts"
      :key="account.id"
      :account="account"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AccountCard from './AccountCard.vue'

// Моковые данные о счетах
const accounts = ref([
  {
    id: 'kKGVoZuHWzqVoZuH',
    sendId: 'uHWzqVoZuH',
    balance: 10000000,
    creditLimit: 10000000,
    type: 'black',
    currencyCode: 980,
    cashbackType: 'UAH',
    maskedPan: ['537541******1234'],
    iban: 'UA733220010000026201234567890',
  },
  {
    id: 'dFgVoZwHVzqVoZrF',
    sendId: 'rHVsqVdFgZ',
    balance: 500000,
    creditLimit: 200000,
    type: 'platinum',
    currencyCode: 840,
    cashbackType: 'USD',
    maskedPan: ['123456******7890'],
    iban: 'UA733220010000026201234567891',
  },
])
</script>
