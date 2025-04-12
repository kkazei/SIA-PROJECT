import React, { useEffect } from 'react';
import { useMaintenanceStore } from '../../store/maintenanceStore';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Swal from "sweetalert2"; // Import SweetAlert2

const ArchivePage = () => {
  const { 
    archivedRequests,
    isLoading,
    error,
    success,
    fetchArchivedMaintenance,
    restoreArchive,
    permanentlyDeleteMaintenance,
    clearError,
    clearSuccess
  } = useMaintenanceStore();
  
  useEffect(() => {
    console.log("ArchivePage mounted, fetching archived maintenance");
    fetchArchivedMaintenance();
  }, []);
  
  // Debug useEffect to see what's in archivedRequests
  useEffect(() => {
    console.log("archivedRequests:", archivedRequests);
  }, [archivedRequests]);

  // Handle success and error messages
  useEffect(() => {
    if (success) {
      toast.success(success);
      clearSuccess();
    }
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [success, error, clearSuccess, clearError]);

  const handleRestore = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This will restore the maintenance record to the active list.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, restore it!",
      });

      if (result.isConfirmed) {
        console.log("Restoring maintenance with ID:", id);
        await restoreArchive(id);
        Swal.fire("Restored!", "The maintenance record has been restored.", "success");
      }
    } catch (error) {
      console.error("Error restoring maintenance record:", error);
      Swal.fire("Error!", "Failed to restore the record.", "error");
    }
  };

  const handlePermanentDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        console.log("Permanently deleting maintenance with ID:", id);
        await permanentlyDeleteMaintenance(id);
        Swal.fire("Deleted!", "The maintenance record has been permanently deleted.", "success");
      }
    } catch (error) {
      console.error("Error deleting maintenance record:", error);
      Swal.fire("Error!", "Failed to delete the record.", "error");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-600';
      case 'in-progress':
        return 'bg-blue-600';
      case 'completed':
        return 'bg-green-600';
      case 'cancelled':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (isLoading && archivedRequests.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-white">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2">Loading archived maintenance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Archived Maintenance Records</h1>
      
      {!archivedRequests || archivedRequests.length === 0 ? (
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <p className="text-gray-300">No archived maintenance records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {archivedRequests.map((task) => (
            <div key={task._id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-white truncate max-w-[200px]">
                    {task.description || "No description"}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                    {task.status ? (task.status.charAt(0).toUpperCase() + task.status.slice(1)) : "Unknown"}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Created: {formatDate(task.createdAt)}</p>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Start Date:</span>
                  <span className="text-gray-300">{formatDate(task.start_date)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">End Date:</span>
                  <span className="text-gray-300">{formatDate(task.end_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Expenses:</span>
                  <span className="text-gray-300">${task.expenses || 0}</span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleRestore(task._id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
                >
                  Restore
                </button>
                <button
                  onClick={() => handlePermanentDelete(task._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-400">
        <p>
          Note: Restored maintenance records will be moved back to your active maintenance list. Permanently deleted records cannot be recovered.
        </p>
      </div>
    </div>
  );
};

export default ArchivePage;