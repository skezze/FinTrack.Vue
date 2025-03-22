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
  import AccountCard from './AccountCard.vue'
  
  const props = defineProps({
    accounts: Array
  })
  </script>