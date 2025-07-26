import React from 'react';
import { Users, Bed, Calendar, CreditCard, TrendingUp, Clock } from 'lucide-react';

const DashboardPage: React.FC = () => {
  // Mock data - in a real app, this would come from API calls
  const stats = [
    {
      name: 'Total Rooms',
      value: '24',
      change: '+2.5%',
      changeType: 'increase',
      icon: Bed,
    },
    {
      name: 'Occupied Rooms',
      value: '18',
      change: '+1.2%',
      changeType: 'increase',
      icon: Users,
    },
    {
      name: 'Today\'s Check-ins',
      value: '5',
      change: '+0.8%',
      changeType: 'increase',
      icon: Calendar,
    },
    {
      name: 'Revenue',
      value: '$12,450',
      change: '+5.2%',
      changeType: 'increase',
      icon: CreditCard,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'check-in',
      guest: 'John Doe',
      room: '101',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'check-out',
      guest: 'Jane Smith',
      room: '205',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'reservation',
      guest: 'Mike Johnson',
      room: '302',
      time: '6 hours ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back! Here's what's happening with your hotel today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                        <span className="sr-only">Increased by</span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
          </div>
          <div className="card-body">
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivity.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                            <Clock className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {activity.type === 'check-in' && 'Check-in'}
                              {activity.type === 'check-out' && 'Check-out'}
                              {activity.type === 'reservation' && 'New Reservation'}
                              {' '}
                              <span className="font-medium text-gray-900">
                                {activity.guest}
                              </span>
                              {' '}
                              in room {activity.room}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quick Actions
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <button className="btn btn-primary">
                <Calendar className="h-5 w-5 mr-2" />
                New Reservation
              </button>
              <button className="btn btn-secondary">
                <Users className="h-5 w-5 mr-2" />
                Add Guest
              </button>
              <button className="btn btn-success">
                <Bed className="h-5 w-5 mr-2" />
                Check In
              </button>
              <button className="btn btn-warning">
                <CreditCard className="h-5 w-5 mr-2" />
                Process Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Room Status Overview */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Room Status Overview
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">6</div>
              <div className="text-sm text-gray-500">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">18</div>
              <div className="text-sm text-gray-500">Occupied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">2</div>
              <div className="text-sm text-gray-500">Maintenance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">3</div>
              <div className="text-sm text-gray-500">Reserved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 