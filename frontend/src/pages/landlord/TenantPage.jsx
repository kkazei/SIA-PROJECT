import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useTenantStore } from "../../store/tenantStore";
import { useApartmentStore } from "../../store/apartmentStore";
import LandlordSideNav from "../../components/layout/LandlordSideNav";
import TenantModal from "../../components/TenantModal"; // Import the TenantModal
import { motion } from "framer-motion";

const TenantPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false); // For Payment QR
  const [showAssignModal, setShowAssignModal] = useState(false); // For Assign Tenant
  const [collapsed, setCollapsed] = useState(true); // Track sidebar state

  const { user } = useAuthStore();
  const {
    tenants,
    loading,
    error,
    fetchTenants,
    clearMessages,
  } = useTenantStore();

  const { getApartments, fetchUnassignedTenants } = useApartmentStore();

  // Fetch tenants when the component mounts
  useEffect(() => {
    fetchTenants();
    return () => {
      clearMessages(); // Clean up on unmount
    };
  }, [fetchTenants, clearMessages]);

  // Filter tenants based on search term
  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.apartment?.room?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar */}
      <LandlordSideNav
        onToggle={(isCollapsed) => setCollapsed(isCollapsed)} // Update collapsed state
        className="hidden lg:block"
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        className={`p-4 lg:p-6 bg-blue-50 min-h-screen w-full transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        {/* Title and Search Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4 lg:mb-0">
            Tenant Management
          </h2>
          <div className="flex flex-col sm:flex-row w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search tenant by name or room"
              className="border p-2 rounded-lg w-full sm:w-80 mb-2 sm:mb-0"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="sm:ml-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              onClick={() => setShowModal(true)}
            >
              Add Payment QR
            </button>
            <button
              className="sm:ml-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              onClick={() => {
                setShowAssignModal(true); // Open the Assign Tenant modal
                fetchUnassignedTenants(); // Fetch unassigned tenants
                getApartments(); // Fetch apartments
              }}
            >
              Assign Tenant
            </button>
          </div>
        </div>

        {/* Tenant Cards */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => (
                  <div
                    key={tenant._id}
                    className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow transition duration-300 cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold mb-3">
                        {tenant.name?.charAt(0).toUpperCase() || "T"}
                      </div>
                      <h3 className="font-medium text-lg text-center">
                        {tenant.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Room: {tenant.apartment?.room || "Not Assigned"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Rent: ₱{tenant.apartment?.rent?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  {tenants.length === 0
                    ? "You don't have any tenants yet."
                    : "No tenants match your search."}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Assign Tenant Modal */}
        <TenantModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
        />
      </motion.div>
    </div>
  );
};

export default TenantPage;