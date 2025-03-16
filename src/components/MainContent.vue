<template>
    <div class="content">
      <router-view />
      <TaxInfoWidget />
    </div>
  </template>
   
  <script setup>
  import TaxInfoWidget from '@/components/TaxInfoWidget.vue'
  </script>
  