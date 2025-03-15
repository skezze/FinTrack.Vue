<template>
    <div class="content">
      <router-view />
      <TaxInfoWidget />
    </div>
  </template>
  
  <script>
  import TaxInfoWidget from '@/components/TaxInfoWidget.vue'
  export default {
    name: 'MainContent',
    components: {
      TaxInfoWidget
    }
  }
  </script>
  