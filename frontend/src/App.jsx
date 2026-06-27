import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login       from './pages/Login'
import Dashboard   from './pages/Dashboard'
import Orders      from './pages/Orders'
import Production  from './pages/Production'
import Workforce   from './pages/Workforce'
import Procurement from './pages/Procurement'
import Logistics   from './pages/Logistics'
import Pricing     from './pages/Pricing'
import Waste       from './pages/Waste'
import ESG         from './pages/ESG'
import Forecast    from './pages/Forecast'
import NotFound    from './pages/NotFound'
import Layout      from './components/Layout'
import BoxOptimizer from './pages/BoxOptimizer'
import WasteInsights from './pages/WasteInsights'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index              element={<Dashboard />}   />
          <Route path="orders"      element={<Orders />}      />
          <Route path="production"  element={<Production />}  />
          <Route path="workforce"   element={<Workforce />}   />
          <Route path="procurement" element={<Procurement />} />
          <Route path="logistics"   element={<Logistics />}   />
          <Route path="pricing"     element={<Pricing />}     />
          <Route path="waste"       element={<Waste />}       />
          <Route path="esg"         element={<ESG />}         />
          <Route path="forecast"    element={<Forecast />}    />
          <Route path="*"           element={<NotFound />}    />
          <Route path="boxoptimizer" element={<BoxOptimizer />} />
          <Route path="waste-insights" element={<WasteInsights />} />
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