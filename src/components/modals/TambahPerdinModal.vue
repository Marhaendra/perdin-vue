<script setup>
import { ref, computed, onMounted } from 'vue'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
// 1. PERBAIKAN TANGGAL: Impor helper dari date-fns
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import CryptoJS from 'crypto-js'

// Impor service API
import apiKota from '@/services/kota'
import apiPerdin from '@/services/perdin'

// Impor komponen shadcn-vue
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const emit = defineEmits(['close', 'submit-success'])

const form = ref({
  kotaAsalId: null,
  kotaTujuanId: null,
  tanggalAwal: null,
  tanggalAkhir: null,
  keterangan: '',
})

const cities = ref([])
const isLoadingCities = ref(false)
const fetchError = ref(null)
const isSubmitting = ref(false)

const totalHari = computed(() => {
  if (form.value.tanggalAwal && form.value.tanggalAkhir) {
    const start = new Date(form.value.tanggalAwal)
    const end = new Date(form.value.tanggalAkhir)
    if (end < start) return 0
    const diff = end.getTime() - start.getTime()
    const total = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return total + 1
  }
  return 0
})

async function fetchCities() {
  isLoadingCities.value = true
  fetchError.value = null
  try {
    const response = await apiKota.getAll()

    // PERBAIKAN KOTA: Akses array dari properti 'data' di dalam response.data
    if (response.data && Array.isArray(response.data.data)) {
      cities.value = response.data.data
      if (response.data.data.length === 0) {
        fetchError.value = 'Tidak ada data kota.'
      }
    } else {
      console.error('Format data kota tidak sesuai.')
      fetchError.value = 'Format data tidak sesuai.'
    }
  } catch (error) {
    console.error('Gagal memuat data kota:', error)
    fetchError.value = 'Gagal memuat data.'
  } finally {
    isLoadingCities.value = false
  }
}
const disabledDateRange = computed(() => {
  if (!form.value.tanggalAwal) {
    return [] // Jika tanggal awal belum ada, jangan nonaktifkan apapun
  }

  // Buat objek date dari tanggal awal
  const startDate = new Date(form.value.tanggalAwal)

  // Nonaktifkan semua tanggal SEBELUM tanggal awal.
  // Properti 'end' berarti menonaktifkan semua tanggal yang berakhir SEBELUM tanggal ini.
  return [{ end: startDate }]
})

// Di dalam <script setup> di file TambahPerdinModal.vue

async function handleSubmit() {
  isSubmitting.value = true

  let userId

  // --- LANGKAH DEKRIPSI UNTUK MENDAPATKAN USER ID ---
  try {
    const encryptedData = localStorage.getItem('userData') // Ambil data terenkripsi dari store
    if (!encryptedData) {
      throw new Error('Data pengguna tidak ditemukan di sesi.')
    }

    // Lakukan dekripsi
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, 'ud')
    const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8)
    console.log(`decryptedString: ${decryptedString}`)

    if (!decryptedString) {
      throw new Error('Gagal mendekripsi data pengguna.')
    }

    const userObject = JSON.parse(decryptedString)
    userId = userObject.id // Ambil ID dari objek hasil dekripsi

    console.log(`userID: ${userId}`)

    if (!userId) {
      throw new Error('User ID tidak ditemukan setelah dekripsi.')
    }
  } catch (error) {
    console.error('Error saat mengambil data user:', error)
    alert(`Sesi Anda tidak valid. Silakan login kembali. encryptedData: ${userId}`)
    isSubmitting.value = false
    return // Hentikan proses jika gagal mendapatkan userId
  }

  // --- Lanjutkan proses seperti sebelumnya ---
  // Validasi form
  if (
    !form.value.kotaAsalId ||
    !form.value.kotaTujuanId ||
    !form.value.tanggalAwal ||
    !form.value.tanggalAkhir ||
    !form.value.keterangan
  ) {
    alert('Harap isi semua field yang wajib diisi.')
    isSubmitting.value = false
    return
  }

  // Siapkan payload
  const payload = {
    maksud_tujuan: form.value.keterangan,
    tanggal_berangkat: format(new Date(form.value.tanggalAwal), 'yyyy-MM-dd'),
    tanggal_pulang: format(new Date(form.value.tanggalAkhir), 'yyyy-MM-dd'),
    kota_asal_id: form.value.kotaAsalId.toString(),
    kota_tujuan_id: form.value.kotaTujuanId.toString(),
  }

  try {
    // Panggil API dengan userId yang sudah kita dapatkan
    await apiPerdin.create(userId, payload)
    alert('Pengajuan perdin berhasil dibuat!')
    emit('submit-success')
  } catch (error) {
    console.error('Gagal mengajukan perdin:', error.response?.data || error.message)
    alert(`Gagal menyimpan data: ${error.response?.data?.message || 'Terjadi kesalahan'}`)
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  emit('close')
}

onMounted(() => {
  fetchCities()
})
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/80 flex justify-center items-start pt-16 md:pt-24">
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg animate-in fade-in-0 zoom-in-95">
      <div class="flex justify-between items-center mb-6 border-b pb-4">
        <h2 class="text-xl font-bold text-gray-800">Tambah Perdin</h2>
        <Button variant="ghost" size="icon" @click="handleCancel" class="rounded-full"
          >&times;</Button
        >
      </div>
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <Label for="kota-asal">Kota</Label>
          <div class="flex items-center gap-2 mt-1">
            <Select v-model="form.kotaAsalId">
              <SelectTrigger id="kota-asal"
                ><SelectValue placeholder="Pilih kota asal"
              /></SelectTrigger>
              <SelectContent>
                <div v-if="isLoadingCities" class="p-2 text-sm text-muted-foreground">
                  Memuat...
                </div>
                <div v-else-if="fetchError" class="p-2 text-sm text-destructive">
                  {{ fetchError }}
                </div>
                <SelectItem v-for="kota in cities" :key="`asal-${kota.id}`" :value="kota.id">{{
                  kota.nama
                }}</SelectItem>
              </SelectContent>
            </Select>
            <span class="text-muted-foreground">&rarr;</span>
            <Select v-model="form.kotaTujuanId">
              <SelectTrigger id="kota-tujuan"
                ><SelectValue placeholder="Pilih kota tujuan"
              /></SelectTrigger>
              <SelectContent>
                <div v-if="isLoadingCities" class="p-2 text-sm text-muted-foreground">
                  Memuat...
                </div>
                <div v-else-if="fetchError" class="p-2 text-sm text-destructive">
                  {{ fetchError }}
                </div>
                <SelectItem v-for="kota in cities" :key="`tujuan-${kota.id}`" :value="kota.id">{{
                  kota.nama
                }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Tanggal</Label>
          <div class="flex items-center gap-2 mt-1">
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  :variant="'outline'"
                  :class="
                    cn(
                      'w-full justify-start text-left font-normal',
                      !form.tanggalAwal && 'text-muted-foreground',
                    )
                  "
                >
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ form.tanggalAwal ? format(form.tanggalAwal, 'PPP') : 'Tanggal Awal' }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0"
                ><Calendar v-model="form.tanggalAwal"
              /></PopoverContent>
            </Popover>
            <span class="text-muted-foreground">&rarr;</span>
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  :variant="'outline'"
                  :class="
                    cn(
                      'w-full justify-start text-left font-normal',
                      !form.tanggalAkhir && 'text-muted-foreground',
                    )
                  "
                >
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ form.tanggalAkhir ? format(form.tanggalAkhir, 'PPP') : 'Tanggal Akhir' }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar v-model="form.tanggalAkhir" :disabled-dates="disabledDateRange" />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div>
          <Label for="keterangan">Keterangan</Label>
          <Textarea
            id="keterangan"
            v-model="form.keterangan"
            placeholder="Masukkan keterangan perjalanan dinas..."
            class="mt-1"
          />
        </div>
        <div class="text-center bg-muted/50 p-4 rounded-md">
          <p class="text-sm text-muted-foreground">Total Perjalanan Dinas</p>
          <p class="text-2xl font-bold text-primary">{{ totalHari }} Hari</p>
        </div>
        <div class="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" @click="handleCancel">Kembali</Button>
          <Button type="submit" :disabled="isSubmitting">
            <span v-if="isSubmitting">Menyimpan...</span>
            <span v-else>Tambah</span>
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
