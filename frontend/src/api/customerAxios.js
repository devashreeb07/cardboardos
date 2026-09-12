import axios from 'axios'

const customerApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

customerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('customer_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

customerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('customer_token')
      localStorage.removeItem('customer_user')
      window.location.href = '/customer/login'
    }
    return Promise.reject(error)
  }
)

export default customerApi