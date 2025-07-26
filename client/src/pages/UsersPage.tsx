import React from 'react';
import { UserCheck } from 'lucide-react';

const UsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">
            Manage system users, roles, and permissions.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">User Management</h3>
            <p className="mt-1 text-sm text-gray-500">
              This page will contain user management functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage; 