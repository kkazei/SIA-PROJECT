import React, { useEffect } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import { FaHome, FaClipboardList, FaSignOutAlt } from "react-icons/fa";

const NoApartmentView = ({ userName, onBrowseClick, onApplicationsClick, onLogout, children }) => {
  const { tenantApplications, fetchTenantApplications, loading } = useApplicationStore();

  // Fetch tenant's applications when component mounts
  useEffect(() => {
    fetchTenantApplications();
  }, [fetchTenantApplications]);

  // Count pending applications
  const pendingCount = tenantApplications.filter(app => app.status === "pending").length;
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-8 text-white">
          <h1 className="text-3xl font-semibold">Welcome, {userName}</h1>
          <p className="mt-2 opacity-90">You don't have an apartment assigned yet</p>
        </div>
        
        {/* Dashboard Content */}
        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-5 mb-6 border border-blue-100">
            <h2 className="text-lg font-medium text-blue-800 mb-2">Next Steps</h2>
            <p className="text-gray-600">
              To get started, you can browse available apartments and submit applications. 
              Once a landlord approves your application, you'll be assigned to that apartment.
            </p>
          </div>
          
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Browse Apartments Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaHome className="text-blue-600 text-xl" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-800">Browse Apartments</h3>
                  <p className="text-gray-500 mt-1 text-sm">View available apartments and submit applications</p>
                  <button 
                    onClick={onBrowseClick}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Find Apartments
                  </button>
                </div>
              </div>
            </div>
            
            {/* My Applications Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaClipboardList className="text-green-600 text-xl" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-800">My Applications</h3>
                  <p className="text-gray-500 mt-1 text-sm">
                    {loading 
                      ? "Loading your applications..." 
                      : `You have ${pendingCount} pending application${pendingCount !== 1 ? 's' : ''}`}
                  </p>
                  <button 
                    onClick={onApplicationsClick}
                    className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                  >
                    View Applications
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Logout Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
            <button 
              onClick={onLogout}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Child components (modals) */}
      {children}
    </div>
  );
};

export default NoApartmentView;