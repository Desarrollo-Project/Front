import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardBody, CardFooter } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { UserPlus } from 'lucide-react';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  userType: 'bidder' | 'auctioneer';
}

interface FormErrors {
  [key: string]: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    userType: 'bidder'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

if (!formData.password) {
  newErrors.password = 'Password is required';
} else {
  const passwordErrors: string[] = [];

  if (formData.password.length < 8) {
    passwordErrors.push('at least 8 characters');
  }
  if (!/[a-z]/.test(formData.password)) {
    passwordErrors.push('a lowercase letter');
  }
  if (!/[A-Z]/.test(formData.password)) {
    passwordErrors.push('an uppercase letter');
  }
  if (!/\d/.test(formData.password)) {
    passwordErrors.push('a number');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
    passwordErrors.push('a special character');
  }

  if (passwordErrors.length > 0) {
    newErrors.password = `Password must include ${passwordErrors.join(', ')}.`;
  }
}


    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

  const roleMap: Record<'bidder' | 'auctioneer', number> = {
    bidder: 3,       // ejemplo: Postor
    auctioneer: 2    // ejemplo: Subastador
  };

    try {
      const dbResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/Usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.firstName,
          apellido: formData.lastName,
          username: formData.email,
          password: formData.password,
          correo: formData.email,
          telefono: formData.phone,
          direccion: formData.address,
          rol_id: roleMap[formData.userType]
        })
      });

      if (!dbResponse.ok) {
        const error = await dbResponse.text();
        setErrors({ general: `Error saving in database: ${error}` });
        return;
      }

      navigate('/profile');
    } catch (err) {
      setErrors({ general: 'Unexpected error occurred during registration' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center animate-fade-in">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create an Account</h1>
          <p className="mt-2 text-gray-600">Join our auction platform today</p>
        </div>

        <Card className="animate-slide-up">
          <form onSubmit={handleSubmit}>
            <CardBody>
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {errors.general}
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  fullWidth
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    required
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    required
                  />
                </div>

                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  fullWidth
                  required
                />

                <Input
                  label="Address"
                  type="text"
                  name="address"
                  placeholder="123 Main St, City, Country"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  fullWidth
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Register as</label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-colors duration-200"
                  >
                    <option value="bidder">Bidder</option>
                    <option value="auctioneer">Auctioneer</option>
                  </select>
                </div>

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  fullWidth
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  fullWidth
                  required
                />
              </div>
            </CardBody>

            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                icon={<UserPlus size={20} />}
              >
                Register
              </Button>

              <div className="mt-4 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
