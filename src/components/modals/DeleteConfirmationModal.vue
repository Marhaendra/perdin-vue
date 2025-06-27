<script setup>
import { defineEmits } from 'vue'
import { Button } from '@/components/ui/button'

// defineEmits sekarang akan digunakan oleh fungsi di bawah ini
const emit = defineEmits(['confirm', 'close'])

// Buat fungsi handler untuk setiap tombol
function handleConfirm() {
  emit('confirm')
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/80 flex justify-center items-center p-4">
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
      <h3 class="text-lg font-bold mb-2">Hapus Data</h3>
      <p class="text-sm text-muted-foreground mb-6">
        Apakah Anda yakin ingin menghapus data ini secara permanen?
      </p>
      <div class="flex justify-center gap-4">
        <Button variant="outline" @click="handleClose">Batal</Button>
        <Button variant="destructive" @click="handleConfirm">Hapus</Button>
      </div>
    </div>
  </div>
</template>
