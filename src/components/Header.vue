<template>
  <div class="header">
    <div class="header-right">
      <div v-if="isLoggedIn && user" class="user-info">
        <span class="user-name">{{ user.name }}</span>
        <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="Avatar" class="user-avatar" />
        <span v-else class="user-avatar default-avatar">👤</span>
        <button @click="handleLogout" class="btn-logout" title="Вийти">🚪</button>
      </div>

      <button v-else @click="handleLogin" class="btn-login">
        Увійти <span style="margin-left: 6px;">🔑</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getToken, removeToken } from '@/helpers/auth'; // Импортируем хелперы
import { jwtDecode } from 'jwt-decode'; // Импортируем декодер JWT

// Реактивное состояние для статуса входа и данных пользователя
const isLoggedIn = ref(false);
const user = ref(null); // Здесь будет объект { name: '...' }

// Хук onMounted срабатывает один раз при загрузке компонента
onMounted(() => {
  const token = getToken(); // Пытаемся получить токен

  if (token) {
    try {
      const decodedToken = jwtDecode(token); // Декодируем токен
      console.log("Decoded token for header:", decodedToken); // Для отладки

      // Извлекаем имя пользователя (логин) из токена
      // Ищем стандартные claim'ы: unique_name или name
      const usernameClaim = decodedToken.unique_name || decodedToken.name || null;

      if (usernameClaim) {
        // Если нашли имя пользователя, считаем, что пользователь вошел
        isLoggedIn.value = true;
        user.value = {
          name: usernameClaim, // Отображаем имя пользователя из токена
          avatarUrl: null // Аватара пока нет, будет дефолтный
          // Сюда можно добавить email или другие данные из токена, если они нужны в хедере
          // email: decodedToken.email || null
        };
      } else {
        // Токен есть, но нужного claim'а нет - считаем невалидным для сессии
        console.warn("Username claim (unique_name or name) not found in token.");
        isLoggedIn.value = false;
        user.value = null;
        removeToken(); // Удаляем "плохой" токен
      }

    } catch (error) {
      // Ошибка декодирования (токен истек или поврежден)
      console.error("Error decoding token for header:", error);
      isLoggedIn.value = false;
      user.value = null;
      removeToken(); // Удаляем невалидный токен
    }
  } else {
    // Токена нет - пользователь не вошел
    isLoggedIn.value = false;
    user.value = null;
  }
});

// Обработчик для кнопки "Увійти"
function handleLogin() {
  console.log('Redirecting to login page...');
  // Перенаправляем на страницу аутентификации
  window.location.href = '/auth'; // Или используйте vue-router: router.push('/auth')
}

// Обработчик для кнопки "Вийти" (остается без изменений)
function handleLogout() {
  removeToken(); // Удаляем токен
  isLoggedIn.value = false; // Обновляем состояние
  user.value = null;
  window.location.href = '/auth'; // Перенаправляем на страницу входа
  // Или window.location.reload(); чтобы перезагрузить страницу и обновить состояние
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.8rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
    font-size: 1.5rem;
    font-weight: bold;
    margin-right: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;
  background-color: #f0f0f0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.default-avatar {
    color: #555;
}

.btn-login,
.btn-logout {
  background-color: #e18877;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.2s ease;
}

.btn-login:hover {
  background-color: #d46b5b;
}

.btn-logout {
    background-color: #f8f9fa;
    color: #dc3545;
    border: 1px solid #dee2e6;
    padding: 0.4rem 0.6rem;
    font-size: 1.1rem;
    margin-left: 0.5rem;
}

.btn-logout:hover {
    background-color: #e9ecef;
    border-color: #ced4da;
}
</style>