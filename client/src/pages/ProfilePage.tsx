import React from 'react';
import { User } from 'lucide-react';

const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="page-title">User Profile</h1>
          <p className="page-subtitle">
            Manage your profile and account settings.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">User Profile</h3>
            <p className="mt-1 text-sm text-gray-500">
              This page will contain user profile management functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 