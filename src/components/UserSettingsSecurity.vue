<template>
    <div class="settings-security">
      <h2>Безпека та Вхід</h2>
  
      <div class="setting-section">
        <h3>Змінити Email (Логін)</h3>
        <form @submit.prevent="handleChangeLogin" class="setting-form">
          <div class="form-group">
            <label for="current-email">Поточний Email:</label>
            <input type="email" id="current-email" :value="currentUserEmail" disabled />
            <small>Для зміни логіну зверніться до підтримки (приклад).</small>
            </div>
  
          </form>
      </div>
  
      <div class="setting-section">
        <h3>Змінити Пароль</h3>
        <form @submit.prevent="handleChangePassword" class="setting-form">
          <div class="form-group">
            <label for="current-password">Поточний Пароль:</label>
            <input type="password" id="current-password" v-model="currentPassword" required :disabled="isLoadingPasswordChange" />
          </div>
          <div class="form-group">
            <label for="new-password">Новий Пароль:</label>
            <input type="password" id="new-password" v-model="newPassword" required :disabled="isLoadingPasswordChange" />
          </div>
          <div class="form-group">
            <label for="confirm-password">Підтвердіть Новий Пароль:</label>
            <input type="password" id="confirm-password" v-model="confirmPassword" required :disabled="isLoadingPasswordChange" />
          </div>
  
          <button type="submit" class="btn-save" :disabled="isLoadingPasswordChange">
            {{ isLoadingPasswordChange ? 'Збереження...' : 'Змінити Пароль' }}
          </button>
          <p v-if="successMessagePassword" class="success-message">{{ successMessagePassword }}</p>
          <p v-if="errorMessagePassword" class="error-message">{{ errorMessagePassword }}</p>
        </form>
      </div>
  
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  // Предполагается, что есть доступ к API сервисам
  // import * as api from '@/services/apiService'; // Пример
  
  // --- Состояние ---
  // Для смены логина (Email)
  const currentUserEmail = ref('user@example.com'); // Получите реальный email пользователя
  const newEmail = ref('');
  const currentPasswordForLoginChange = ref('');
  const isLoadingLoginChange = ref(false);
  const successMessageLogin = ref('');
  const errorMessageLogin = ref('');
  
  // Для смены пароля
  const currentPassword = ref('');
  const newPassword = ref('');
  const confirmPassword = ref('');
  const isLoadingPasswordChange = ref(false);
  const successMessagePassword = ref('');
  const errorMessagePassword = ref('');
  
  // --- Методы ---
  
  // Обработчик смены Email (Логина)
  async function handleChangeLogin() {
    /*
     * Примечание: Смена email часто требует подтверждения по новому адресу
     * и может быть сложной для реализации чисто через фронтенд без поддержки бекенда.
     * В данном примере функция закомментирована, т.к. часто это делают через поддержку.
     * Если ваш API позволяет смену email, раскомментируйте и адаптируйте.
     */
     errorMessageLogin.value = '';
     successMessageLogin.value = '';
     if (!newEmail.value || !currentPasswordForLoginChange.value) {
         errorMessageLogin.value = 'Будь ласка, заповніть всі поля.';
         return;
     }
     if (!/\S+@\S+\.\S+/.test(newEmail.value)) { // Простая проверка email
          errorMessageLogin.value = 'Будь ласка, введіть коректний Email.';
          return;
     }
  
     isLoadingLoginChange.value = true;
     try {
         console.log('API Call: updateEmail', { email: newEmail.value, currentPassword: currentPasswordForLoginChange.value });
         // const response = await api.updateEmail(newEmail.value, currentPasswordForLoginChange.value);
         await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация API
  
         successMessageLogin.value = 'Email успішно змінено (потрібне підтвердження, якщо налаштовано).';
         // currentUserEmail.value = newEmail.value; // Обновить текущий email (если API вернул успех)
         newEmail.value = ''; // Очистить поля
         currentPasswordForLoginChange.value = '';
     } catch (error) {
         console.error("Error updating email:", error);
         // errorMessageLogin.value = error?.response?.data?.message || 'Помилка зміни Email.'; // Пример обработки ошибки API
         errorMessageLogin.value = 'Помилка зміни Email (можливо, невірний поточний пароль).'; // Заглушка
     } finally {
         isLoadingLoginChange.value = false;
     }
  }
  
  // Обработчик смены Пароля
  async function handleChangePassword() {
    errorMessagePassword.value = '';
    successMessagePassword.value = '';
  
    // Валидация
    if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
      errorMessagePassword.value = 'Будь ласка, заповніть всі поля.';
      return;
    }
    if (newPassword.value !== confirmPassword.value) {
      errorMessagePassword.value = 'Новий пароль та підтвердження не співпадають.';
      return;
    }
    if (newPassword.value.length < 8) { // Пример минимальной длины
        errorMessagePassword.value = 'Новий пароль має містити щонайменше 8 символів.';
        return;
    }
     if (newPassword.value === currentPassword.value) {
        errorMessagePassword.value = 'Новий пароль не повинен співпадати зі старим.';
        return;
    }
  
  
    isLoadingPasswordChange.value = true;
    try {
      console.log('API Call: updatePassword', { currentPassword: '***', newPassword: '***' });
      // const response = await api.updatePassword(currentPassword.value, newPassword.value);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация API
  
      successMessagePassword.value = 'Пароль успішно змінено.';
      currentPassword.value = ''; // Очистить поля
      newPassword.value = '';
      confirmPassword.value = '';
  
    } catch (error) {
      console.error("Error updating password:", error);
      // errorMessagePassword.value = error?.response?.data?.message || 'Помилка зміни пароля.'; // Пример обработки ошибки API
      errorMessagePassword.value = 'Помилка зміни пароля (можливо, невірний поточний пароль).'; // Заглушка
    } finally {
      isLoadingPasswordChange.value = false;
    }
  }
  
  // Получение текущего email при загрузке (пример)
  // onMounted(async () => {
  //   try {
  //     const user = await api.getCurrentUser();
  //     currentUserEmail.value = user.email;
  //   } catch (error) {
  //     console.error("Failed to load user email");
  //   }
  // });
  
  </script>
  
  <style scoped>
  .settings-security {
    font-family: sans-serif;
    padding: 1rem 0; /* Добавлены вертикальные отступы */
  }
  
  h2 {
    margin-top: 0;
    margin-bottom: 2rem;
    padding-bottom: 0.8rem;
    border-bottom: 1px solid #eee;
    color: #333;
    font-weight: 600;
  }
  
  .setting-section {
    margin-bottom: 2.5rem;
    padding: 1.5rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.07);
  }
  .setting-section:last-of-type {
      margin-bottom: 1rem; /* Уменьшаем отступ у последней секции */
  }
  
  
  .setting-section h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    color: #444;
  }
  
  .setting-form {
    max-width: 450px; /* Ограничиваем ширину формы */
  }
  
  .form-group {
    margin-bottom: 1.2rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.4rem;
    font-weight: 500;
    font-size: 0.9rem;
    color: #555;
  }
  
  .form-group input[type="email"],
  .form-group input[type="password"] {
    width: 100%;
    padding: 0.6rem 0.8rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    box-sizing: border-box; /* Учитываем padding/border */
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .form-group input:disabled {
      background-color: #f3f3f3;
      cursor: not-allowed;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: #e18877; /* Цвет из предыдущих примеров */
    box-shadow: 0 0 0 2px rgba(225, 136, 119, 0.2);
  }
  .form-group small {
      font-size: 0.8rem;
      color: #777;
      margin-top: 0.3rem;
      display: block;
  }
  
  .btn-save {
    background-color: #e18877;
    color: white;
    border: none;
    padding: 0.7rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: background-color 0.2s ease, opacity 0.2s ease;
  }
  
  .btn-save:hover:not(:disabled) {
    background-color: #d46b5b;
  }
  .btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .success-message {
    color: #198754; /* Зеленый */
    background-color: #d1e7dd;
    border: 1px solid #a3cfbb;
    padding: 0.8rem 1rem;
    border-radius: 6px;
    margin-top: 1rem;
    font-size: 0.9rem;
  }
  
  .error-message {
    color: #dc3545; /* Красный */
    background-color: #f8d7da;
    border: 1px solid #f1aeb5;
    padding: 0.8rem 1rem;
    border-radius: 6px;
    margin-top: 1rem;
    font-size: 0.9rem;
  }
  </style>