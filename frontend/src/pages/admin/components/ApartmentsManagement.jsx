import React from 'react';
import { FaEye } from 'react-icons/fa';

const ApartmentsManagement = ({ apartments, apartmentFilters, setApartmentFilters }) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₱0.00';
    return `₱${parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-700">Apartments</h2>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
        <div>
          <select
            value={apartmentFilters.status}
            onChange={(e) => setApartmentFilters({...apartmentFilters, status: e.target.value})}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div>
          <select
            value={apartmentFilters.sort}
            onChange={(e) => setApartmentFilters({...apartmentFilters, sort: e.target.value})}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="createdAt">Creation Date</option>
            <option value="rent">Rent Price</option>
          </select>
        </div>

        <div>
          <select
            value={apartmentFilters.order}
            onChange={(e) => setApartmentFilters({...apartmentFilters, order: e.target.value})}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <button
          onClick={() => setApartmentFilters({status: '', sort: 'createdAt', order: 'desc'})}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
        >
          Reset
        </button>
      </div>

      {/* Apartments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Apartment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Landlord
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rent
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                View
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {apartments && apartments.length > 0 ? (
              apartments.map((apt) => (
                <tr key={apt._id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{apt.title || "Apartment"}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {apt.address?.city ? `${apt.address.city}, ${apt.address.state}` : "No address"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {apt.landlord_id?.name || "No landlord"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {apt.landlord_id?.email || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {apt.tenant_id ? (
                      <>
                        <div className="text-sm text-gray-900">
                          {apt.tenant_id.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {apt.tenant_id.email}
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">Unoccupied</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-600 font-medium">
                      {formatCurrency(apt.rent)}
                    </div>
                    <div className="text-xs text-gray-500">
                      per month
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${apt.status === 'available' ? 'bg-green-100 text-green-800' : 
                        apt.status === 'occupied' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        // navigate to apartment detail view (if implemented)
                        // For now, just alert apartment ID
                        alert(`Apartment ID: ${apt._id}`);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-900"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No apartments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApartmentsManagement;