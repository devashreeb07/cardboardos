import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login         from './pages/Login'
import Dashboard     from './pages/Dashboard'
import Orders        from './pages/Orders'
import Production    from './pages/Production'
import Workforce     from './pages/Workforce'
import Procurement   from './pages/Procurement'
import Logistics     from './pages/Logistics'
import Pricing       from './pages/Pricing'
import Waste         from './pages/Waste'
import ESG           from './pages/ESG'
import Forecast      from './pages/Forecast'
import NotFound      from './pages/NotFound'
import Layout        from './components/Layout'
import BoxOptimizer  from './pages/BoxOptimizer'
import WasteInsights from './pages/WasteInsights'
import Customers     from './pages/Customers'
import Reorder       from './pages/Reorder'

import CustomerLogin     from './pages/customer/CustomerLogin'
import CustomerLayout    from './components/CustomerLayout'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CustomerOrders    from './pages/customer/CustomerOrders'
import PlaceOrder        from './pages/customer/PlaceOrder'
import CustomerProfile   from './pages/customer/CustomerProfile'
import CustomerHistory   from './pages/customer/CustomerHistory'
import CustomerRoute     from './components/CustomerRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Admin / Staff Routes ────────────────────────────── */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index                 element={<Dashboard />}     />
          <Route path="orders"         element={<Orders />}        />
          <Route path="production"     element={<Production />}    />
          <Route path="workforce"      element={<Workforce />}     />
          <Route path="procurement"    element={<Procurement />}   />
          <Route path="logistics"      element={<Logistics />}     />
          <Route path="pricing"        element={<Pricing />}       />
          <Route path="waste"          element={<Waste />}         />
          <Route path="esg"            element={<ESG />}           />
          <Route path="forecast"       element={<Forecast />}      />
          <Route path="boxoptimizer"   element={<BoxOptimizer />}  />
          <Route path="waste-insights" element={<WasteInsights />} />
          <Route path="customers"      element={<Customers />}     />
          <Route path="reorder"        element={<Reorder />}       />
          <Route path="*"              element={<NotFound />}      />
        </Route>

        {/* ── Customer Portal Routes ──────────────────────────── */}
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer" element={
          <CustomerRoute>
            <CustomerLayout />
          </CustomerRoute>
        }>
          <Route path="dashboard"   element={<CustomerDashboard />} />
          <Route path="orders"      element={<CustomerOrders />}    />
          <Route path="place-order" element={<PlaceOrder />}        />
          <Route path="profile"     element={<CustomerProfile />}   />
          <Route path="history"     element={<CustomerHistory />}   />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

export default App