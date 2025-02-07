import React, { useState } from "react";

const TenantModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [selectedApartment, setSelectedApartment] = useState("");
  const [selectedTenant, setSelectedTenant] = useState("");
  const [isTenantEnabled, setIsTenantEnabled] = useState(false);

  // Sample data (replace with API data)
  const apartments = [
    { id: "apt1", name: "Apartment 101" },
    { id: "apt2", name: "Apartment 202" },
    { id: "apt3", name: "Apartment 303" },
  ];

  const tenants = {
    apt1: ["John Doe", "Jane Smith"],
    apt2: ["Alice Johnson", "Bob Brown"],
    apt3: ["Charlie White", "Diana Green"],
  };

  const handleApartmentChange = (event) => {
    const apt = event.target.value;
    setSelectedApartment(apt);
    setSelectedTenant(""); 
    setIsTenantEnabled(!!apt);
  };

  const handleTenantChange = (event) => {
    setSelectedTenant(event.target.value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-[500px]">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl text-white font-bold">Assign Tenant to a Room</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✖</button>
        </div>

        <div className="mt-4">
          {/* Select Apartment */}
          <label className="block text-white font-medium">Select Apartment</label>
          <select
            className="w-full  p-2 border rounded mt-1"
            value={selectedApartment}
            onChange={handleApartmentChange}
          >
            <option value="">Select an Apartment</option>
            {apartments.map((apt) => (
              <option key={apt.id} value={apt.id}>
                {apt.name}
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
            {selectedApartment &&
              tenants[selectedApartment]?.map((tenant, index) => (
                <option key={index} value={tenant}>
                  {tenant}
                </option>
              ))}
          </select>

          {/* Buttons */}
          <div className="flex justify-end mt-4">
            <button
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2
               transition-all duration-300 group hover:bg-black hover:bg-none px-4 rounded mr-2"
              disabled={!selectedApartment || !selectedTenant}
            >
              Assign Tenant
            </button>
            <button className="bg-red-700 hover:bg-black text-white px-4 py-2 rounded">
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantModal;
