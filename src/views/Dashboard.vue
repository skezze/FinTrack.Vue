<template>
  <div class="wrapper">
    <Header />
    <div class="main">
      <Sidebar />
      <MainContent />
    </div>
  </div>
</template>

  
  <script>
  import Header from '@/components/Header.vue'
  import Sidebar from '@/components/Sidebar.vue'
  import MainContent from '@/components/MainContent.vue'
  
  export default {
    components: {
      Header,
      Sidebar,
      MainContent
    }
  }
  </script>
  