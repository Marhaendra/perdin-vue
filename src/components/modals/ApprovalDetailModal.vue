<script setup>
import { ref } from 'vue'
import { defineProps, defineEmits } from 'vue'
import { X } from 'lucide-vue-next'
import { format } from 'date-fns'

// Impor service untuk approve/reject
import perdinApi from '@/services/perdin'

// Impor komponen UI
import { Button } from '@/components/ui/button'

// Komponen ini menerima data perdin sebagai 'props' dari induknya
const props = defineProps({
  perdinData: {
    type: Object,
    required: true,
  },
})

// Komponen ini akan mengirim event 'close' dan 'action-completed' ke induk
const emit = defineEmits(['close', 'action-completed'])

// State untuk loading saat tombol ditekan
const isProcessing = ref(false)

// Helper untuk format mata uang
const formatCurrency = (value) => {
  const numberValue = Number(value)
  if (isNaN(numberValue)) return 'Rp. 0,-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numberValue)
}

// Handler untuk tombol Approve
async function handleApprove() {
  isProcessing.value = true
  try {
    // Ini sudah benar, ia akan memanggil fungsi .put() yang baru kita ubah di service
    await perdinApi.approve(props.perdinData.id)
    alert('Pengajuan berhasil disetujui!')
    emit('action-completed')
  } catch (error) {
    console.error('Gagal menyetujui:', error)
    alert('Gagal menyetujui pengajuan.')
  } finally {
    isProcessing.value = false
  }
}

// Handler untuk tombol Reject
async function handleReject() {
  isProcessing.value = true
  try {
    // Ini sudah benar, ia akan memanggil fungsi .put() yang baru kita ubah di service
    await perdinApi.reject(props.perdinData.id)
    alert('Pengajuan berhasil ditolak!')
    emit('action-completed')
  } catch (error) {
    console.error('Gagal menolak:', error)
    alert('Gagal menolak pengajuan.')
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/80 flex justify-center items-center p-4">
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg animate-in fade-in-0 zoom-in-95">
      <div class="flex justify-between items-center mb-6 border-b pb-4">
        <h2 class="text-xl font-bold text-gray-800">Approval Pengajuan Perdin</h2>
        <Button @click="$emit('close')" variant="ghost" size="icon" class="rounded-full">
          <X class="h-5 w-5" />
        </Button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium text-muted-foreground">Nama</label>
          <p class="w-full mt-1 p-2 bg-slate-100 rounded-md">{{ perdinData.nama_pegawai }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-muted-foreground">Kota</label>
          <div class="flex items-center gap-2 mt-1">
            <p class="w-full p-2 bg-slate-100 rounded-md">{{ perdinData.kota_asal }}</p>
            <span class="text-muted-foreground">&rarr;</span>
            <p class="w-full p-2 bg-slate-100 rounded-md">{{ perdinData.kota_tujuan }}</p>
          </div>
        </div>
        <div>
          <label class="text-sm font-medium text-muted-foreground">Tanggal</label>
          <div class="flex items-center gap-2 mt-1">
            <p class="w-full p-2 bg-slate-100 rounded-md">
              {{ format(new Date(perdinData.tanggal_berangkat), 'dd MMMM yyyy') }}
            </p>
            <span class="text-muted-foreground">&rarr;</span>
            <p class="w-full p-2 bg-slate-100 rounded-md">
              {{ format(new Date(perdinData.tanggal_pulang), 'dd MMMM yyyy') }}
            </p>
          </div>
        </div>
        <div>
          <label class="text-sm font-medium text-muted-foreground">Keterangan</label>
          <p class="w-full mt-1 p-2 bg-slate-100 rounded-md h-20 overflow-auto">
            {{ perdinData.maksud_tujuan }}
          </p>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-3 gap-4 text-center bg-muted/50 p-4 rounded-lg">
        <div>
          <p class="text-sm text-muted-foreground">Total Hari</p>
          <p class="font-bold text-lg">{{ perdinData.durasi }} Hari</p>
        </div>
        <div>
          <p class="text-sm text-muted-foreground">Jarak Tempuh</p>
          <p class="font-bold text-lg">{{ Number(perdinData.jarak_km).toFixed(0) }} KM</p>
          <p class="text-xs text-muted-foreground">
            {{ formatCurrency(perdinData.uang_saku_perhari) }} / Hari
          </p>
        </div>
        <div>
          <p class="text-sm text-muted-foreground">Total Uang Perdin</p>
          <p class="font-bold text-lg text-primary">
            {{ formatCurrency(perdinData.total_uang_saku) }}
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-4 mt-8">
        <Button variant="destructive" @click="handleReject" :disabled="isProcessing">
          {{ isProcessing ? 'Memproses...' : 'Reject' }}
        </Button>
        <Button @click="handleApprove" :disabled="isProcessing">
          {{ isProcessing ? 'Memproses...' : 'Approve' }}
        </Button>
      </div>
    </div>
  </div>
</template>
