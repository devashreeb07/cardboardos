import { Navigate } from 'react-router-dom'

export default function CustomerRoute({ children }) {
  const token = localStorage.getItem('customer_token')
  return token ? children : <Navigate to="/customer/login" />
}