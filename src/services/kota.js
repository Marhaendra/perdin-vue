import apiClient from './api'

export default {
  getAll() {
    return apiClient.get('/kota')
  },
  /**
   * @param {number|string} id
   */
  getById(id) {
    return apiClient.get(`/kota/${id}`)
  },

  /**
   * @param {object} cityData
   */
  create(cityData) {
    return apiClient.post('/kota', cityData)
  },

  /**
   * @param {number|string} id
   * @param {object} cityData
   */
  update(id, cityData) {
    return apiClient.put(`/kota/${id}`, cityData)
  },

  /**
   * @param {number|string} id
   */
  delete(id) {
    return apiClient.delete(`/kota/${id}`)
  },
}
