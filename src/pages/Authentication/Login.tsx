import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Card, { CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { LogIn } from 'lucide-react';

interface LocationState {
  from?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const { from = '/profile' } = (location.state as LocationState) || {};

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showConfirmForm, setShowConfirmForm] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      const errorMessage = await login(email, password);
      if (errorMessage === null) {
        navigate(from);
      } else {
        setError(errorMessage);
      }
    } catch {
      setError('An error occurred while logging in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!email || !confirmationCode) {
      setConfirmMessage('Please enter both email and confirmation code');
      return;
    }

    try {
      setIsConfirming(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Usuarios/confirmar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo: confirmationCode }),
      });

      const result = await response.json();
      if (response.ok) {
        setConfirmMessage('Your account has been successfully confirmed!');
      } else {
        setConfirmMessage(result.message || 'Failed to confirm account.');
      }
    } catch {
      setConfirmMessage('An error occurred while confirming your account.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center animate-fade-in">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <Card className="animate-slide-up">
          <form onSubmit={handleLoginSubmit}>
            <CardBody>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
              />

              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-2"
                  />
                  Remember me
                </label>

                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </Link>
              </div>
            </CardBody>

            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                icon={<LogIn size={20} />}
              >
                Sign in
              </Button>

              <div className="mt-4 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign up
                </Link>
              </div>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowConfirmForm((prev) => !prev)}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  {showConfirmForm ? 'Hide Activation Form' : 'Activate your account'}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>

        {showConfirmForm && (
          <Card className="mt-6 animate-fade-in">
            <CardBody>
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Activate Account</h2>

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />

              <Input
                label="Confirmation Code"
                type="text"
                placeholder="Enter the code sent to your email"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                fullWidth
              />

              <Button
                className="mt-4"
                onClick={handleConfirmSubmit}
                isLoading={isConfirming}
                variant="secondary"
                fullWidth
              >
                Confirm Account
              </Button>

              {confirmMessage && (
                <p className="mt-2 text-sm text-center text-gray-700">{confirmMessage}</p>
              )}
            </CardBody>
          </Card>
        )}

        
      </div>
    </div>
  );
};

export default Login;
