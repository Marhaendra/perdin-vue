<script setup>

import { computed} from 'vue'; 
import { useJwtStore } from '@/services/jwtStore';
import { useRouter } from 'vue-router';
import CryptoJS from 'crypto-js';
import { Avatar, AvatarFallback, } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const jwtStore = useJwtStore();
const router = useRouter();

const userData = computed(() => {
  if (!jwtStore.userData) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(jwtStore.userData, 'ud');
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
});

const handleLogout = () => {
  jwtStore.clearToken();
  router.push('/login');
};
</script>

<template>
  <header class="border-b">
    <div class="container flex h-16 items-center justify-between px-4">
      <div class="flex items-center gap-2">
        <router-link to="/dashboard" class="font-semibold">
          PERDIN APP
        </router-link>
      </div>
      
      <DropdownMenu v-if="userData">
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" class="relative h-8 w-8 rounded-full">
            <Avatar class="h-8 w-8">
              <AvatarFallback>
                {{ userData.username.charAt(0).toUpperCase() }}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div class="flex flex-col space-y-1">
              <p class="text-sm font-medium">{{ userData.username }}</p>
              <p class="text-xs text-muted-foreground">
                {{ userData.role === 'DIVISI-SDM' ? 'Divisi SDM' : 'Pegawai' }}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="handleLogout" class="cursor-pointer">
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>