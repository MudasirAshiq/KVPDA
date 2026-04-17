import React, { useState } from 'react';
import HomePage from './components/auth/HomePage';
import AdminLoginPage from './components/auth/AdminLoginPage';
import DealerLoginPage from './components/auth/DealerLoginPage';
import Layout from './components/layout/Layout';
import AdminDashboard from './components/admin/AdminDashboard';
import DealerDashboard from './components/dealer/DealerDashboard';
import { useAuth } from './hooks/useAuth';
import Footer from './components/common/Footer';
import ContactPage from './components/auth/ContactPage';

type View = 'home' | 'adminLogin' | 'dealerLogin' | 'contact';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('home');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (user) {
        return (
            <Layout>
                {user.role === 'admin' ? <AdminDashboard /> : <DealerDashboard />}
            </Layout>
        );
    }
    
    switch (view) {
        case 'adminLogin':
            return <AdminLoginPage onBack={() => setView('home')} />;
        case 'dealerLogin':
            return <DealerLoginPage onBack={() => setView('home')} />;
        case 'contact':
            return <ContactPage onBack={() => setView('home')} />;
        case 'home':
        default:
            return <HomePage 
                        onAdminLogin={() => setView('adminLogin')} 
                        onDealerLogin={() => setView('dealerLogin')} 
                        onContactUs={() => setView('contact')}
                    />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-gray-800">
      <main className="flex-grow flex flex-col">
        {renderContent()}
      </main>
      {/* Footer is only shown for logged-in users via Layout, or here for logged-out users */}
      {!user && <Footer />}
    </div>
  );
};

export default App;