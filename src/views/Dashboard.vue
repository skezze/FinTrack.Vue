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
  