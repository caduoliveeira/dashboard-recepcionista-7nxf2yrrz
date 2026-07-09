import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Checklist from './pages/Checklist'
import Reports from './pages/Reports'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Inventory from './pages/Inventory'
import Maintenance from './pages/Maintenance'
import Shopping from './pages/Shopping'
import Emergency from './pages/Emergency'
import Layout from './components/Layout'
import { AuthProvider } from '@/hooks/use-auth'

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/shopping" element={<Shopping />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
