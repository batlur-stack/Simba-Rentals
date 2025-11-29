import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, User, FileText, Settings, CreditCard, PieChart } from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const common = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
    ];
    if (!user) return common;
    
    if (user.role === UserRole.LANDLORD) {
      return [
        ...common, 
        { id: 'properties', label: 'My Properties', icon: Settings }, 
        { id: 'tenants', label: 'Tenants', icon: User },
        { id: 'payments', label: 'Payments', icon: CreditCard }
      ];
    }
    if (user.role === UserRole.TENANT) {
      return [...common, { id: 'my-lease', label: 'My Lease', icon: FileText }, { id: 'manage-residence', label: 'Manage Residence', icon: Settings }];
    }
    if (user.role === UserRole.ADMIN) {
      return [
        ...common, 
        { id: 'users', label: 'User Management', icon: User }, 
        { id: 'all-properties', label: 'All Properties', icon: Settings },
        { id: 'payments-overview', label: 'Financials', icon: PieChart }
      ];
    }
    return common;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-slate-900 text-white w-full md:w-64 flex-shrink-0">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-kenyaRed">Simba</span> Estates
          </h1>
          {user && (
            <div className="mt-4 text-xs text-slate-400">
              Logged in as: <span className="text-white font-medium capitalize">{user.role}</span>
            </div>
          )}
        </div>
        
        <nav className="p-4 space-y-2">
          {getMenuItems().map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-kenyaGreen text-white' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-slate-800 mt-8"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
              {user?.name.charAt(0)}
            </div>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};