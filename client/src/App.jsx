import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import NuestraHistoria from './pages/NuestraHistoria';
import CalendarioEventos from './pages/CalendarioEventos';
import ValoresInstitucionales from './pages/ValoresInstitucionales';
import NuestroEquipo from './pages/NuestroEquipo';
import Pastoral from './pages/Pastoral';
import Noticias from './pages/Noticias';
import NoticiaDetalle from './pages/NoticiaDetalle';
import Colegios from './pages/Colegios';
import ColegioDetalle from './pages/ColegioDetalle';
import Protocolos from './pages/ProtocolosFixed';
import Contacto from './pages/Contacto';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import CrearNoticiaAvanzada from './pages/dashboard/CrearNoticiaAvanzada';
import CrearEvento from './pages/dashboard/CrearEvento';
import EditarNoticia from './pages/dashboard/EditarNoticia';
import EditarEvento from './pages/dashboard/EditarEvento';
import GestionarContenido from './pages/dashboard/GestionarContenido';
import UsuariosPanel from './pages/dashboard/UsuariosPanel';
import DetalleNoticia from './pages/dashboard/DetalleNoticia';
import NotFound from './pages/NotFound';

function App() {
  return (
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
                    <Route path="/nuestra-historia" element={<NuestraHistoria />} />
                    <Route path="/calendario-eventos" element={<CalendarioEventos />} />
                    <Route path="/valores-institucionales" element={<ValoresInstitucionales />} />
                    <Route path="/nuestro-equipo" element={<NuestroEquipo />} />
                    <Route path="/pastoral" element={<Pastoral />} />
                    <Route path="/noticias" element={<Noticias />} />
                    <Route path="/noticias/:id" element={<NoticiaDetalle />} />
                    <Route path="/colegios" element={<Colegios />} />
                    <Route path="/colegios/:id" element={<ColegioDetalle />} />
                    <Route path="/protocolos" element={<Protocolos />} />
                    <Route path="/contacto" element={<Contacto />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Navigate to="/" replace />} />
                    
                    {/* Rutas protegidas */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <AdminDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/dashboard/contenido/crear" 
                      element={
                        <ProtectedRoute>
                          <CrearNoticiaAvanzada />
                        </ProtectedRoute>
                      } 
                    />
                    <Route
                      path="/dashboard/usuarios"
                      element={
                        <ProtectedRoute requiredRole={['admin','propietario']}>
                          <UsuariosPanel />
                        </ProtectedRoute>
                      }
                    />
                    <Route 
                      path="/dashboard/contenido" 
                      element={
                        <ProtectedRoute>
                          <GestionarContenido />
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
                          <EditarNoticia />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Rutas de eventos */}
                    <Route 
                      path="/dashboard/eventos/crear" 
                      element={
                        <ProtectedRoute>
                          <CrearEvento />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/dashboard/eventos/editar/:id" 
                      element={
                        <ProtectedRoute>
                          <EditarEvento />
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
        </AuthProvider>
      </ThemeProvider>
  );
}

export default App;
