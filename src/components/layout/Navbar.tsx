import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Gavel, 
  Package, 
  CreditCard,
  BarChart2,
  AlertCircle,
  Shield,
  History,
  Clock, 
  PlusCircle, 
  ClipboardList, 
  Gift
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };


  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Gavel className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-primary-600 font-bold text-xl">BidHub</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:flex sm:items-center">
            <div className="ml-10 flex items-center space-x-4">

              {!isAuthenticated ? (
                <>
                  <Link
                    to="/"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/') 
                        ? 'text-primary-700 bg-primary-50' 
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/register"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/register') 
                        ? 'text-primary-700 bg-primary-50' 
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    Register
                  </Link>
                  <Link
                    to="/login"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/login') 
                        ? 'text-primary-700 bg-primary-50' 
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    Login
                  </Link>
                </>
              ) : (
                <>
                {/* ADMIN */}

                  {user?.userType === 'admin' && (
                    <>
                      <Link
                        to="/roles-permisos"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/roles-permisos') 
                            ? 'text-primary-700 bg-primary-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <Shield size={16} className="shrink-0" />
                        Roles y Permisos
                      </Link>
                      <Link
                        to="/reports"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/reports') 
                            ? 'text-primary-700 bg-primary-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <BarChart2 size={16} />
                        Reports
                      </Link>
                      <Link
                        to="/claims"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/create-claim')
                            ? 'text-primary-700 bg-primary-50'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <ClipboardList size={16} />
                        Reclamos
                      </Link>
                      <Link
                        to="/profile"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/profile') 
                            ? 'text-primary-700 bg-primary-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <User size={16} />
                        Profile
                      </Link>
                    </>
                  )}

                {/* SUBASTADOR */}

                  {user?.userType === 'auctioneer' && (
                    <>
                      <Link
                        to="/products"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/products') 
                            ? 'text-primary-700 bg-primary-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <Package size={16} />
                        Products
                      </Link>
                      <Link
                        to="/reports-Pay"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/reports-Pay') 
                            ? 'text-primary-700 bg-primary-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <BarChart2 size={16} />
                        Payment Reports
                      </Link>
                      <Link
                        to="/auctions"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/auctions') 
                            ? 'text-primary-700 bg-primary-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <Gavel size={16} />
                        Auctions
                      </Link>
                      <Link
                        to="/profile"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/profile') 
                            ? 'text-primary-700 bg-primary-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <User size={16} />
                        Profile
                      </Link>
                    </>
                  )}

                {/* POSTOR */}

                  {user?.userType === 'bidder' && (
                    <>
                      <Link
                        to="/reports-user"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/reports-user') 
                            ? 'text-primary-700 bg-primary-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <BarChart2 size={16} />
                        Reportes
                      </Link>
                      <Link
                        to="/payments"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/payments') 
                            ? 'text-primary-700 bg-primary-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <CreditCard size={16} />
                        Payments
                      </Link>
                      
                      <Link
                        to="/explore-auctions"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/auctions') 
                            ? 'text-primary-700 bg-primary-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <Gavel size={16} />
                        Auctions
                      </Link>
                      <Link
                        to="/create-claim"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/create-claim')
                            ? 'text-primary-700 bg-primary-50'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <PlusCircle size={16} />
                        Nuevo Reclamo
                      </Link>

                      <Link
                        to="/my-claims"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/my-claims')
                            ? 'text-primary-700 bg-primary-50'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <ClipboardList size={16} />
                        Mis Reclamos
                      </Link>

                      <Link
                        to="/prize-claim"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/prize-claim')
                            ? 'text-primary-700 bg-primary-50'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <Gift size={16} />
                        Reclamar Premio
                      </Link>
                      
                      <Link
                        to="/profile"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/profile') 
                            ? 'text-primary-700 bg-primary-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <User size={16} />
                        Profile
                      </Link>
                    </>
                  )}


                {/* SOPORTE TECNICO */}

                  {user?.userType === 'support' && (
                    <>
                      <Link
                        to="/claims"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/create-claim')
                            ? 'text-primary-700 bg-primary-50'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <ClipboardList size={16} />
                        Reclamos
                      </Link>
                      <Link
                        to="/reports"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/reports') 
                            ? 'text-primary-700 bg-primary-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <BarChart2 size={16} />
                        Reports
                      </Link>
                      <Link
                        to="/profile"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isActive('/profile') 
                            ? 'text-primary-700 bg-primary-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <User size={16} />
                        Profile
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t animate-slide-down">
          <div className="px-2 pt-2 pb-3 space-y-1">

            {!isAuthenticated ? (
              <>
                <Link
                  to="/"
                  onClick={closeMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/') 
                      ? 'text-primary-700 bg-primary-50' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/register') 
                      ? 'text-primary-700 bg-primary-50' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/login') 
                      ? 'text-primary-700 bg-primary-50' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/auctions"
                  onClick={closeMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
                    isActive('/auctions') 
                      ? 'text-primary-700 bg-primary-50' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Gavel size={18} />
                  Auctions
                </Link>

                {user?.userType === 'auctioneer' && (
                  <>
                    <Link
                      to="/products"
                      onClick={closeMenu}
                      className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
                        isActive('/products') 
                          ? 'text-primary-700 bg-primary-50' 
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      <Package size={18} />
                      Products
                    </Link>
                    <Link
                      to="/reports"
                      onClick={closeMenu}
                      className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
                        isActive('/reports') 
                          ? 'text-primary-700 bg-primary-50' 
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      <BarChart2 size={18} />
                      Reports
                    </Link>
                  </>
                )}

                {user?.userType === 'bidder' && (
                  <>
                    <Link
                      to="/payments"
                      onClick={closeMenu}
                      className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
                        isActive('/payments') 
                          ? 'text-primary-700 bg-primary-50' 
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      <CreditCard size={18} />
                      Payments
                    </Link>
                    <Link
                      to="/claims"
                      onClick={closeMenu}
                      className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
                        isActive('/claims') 
                          ? 'text-primary-700 bg-primary-50' 
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      <AlertCircle size={18} />
                      Claims
                    </Link>
                  </>
                )}

                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
                    isActive('/profile') 
                      ? 'text-primary-700 bg-primary-50' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <User size={18} />
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;