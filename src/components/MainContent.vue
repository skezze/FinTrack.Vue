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
import TaxCalendar from './TaxCalendar.vue'
import TransactionList from './TransactionList.vue'
import AccountList from './AccountList.vue'

let currentComponent = shallowRef(AccountList) 

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
    case 'profile':
      currentComponent.value = AccountList;
      break;
    default:
      console.warn(`Unknown view requested: ${view}. Setting default.`);
      currentComponent.value = AccountList;
      break;
  }
  console.log('Current component set to:', currentComponent.value);
}

onMounted(() => {
  window.addEventListener('viewChange', updateView);
});

onBeforeUnmount(() => {
  window.removeEventListener('viewChange', updateView);
});
</script>

<style scoped>
.main-content { 
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;

  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);

  flex-grow: 1;
  min-width: 0;
}

.content-wrapper-inside {
    padding: 20px;
}

.component {
  max-width: 900px; 
  margin: 0 auto;
  padding: 0 5px;
  font-family: sans-serif;
}
</style>