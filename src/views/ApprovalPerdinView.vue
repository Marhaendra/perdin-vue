<script setup>
import { ref, onMounted, computed } from 'vue' 
import { Eye } from 'lucide-vue-next'
import { format } from 'date-fns'
import perdinApi from '@/services/perdin'

// shadcn-vue
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import ApprovalDetailModal from '@/components/modals/ApprovalDetailModal.vue'

const allPerdinList = ref([]) 
const isLoading = ref(true)
const selectedPerdin = ref(null)

const pengajuanBaruList = computed(() => 
  allPerdinList.value.filter(item => item.status === 'PENGAJUAN')
);

const historyList = computed(() => 
  allPerdinList.value.filter(item => item.status === 'DISETUJUI' || item.status === 'DITOLAK')
);

async function fetchAllPerdin() {
  isLoading.value = true
  try {
    const response = await perdinApi.getPerdin()

    if (response.data && response.data.success) {

      allPerdinList.value = response.data.data
    } else {
      console.error("Gagal mengambil data perdin:", response.data.message)
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat mengambil data perdin:", error)
  } finally {
    isLoading.value = false
  }
}

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


function openDetailModal(perdinItem) {
  selectedPerdin.value = perdinItem
}
function closeDetailModal() {
  selectedPerdin.value = null
}
function handleActionSuccess() {
  closeDetailModal()
  fetchAllPerdin() 
}

onMounted(() => {
  fetchAllPerdin()
})
</script>

<template>
  <div class="p-4 sm:p-6 md:p-8">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
      Pengajuan Perdin
    </h1>

    <Tabs default-value="baru" class="w-full">
      <TabsList class="grid w-full grid-cols-2 md:w-[400px]">
        <TabsTrigger value="baru">
          Pengajuan Baru
          <Badge v-if="pengajuanBaruList.length > 0" class="ml-2">
            {{ pengajuanBaruList.length }}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="history">
          History Pengajuan
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="baru" class="mt-4">
        <div class="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[50px]">#</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kota</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead class="text-center w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="isLoading">
                <TableRow><TableCell colspan="6" class="h-24 text-center text-muted-foreground">Memuat data...</TableCell></TableRow>
              </template>
              <template v-else-if="pengajuanBaruList.length > 0">
                <TableRow v-for="item in pengajuanBaruList" :key="item.id">
                  <TableCell class="font-medium">{{ item.id }}</TableCell>
                  <TableCell>{{ item.nama_pegawai }}</TableCell>
                  <TableCell>{{ item.kota_asal }} &rarr; {{ item.kota_tujuan }}</TableCell>
                  <TableCell>{{ format(new Date(item.tanggal_berangkat), 'dd MMM yyyy') }} - {{ format(new Date(item.tanggal_pulang), 'dd MMM yyyy') }} ({{ item.durasi }} Hari)</TableCell>
                  <TableCell class="max-w-xs truncate">{{ item.maksud_tujuan }}</TableCell>
                  <TableCell class="text-center">
                    <Button @click="openDetailModal(item)" variant="ghost" size="icon">
                      <Eye class="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </template>
              <template v-else>
                <TableRow><TableCell colspan="6" class="h-24 text-center text-muted-foreground">Tidak ada pengajuan baru.</TableCell></TableRow>
              </template>
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="history" class="mt-4">
        <div class="border rounded-lg">
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[50px]">#</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kota</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="isLoading">
                <TableRow><TableCell colspan="5" class="h-24 text-center text-muted-foreground">Memuat data...</TableCell></TableRow>
              </template>
              <template v-else-if="historyList.length > 0">
                <TableRow v-for="item in historyList" :key="item.id">
                  <TableCell class="font-medium">{{ item.id }}</TableCell>
                  <TableCell>{{ item.nama_pegawai }}</TableCell>
                  <TableCell>{{ item.kota_asal }} &rarr; {{ item.kota_tujuan }}</TableCell>
                  <TableCell>{{ format(new Date(item.tanggal_berangkat), 'dd MMM yyyy') }}</TableCell>
                  <TableCell>
                    <Badge :class="getBadgeClass(item.status)" variant="outline">{{ item.status }}</Badge>
                  </TableCell>
                </TableRow>
              </template>
              <template v-else>
                <TableRow><TableCell colspan="5" class="h-24 text-center text-muted-foreground">Belum ada riwayat pengajuan.</TableCell></TableRow>
              </template>
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>

    <ApprovalDetailModal
      v-if="selectedPerdin"
      :perdin-data="selectedPerdin"
      @close="closeDetailModal"
      @action-completed="handleActionSuccess"
    />
  </div>
</template>