import apiClient from './api'

export default {
  /**
   * @param {number|string} userId
   * @param {object} perdinData
   */
  create(userId, perdinData) {
    const fullPayload = {
      userId: userId,
      ...perdinData,
    }
    return apiClient.post('/perdin', fullPayload)
  },
  getUserPerdin(userId) {
    return apiClient.get(`/perdin/${userId}`)
  },
  getPerdin() {
    return apiClient.get(`/perdin/`)
  },
  /**
   * @param {number|string} perdinId
   */
  approve(perdinId) {
    return apiClient.put(`/perdin/${perdinId}/approve`);
  },

  reject(perdinId) {
    return apiClient.put(`/perdin/${perdinId}/reject`);
  },
}
