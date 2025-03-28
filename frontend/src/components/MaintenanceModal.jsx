import React, { useState, useEffect } from "react";
import { useMaintenanceStore } from "../store/maintenanceStore";

const MaintenanceModal = ({ isOpen, onClose }) => {
    const [description, setDescription] = useState("");
    const [apartment, setApartment] = useState("");
    const [status, setStatus] = useState("pending");
    const [startDate, setStartDate] = useState("");
    const [localError, setLocalError] = useState("");
    
    // Get store functions and state
    const { 
        createMaintenance, 
        isLoading, 
        error, 
        success, 
        clearError 
    } = useMaintenanceStore();
    
    // Use apartment store to get available apartments
    const [apartments, setApartments] = useState([]);
    
    useEffect(() => {
        // Fetch apartments on component mount
        const fetchApartments = async () => {
            try {
                // Import dynamically to avoid circular dependencies
                const { useApartmentStore } = await import("../store/apartmentStore");
                
                // Set role first
                useApartmentStore.getState().setUserRole('landlord');
                
                // Then fetch apartments
                await useApartmentStore.getState().fetchApartments();
                const allApartments = useApartmentStore.getState().apartments;
                
                setApartments(allApartments);
                
                // Set first apartment as default if available
                if (allApartments.length > 0 && !apartment) {
                    setApartment(allApartments[0]._id);
                }
            } catch (err) {
                console.error("Error fetching apartments:", err);
                setLocalError("Failed to load apartments");
            }
        };
        
        if (isOpen) {
            fetchApartments();
            // Set default start date to today
            setStartDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Form validation
        if (!description) {
            setLocalError("Description is required.");
            setTimeout(() => setLocalError(""), 5000);
            return;
        }
        
        if (!apartment) {
            setLocalError("Please select an apartment.");
            setTimeout(() => setLocalError(""), 5000);
            return;
        }
    
        const maintenanceData = {
            description,
            apartment_id: apartment,
            status,
            start_date: startDate || new Date().toISOString(),
        };
    
        try {
            // Use the store action
            await createMaintenance(maintenanceData);
            
            // Clear form
            setDescription("");
            setStatus("pending");
            setStartDate("");
            
            // Close modal
            onClose();
        } catch (err) {
            // Error handling is managed by the store
            console.error("Error in component:", err);
            setLocalError("Failed to create maintenance request. Please try again.");
        }
    };
    
    // Hide modal if not open
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-900 w-full max-w-md p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <h2 className="text-xl text-white font-semibold">Create Maintenance Request</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="mb-4">
                        <label className="block text-white text-sm font-medium mb-1">Select Apartment</label>
                        <select 
                            value={apartment}
                            onChange={(e) => setApartment(e.target.value)}
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                        >
                            <option value="">Select an apartment</option>
                            {apartments.map(apt => (
                                <option key={apt._id} value={apt._id}>
                                    {apt.room} {apt.tenant_id ? '(Occupied)' : '(Vacant)'}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-white text-sm font-medium mb-1">Description</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white min-h-[100px]" 
                            placeholder="Describe the maintenance issue" 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-white text-sm font-medium mb-1">Status</label>
                        <select 
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                        >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-white text-sm font-medium mb-1">Start Date</label>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white" 
                        />
                    </div>

                    {(localError || error) && (
                        <div className="p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-300 text-sm mb-4">
                            {localError || error}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 mt-6">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors flex items-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : "Create Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MaintenanceModal;