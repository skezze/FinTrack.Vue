<template>
  <div class="settings-security">
    <h2>Безпека та Вхід</h2>

    <div class="setting-section">
      <h3>Змінити Логін</h3>
      <form @submit.prevent="handleChangeUsername" class="setting-form">
        <div class="form-group">
          <label for="current-username">Поточний Логін:</label>
          <input type="text" id="current-username" :value="currentUserUsername" disabled />
        </div>
        <div class="form-group">
          <label for="new-username">Новий Логін:</label>
          <input type="text" id="new-username" v-model="newUsername" required :disabled="isLoadingUsernameChange" />
        </div>
         <div class="form-group">
          <label for="current-password-for-username">Пароль для підтвердження:</label>
          <input type="password" id="current-password-for-username" v-model="currentPasswordForUsernameChange" required :disabled="isLoadingUsernameChange" placeholder="Ваш поточний пароль"/>
           <small>Введіть поточний пароль, щоб змінити логін.</small>
        </div>

        <button type="submit" class="btn-save" :disabled="isLoadingUsernameChange">
          {{ isLoadingUsernameChange ? 'Збереження...' : 'Змінити Логін' }}
        </button>
        <p v-if="successMessageUsername" class="success-message">{{ successMessageUsername }}</p>
        <p v-if="errorMessageUsername" class="error-message">{{ errorMessageUsername }}</p>
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
import { ref, onMounted } from 'vue';
import apiClient from '@/api/client';
import { getToken, removeToken } from '@/helpers/auth';
import { jwtDecode } from 'jwt-decode';

const currentUserUsername = ref('');
const currentUserEmail = ref('');
const newUsername = ref('');
const currentPasswordForUsernameChange = ref('');
const isLoadingUsernameChange = ref(false);
const successMessageUsername = ref('');
const errorMessageUsername = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isLoadingPasswordChange = ref(false);
const successMessagePassword = ref('');
const errorMessagePassword = ref('');

async function handleChangeUsername() {
  errorMessageUsername.value = '';

  if (!newUsername.value || !currentPasswordForUsernameChange.value) {
    errorMessageUsername.value = 'Будь ласка, заповніть новий логін та поточний пароль.';
    return;
  }
  if (newUsername.value === currentUserUsername.value) {
    errorMessageUsername.value = 'Новий логін співпадає з поточним.';
    return;
  }

  isLoadingUsernameChange.value = true;
  try {
    const payload = {
      currentUsername: currentUserUsername.value,
      newUsername: newUsername.value,
      currentPassword: currentPasswordForUsernameChange.value,
      newPassword: currentPasswordForUsernameChange.value
    };
    await apiClient.put('/User/UpdateUser', payload);

    removeToken();
    alert('Логін успішно змінено! Будь ласка, увійдіть знову, використовуючи новий логін.');
    window.location.href = '/login';

  } catch (error) {
    console.error("Error updating username:", error);
    const errors = parseIdentityErrors(error?.response?.data);
    errorMessageUsername.value = errors.length > 0 ? errors.join(' ') : 'Помилка зміни логіну (можливо, невірний поточний пароль).';
  } finally {
    isLoadingUsernameChange.value = false;
  }
}

async function handleChangePassword() {
  errorMessagePassword.value = '';

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) { /* ... */ return; }
  if (newPassword.value !== confirmPassword.value) { /* ... */ return; }
  if (newPassword.value.length < 6) { /* ... */ return; }
  if (newPassword.value === currentPassword.value) { /* ... */ return; }


  isLoadingPasswordChange.value = true;
  try {
     const payload = {
        currentUsername: currentUserUsername.value,
        newUsername: currentUserUsername.value,
        currentPassword: currentPassword.value,
        newPassword: newPassword.value
    };
    await apiClient.put('/User/UpdateUser', payload);

    removeToken();
    alert('Пароль успішно змінено! Будь ласка, увійдіть знову з новим паролем.');
    window.location.href = '/login';

  } catch (error) {
    console.error("Error updating password:", error);
     const errors = parseIdentityErrors(error?.response?.data);
     errorMessagePassword.value = errors.length > 0 ? errors.join(' ') : 'Помилка зміни пароля (можливо, невірний поточний пароль).';
  } finally {
    isLoadingPasswordChange.value = false;
  }
}

function parseIdentityErrors(errorData) {
    let messages = [];
    if (Array.isArray(errorData)) {
        messages = errorData.map(err => err.description);
    } else if (typeof errorData === 'object' && errorData !== null) {
        if (errorData.errors && typeof errorData.errors === 'object') {
             messages = Object.values(errorData.errors).flat();
        } else if (errorData.title) { messages.push(errorData.title) }
        else if (errorData.message) { messages.push(errorData.message) }
    } else if (typeof errorData === 'string') { messages.push(errorData) }
    if (messages.length === 0 && errorData) {
        messages.push("Сталася помилка.")
    }
    return messages;
}


onMounted(() => {
  const token = getToken();
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const usernameClaim = decodedToken.unique_name || decodedToken.name || null;
      const emailClaim = decodedToken.email || null;
      currentUserUsername.value = usernameClaim || 'Логін не знайдено';
      currentUserEmail.value = emailClaim || 'Email не знайдено в токені';
    } catch (error) {
      console.error("Error decoding token:", error);
      currentUserUsername.value = 'Помилка токена';
      currentUserEmail.value = '';
      removeToken();
    }
  } else {
    console.error("No token found, cannot load user data.");
     currentUserUsername.value = 'Не авторизовано';
     currentUserEmail.value = '';
  }
});

</script>

<style scoped>
 .settings-security {
   font-family: sans-serif;
   padding: 1rem 0;
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
     margin-bottom: 1rem;
 }


 .setting-section h3 {
   margin-top: 0;
   margin-bottom: 1.5rem;
   font-size: 1.2rem;
   color: #444;
 }

 .setting-form {
   max-width: 450px;
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
 .form-group input[type="text"],
 .form-group input[type="password"] {
   width: 100%;
   padding: 0.6rem 0.8rem;
   border: 1px solid #ccc;
   border-radius: 6px;
   font-size: 1rem;
   box-sizing: border-box;
   transition: border-color 0.2s ease, box-shadow 0.2s ease;
 }
 .form-group input:disabled {
     background-color: #f3f3f3;
     cursor: not-allowed;
     color: #777;
 }

 .form-group input:focus {
   outline: none;
   border-color: #e18877;
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
   color: #198754;
   background-color: #d1e7dd;
   border: 1px solid #a3cfbb;
   padding: 0.8rem 1rem;
   border-radius: 6px;
   margin-top: 1rem;
   font-size: 0.9rem;
 }

 .error-message {
   color: #dc3545;
   background-color: #f8d7da;
   border: 1px solid #f1aeb5;
   padding: 0.8rem 1rem;
   border-radius: 6px;
   margin-top: 1rem;
   font-size: 0.9rem;
 }
</style>