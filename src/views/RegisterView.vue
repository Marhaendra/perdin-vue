<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import authApi from '@/services/auth'

const router = useRouter()

const form = ref({
  username: '',
  password: '',
})

const errors = ref({})
const isLoading = ref(false)
const showSuccessPopup = ref(false)

const validateForm = () => {
  const newErrors = {}
  if (!form.value.username.trim()) newErrors.username = 'Username wajib diisi'
  if (!form.value.password || form.value.password.length < 6) {
    newErrors.password = 'Password minimal 6 karakter'
  }
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleRegister = async () => {
  errors.value = {}
  isLoading.value = true

  if (!validateForm()) {
    isLoading.value = false
    return
  }

  try {
    await authApi.register({
      username: form.value.username,
      password: form.value.password,
    })

    showSuccessPopup.value = true

    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    if (error.response?.data?.message) {
      errors.value.general = error.response.data.message
    } else if (error.response?.data?.errors) {
      error.response.data.errors.forEach((err) => {
        errors.value[err.path] = err.msg
      })
    } else {
      errors.value.general = 'Terjadi kesalahan saat registrasi. Silakan coba lagi.'
    }
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
          Register Akun Baru
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleRegister" class="space-y-6">
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
              placeholder="Masukkan username"
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
              minlength="6"
              class="mt-1 block w-full"
              :class="{ 'border-destructive': errors.password }"
              placeholder="Password minimal 6 karakter"
            />
            <span v-if="errors.password" class="text-destructive text-sm">{{
              errors.password
            }}</span>
          </div>

          <div>
            <Button type="submit" class="w-full" :disabled="isLoading">
              <span v-if="isLoading">Mendaftarkan...</span>
              <span v-else>Register</span>
            </Button>
          </div>
        </form>

        <p class="mt-6 text-center text-sm text-muted-foreground">
          Sudah punya akun?
          <router-link
            to="/login"
            class="font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
          >
            Login di sini
          </router-link>
        </p>

        <transition name="fade">
          <div
            v-if="showSuccessPopup"
            class="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-md z-50"
          >
            Registrasi berhasil!
          </div>
        </transition>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
