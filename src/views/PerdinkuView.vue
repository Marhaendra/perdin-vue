<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import CryptoJS from 'crypto-js'
import apiPerdin from '@/services/perdin'

import { format } from 'date-fns'

// Impor komponen shadcn-vue
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import TambahPerdinModal from '@/components/modals/TambahPerdinModal.vue'

const perdinList = ref([])
const isLoading = ref(true)
const isModalOpen = ref(false)

// Fungsi untuk mengambil data dari API
async function fetchPerdinList() {
  isLoading.value = true
  let userId

  try {
    const encryptedData = localStorage.getItem('userData')
    if (!encryptedData) throw new Error('Data pengguna tidak ditemukan di sesi.')

    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, 'ud')
    const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8)
    if (!decryptedString) throw new Error('Gagal mendekripsi data pengguna.')

    const userObject = JSON.parse(decryptedString)
    userId = userObject.id
    if (!userId) throw new Error('User ID tidak ditemukan setelah dekripsi.')
  } catch (error) {
    console.error('Sesi tidak valid atau data korup:', error.message)
    perdinList.value = []
    isLoading.value = false
    return
  }

  try {
    const response = await apiPerdin.getUserPerdin(userId)

    if (response.data && response.data.success) {
      const apiData = response.data.data


      perdinList.value = apiData.map((item) => {
        const tglBerangkat = item.tanggal_berangkat ? new Date(item.tanggal_berangkat) : null
        const tglPulang = item.tanggal_pulang ? new Date(item.tanggal_pulang) : null

        return {
          id: item.id,
          kotaAsal: item.kota_asal, 
          kotaTujuan: item.kota_tujuan, 
          tanggalMulai: tglBerangkat ? format(tglBerangkat, 'dd MMM') : '', // Format: 28 Sep
          tanggalSelesai: tglPulang ? format(tglPulang, 'dd MMM, yyyy') : '', // Format: 09 Oct, 2022
          durasi: item.durasi,
          keterangan: item.maksud_tujuan, // dari snake_case ke camelCase
          status: item.status,
        }
      })
    } else {
      console.error('Gagal mengambil data perdin:', response.data.message)
    }
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil data perdin:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchPerdinList()
})

const getBadgeClass = (status) => {
  switch (status) {
    case 'PENGAJUAN':
      return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100'
    case 'DISETUJUI':
      return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100'
    case 'DITOLAK':
      return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100'
  }
}

function openModal() {
  isModalOpen.value = true
}
function closeModal() {
  isModalOpen.value = false
}
function handleSubmissionSuccess() {
  closeModal()
  fetchPerdinList() 
}
</script>

<template>
  <div class="p-4 sm:p-6 md:p-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800">PerdinKu</h1>
      <Button @click="openModal">
        <Plus class="mr-2 h-4 w-4" />
        Tambah Perdin
      </Button>
    </div>

    <div class="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[50px]">#</TableHead>
            <TableHead class="min-w-[180px]">Kota</TableHead>
            <TableHead class="min-w-[220px]">Tanggal</TableHead>
            <TableHead>Keterangan</TableHead>
            <TableHead class="text-center w-[120px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="isLoading">
            <TableRow>
              <TableCell colspan="5" class="h-24 text-center">
                <p class="text-muted-foreground">Memuat data...</p>
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="perdinList.length > 0">
            <TableRow v-for="perdin in perdinList" :key="perdin.id">
              <TableCell class="font-medium">
                {{ perdin.id }}
              </TableCell>
              <TableCell> {{ perdin.kotaAsal }} &rarr; {{ perdin.kotaTujuan }} </TableCell>
              <TableCell>
                {{ perdin.tanggalMulai }} - {{ perdin.tanggalSelesai }} ({{ perdin.durasi }} Hari)
              </TableCell>
              <TableCell class="max-w-xs text-gray-600 truncate">
                {{ perdin.keterangan }}
              </TableCell>
              <TableCell class="text-center">
                <Badge :class="getBadgeClass(perdin.status)" variant="outline">
                  {{ perdin.status }}
                </Badge>
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell colspan="5" class="h-24 text-center"> Tidak ada data perdin. </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <TambahPerdinModal
      v-if="isModalOpen"
      @close="closeModal"
      @submit-success="handleSubmissionSuccess"
    />
  </div>
</template>
