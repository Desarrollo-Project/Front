import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Card, { CardBody, CardFooter } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Lock, ArrowLeft } from 'lucide-react';


interface FormErrors {
  [key: string]: string;
}

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();  
  const token = searchParams.get('token'); // Extraemos el token de la query string
  const navigate = useNavigate();
  const newErrors: FormErrors = {};

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("El token es inválido o falta.");
      return;
    }

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


    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/Usuarios/restablecer-password`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token,
            nuevaPassword: formData.newPassword,
            confirmarPassword: formData.confirmPassword
          })
        }
      );

      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        setError(data.message || 'Error al restablecer la contraseña');
      }
    } catch (err) {
      setError("Ocurrió un error. Inténtalo de nuevo más tarde.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        {success ? (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Contraseña Restablecida</h1>
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
              Tu contraseña ha sido actualizada exitosamente.
            </div>
            <Button onClick={() => navigate('/login')} variant="primary">
              Volver al Inicio de Sesión
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Restablecer Contraseña</h1>
              <p className="mt-2 text-gray-600">
                Ingresa tu nueva contraseña para actualizar tu cuenta.
              </p>
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
                    label="Nueva Contraseña"
                    type="password"
                    name="newPassword"
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={handleChange}
                    fullWidth
                    required
                  />

                  <Input
                    label="Confirmar Contraseña"
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </CardBody>

                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
                    icon={<Lock size={20} />}
                  >
                    Restablecer Contraseña
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => navigate('/login')}
                    icon={<ArrowLeft size={20} />}
                  >
                    Volver al Inicio de Sesión
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;