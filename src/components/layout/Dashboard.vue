<script setup>
import Sidebar from '@/components/Sidebar.vue'
</script>

<template>
  <div class="flex min-h-screen w-full">
    <Sidebar class="fixed top-0 left-0 h-full w-64 hidden md:block" />

    <main class="flex-1 md:ml-64">
      <router-view />
    </main>
  </div>
</template>
