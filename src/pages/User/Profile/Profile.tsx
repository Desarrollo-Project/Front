import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import {
  User as IconUser,
  Mail,
  Pencil,
  Check,
  X,
  Phone,
  MapPin,
  History,
  Lock,
} from 'lucide-react';
import apiClient from '../../../services/ApiClient';


const Profile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading, fetchAndUpdateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [updateMessage, setUpdateMessage] = useState(''); // Estado para el mensaje de actualización

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    email: '',
  });

  // Carga inicial del usuario
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated && user?.email) {
        try {
          await fetchAndUpdateUser(user.email);
        } catch (error) {
          console.error('Error updating user:', error);
        }
      }
      setIsFetching(false);
    };

    loadUser();
  }, [isAuthenticated, user?.email, fetchAndUpdateUser]);

  // Sincroniza formData con el estado global solo cuando no se está editando
  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '',
        email: user.email || '',
      });
    }
  }, [user, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
  if (!user) return;

  try {
    await apiClient.put('/api/Usuarios/actualizar-perfil', {
      usuarioId: user.id,
      nombre: formData.firstName,
      apellido: formData.lastName,
      correo: formData.email,
      telefono: formData.phone,
      direccion: formData.address,
    });

    await fetchAndUpdateUser(formData.email);
    setIsEditing(false);
    setUpdateMessage('Perfil actualizado');

    setTimeout(() => setUpdateMessage(''), 3000);
  } catch (error) {
    alert('Failed to update profile');
    console.error('Error al actualizar perfil:', error);
  }
};

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      address: user?.address || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const roleLabels: Record<'admin' | 'auctioneer' | 'bidder' | 'support', string> = {
    admin: 'Administrator',
    auctioneer: 'Auctioneer',
    bidder: 'Bidder',
    support: 'Technical Support',
  };


  if (isLoading || isFetching) {
    return <p className="text-center mt-10 text-gray-600">Loading profile...</p>;
  }

  if (!user) {
    return <p className="text-center mt-10 text-red-600">No user found. Please log in again.</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>

        {location.state?.message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
            {location.state.message}
          </div>
        )}

        {updateMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
            {updateMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="animate-slide-up">
              <CardHeader className="text-center">
                <div className="flex justify-center">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border-4 border-white shadow-md">
                    <IconUser size={40} className="text-primary-600" />
                  </div>
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  {formData.firstName} {formData.lastName}
                </h2>       
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700 mt-2">
                  {roleLabels[user.userType]}
                </span>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail size={18} className="mr-2" />
                    <span>{formData.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone size={18} className="mr-2" />
                    <span>{formData.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin size={18} className="mr-2" />
                    <span className="text-sm">{formData.address}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="animate-slide-up delay-75">
              <CardHeader className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Profile Details</h2>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    icon={<Pencil size={16} />}
                  >
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCancel} icon={<X size={16} />}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSave} icon={<Check size={16} />}>
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardBody>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        fullWidth
                      />
                      <Input
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        fullWidth
                      />
                    </div>
                    <Input
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      fullWidth
                    />
                    <Input
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      fullWidth
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">First Name</h3>
                        <p className="text-gray-900">{formData.firstName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Last Name</h3>
                        <p className="text-gray-900">{formData.lastName}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h3>
                      <p className="text-gray-900">{formData.phone}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
                      <p className="text-gray-900">{formData.address}</p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            <Card className="mt-6 animate-slide-up delay-150">
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-900">Account Actions</h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link to="/activity-history">
                    <Button variant="outline" fullWidth icon={<History size={20} />}>
                      View Activity History
                    </Button>
                  </Link>
                  <Link to="/change-password">
                    <Button variant="outline" fullWidth icon={<Lock size={20} />}>
                      Change Password
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;