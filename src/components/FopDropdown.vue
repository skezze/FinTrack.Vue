<template>
    <div class="fop-dropdown">
      <button class="dropdown-toggle" @click="toggleDropdown">
        {{ selected || 'Выберите ФОП' }}
        <span class="arrow">▾</span>
      </button>
      <ul v-if="isOpen" class="dropdown-menu">
        <li
          v-for="option in options"
          :key="option"
          class="dropdown-item"
          @click="selectOption(option)"
        >
          {{ option }}
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const options = ['Іван Іванов ФОП', 'Петро Петренко ФОП', 'Нова компанія']
  const isOpen = ref(false)
  const selected = ref(null)
  
  const toggleDropdown = () => {
    isOpen.value = !isOpen.value
    console.log(isOpen.value)
    console.log("toggle")
    console.log(options)
  }
  
  const closeDropdown = () => {
    isOpen.value = false
    console.log("close")
  }
  
  const selectOption = (option) => {
    selected.value = option
    closeDropdown()
    // emit или сохранение можно сюда добавить
  }
  </script>
  
  <style scoped>
  .fop-dropdown {
    position: relative;
    display: inline-block;
  }
  
  .dropdown-toggle {
    background-color: transparent;
    color: #5e0000;
    border: 2px solid #d49b95;
    border-radius: 20px;
    padding: 8px 16px;
    font-weight: 500;
    font-size: 16px;
    cursor: pointer;
    min-width: 200px;
    text-align: left;
  }
  
  .arrow {
    float: right;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 110%;
    left: 0;
    background-color: #fffdf0;
    border: 2px solid #d49b95;
    border-radius: 12px;
    min-width: 100%;
    z-index: 10;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  
  .dropdown-item {
    list-style-type: none;
    padding: 10px 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .dropdown-item:hover {
    background-color: #f4e3df;
  }
  </style>
  