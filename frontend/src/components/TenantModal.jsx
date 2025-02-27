import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authStore"; // Ensure landlord ID is accessible

const TenantModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { user } = useAuthStore(); // Get logged-in landlord info
  const landlordId = user?._id; // Extract landlord ID

  const [apartments, setApartments] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState("");
  const [selectedTenant, setSelectedTenant] = useState("");
  const [isTenantEnabled, setIsTenantEnabled] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch apartments linked to the landlord
  useEffect(() => {
    if (!landlordId) return;

    const fetchApartments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/apartments-with-tenants?userId=${landlordId}`,
          { withCredentials: true }
        );
        setApartments(response.data);
      } catch (error) {
        console.error("Error fetching apartments:", error);
      }
    };

    fetchApartments();
  }, [landlordId]);

  // Fetch tenants linked to the landlord
  useEffect(() => {
    if (!landlordId) return;

    const fetchTenants = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/tenants?userId=${landlordId}`);
        if (!response.ok) throw new Error("Failed to fetch tenants");
        const data = await response.json();
        setTenants(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [landlordId]);

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
    try {
      const response = await axios.post(
        "http://localhost:5000/api/assign-tenant",
        {
          apartmentId: selectedApartment,
          tenantId: selectedTenant,
        },
        { withCredentials: true }
      );
      if (response.status === 200) {
        alert("Tenant assigned successfully");
        onClose();
      }
    } catch (error) {
      console.error("Error assigning tenant:", error);
      alert("Failed to assign tenant");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-[500px]">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl text-white font-bold">Assign Tenant to a Room</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✖
          </button>
        </div>

        <div className="mt-4">
          {/* Select Apartment */}
          <label className="block text-white font-medium">Select Apartment</label>
          <select
            className="w-full p-2 border rounded mt-1"
            value={selectedApartment}
            onChange={handleApartmentChange}
          >
            <option value="">Select an Apartment</option>
            {apartments.map((apt) => (
              <option key={apt._id} value={apt._id}>
                {apt.room}
              </option>
            ))}
          </select>

          {/* Select Tenant */}
          <label className="block text-white font-medium mt-3">Select Tenant</label>
          <select
            className="w-full p-2 border rounded mt-1 bg-gray-200"
            value={selectedTenant}
            onChange={handleTenantChange}
            disabled={!isTenantEnabled}
          >
            <option value="">Select a Tenant</option>
            {loading ? (
              <option>Loading tenants...</option>
            ) : error ? (
              <option>{error}</option>
            ) : (
              tenants.map((tenant) => (
                <option key={tenant._id} value={tenant._id}>
                  {tenant.tenant_fullname}
                </option>
              ))
            )}
          </select>

          {/* Buttons */}
          <div className="flex justify-end mt-4">
            <button
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded mr-2"
              disabled={!selectedApartment || !selectedTenant}
              onClick={handleAssignTenant}
            >
              Assign Tenant
            </button>
            <button className="bg-red-700 hover:bg-black text-white px-4 py-2 rounded" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantModal;
