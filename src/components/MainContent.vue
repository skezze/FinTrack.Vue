<template>
    <div class="content">
      <router-view />
      <div class="app">
        <h1>Мои транзакции</h1>
        <TransactionList :transactions="transactions" />
      </div>
    </div>
  </template>

<script setup>
import TransactionList from './TransactionList.vue'

const transactions = [
  {
    id: 'ZuHWzqkKGVo=',
    time: 1554466347,
    description: 'Покупка щастя',
    mcc: 7997,
    originalMcc: 7997,
    hold: null,
    amount: -95000,
    operationAmount: -95000,
    currencyCode: 980,
    commissionRate: null,
    cashbackAmount: 19000,
    balance: 10050000,
    comment: 'За каву',
    receiptId: 'XXXX-XXXX-XXXX-XXXX',
    invoiceId: '2103.в.27',
    counterEdrpou: '3096889974',
    counterIban: 'UA898999980000355639201001404',
    counterName: 'ТОВ «ВОРОНА»'
  }
]
</script>
  
  <style>
  .container {
    max-width: 800px;
    margin: 2rem auto;
  }
  .app {
    max-width: 700px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: sans-serif;
  }
  </style>