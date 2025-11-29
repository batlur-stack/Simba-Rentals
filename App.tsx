import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';
import { AuthPage } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <Dashboard activeTab={activeTab} />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;