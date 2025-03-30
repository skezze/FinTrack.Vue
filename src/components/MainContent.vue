<template>
  <div class="main-content">
    <div class="component">
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, shallowRef } from 'vue'
import TaxCalendar from './TaxCalendar.vue'
import TransactionList from './TransactionList.vue'
import AccountList from './AccountList.vue'

let currentComponent = shallowRef(TaxCalendar)

function updateView(event) {
  console.log(event)
  switch (event.detail) {
    case 'calendar':
      currentComponent.value = TaxCalendar
      break
    case 'transactions':
      currentComponent.value = TransactionList
      break
     case 'profile':
      currentComponent.value = AccountList
      break
    default:
      currentComponent.value = null
  }
  console.log(currentComponent.value)
}

onMounted(() => {
  window.addEventListener('viewChange', updateView)
})

onBeforeUnmount(() => {
  window.removeEventListener('viewChange', updateView)
})
</script>

<style scoped>
.main-content {
  padding: 20px;
    max-width: 800px;
    margin: 2rem auto;
}
.component {
    max-width: 700px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: sans-serif;
}
</style>