import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardBody, CardFooter } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import apiClient from '../../../services/ApiClient';

interface FormErrors {
  [key: string]: string;
}

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const newErrors: FormErrors = {};

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();


if (!formData.newPassword) {
  newErrors.password = 'Password is required';
} else {
  const passwordErrors: string[] = [];

  if (formData.newPassword.length < 8) {
    passwordErrors.push('at least 8 characters');
  }
  if (!/[a-z]/.test(formData.newPassword)) {
    passwordErrors.push('a lowercase letter');
  }
  if (!/[A-Z]/.test(formData.newPassword)) {
    passwordErrors.push('an uppercase letter');
  }
  if (!/\d/.test(formData.newPassword)) {
    passwordErrors.push('a number');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword)) {
    passwordErrors.push('a special character');
  }

  if (passwordErrors.length > 0) {
    newErrors.password = `Password must include ${passwordErrors.join(', ')}.`;
  }
}

  
  
  setIsLoading(true);
  setError('');

  try {
    await apiClient.patch('/api/Usuarios/cambiar-password', {
      usuarioId: user?.id,
      passwordActual: formData.currentPassword,
      nuevoPassword: formData.newPassword,
      confirmarPassword: formData.confirmPassword,
    });

    navigate('/profile', { state: { message: 'Password successfully updated' } });
  } catch (err: any) {
    const msg = err.response?.data?.message || 'Failed to update password';
    setError(msg);
    console.error('Error al cambiar la contraseña:', err);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
          <p className="mt-2 text-gray-600">Update your account password</p>
        </div>

        <Card className="animate-slide-up">
          <form onSubmit={handleSubmit}>
            <CardBody>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}
              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                placeholder="••••••••"
                value={formData.currentPassword}
                onChange={handleChange}
                fullWidth
                required
              />
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={handleChange}
                fullWidth
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                fullWidth
                required
              />
            </CardBody>
            <CardFooter>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                icon={<Lock size={20} />}
              >
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;