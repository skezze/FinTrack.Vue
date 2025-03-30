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
  flex-direction: column;
  min-height: 90vh;
  background-color: #f8f9fa;
  box-sizing: border-box;
}

.main {
  display: flex;
  align-items: stretch;
  flex-grow: 1;
  padding: 1.5rem;
  padding-bottom: 3rem;
  gap: 1.5rem;
  box-sizing: border-box;
}

</style>