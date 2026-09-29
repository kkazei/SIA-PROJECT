import React from 'react';
import { 
  FaUsers, FaHouseUser, FaBullhorn 
} from 'react-icons/fa';

const DashboardStats = ({ systemStats }) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700">System Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users Stats */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <FaUsers className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{systemStats.users.total}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="flex justify-between mb-1">
              <div className="text-sm">
                <span className="font-medium text-blue-600">{systemStats.users.tenants}</span>
                <span className="text-gray-500"> Tenants</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-green-600">{systemStats.users.landlords}</span>
                <span className="text-gray-500"> Landlords</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-purple-600">{systemStats.users.admins}</span>
                <span className="text-gray-500"> Admins</span>
              </div>
            </div>
            <div className="flex justify-between mt-2 border-t pt-2">
              <div className="text-sm">
                <span className="font-medium text-green-600">{systemStats.users.verified || 0}</span>
                <span className="text-gray-500"> Verified</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-yellow-600">{systemStats.users.unverified || 0}</span>
                <span className="text-gray-500"> Unverified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Apartments Stats */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <FaHouseUser className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Apartments</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{systemStats.apartments.total}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 flex justify-between">
            <div className="text-sm">
              <span className="font-medium text-green-600">{systemStats.apartments.available}</span>
              <span className="text-gray-500"> Available</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-blue-600">{systemStats.apartments.occupied}</span>
              <span className="text-gray-500"> Occupied</span>
            </div>
          </div>
        </div>

        {/* Announcements Stats */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <FaBullhorn className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Announcements</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{systemStats.announcements?.total || 0}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 flex justify-between">
            <div className="text-sm">
              <span className="font-medium text-yellow-600">{systemStats.announcements?.active || 0}</span>
              <span className="text-gray-500"> Active</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-600">{systemStats.announcements?.expired || 0}</span>
              <span className="text-gray-500"> Expired</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-700">Recent User Registrations</h3>
        <div className="mt-2 bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                {/* Removed Status column */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {systemStats.recentUsers.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${!user.role ? 'bg-gray-100 text-gray-800' :
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        user.role === 'landlord' ? 'bg-green-100 text-green-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  {/* Removed Status cell */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;