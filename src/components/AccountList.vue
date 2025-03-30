<template>
  <div class="account-list-container">
    <h2>Ваші рахунки</h2>

    <div v-if="isLoading">Завантаження рахунків...</div>
    <div v-if="error" class="error-message">Помилка завантаження: {{ error }}</div>

    <div v-if="!isLoading && !error && accounts.length === 0" class="no-accounts">
      У вас ще немає доданих рахунків.
    </div>

    <div v-if="!isLoading && !error && accounts.length > 0" class="account-cards-grid">
   <AccountCard
     v-for="account in accounts"
     :key="account.id"
     :account="account"
     @view-details="handleViewDetails" />
 </div>

  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import AccountCard from './AccountCard.vue';

export default defineComponent({
  name: 'AccountList',
  components: {
    AccountCard
  },
  setup() {
    const isLoading = ref(false);
    const error = ref(null);
    const accounts = ref([]);
    const mockAccounts = [
     { id: 'kKGVoZuHWzqVoZuH', sendId: 'uHWzqVoZuH', balance: 10000000, creditLimit: 1000000, type: 'black', currencyCode: 980, cashbackType: 'UAH', maskedPan: ['537541******1234'], iban: 'UA733220010000026201234567890' },
     { id: 'dFgVoZwHVzqVoZrF', sendId: 'rHVsqVdFgZ', balance: 50000, creditLimit: 20000, type: 'platinum', currencyCode: 840, cashbackType: 'Miles', maskedPan: ['414962******7890'], iban: 'UA733220010000026201234567891' },
     { id: 'eUrVoZwHVzqVoZrE', sendId: 'eURsqVdFgZ', balance: 150000, creditLimit: 0, type: 'white', currencyCode: 978, cashbackType: 'None', maskedPan: ['516874******1122'], iban: 'UA733220010000026201234567892' },
     { id: 'nOpVoZwHVzqVoZrN', sendId: 'nOPsqVdFgN', balance: 50000, creditLimit: 0, type: 'digital', currencyCode: 980, cashbackType: 'UAH', maskedPan: [], iban: 'UA733220010000026201234567893' },
     // Добавим еще пару карт для наглядности переноса
     { id: 'aDdVoZwHVzqVoZrA', sendId: 'aDDsqVdFgA', balance: 250000, creditLimit: 50000, type: 'iron', currencyCode: 980, cashbackType: 'UAH', maskedPan: ['555544******3322'], iban: 'UA733220010000026201234567894' },
     { id: 'bEeVoZwHVzqVoZrB', sendId: 'bEEsqVdFgB', balance: 10000, creditLimit: 10000, type: 'standard', currencyCode: 980, cashbackType: 'UAH', maskedPan: ['444433******1100'], iban: 'UA733220010000026201234567895' }
    ];

    function fetchAccounts() { /* ... (код fetchAccounts остается прежним) ... */ }
    function handleViewDetails(accountId) { console.log('Need to view details for account ID:', accountId); }

    onMounted(() => { accounts.value = mockAccounts; });

    return { isLoading, error, accounts, handleViewDetails };
  }
});
</script>

<style scoped>
.account-list-container { padding: 1rem 1rem 3rem 1rem; }
h2 { margin-bottom: 1.5rem; color: #333; font-weight: 600; }
.error-message { color: #d9534f; background-color: #f2dede; border: 1px solid #ebccd1; padding: 0.8rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
.no-accounts { color: #666; background-color: #f9f9f9; border: 1px dashed #ddd; padding: 1.5rem 1rem; border-radius: 8px; text-align: center; margin-top: 1rem; }

/* Временно в AccountList.vue */
.account-cards-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)) !important;
  gap: 1.5rem !important;
}

.account-cards-grid :deep(.card) {
  margin-bottom: 0;
}
</style>