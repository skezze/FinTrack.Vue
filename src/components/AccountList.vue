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
import AccountCard from './AccountCard.vue'; // Убедитесь, что путь правильный
import apiClient from '@/api/client';     // Убедитесь, что путь правильный

// Реактивное состояние
const isLoading = ref(false);
const error = ref(null);
const accounts = ref([]); // Здесь будут храниться счета, загруженные с API

// Функция для загрузки информации о клиенте (включая счета)
async function fetchClientInfo() {
  isLoading.value = true;
  error.value = null;
  accounts.value = []; // Очищаем перед загрузкой

  try {
    // Выполняем GET-запрос к эндпоинту /Monobank/GetClientInfo
    const response = await apiClient.get('/Monobank/GetClientInfo');

    // Проверяем, что ответ содержит данные и массив счетов
    if (response.data && Array.isArray(response.data.accounts)) {
      accounts.value = response.data.accounts; // Присваиваем массив счетов из ответа
    } else {
      console.warn('Received unexpected data structure from GetClientInfo:', response.data);
      accounts.value = []; // Оставляем пустым, если структура не та
    }

  } catch (err) {
    console.error("Failed to fetch client info:", err);
    error.value = "Не вдалося завантажити інформацію про рахунки.";
    // Добавляем детали ошибки, если они есть
    if (err.response) {
        error.value += ` (Помилка сервера: ${err.response.status})`;
    } else if (err.request) {
        error.value += ` (Сервер не відповідає)`;
    }
  } finally {
    isLoading.value = false;
  }
}

// Обработчик события для просмотра деталей (пока просто выводит в консоль)
function handleViewDetails(accountId) {
  console.log('Need to view details for account ID:', accountId);
  // Здесь в будущем будет логика перехода на страницу деталей счета,
  // например, с использованием vue-router: router.push(`/accounts/${accountId}`)
}

// Вызываем функцию загрузки данных при монтировании компонента
onMounted(() => {
  fetchClientInfo();
});

// Возвращать переменные и функции не нужно в <script setup>,
// они автоматически доступны в <template>
</script>

<style scoped>
/* Стили остаются без изменений */
.account-list-container {
  padding: 1rem 1rem 3rem 1rem;
}
h2 {
  margin-bottom: 1.5rem;
  color: #333;
  font-weight: 600;
  text-align: center; /* Добавим центрирование для заголовка */
}
.loading-message { /* Стиль для сообщения о загрузке */
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
  /* grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); */
  /* Изменим для лучшего отображения на разных экранах */
   grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem; /* Оставляем отступ */
  margin-top: 1rem; /* Добавим отступ сверху */
}

/* Убираем лишний отступ у карточек внутри сетки */
.account-cards-grid :deep(.card) {
  margin-bottom: 0;
}

/* Добавим немного адаптивности */
@media (max-width: 768px) {
    .account-cards-grid {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1rem;
    }
    h2 {
        font-size: 1.5rem; /* Уменьшим заголовок на мал. экранах */
    }
}
@media (max-width: 480px) {
    .account-cards-grid {
        grid-template-columns: 1fr; /* Одна колонка на очень мал. экранах */
        gap: 1rem;
    }
     .account-list-container {
         padding: 0.5rem 0.5rem 2rem 0.5rem;
     }
}
</style>