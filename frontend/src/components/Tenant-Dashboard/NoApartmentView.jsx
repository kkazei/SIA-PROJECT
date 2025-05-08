import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useApplicationStore } from "../../store/applicationStore";
import { 
  FaHome, 
  FaClipboardList,
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1024px)");

  useEffect(() => {
    fetchTenantApplications();
  }, [fetchTenantApplications]);

  const pendingCount = tenantApplications.filter(app => app.status === "pending").length;

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 via-indigo-50 to-white min-h-screen">
      <NoApartmentSideNavBar
        userName={userName}
        onBrowseClick={onBrowseClick}
        onApplicationsClick={onApplicationsClick}
        onLogout={onLogout}
        pendingCount={pendingCount}
        onSidebarToggle={handleSidebarToggle}
      />

      {/* Main content - updated with enhanced styling */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`p-4 lg:p-8 w-full transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        {/* Welcome Section - Enhanced with card styling and mobile-friendly spacing */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='bg-white shadow-xl rounded-xl p-6 border border-blue-100 backdrop-blur-sm bg-opacity-80 mt-24 lg:mt-0'
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className='text-2xl lg:text-3xl font-bold bg-gradient-to-r from-black to-indigo-800 bg-clip-text text-transparent'>
                Welcome, {userName || 'Tenant'}
              </h2>
              <p className='text-gray-600 mt-1'>Find your perfect apartment</p>
            </div>
            <div className="hidden md:block">
            
            </div>
          </div>
        </motion.div>

        {/* Apartment Journey - Enhanced with glass morphism and better styling */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='bg-gradient-to-br from-gray-900 to-indigo-900 shadow-xl rounded-xl mt-6 p-6 border border-indigo-900/20 backdrop-blur-sm'
        >
          <h3 className="text-xl font-bold text-white flex items-center">
            <FaRegLightbulb className="mr-2 text-blue-400" /> Your Apartment Journey
          </h3>
          
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/70 p-5 rounded-xl border border-gray-700 shadow-lg transform transition-all duration-300 hover:shadow-blue-500/10 hover:border-blue-500/30"
            >
              <div className="rounded-full w-10 h-10 bg-blue-600/70 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2 text-center">Browse Apartments</h4>
              <p className="text-gray-300 text-sm mb-4 text-center">
                Explore available listings and find apartments that match your preferences.
              </p>
              <button 
                onClick={onBrowseClick}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-blue-500/30"
              >
                Start Browsing <FaChevronRight className="ml-2" />
              </button>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/70 p-5 rounded-xl border border-gray-700 shadow-lg transform transition-all duration-300 hover:shadow-blue-500/10 hover:border-blue-500/30"
            >
              <div className="rounded-full w-10 h-10 bg-indigo-600/70 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/20">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2 text-center">Apply for Apartments</h4>
              <p className="text-gray-300 text-sm mb-4 text-center">
                Submit applications for apartments you're interested in renting.
              </p>
              <div className="bg-indigo-900/40 text-indigo-200 py-2 px-4 rounded-lg text-center text-sm border border-indigo-700/40">
                {loading ? "Loading applications..." : `${pendingCount} pending application${pendingCount !== 1 ? 's' : ''}`}
              </div>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/70 p-5 rounded-xl border border-gray-700 shadow-lg transform transition-all duration-300 hover:shadow-blue-500/10 hover:border-blue-500/30"
            >
              <div className="rounded-full w-10 h-10 bg-green-600/70 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/20">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2 text-center">Get Approved & Move In</h4>
              <p className="text-gray-300 text-sm mb-4 text-center">
                Once approved, you'll access the full tenant dashboard.
              </p>
              <div className="bg-green-900/40 text-green-200 py-2 px-4 rounded-lg text-center text-sm border border-green-700/40">
                Awaiting approval
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Actions Box - Enhanced with glass morphism and better icons */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className='bg-gradient-to-br from-blue-600 to-blue-900 text-white p-6 rounded-xl shadow-xl border border-blue-500/20 backdrop-blur-sm'
          >
            <div className="rounded-full w-12 h-12 bg-blue-500/30 flex items-center justify-center mb-4">
              <FaSearchLocation className="text-blue-200 text-xl" />
            </div>
            <h3 className="text-xl font-bold">Find Your New Home</h3>
            <p className="text-blue-200 my-3">Browse our selection of high-quality apartments available for rent</p>
            
            <button 
              onClick={onBrowseClick}
              className="px-5 py-2 bg-gradient-to-r from-blue-500/80 to-indigo-500/80 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 text-white rounded-lg flex items-center shadow-md hover:shadow-blue-400/50"
            >
              Browse Apartments <FaChevronRight className="ml-2" />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className='bg-gradient-to-br from-green-600 to-green-900 text-white p-6 rounded-xl shadow-xl border border-green-500/20 backdrop-blur-sm'
          >
            <div className="rounded-full w-12 h-12 bg-green-500/30 flex items-center justify-center mb-4">
              <FaClipboardCheck className="text-green-200 text-xl" />
            </div>
            <h3 className="text-xl font-bold">Manage Applications</h3>
            <p className="text-green-200 my-3">
              {loading 
                ? "Loading your application status..." 
                : `Check the status of your ${pendingCount} pending application${pendingCount !== 1 ? 's' : ''}`}
            </p>
            
            <button 
              onClick={onApplicationsClick}
              className="px-5 py-2 bg-gradient-to-r from-green-500/80 to-emerald-500/80 hover:from-green-500 hover:to-emerald-500 transition-all duration-300 text-white rounded-lg flex items-center shadow-md hover:shadow-green-400/50"
            >
              View Applications {pendingCount > 0 && <span className="ml-2 bg-white text-green-600 rounded-full w-5 h-5 flex items-center justify-center text-xs">{pendingCount}</span>}
            </button>
          </motion.div>
        </div>

        {/* Additional information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className='bg-white shadow-xl rounded-xl p-6 border border-blue-100 backdrop-blur-sm bg-opacity-80 mt-6'
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Ready to find your perfect apartment?</h3>
          <p className="text-gray-600 mb-4">
            Browse our selection of apartments, apply for your favorites, and get approved to move in. 
            Our tenant portal offers a seamless experience from application to residency.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onBrowseClick}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg flex items-center justify-center shadow-md hover:shadow-blue-500/30 transition-all duration-300"
            >
              <FaSearchLocation className="mr-2" /> Browse Available Units
            </button>
            <button 
              onClick={onApplicationsClick}
              className="px-5 py-2.5 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-900 text-white rounded-lg flex items-center justify-center shadow-md hover:shadow-gray-500/30 transition-all duration-300"
            >
              <FaClipboardList className="mr-2" /> Check Application Status
            </button>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Child components (modals) */}
      {children}
    </div>
  );
};

export default NoApartmentView;