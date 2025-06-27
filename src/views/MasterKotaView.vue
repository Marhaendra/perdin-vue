<script setup>
import { ref, onMounted } from 'vue';
import { Plus, Pencil, Trash2 } from 'lucide-vue-next';
import kotaApi from '@/services/kota';

// Impor komponen UI dan Modal
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import KotaFormModal from '@/components/modals/KotaFormModal.vue';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal.vue';

// State utama
const cities = ref([]);
const isLoading = ref(true);

// State untuk mengontrol modal
const isFormModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isEditMode = ref(false);
const selectedCity = ref(null);

// Fungsi untuk mengambil data
async function fetchCities() {
  isLoading.value = true;
  try {
    const response = await kotaApi.getAll();
    cities.value = response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data kota:", error);
  } finally {
    isLoading.value = false;
  }
}

// Fungsi untuk membuka modal tambah
function handleAdd() {
  isEditMode.value = false;
  selectedCity.value = null;
  isFormModalOpen.value = true;
}

// Fungsi untuk membuka modal edit
function handleEdit(city) {
  isEditMode.value = true;
  selectedCity.value = city;
  isFormModalOpen.value = true;
}

// Fungsi untuk membuka modal hapus
function handleDelete(city) {
  selectedCity.value = city;
  isDeleteModalOpen.value = true;
}

// Fungsi untuk konfirmasi hapus
async function confirmDelete() {
  try {
    await kotaApi.delete(selectedCity.value.id);
    alert('Data berhasil dihapus.');
    closeAllModals();
    fetchCities(); 
  } catch (error) {
    console.error('Gagal menghapus data:', error);
    alert('Gagal menghapus data.');
  }
}

function handleSaveSuccess() {
  closeAllModals();
  fetchCities(); 
}

function closeAllModals() {
  isFormModalOpen.value = false;
  isDeleteModalOpen.value = false;
  selectedCity.value = null;
}

onMounted(fetchCities);
</script>

<template>
  <div class="p-4 sm:p-6 md:p-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800">Master Kota</h1>
      <Button @click="handleAdd">
        <Plus class="mr-2 h-4 w-4" />
        Tambah Kota
      </Button>
    </div>

    <div class="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[50px]">#</TableHead>
            <TableHead>Nama Kota</TableHead>
            <TableHead>Provinsi</TableHead>
            <TableHead>Pulau</TableHead>
            <TableHead>Luar Negeri</TableHead>
            <TableHead>Latitude</TableHead>
            <TableHead>Longitude</TableHead>
            <TableHead class="text-center w-[120px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="isLoading">
            <TableRow><TableCell colspan="8" class="h-24 text-center text-muted-foreground">Memuat data...</TableCell></TableRow>
          </template>
          <template v-else-if="cities.length > 0">
            <TableRow v-for="(city, index) in cities" :key="city.id">
              <TableCell>{{ index + 1 }}</TableCell>
              <TableCell class="font-medium">{{ city.nama }}</TableCell>
              <TableCell>{{ city.provinsi }}</TableCell>
              <TableCell>{{ city.pulau }}</TableCell>
              <TableCell>{{ city.luar_negeri ? 'Ya' : 'Tidak' }}</TableCell>
              <TableCell>{{ city.latitude }}</TableCell>
              <TableCell>{{ city.longitude }}</TableCell>
              <TableCell class="text-center">
                <div class="flex items-center justify-center gap-2">
                  <Button @click="handleEdit(city)" variant="outline" size="icon"><Pencil class="h-4 w-4" /></Button>
                  <Button @click="handleDelete(city)" variant="destructive" size="icon"><Trash2 class="h-4 w-4" /></Button>
                </div>
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow><TableCell colspan="8" class="h-24 text-center text-muted-foreground">Tidak ada data kota.</TableCell></TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <KotaFormModal
      v-if="isFormModalOpen"
      :is-edit="isEditMode"
      :initial-data="selectedCity"
      @close="closeAllModals"
      @save-success="handleSaveSuccess"
    />

    <DeleteConfirmationModal
      v-if="isDeleteModalOpen"
      @close="closeAllModals"
      @confirm="confirmDelete"
    />
  </div>
</template>