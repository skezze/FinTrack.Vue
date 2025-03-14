<template>
  <div class="auth-form">
    <div class="form-box">
      <h2>{{ isLogin ? 'Login' : 'Register' }}</h2>

      <input v-model="login" type="text" placeholder="Login" />
      <input v-model="password" type="password" placeholder="Password" />

      <button @click="handleSubmit">
        {{ isLogin ? 'Login' : 'Register' }}
      </button>

      <button class="google-button" @click="loginWithGoogle">
        Login via Google
        <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" alt="G" class="google-icon" />
      </button>

      <p class="switch-mode">
        {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
        <a href="#" @click.prevent="toggleMode">{{ isLogin ? 'Register' : 'Login' }}</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const login = ref('')
const password = ref('')
const isLogin = ref(true)

function toggleMode() {
  isLogin.value = !isLogin.value
}

function handleSubmit() {
  console.log(isLogin.value ? 'Logging in' : 'Registering', login.value, password.value)
}

function loginWithGoogle() {
  console.log('Login with Google clicked')
}
</script>

<style scoped>
.auth-form {
  width: 100vw;
  height: 100vh;
  background-color: #fefceb;
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-box {
  width: 100%;
  max-width: 700px;
  padding: 60px;
  background-color: #fce1bb;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  text-align: center;
  box-sizing: border-box;
}

h2 {
  font-size: 36px;
  margin-bottom: 32px;
}

input {
  display: block;
  width: 100%;
  margin: 20px 0;
  padding: 18px;
  font-size: 18px;
  border: none;
  border-radius: 10px;
  background-color: #f1f1f1;
  box-sizing: border-box;
}

button {
  margin-top: 24px;
  padding: 16px;
  width: 100%;
  font-size: 22px;
  border: none;
  background-color: white;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
}

button:hover {
  background-color: #eee;
}

.google-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.google-icon {
  height: 24px;
}

.switch-mode {
  margin-top: 28px;
  font-size: 20px;
}

.switch-mode a {
  color: #007BFF;
  text-decoration: none;
  margin-left: 6px;
}

.switch-mode p {
  font-size: 16px;
}
</style>
