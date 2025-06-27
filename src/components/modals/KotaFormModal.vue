<script setup>
import { ref, onMounted, computed } from 'vue'
import { defineProps, defineEmits } from 'vue'
import kotaApi from '@/services/kota'

// Impor komponen UI dari shadcn-vue
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false,
  },
  initialData: {
    type: Object,
    default: () => null,
  },
})

const emit = defineEmits(['close', 'save-success'])

const form = ref({
  nama: '',
  provinsi: '',
  pulau: '',
  luar_negeri: false,
  latitude: '',
  longitude: '',
})

const isProcessing = ref(false)
const title = computed(() => (props.isEdit ? 'Edit Kota' : 'Tambah Kota'))

// Jika ini mode edit, isi form dengan data awal
onMounted(() => {
  if (props.isEdit && props.initialData) {
    form.value = { ...props.initialData }
  }
})

async function handleSubmit() {
  isProcessing.value = true
  try {
    if (props.isEdit) {
      // Panggil API update
      await kotaApi.update(props.initialData.id, form.value)
    } else {
      // Panggil API create
      await kotaApi.create(form.value)
    }
    alert(`Data kota berhasil ${props.isEdit ? 'diperbarui' : 'ditambahkan'}!`)
    emit('save-success')
  } catch (error) {
    console.error('Gagal menyimpan data kota:', error)
    alert('Gagal menyimpan data.')
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/80 flex justify-center items-center p-4">
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
      <h2 class="text-xl font-bold mb-4">{{ title }}</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 gap-4">
          <div>
            <Label for="nama">Nama Kota</Label>
            <Input id="nama" v-model="form.nama" required />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="provinsi">Provinsi</Label>
            <Input id="provinsi" v-model="form.provinsi" required />
          </div>
          <div>
            <Label for="pulau">Pulau</Label>
            <Input id="pulau" v-model="form.pulau" required />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="latitude">Latitude</Label>
            <Input id="latitude" v-model="form.latitude" required />
          </div>
          <div>
            <Label for="longitude">Longitude</Label>
            <Input id="longitude" v-model="form.longitude" required />
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox id="luar_negeri" v-model:checked="form.luar_negeri" />
          <label for="luar_negeri" class="text-sm font-medium">Luar Negeri</label>
        </div>
        <div class="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" @click="$emit('close')">Batal</Button>
          <Button type="submit" :disabled="isProcessing">
            {{ isProcessing ? 'Menyimpan...' : 'Simpan' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
