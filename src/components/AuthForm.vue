<template>
  <div class="auth-form">
    <div class="form-box">
      <h2>{{ isLogin ? 'Вхід' : 'Реєстрація' }}</h2>
      <div class="input-group">
        <label for="login-input">Логін</label>
        <input id="login-input" v-model="login" type="text" placeholder="Введіть ваш логін" />
      </div>
      <div class="input-group">
        <label for="password-input">Пароль</label>
        <input id="password-input" v-model="password" type="password" placeholder="Введіть ваш пароль" />
      </div>

      <button @click="handleSubmit" :disabled="isLoading">
        {{ isLoading ? 'Зачекайте...' : (isLogin ? 'Увійти' : 'Зареєструватись') }}
      </button>

      <p class="switch-mode">
        {{ isLogin ? "Немає акаунту?" : "Вже маєте акаунт?" }}
        <a href="#" @click.prevent="toggleMode">{{ isLogin ? 'Зареєструватись' : 'Увійти' }}</a>
      </p>

      <p v-if="error" class="error-message">{{ error }}</p>

    </div>
  </div>
</template>

<script setup>
import apiClient from '@/api/client';

import { ref } from 'vue';
import { removeToken, saveToken } from '@/helpers/auth';

const login = ref('');
const password = ref('');
const isLogin = ref(true);
const isLoading = ref(false);
const error = ref(null);

function toggleMode() {
  isLogin.value = !isLogin.value;
  error.value = null;
}

async function handleSubmit() {
  error.value = null;
  isLoading.value = true;

  if (!login.value || !password.value) {
    error.value = 'Будь ласка, заповніть логін та пароль.';
    isLoading.value = false;
    return;
  }

  const url = isLogin.value ? `/SignIn/Login` : `/User/AddUser`;

  const payload = {
    username: login.value,
    password: password.value
  };

  try {
    const response = await apiClient.post(url, payload);

    if (isLogin.value && response.data) {
      removeToken();
      saveToken(response.data);
      window.location.href = '/';
    } else if (!isLogin.value) {
      alert('Реєстрація успішна! Тепер ви можете увійти.');
      isLogin.value = true;
      login.value = '';
      password.value = '';
    } else {
      throw new Error('Не вдалося обробити відповідь сервера.');
    }

  } catch (err) {
    console.error('Auth Error:', err);
    if (err.response) {
      if (err.response.status === 401 && isLogin.value) {
         error.value = 'Неправильний логін або пароль.';
      } else {
         error.value = err.response.data?.message
                    || err.response.data?.title
                    || (err.response.data && typeof err.response.data === 'string' ? err.response.data : null)
                    || `Помилка сервера: ${err.response.status}`;
      }
        if (!isLogin.value && err.response.data?.errors) {
            const errors = Object.values(err.response.data.errors).flat();
            error.value = `Помилка реєстрації: ${errors.join(' ')}`;
        }

    } else if (err.request) {
      error.value = 'Не вдалося підключитися до сервера. Перевірте з\'єднання.';
    } else {
      error.value = 'Виникла помилка під час відправки запиту.';
    }
  } finally {
    isLoading.value = false;
  }
}

async function loginWithGoogle() {
  console.log('Login with Google clicked');
  error.value = 'Вхід через Google ще не реалізовано.';
}
</script>

<style scoped>
.auth-form {
  width: 100vw;
  min-height: 100vh;
  background-color: #fefceb;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}

.form-box {
  width: 100%;
  max-width: 480px;
  padding: 40px;
  background-color: #fce1bb;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  box-sizing: border-box;
}

h2 {
  font-size: 28px;
  margin-bottom: 24px;
  color: #444;
  font-weight: 600;
}

.input-group {
    margin-bottom: 18px;
    text-align: left;
}

.input-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    font-size: 0.9rem;
    color: #555;
}

input[type="text"],
input[type="password"] {
  display: block;
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #dcb7ae;
  border-radius: 8px;
  background-color: #fff;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input[type="text"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #e18877;
  box-shadow: 0 0 0 3px rgba(225, 136, 119, 0.25);
}

button {
  margin-top: 20px;
  padding: 12px 16px;
  width: 100%;
  font-size: 18px;
  font-weight: 500;
  border: none;
  background-color: #e18877;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease;
}

button:hover:not(:disabled) {
  background-color: #d46b5b;
}
button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}


.switch-mode {
  margin-top: 24px;
  font-size: 15px;
  color: #555;
}

.switch-mode a {
  color: #d46b5b;
  text-decoration: none;
  font-weight: 500;
  margin-left: 5px;
}

.switch-mode a:hover {
  text-decoration: underline;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f1aeb5;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  text-align: center;
}
</style>