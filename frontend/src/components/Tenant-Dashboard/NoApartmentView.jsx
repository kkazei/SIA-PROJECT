import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import { 
  FaHome, 
  FaClipboardList, 
  FaSignOutAlt,
  FaChevronRight,
  FaBuilding,
  FaRegLightbulb,
  FaSearchLocation,
  FaClipboardCheck
} from "react-icons/fa";
import NoApartmentSideNavBar from "./NoApartmentSideNavBar";

// Custom hook to detect screen size
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

const NoApartmentView = ({ userName, onBrowseClick, onApplicationsClick, onLogout, children }) => {
  const { tenantApplications, fetchTenantApplications, loading } = useApplicationStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Track sidebar state
  const isMobile = useMediaQuery("(max-width: 1024px)"); // Detect mobile view

  useEffect(() => {
    fetchTenantApplications();
  }, [fetchTenantApplications]);

  const pendingCount = tenantApplications.filter(app => app.status === "pending").length;

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <NoApartmentSideNavBar
        userName={userName}
        onBrowseClick={onBrowseClick}
        onApplicationsClick={onApplicationsClick}
        onLogout={onLogout}
        pendingCount={pendingCount}
        onSidebarToggle={handleSidebarToggle} // Pass the callback
      />

      {/* Main Content */}
      <div
        className={`flex-1 overflow-auto transition-all duration-300 ${
          !isMobile && (isSidebarCollapsed ? "ml-20" : "ml-64") // Adjust margin only in desktop view
        } ${isMobile ? "pt-20" : ""}`} // Slightly reduce padding in mobile view
      >
        <header className="bg-gray-800 border-b border-gray-700 p-6">
          <h1 className="text-2xl font-bold">Welcome Tenant!</h1>
        </header>
        
        <div className="p-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-6 mb-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full opacity-20 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 rounded-full opacity-20 -ml-10 -mb-10"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Hello, {userName}!</h2>
              <p className="text-blue-200 mb-6">
                You're just a few steps away from finding your new home. Let's get started with your apartment journey.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={onBrowseClick}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  Browse Apartments <FaChevronRight className="ml-2" />
                </button>
                
                <button 
                  onClick={onApplicationsClick}
                  className="px-5 py-2 bg-blue-500 bg-opacity-30 text-white border border-blue-400 rounded-lg hover:bg-opacity-40 transition-colors flex items-center"
                >
                  My Applications 
                  {pendingCount > 0 && (
                    <span className="ml-2 bg-blue-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Rest of the content */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaRegLightbulb className="mr-2 text-blue-400" /> Your Apartment Journey
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 relative">
                <span className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold">1</span>
                <h3 className="text-lg font-medium mb-2 mt-2">Browse Apartments</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Explore our available listings and find apartments that match your preferences and budget.
                </p>
                <button 
                  onClick={onBrowseClick}
                  className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                >
                  Start Browsing <FaChevronRight className="ml-1" />
                </button>
              </div>
              
              {/* Step 2 */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 relative">
                <span className="absolute -top-3 -left-3 w-8 h-8 bg-gray-600 rounded-full text-white flex items-center justify-center font-bold">2</span>
                <h3 className="text-lg font-medium mb-2 mt-2">Apply for Apartments</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Submit applications for apartments you're interested in. You can apply for multiple units.
                </p>
                <div className="text-sm text-gray-500">
                  {loading ? "Loading applications..." : `${pendingCount} pending applications`}
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 relative">
                <span className="absolute -top-3 -left-3 w-8 h-8 bg-gray-600 rounded-full text-white flex items-center justify-center font-bold">3</span>
                <h3 className="text-lg font-medium mb-2 mt-2">Get Approved & Move In</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Once approved, you'll be assigned to your new apartment and can access the full tenant dashboard.
                </p>
                <div className="text-sm text-gray-500">Waiting for approval</div>
              </div>
            </div>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg shadow-md p-6 flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center mr-4">
                <FaSearchLocation className="text-xl text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Find Your New Home</h3>
                <p className="text-sm text-blue-200 mb-3">Browse our available apartment listings</p>
                <button 
                  onClick={onBrowseClick}
                  className="px-4 py-1.5 bg-blue-600 text-sm text-white rounded-md hover:bg-blue-700"
                >
                  Browse Now
                </button>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-900 to-green-800 rounded-lg shadow-md p-6 flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-700 flex items-center justify-center mr-4">
                <FaClipboardCheck className="text-xl text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Manage Applications</h3>
                <p className="text-sm text-green-200 mb-3">
                  {loading 
                    ? "Loading applications..." 
                    : `You have ${pendingCount} pending application${pendingCount !== 1 ? 's' : ''}`}
                </p>
                <button 
                  onClick={onApplicationsClick}
                  className="px-4 py-1.5 bg-green-600 text-sm text-white rounded-md hover:bg-green-700"
                >
                  View Applications
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Child components (modals) */}
      {children}
    </div>
  );
};

export default NoApartmentView;