<template>
  <div class="wrapper">
    <Header />
    <div class="main">
      <Sidebar />
      <MainContent />
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import MainContent from '@/components/MainContent.vue'
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column; /* Header над .main */
  min-height: 90vh;     /* Минимальная высота всего экрана */
  background-color: #f8f9fa; /* Пример легкого фона для всей страницы */
  box-sizing: border-box;
}

/* В <style scoped> компонента-макета */
.main {
  display: flex;
  align-items: stretch; /* Убеждаемся, что элементы растягиваются по высоте */
  flex-grow: 1;
  padding: 1.5rem;
  padding-bottom: 3rem;
  gap: 1.5rem;
  box-sizing: border-box;
  /* overflow: hidden; */ /* Пока убираем или комментируем для теста */
}

/* Дополнительные стили, чтобы Sidebar и MainContent занимали свое место */
/* Предполагаем, что у Sidebar фиксированная ширина, а MainContent занимает остальное */
/* Эти стили лучше размещать внутри самих компонентов Sidebar и MainContent, */
/* но для примера можно и здесь: */

/* :deep() используется для стилизации дочерних компонентов из родителя, */
/* но лучше стилизовать их внутри себя */

/*
:deep(.sidebar-component-root-class) { // Замените на реальный корневой класс Sidebar
  flex-shrink: 0; // Запрещаем сжиматься
  width: 250px; // Пример ширины
}

:deep(.main-content-component-root-class) { // Замените на реальный корневой класс MainContent
  flex-grow: 1; // Занимает оставшееся пространство
  min-width: 0; // Позволяет сжиматься при необходимости
  overflow-y: auto; // Добавляет прокрутку, если контент не помещается по высоте
}
*/

</style>