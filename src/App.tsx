import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// ---------------Pages------------------

// Autenticación
import Home from './pages/Authentication/Home';
import Register from './pages/Authentication/Register';
import Login from './pages/Authentication/Login';

// Recuperación / Confirmación
import ForgotPassword from './pages/User/Profile/ForgotPassword';
import ResetPassword from './pages/User/Profile/ResetPassword';
import ConfirmAccount from './pages/User/Profile/ConfirmAccount';

// Usuario común
import Profile from './pages/User/Profile/Profile';
import ActivityHistory from './pages/User/Profile/ActivityHistory';
import ChangePassword from './pages/User/Profile/ChangePassword';

// Admin
import RolesPermisos from './pages/Admin/RolesPermisos/RolesPermisosAdmin';
import AdminReports from './pages/Admin/Reportes/AdminReports';

// Subastador
import Products from './pages/Subastador/Producto/Products';
import AuctionsAuctionner from './pages/Subastador/Subasta/AuctionsAuctionner';
import PaymentReport from './pages/Subastador/Reporte_Pagos/HistorialTransacciones';

// Postor
import Payments from './pages/Postor/Pago/PostorDashboard';
import PaymentHistory from './pages/Postor/Pago/TransactionHistory';
import AuctionExplorer from './pages/Postor/Subasta/AuctionExplorer';
import CreateClaim from './pages/Postor/Reclamos/CreateClaim';
import MyClaims from './pages/Postor/Reclamos/MyClaims';
import PrizeClaim from './pages/Postor/Reclamos/PrizeClaim';
import ReportPostor from "./pages/Postor/Reportes/PostorReportes"

// Soporte / Admin
import Claims from './pages/Soporte/SoporteReclamos';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>

              {/* Rutas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/confirm/:token" element={<ConfirmAccount />} />
              <Route path="/recuperar" element={<ResetPassword />} />

              {/* Rutas Protegidas - Usuario común */}
              <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
              <Route path="/activity-history" element={<AuthGuard><ActivityHistory /></AuthGuard>} />
              <Route path="/change-password" element={<AuthGuard><ChangePassword /></AuthGuard>} />

              {/* Admin */}
              <Route path="/roles-permisos" element={<AuthGuard><RolesPermisos /></AuthGuard>} />

              {/* Subastador */}
              <Route path="/products" element={<AuthGuard><Products /></AuthGuard>} />
              <Route path="/auctions" element={<AuthGuard><AuctionsAuctionner /></AuthGuard>} />
              <Route path="/reports-Pay" element={<AuthGuard><PaymentReport /></AuthGuard>} />

              {/* Postor */}
              <Route path="/reports-user" element={<AuthGuard><ReportPostor /></AuthGuard>} />
              <Route path="/payments" element={<AuthGuard><Payments /></AuthGuard>} />
              <Route path="/payment-history" element={<AuthGuard><PaymentHistory /></AuthGuard>} />
              <Route path="/explore-auctions" element={<AuthGuard><AuctionExplorer /></AuthGuard>} />
              <Route path="/create-claim" element={<AuthGuard><CreateClaim /></AuthGuard>} />
              <Route path="/my-claims" element={<AuthGuard><MyClaims /></AuthGuard>} />
              <Route path="/prize-claim" element={<AuthGuard><PrizeClaim /></AuthGuard>} />


              {/* Soporte + Admin */}
              <Route path="/reports" element={<AuthGuard><AdminReports /></AuthGuard>} />
              <Route path="/claims" element={<AuthGuard><Claims /></AuthGuard>} />


              {/* Ruta por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
