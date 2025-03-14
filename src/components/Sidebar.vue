<template>
    <div class="sidebar">
      <h2>FinTrack</h2>
      <nav>
        <a href="#">Profile</a>
        <a href="#">Events</a>
        <a href="#">Transactions</a>
        <a href="#">Settings</a>
        <a href="#">Help</a>
        <a href="#" @click="logout">Logout</a>
      </nav>
    </div>
  </template>
  
  <script>
  import { removeToken } from '@/helpers/auth'
  
  export default {
    name: 'Sidebar',
    methods: {
      logout() {
        removeToken()
        window.location.href = '/auth'
      }
    }
  }
  </script>
  