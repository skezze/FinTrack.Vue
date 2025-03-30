<template>
  <div class="sidebar">
    <div class="logo">Fin<span>Track</span></div>
    <nav>
      <a
        @click="selectView('calendar')"
        :class="{ active: activeView === 'calendar' }"
      >
        Календар
      </a>
      <a
        @click="selectView('transactions')"
        :class="{ active: activeView === 'transactions' }"
      >
        Транзакції
      </a>
      <a
        @click="selectView('profile')"
        :class="{ active: activeView === 'profile' }"
      >
        Відкриті рахунки
      </a>
      <a
        @click="selectView('settings')"
        :class="{ active: activeView === 'settings' }"
      >
        Налаштування
      </a>
      <a
        @click="selectView('documents')"
        :class="{ active: activeView === 'documents' }"
      >
        Документи
      </a>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeView = ref('calendar')

function selectView(view) {
  activeView.value = view
  const event = new CustomEvent('viewChange', { detail: view })
  window.dispatchEvent(event)
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  box-sizing: border-box;

  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem 1rem;
  width: 250px;
  flex-shrink: 0;
}

.logo {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #bb3333;
  text-align: center;
}

.logo span {
  color: #333;
}

nav {
    display: flex;
    flex-direction: column;
}

nav a {
  font-size: 20px;
  margin: 8px 0;
  padding: 10px 15px;
  display: block;
  cursor: pointer;
  color: #555;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

nav a:hover {
  background-color: #e9ecef;
  color: #333;
}

nav a.active {
  background-color: #e18877;
  color: #ffffff;
  font-weight: 600;
}

nav a:last-of-type {
    margin-top: 20px;
}
</style>