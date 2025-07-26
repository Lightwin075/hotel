import React from 'react';
import { Users } from 'lucide-react';

const GuestsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="page-title">Guest Management</h1>
          <p className="page-subtitle">
            Manage guest profiles, preferences, and history.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Guest Management</h3>
            <p className="mt-1 text-sm text-gray-500">
              This page will contain guest management functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestsPage; 