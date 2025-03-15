<template>
    <div class="tax-widget" @click="handleOutsideClick">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="tax-item"
        :class="{ active: activeIndex === index }"
        @mouseenter="hoverIndex = index"
        @mouseleave="hoverIndex = null"
        @click.stop="selectItem(index)"
      >
        <div class="label">{{ item.label }}</div>
        <div v-if="hoverIndex === index" class="tooltip">
          {{ item.short }}
        </div>
      </div>
  
      <div v-if="activeIndex !== null" class="details">
        <h3>{{ items[activeIndex].label }}</h3>
        <p>{{ items[activeIndex].description }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  
  const items = ref([
    {
      label: 'Єдиний податок',
      short: 'Щоквартальний платіж',
      description: 'Єдиний податок сплачується щоквартально до 20 числа місяця, наступного за кварталом.',
    },
    {
      label: 'ПДФО',
      short: 'Податок на доходи фізичних осіб',
      description: 'ПДФО сплачується щомісяця за результатами діяльності.',
    },
    {
      label: 'ЄСВ',
      short: 'Єдиний соціальний внесок',
      description: 'ЄСВ сплачується незалежно від доходу кожного місяця до 20 числа.',
    },
  ])
  
  const hoverIndex = ref(null)
  const activeIndex = ref(null)
  
  function selectItem(index) {
    activeIndex.value = index
  }
  
  function handleOutsideClick(e) {
    const widget = document.querySelector('.tax-widget')
    if (!widget.contains(e.target)) {
      activeIndex.value = null
      hoverIndex.value = null
    }
  }
  
  onMounted(() => {
    document.addEventListener('click', handleOutsideClick)
  })
  
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleOutsideClick)
  })
  </script>
  
  <style scoped>
  .tax-widget {
    position: relative;
    padding: 1rem;
    max-width: 600px;
    margin: auto;
  }
  
  .tax-item {
    position: relative;
    margin: 0.5rem 0;
    padding: 0.5rem;
    background: #f3f3f3;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s;
  }
  
  .tax-item.active {
    background: #d1e7dd;
    border: 1px solid #0f5132;
  }
  
  .label {
    font-weight: 600;
  }
  
  .tooltip {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    background: #222;
    color: #fff;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
    white-space: nowrap;
    z-index: 10;
  }
  
  .details {
    margin-top: 2rem;
    padding: 1rem;
    border-top: 1px solid #ccc;
    background: #fafafa;
  }
  </style>
  