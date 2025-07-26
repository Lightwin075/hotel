import React from 'react';
import { Calendar } from 'lucide-react';

const ReservationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="page-title">Reservation Management</h1>
          <p className="page-subtitle">
            Manage hotel reservations, check-ins, and check-outs.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Reservation Management</h3>
            <p className="mt-1 text-sm text-gray-500">
              This page will contain reservation management functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationsPage; 