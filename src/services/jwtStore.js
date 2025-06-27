import { defineStore } from 'pinia'

export const useJwtStore = defineStore('jwt', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    userData: localStorage.getItem('userData') || null,
  }),
  actions: {
    setToken(token, encryptUserData) {
      this.token = token
      this.userData = encryptUserData

      localStorage.setItem('token', this.token)
      localStorage.setItem('userData', this.userData)
    },
    getState() {
      return {
        token: this.token,
        userData: this.userData,
      }
    },
    clearToken() {
      localStorage.removeItem('token', this.token)
      localStorage.removeItem('userData', this.userData)
      this.token = null
      this.userData = null
    },
  },
})
