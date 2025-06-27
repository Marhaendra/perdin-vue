<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useJwtStore } from '@/services/jwtStore'
import CryptoJS from 'crypto-js'
import { LayoutDashboard, CheckSquare, MapPin, LogOut } from 'lucide-vue-next'

const jwtStore = useJwtStore()
const router = useRouter()

const userRole = computed(() => {
  if (!jwtStore.userData) return null
  console.log(`sidebar 1 jwtstore.userdata:${jwtStore.userData}`)
  try {
    const bytes = CryptoJS.AES.decrypt(jwtStore.userData, 'ud')
    console.log(`sidebar 2 role:${JSON.parse(bytes.toString(CryptoJS.enc.Utf8)).role}`)
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)).role
  } catch {
    return null
  }
})

const handleLogout = () => {
  jwtStore.clearToken()

  router.push('/login')
}
</script>

<template>
  <aside
    class="hidden md:flex flex-col justify-between w-64 border-r h-[calc(100vh)] fixed bg-background"
  >
    <nav class="p-4 space-y-1">
      <RouterLink
        v-if="userRole === 'PEGAWAI'"
        to="/dashboard"
        class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        active-class="bg-accent text-accent-foreground"
      >
        <LayoutDashboard class="h-4 w-4" />
        <span>Perdinku</span>
      </RouterLink>

      <RouterLink
        v-if="userRole === 'DIVISI-SDM'"
        to="/admin/dashboard/"
        class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        active-class="bg-accent text-accent-foreground"
      >
        <CheckSquare class="h-4 w-4" />
        <span>Approval Perdin</span>
      </RouterLink>

      <RouterLink
        v-if="userRole === 'DIVISI-SDM'"
        to="/admin/dashboard/master-kota"
        class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        active-class="bg-accent text-accent-foreground"
      >
        <MapPin class="h-4 w-4" />
        <span>Master Kota</span>
      </RouterLink>
    </nav>

    <div class="p-4">
      <button
        @click="handleLogout"
        class="flex items-center gap-3 rounded-md px-3 py-2 w-full text-left text-sm font-medium hover:bg-accent hover:text-accent-foreground"
      >
        <LogOut class="h-4 w-4" />
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>
