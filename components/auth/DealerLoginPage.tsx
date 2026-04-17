import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import ForgotPasswordModal from './ForgotPasswordModal';
import BrandHeader from './BrandHeader';

interface DealerLoginPageProps {
    onBack: () => void;
}

const DealerLoginPage: React.FC<DealerLoginPageProps> = ({ onBack }) => {
  const { dealerLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await dealerLogin(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const backgroundImageUrl = 'https://images.unsplash.com/photo-1608333239238-51b1a4325813?q=80&w=1974&auto=format&fit=crop';

  return (
    <>
        <div 
            className="flex flex-grow items-center justify-center min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-brightness-75"></div>

            <div className="relative w-full max-w-md px-4">
                {/* Changed bg-white/95 to bg-white for solid background */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-8">
                    <BrandHeader theme="light" />
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Dealer Login</h2>
                        <p className="text-gray-500">Use your provided credentials.</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            id="email"
                            label="Email or Username"
                            labelTheme="light"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="username or email"
                            disabled={loading}
                            autoFocus
                        />
                        <Input
                            id="password"
                            label="Password"
                            labelTheme="light"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••"
                            disabled={loading}
                        />
                        
                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <a href="#" onClick={(e) => { e.preventDefault(); setForgotPasswordOpen(true); }} className="font-medium text-primary hover:text-blue-700">
                                    Forgot password?
                                </a>
                            </div>
                        </div>
                        
                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                        
                        <div className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={loading || !email || !password}>
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>
                            <Button variant="secondary" type="button" onClick={onBack} className="w-full" disabled={loading}>
                                Back
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)} />
    </>
  );
};

export default DealerLoginPage;