import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useApartmentStore } from "../store/apartmentStore";
import { useTenantStore } from "../store/tenantStore";

const TenantModal = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  
  // Get functions from apartment store
  const { 
    apartments, 
    getApartments, 
    assignTenant, 
    isLoading: apartmentsLoading,
    error: apartmentError,
    message: apartmentMessage,
    clearMessages
  } = useApartmentStore();

  // Get functions from tenant store
  const { 
    tenants, 
    fetchTenants, 
    loading: tenantsLoading, 
    error: tenantsError 
  } = useTenantStore();

  const [selectedApartment, setSelectedApartment] = useState("");
  const [selectedTenant, setSelectedTenant] = useState("");
  const [isTenantEnabled, setIsTenantEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [localApartments, setLocalApartments] = useState([]);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [dataRefreshed, setDataRefreshed] = useState(false);

  // Fetch apartments and tenants when modal opens
  useEffect(() => {
    if (!isOpen) {
      setDataRefreshed(false);
      return;
    }

    clearMessages();
    setStatusMessage("");
    
    // Fetch data only once when modal opens
    const fetchData = async () => {
      try {
        await Promise.all([
          getApartments(),
          fetchTenants()
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();

    return () => {
      // Clean up form state when modal closes
      setSelectedApartment("");
      setSelectedTenant("");
      setIsTenantEnabled(false);
    };
  }, [isOpen, getApartments, fetchTenants, clearMessages]);

  // Update local apartments list whenever the store apartments change
  useEffect(() => {
    // Filter apartments locally for the modal display
    setLocalApartments(apartments.filter(apt => apt.status === 'available'));
  }, [apartments]);

  // Filter tenants who already have apartments
  useEffect(() => {
    if (tenants && apartments) {
      // Get IDs of tenants who already have apartments
      const assignedTenantIds = apartments
        .filter(apt => apt.status === 'occupied' && apt.tenant_id)
        .map(apt => apt.tenant_id);
      
      // Filter out tenants who already have apartments
      const filteredTenants = tenants.filter(
        tenant => !assignedTenantIds.includes(tenant._id)
      );
      
      setAvailableTenants(filteredTenants);
    }
  }, [tenants, apartments]);

  // Display success or error message
  useEffect(() => {
    if (apartmentMessage) {
      setStatusMessage(apartmentMessage);
      
      // Auto close on success after delay, but only refetch data once
      if (apartmentMessage.includes('success') && !dataRefreshed) {
        setDataRefreshed(true);
        
        const timer = setTimeout(() => {
          onClose();
        }, 1500);
        
        return () => clearTimeout(timer);
      }
    } else if (apartmentError) {
      setStatusMessage(apartmentError);
    }
  }, [apartmentMessage, apartmentError, onClose, dataRefreshed]);

  const handleApartmentChange = (event) => {
    const aptId = event.target.value;
    setSelectedApartment(aptId);
    setSelectedTenant("");
    setIsTenantEnabled(!!aptId);
  };

  const handleTenantChange = (event) => {
    setSelectedTenant(event.target.value);
  };

  const handleAssignTenant = async () => {
    if (!selectedApartment || !selectedTenant) return;
    
    setSubmitting(true);
    setStatusMessage("");
    
    try {
      // Use the store function for assigning tenant
      await assignTenant(selectedApartment, selectedTenant);
      
      // Refresh data immediately after successful assignment
      await getApartments();
      setDataRefreshed(true);
    } catch (error) {
      console.error("Error assigning tenant:", error);
      // Error is handled by the store and displayed via the useEffect
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Close modal without triggering additional data refresh
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h2 className="text-xl text-white font-bold">Assign Tenant to a Room</h2>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-white transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4">
          {/* Select Apartment */}
          <div className="mb-4">
            <label className="block text-white font-medium mb-1">Select Apartment</label>
            <div className="relative">
              <select
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                value={selectedApartment}
                onChange={handleApartmentChange}
                disabled={apartmentsLoading || submitting}
              >
                <option value="">Select an Apartment</option>
                {apartmentsLoading ? (
                  <option disabled>Loading apartments...</option>
                ) : localApartments.length === 0 ? (
                  <option disabled>No available apartments</option>
                ) : (
                  localApartments.map((apt) => (
                    <option key={apt._id} value={apt._id}>
                      {apt.room} - ₱{apt.rent.toLocaleString()}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Select Tenant */}
          <div className="mb-4">
            <label className="block text-white font-medium mb-1">Select Tenant</label>
            <div className="relative">
              <select
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                value={selectedTenant}
                onChange={handleTenantChange}
                disabled={!isTenantEnabled || tenantsLoading || submitting}
              >
                <option value="">Select a Tenant</option>
                {tenantsLoading ? (
                  <option disabled>Loading tenants...</option>
                ) : availableTenants.length === 0 ? (
                  <option disabled>No available tenants</option>
                ) : (
                  availableTenants.map((tenant) => (
                    <option key={tenant._id} value={tenant._id}>
                      {tenant.name} ({tenant.email})
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Status message (error or success) */}
          {statusMessage && (
            <div className={`mb-4 p-3 rounded text-sm ${
              statusMessage.includes('success')
                ? 'bg-green-900 bg-opacity-30 border border-green-500 text-green-300'
                : 'bg-red-900 bg-opacity-30 border border-red-500 text-red-300'
            }`}>
              {statusMessage}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end mt-6 space-x-3">
            <button
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className={`bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded flex items-center justify-center min-w-[120px] ${
                (!selectedApartment || !selectedTenant || submitting) ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-600 hover:to-emerald-700'
              }`}
              disabled={!selectedApartment || !selectedTenant || submitting}
              onClick={handleAssignTenant}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assigning...
                </>
              ) : "Assign Tenant"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantModal;