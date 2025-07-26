import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, Bed, Calendar, Users, CreditCard, Sparkles, UserCheck, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'staff', 'guest'] },
    { name: 'Rooms', href: '/rooms', icon: Bed, roles: ['admin', 'staff'] },
    { name: 'Reservations', href: '/reservations', icon: Calendar, roles: ['admin', 'staff', 'guest'] },
    { name: 'Guests', href: '/guests', icon: Users, roles: ['admin', 'staff'] },
    { name: 'Billing', href: '/billing', icon: CreditCard, roles: ['admin', 'staff'] },
    { name: 'Housekeeping', href: '/housekeeping', icon: Sparkles, roles: ['admin', 'staff'] },
    { name: 'Users', href: '/users', icon: UserCheck, roles: ['admin'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'staff'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || 'guest')
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Hotel Management</h2>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={onClose}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 