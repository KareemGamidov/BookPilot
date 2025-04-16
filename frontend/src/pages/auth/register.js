import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Register the user
      const registerSuccess = await register(email);
      
      if (registerSuccess) {
        // If registration is successful, log them in
        const loginSuccess = await login(email);
        
        if (loginSuccess) {
          router.push('/books');
        } else {
          setError('Registration successful, but failed to login. Please go to login page.');
        }
      } else {
        setError('Failed to register. Please try again or use a different email.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
        <Card>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            <Input
              label="Email Address"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-secondary-600">
              Already have an account?{' '}
              <a
                href="/auth/login"
                className="text-primary-600 hover:text-primary-700"
              >
                Login
              </a>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
