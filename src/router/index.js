import { createRouter, createWebHistory } from 'vue-router'
import CryptoJS from 'crypto-js'

// Views
import Login from '@/views/LoginView.vue'
import Register from '@/views/RegisterView.vue'
import Dashboard from '@/views/DashboardView.vue'
import AdminDashboard from '@/views/AdminDashboardView.vue'
import Perdinku from '@/views/PerdinkuView.vue'
import ApprovalPerdin from '@/views/ApprovalPerdinView.vue'
import MasterKota from '@/views/MasterKotaView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
    meta: { notLogin: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { notLogin: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { notLogin: true },
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, role: 'PEGAWAI' },
    children: [
      {
        path: '',
        name: 'Perdinku',
        component: Perdinku,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/admin/dashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'DIVISI-SDM' },
    children: [
      {
        path: '',
        name: 'ApprovalPerdin',
        component: ApprovalPerdin,
        meta: { requiresAuth: true },
      },
      {
        path: 'master-kota',
        name: 'MasterKota',
        component: MasterKota,
        meta: { requiresAuth: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})


router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')
  console.log(`2 local storage ${localStorage.getItem('token')}`)

  if (to.matched.some((record) => record.meta.notLogin)) {
    if (isAuthenticated) {
      return next('/dashboard')
    }
  }

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      return next('/login')
    }
  }

  if (to.matched.some((record) => record.meta.role)) {
    if (isAuthenticated) {
      const getLocalData = localStorage.getItem('userData')
      console.log(`3 getlocal storage ${getLocalData}`)
      if (getLocalData) {
        try {
          const decryptData = CryptoJS.AES.decrypt(getLocalData, 'ud')
          const convertToString = decryptData.toString(CryptoJS.enc.Utf8)

          if (!convertToString) {
            throw new Error('Decryption returned an empty string')
          }
          const parseLocalData = JSON.parse(convertToString)
          const userRole = parseLocalData.role
          const requiredRole = to.meta.role

          console.log(`4 decryptData ${decryptData}, convertToString: ${convertToString}`)

          // console.log(`5 jwtStoreData ${}`)

          console.log(`User role: ${userRole}, Required role: ${requiredRole}`)

          if (userRole === requiredRole) {
            return next()
          } else {
            if (userRole === 'DIVISI-SDM') {
              return next('/admin/dashboard')
            } else if (userRole === 'PEGAWAI') {
              return next('/dashboard')
            }
          }
        } catch (error) {
          console.error('Error handling userData:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('userData')
          return next('/login')
        }
      } else {
        return next('/login')
      }
    } else {
      return next('/login')
    }
  }
  next()
})

export default router
