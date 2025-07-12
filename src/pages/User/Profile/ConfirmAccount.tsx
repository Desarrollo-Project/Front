import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card, { CardBody } from '../../../components/ui/Card';
import { Check, X, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';



const ConfirmAccount: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const codigo = searchParams.get('codigo');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmAccount = async () => {
      if (!email || !codigo) {
        setStatus('error');
        setMessage('Missing confirmation parameters');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Usuarios/confirmar`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, codigo }),
        });

        if (response.ok) {
          setStatus('success');
          setMessage('Your account has been successfully confirmed!');

          // Espera 2 segundos y redirige (mejor UX y asegura propagación)
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          let errorMessage = 'Failed to confirm account';
          try {
            const data = await response.json();
            errorMessage = data.message || errorMessage;
          } catch (_) {
            // No JSON in response body
          }
          setStatus('error');
          setMessage(errorMessage);
        }
      } catch (err) {
        setStatus('error');
        setMessage('An error occurred while confirming your account');
      }

    };

    confirmAccount();
  }, [email, codigo]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <Card className="animate-slide-up">
          <CardBody className="text-center p-8">
            {status === 'loading' && (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
                <p className="text-gray-600">Confirming your account...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Confirmed!</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
                >
                  Continue to Login
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center">
                <div className="bg-red-100 p-3 rounded-full mb-4">
                  <X className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmation Failed</h2>
                <p className="text-red-600 mb-6">{message}</p>
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
                >
                  Back to Login
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmAccount;