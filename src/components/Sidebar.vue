<template>
  <div class="sidebar">
    <div class="logo">Fin<span>Track</span></div>
    <nav>
      <a
        @click="selectView('calendar')"
        :class="{ active: activeView === 'calendar' }"
      >
        Calendar
      </a>
      <a
        @click="selectView('transactions')"
        :class="{ active: activeView === 'transactions' }"
      >
        Transactions
      </a>
      <a
        @click="selectView('profile')"
        :class="{ active: activeView === 'profile' }"
      >
        Profile
      </a>
      <a
        @click="selectView('settings')"
        :class="{ active: activeView === 'settings' }"
      >
        Settings
      </a>
      <a
        @click="selectView('help')"
        :class="{ active: activeView === 'help' }"
      >
        Help
      </a>
      <a @click="logout">Logout</a>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue' // Импортируем ref
import { removeToken } from '@/helpers/auth' // Убедитесь, что путь правильный

// Создаем ref для хранения активного вида, устанавливаем начальное значение (например, 'transactions')
const activeView = ref('transactions') // Можете выбрать другое начальное значение

function logout() {
  removeToken()
  window.location.href = '/auth'
}

function selectView(view) {
  activeView.value = view // Обновляем активный вид
  // Отправляем событие родителю (или другим компонентам) о смене вида
  const event = new CustomEvent('viewChange', { detail: view })
  window.dispatchEvent(event)
}

// Опционально: Если родительский компонент может изменять вид,
// можно добавить слушатель событий, чтобы синхронизировать activeView
// window.addEventListener('externalViewChange', (event) => {
//   if (['calendar', 'transactions', 'profile', 'settings', 'help'].includes(event.detail)) {
//      activeView.value = event.detail;
//   }
// });
// Не забудьте удалить слушатель при размонтировании компонента (onUnmounted)

</script>

<style scoped>
.sidebar {
    /* Добавьте общие стили для сайдбара, если нужно */
    /* Например: */
    padding: 20px;
    background-color: #f8f9fa; /* Пример фона */
    height: 100vh; /* Пример высоты */
    width: 250px; /* Пример ширины */
    box-shadow: 2px 0 5px rgba(0,0,0,0.1); /* Пример тени */
}

.logo {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 30px; /* Увеличил отступ */
  color: #bb3333; /* Основной цвет лого */
  text-align: center; /* Центрируем лого */
}

.logo span {
  color: #333; /* Цвет второй части лого */
}

nav {
    display: flex;
    flex-direction: column; /* Располагаем ссылки вертикально */
}

nav a {
  font-size: 20px; /* Немного уменьшил для лучшего вида */
  margin: 8px 0; /* Вертикальные отступы */
  padding: 10px 15px; /* Внутренние отступы для кликабельной области */
  display: block;
  cursor: pointer;
  color: #555; /* Цвет неактивных ссылок */
  text-decoration: none; /* Убираем подчеркивание */
  border-radius: 6px; /* Слегка скругляем углы */
  transition: background-color 0.2s ease, color 0.2s ease; /* Плавный переход */
}

nav a:hover {
  background-color: #e9ecef; /* Легкий фон при наведении */
  color: #333;
}

/* Стиль для активной ссылки */
nav a.active {
  background-color: #e18877; /* Цвет фона активной ссылки (взят из предыдущих примеров) */
  color: #ffffff; /* Белый цвет текста активной ссылки */
  font-weight: 600; /* Делаем шрифт активной ссылки жирнее */
}

/* Стиль для кнопки Logout, чтобы она выглядела похоже, но не имела active состояния */
nav a:last-of-type { /* Применяем к последней ссылке (Logout) */
    margin-top: 20px; /* Добавляем отступ сверху */
    /* Можно добавить отдельные стили для logout, если нужно */
    /* Например, color: #dc3545; */
}
</style>