<template>
  <div class="main-content">
      <div class="content-wrapper-inside">
          <div class="component">
              <component :is="currentComponent" />
          </div>
      </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, shallowRef } from 'vue'
import TaxCalendar from './TaxCalendar.vue' // Предполагаемые компоненты
import TransactionList from './TransactionList.vue'
import AccountList from './AccountList.vue'
// Добавьте импорты других компонентов, если они используются
// import ProfileSettings from './ProfileSettings.vue'
// import HelpSection from './HelpSection.vue'

// shallowRef используется для оптимизации, если компоненты сложные
let currentComponent = shallowRef(AccountList) // Установил AccountList как начальный для примера

function updateView(event) {
  console.log('viewChange event received:', event.detail);
  const view = event.detail;
  switch (view) {
    case 'calendar':
      currentComponent.value = TaxCalendar;
      break;
    case 'transactions':
      currentComponent.value = TransactionList;
      break;
    case 'profile': // Используем 'profile' для отображения AccountList
      currentComponent.value = AccountList;
      break;
    // Добавьте другие case по мере необходимости
    // case 'settings':
    //   currentComponent.value = ProfileSettings;
    //   break;
    // case 'help':
    //   currentComponent.value = HelpSection;
    //   break;
    default:
      // Можно установить компонент по умолчанию или null, если вид неизвестен
      console.warn(`Unknown view requested: ${view}. Setting default.`);
      currentComponent.value = AccountList; // Возвращаемся к списку счетов по умолчанию
      break;
  }
  console.log('Current component set to:', currentComponent.value);
}

onMounted(() => {
  // Слушаем событие viewChange, которое генерирует Sidebar
  window.addEventListener('viewChange', updateView);
  // Установим начальный компонент (если нужно отличаться от дефолтного в shallowRef)
  // currentComponent.value = AccountList; // Например
});

onBeforeUnmount(() => {
  // Очищаем слушатель при размонтировании компонента
  window.removeEventListener('viewChange', updateView);
});
</script>

<style scoped>
/* В <style scoped> компонента MainContent.vue */
.main-content { /* Убедитесь, что это корневой элемент, к которому применен фон/скругление */
  height: 100%;         /* Занимаем всю доступную высоту */
  box-sizing: border-box;
  overflow-y: auto;     /* Оставляем скролл, если контент не помещается */

  /* Ваши стили для фона, скругления и т.д. */
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);

  /* Остальные стили для flex-item */
  flex-grow: 1;
  min-width: 0;
}

/* Возможно, внутренний padding лучше добавить сюда, а не в .main-content, */
/* чтобы скроллбар был снаружи паддинга */
.content-wrapper-inside {
    padding: 20px; /* Пример */
}

.component {
  /* Этот блок центрирует сам компонент внутри .main-content */
  /* Возможно, эти стили больше не нужны или их нужно скорректировать */
  /* Если вы хотите, чтобы контент занимал всю ширину .main-content (за вычетом padding), */
  /* уберите max-width и margin: auto отсюда */
  max-width: 900px; /* Пример: ограничиваем макс. ширину контента */
  margin: 0 auto; /* Центрируем контент внутри .main-content */
  padding: 0 5px; /* Небольшие боковые отступы внутри компонента, если нужно */
  font-family: sans-serif;
  /* margin-top: 40px; убран, т.к. padding есть у .main-content */
  /* margin-bottom: 40px; убран */
}
</style>