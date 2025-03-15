<template>
    <div class="sidebar">
      <div class="logo">Fin<span>Track</span></div>
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

  <style scoped>
  .logo {
    font-size: 30px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #b33;
  }

  .logo span {
    color: #333;
  }
  nav a {
    font-size: 25px;
  }
  </style>
  