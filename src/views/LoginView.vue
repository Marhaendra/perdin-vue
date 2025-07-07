<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import authApi from '@/services/auth'
import { useJwtStore } from '@/services/jwtStore'
import CryptoJS from 'crypto-js'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const router = useRouter()

const form = ref({
  username: '',
  password: '',
})

const errors = ref({})
const isLoading = ref(false)

// --- Login Handler ---
const handleLogin = async () => {
  errors.value = {}
  isLoading.value = true

  try {
    const response = await authApi.login({
      username: form.value.username,
      password: form.value.password,
    })

    const { token, userData } = response.data

    const jwtStore = useJwtStore()

    const encryptedUserData = CryptoJS.AES.encrypt(JSON.stringify(userData), 'ud').toString()

    jwtStore.setToken(token, encryptedUserData)
    console.log(`1 habis login ${jwtStore.token}, local storage ${localStorage.getItem('token')}`)
    router.push('/dashboard')
  } catch (error) {
    console.error('Login Gagal:', error)
    errors.value.general =
      error.response?.data?.message || 'Login gagal. Periksa kembali username dan password Anda.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8"
  >
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-center text-2xl font-bold text-foreground">
          Login Perdin App
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div
            v-if="errors.general"
            class="text-destructive text-sm p-3 bg-destructive/10 rounded-md"
          >
            {{ errors.general }}
          </div>

          <div>
            <Label for="username">Username</Label>
            <Input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="mt-1 block w-full"
              :class="{ 'border-destructive': errors.username }"
              placeholder="Masukkan username Anda"
            />
            <span v-if="errors.username" class="text-destructive text-sm">{{
              errors.username
            }}</span>
          </div>

          <div>
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 block w-full"
              :class="{ 'border-destructive': errors.password }"
              placeholder="Masukkan password Anda"
            />
            <span v-if="errors.password" class="text-destructive text-sm">{{
              errors.password
            }}</span>
          </div>

          <div>
            <Button type="submit" class="w-full" :disabled="isLoading">
              <span v-if="isLoading">Loading...</span>
              <span v-else>Login</span>
            </Button>
          </div>
        </form>

        <!-- Link ke halaman Register -->
        <p class="mt-6 text-center text-sm text-muted-foreground">
          Belum punya akun?
          <router-link
            to="/register"
            class="font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
          >
            Daftar di sini
          </router-link>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
