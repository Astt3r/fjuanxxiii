import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Nosotros from './pages/Nosotros';
import Pastoral from './pages/Pastoral';
import Noticias from './pages/Noticias';
import NoticiaDetalle from './pages/NoticiaDetalle';
import Colegios from './pages/Colegios';
import ColegioDetalle from './pages/ColegioDetalle';
import Protocolos from './pages/ProtocolosFixed';
import Contacto from './pages/Contacto';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import UserDashboard from './pages/dashboard/UserDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import CrearNoticia from './pages/dashboard/CrearNoticia';
import GestionarNoticias from './pages/dashboard/GestionarNoticias';
import DetalleNoticia from './pages/dashboard/DetalleNoticia';
import NotFound from './pages/NotFound';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <ScrollToTop />
              <Header />
              
              <main className="flex-1">
                <AnimatePresence mode="wait" initial={false}>
                  <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<Home />} />
                    <Route path="/nosotros" element={<Nosotros />} />
                    <Route path="/pastoral" element={<Pastoral />} />
                    <Route path="/noticias" element={<Noticias />} />
                    <Route path="/noticias/:id" element={<NoticiaDetalle />} />
                    <Route path="/colegios" element={<Colegios />} />
                    <Route path="/colegios/:id" element={<ColegioDetalle />} />
                    <Route path="/protocolos" element={<Protocolos />} />
                    <Route path="/contacto" element={<Contacto />} />
                    
                    {/* Rutas de autenticación */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Rutas protegidas */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/dashboard/usuario" 
                      element={
                        <ProtectedRoute>
                          <UserDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/dashboard/admin" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/dashboard/contenido/crear" 
                      element={
                        <ProtectedRoute>
                          <CrearNoticia />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/dashboard/contenido" 
                      element={
                        <ProtectedRoute>
                          <GestionarNoticias />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/dashboard/contenido/:id" 
                      element={
                        <ProtectedRoute>
                          <DetalleNoticia />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/dashboard/contenido/editar/:id" 
                      element={
                        <ProtectedRoute>
                          <CrearNoticia />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Página 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AnimatePresence>
              </main>
              
              <Footer />
            </div>
            
            {/* Toast notifications */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Router>
          
          {/* React Query Devtools (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
