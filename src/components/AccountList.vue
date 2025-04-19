<template>
  <div class="account-list-container">
    <h2>Ваші рахунки</h2>

    <div v-if="isLoading" class="loading-message">Завантаження рахунків...</div>

    <div v-if="error" class="error-message">Помилка завантаження: {{ error }}</div>

    <div v-if="!isLoading && !error && accounts.length === 0" class="no-accounts">
      У вас ще немає доданих рахунків або не вдалося їх завантажити.
    </div>

    <div v-if="!isLoading && !error && accounts.length > 0" class="account-cards-grid">
      <AccountCard
        v-for="account in accounts"
        :key="account.id"
        :account="account"
        @view-details="handleViewDetails"
      />
   </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AccountCard from './AccountCard.vue';
import apiClient from '@/api/client';

const ACCOUNTS_CACHE_KEY = 'userAccounts';
const SELECTED_ACCOUNT_ID_KEY = 'selectedAccountId';

const isLoading = ref(false);
const error = ref(null);
const accounts = ref([]);

function loadFromCache() {
  try {
    const accountsJson = localStorage.getItem(ACCOUNTS_CACHE_KEY);
    if (accountsJson) {
      const cachedAccounts = JSON.parse(accountsJson);
      if (Array.isArray(cachedAccounts) && cachedAccounts.length > 0) {
        accounts.value = cachedAccounts;
        console.log(`Loaded ${cachedAccounts.length} accounts from cache.`);
        return true;
      }
    }
  } catch (e) {
    console.error("Failed to parse cached accounts from localStorage:", e);
    localStorage.removeItem(ACCOUNTS_CACHE_KEY);
  }
  return false;
}

async function fetchClientInfo() {
  if (accounts.value.length === 0) {
      isLoading.value = true;
  }
  error.value = null;

  try {
    const response = await apiClient.get('/Monobank/GetClientInfo');
    console.log("GetClientInfo API Response:", response);

    if (response.data && Array.isArray(response.data.accounts)) {
      const freshAccounts = response.data.accounts;
      accounts.value = freshAccounts;

      if (freshAccounts.length > 0) {
        try {
          const accountsJson = JSON.stringify(freshAccounts);
          localStorage.setItem(ACCOUNTS_CACHE_KEY, accountsJson);
          console.log(`Refreshed cache with ${freshAccounts.length} accounts.`);

          const firstAccountId = freshAccounts[0].id;
          if (firstAccountId) {
            localStorage.setItem(SELECTED_ACCOUNT_ID_KEY, firstAccountId);
            console.log(`Refreshed selected accountId in cache to '${firstAccountId}'.`);
          } else {
            localStorage.removeItem(SELECTED_ACCOUNT_ID_KEY);
          }

        } catch (e) {
          console.error("Failed to save fresh accounts data to localStorage:", e);
        }
      } else {
         localStorage.removeItem(ACCOUNTS_CACHE_KEY);
         localStorage.removeItem(SELECTED_ACCOUNT_ID_KEY);
         console.log("Received empty account list, cleared cache.");
      }

    } else {
      console.warn('Received unexpected data structure from GetClientInfo:', response.data);
       error.value = "Отримана некоректна структура даних від сервера.";
    }

  } catch (err) {
    console.error("Failed to fetch client info:", err);
     if (accounts.value.length === 0) {
         error.value = "Не вдалося завантажити інформацію про рахунки.";
         if (err.response) { error.value += ` (Помилка сервера: ${err.response.status})`; }
         else if (err.request) { error.value += ` (Сервер не відповідає)`; }
     } else {
          console.warn("Failed to fetch fresh data, keeping cached version.");
     }
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  const cacheLoaded = loadFromCache();

  fetchClientInfo();

  if (!cacheLoaded) {
      isLoading.value = true;
  }
});
</script>

<style scoped>
.account-list-container {
  padding: 1rem 1rem 3rem 1rem;
}
h2 {
  margin-bottom: 1.5rem;
  color: #333;
  font-weight: 600;
  text-align: center;
}
.loading-message { 
  text-align: center;
  padding: 2rem;
  color: #555;
  font-style: italic;
}
.error-message {
  color: #d9534f;
  background-color: #f2dede;
  border: 1px solid #ebccd1;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
}
.no-accounts {
  color: #666;
  background-color: #f9f9f9;
  border: 1px dashed #ddd;
  padding: 1.5rem 1rem;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
}

.account-cards-grid {
  display: grid;
   grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.account-cards-grid :deep(.card) {
  margin-bottom: 0;
}

@media (max-width: 768px) {
    .account-cards-grid {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1rem;
    }
    h2 {
        font-size: 1.5rem; 
    }
}
@media (max-width: 480px) {
    .account-cards-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
     .account-list-container {
         padding: 0.5rem 0.5rem 2rem 0.5rem;
     }
}
</style>