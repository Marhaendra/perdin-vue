import api from './api'

export default {
  login(body) {
    return api.post('/auth/login', body)
  },

  register(body) {
    return api.post('/auth/register', body )
  },
}
