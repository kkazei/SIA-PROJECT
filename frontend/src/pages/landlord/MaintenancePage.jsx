import React, { useState, useEffect } from "react";
import { useMaintenanceStore } from "../../store/maintenanceStore";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-hot-toast";

const MaintenancePage = () => {
  const { user } = useAuthStore();
  const { 
    maintenanceRequests, 
    statistics,
    isLoading, 
    error,
    success,
    fetchMaintenance,
    fetchMaintenanceStats,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
    clearError,
    clearSuccess
  } = useMaintenanceStore();

  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    description: "",
    expenses: 0,
    status: "pending",
  });
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMaintenance();
    fetchMaintenanceStats();
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await updateMaintenance(editId, formData);
        setEditId(null);
      } else {
        await createMaintenance(formData);
      }
      setFormData({
        start_date: "",
        end_date: "",
        description: "",
        expenses: 0,
        status: "pending",
      });
      // Refresh statistics after adding/updating
      fetchMaintenanceStats();
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (id) => {
    const task = maintenanceRequests.find((task) => task._id === id);
    setFormData({
      ...task,
      start_date: task.start_date ? task.start_date.split("T")[0] : "",
      end_date: task.end_date ? task.end_date.split("T")[0] : "",
      expenses: task.expenses || 0
    });
    setEditId(id);
  };

  const handleArchive = async (id) => {
    try {
      await deleteMaintenance(id);
      // Refresh statistics after deleting
      fetchMaintenanceStats();
    } catch (error) {
      console.error("Error archiving maintenance task", error);
    }
  };

  if (isLoading && maintenanceRequests.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-white">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2">Loading maintenance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Statistics Section */}
      {statistics && (
        <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full">
          <h2 className="text-xl text-white font-bold mb-4">Maintenance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pending Tasks */}
            <div className="bg-yellow-900 bg-opacity-30 p-4 rounded-lg border border-yellow-800">
              <h3 className="text-yellow-400 font-semibold">Pending Tasks</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-2xl font-bold text-white">{statistics.pending.count}</span>
                <span className="text-yellow-400 font-medium">${parseFloat(statistics.pending.expenses).toFixed(2)}</span>
              </div>
            </div>
            
            {/* Ongoing Tasks */}
            <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg border border-blue-800">
              <h3 className="text-blue-400 font-semibold">In Progress</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-2xl font-bold text-white">{statistics.ongoing.count}</span>
                <span className="text-blue-400 font-medium">${parseFloat(statistics.ongoing.expenses).toFixed(2)}</span>
              </div>
            </div>
            
            {/* Completed Tasks */}
            <div className="bg-green-900 bg-opacity-30 p-4 rounded-lg border border-green-800">
              <h3 className="text-green-400 font-semibold">Completed</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-2xl font-bold text-white">{statistics.completed.count}</span>
                <span className="text-green-400 font-medium">${parseFloat(statistics.completed.expenses).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Form Section */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full md:w-1/3">
          <h2 className="text-white font-bold mb-4">{editId ? "Edit Maintenance Task" : "Add Maintenance Task"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white font-semibold">Description:</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="w-full p-3 border rounded-md bg-gray-800 text-white border-gray-700" 
                required 
              />
            </div>
            <div>
              <label className="block text-white font-semibold">Start Date:</label>
              <input 
                type="date" 
                name="start_date" 
                value={formData.start_date} 
                onChange={handleChange} 
                className="w-full p-3 border rounded-md bg-gray-800 text-white border-gray-700" 
                required 
              />
            </div>
            <div>
              <label className="block text-white font-semibold">End Date (optional):</label>
              <input 
                type="date" 
                name="end_date" 
                value={formData.end_date} 
                onChange={handleChange} 
                className="w-full p-3 border rounded-md bg-gray-800 text-white border-gray-700" 
              />
            </div>
            <div>
              <label className="block text-white font-semibold">Expenses:</label>
              <input 
                type="number" 
                name="expenses" 
                value={formData.expenses} 
                onChange={handleChange} 
                className="w-full p-3 border rounded-md bg-gray-800 text-white border-gray-700" 
                min="0" 
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-white font-semibold">Status:</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="w-full p-3 border rounded-md bg-gray-800 text-white border-gray-700"
              >
                <option value="pending">Pending</option>
                <option value="ongoing">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button 
              type="submit" 
              className="bg-green-500 text-white py-3 rounded-md w-full hover:bg-green-600 transition flex items-center justify-center" 
              disabled={submitting || isLoading}
            >
              {(submitting || isLoading) ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : editId ? "Update Task" : "Add Task"}
            </button>
            
            {editId && (
              <button 
                type="button" 
                className="bg-gray-600 text-white py-3 rounded-md w-full hover:bg-gray-700 transition mt-2"
                onClick={() => {
                  setFormData({
                    start_date: "",
                    end_date: "",
                    description: "",
                    expenses: 0,
                    status: "pending",
                  });
                  setEditId(null);
                }}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        {/* Maintenance List Section */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full md:w-2/3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl text-white font-bold">Maintenance Tasks</h2>
            <button 
              onClick={() => {
                fetchMaintenance();
                fetchMaintenanceStats();
              }} 
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
          
          {maintenanceRequests.length === 0 ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-500 mt-2">No maintenance tasks found.</p>
              <p className="text-gray-600 text-sm mt-1">Create a new task to get started.</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-300px)]">
              {maintenanceRequests.map((task) => (
                <div key={task._id} className="p-4 border rounded-md shadow-sm text-white bg-gray-800 border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg mb-2">{task.description}</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-gray-400 text-sm">Start Date</p>
                          <p>{new Date(task.start_date).toLocaleDateString()}</p>
                        </div>
                        {task.end_date && (
                          <div>
                            <p className="text-gray-400 text-sm">End Date</p>
                            <p>{new Date(task.end_date).toLocaleDateString()}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-400 text-sm">Expenses</p>
                          <p>${parseFloat(task.expenses).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Status</p>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            task.status === "pending" ? "bg-yellow-500 text-yellow-900" : 
                            task.status === "ongoing" ? "bg-blue-500 text-blue-900" : 
                            "bg-green-500 text-green-900"
                          }`}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex mt-4 space-x-2">
                    <button 
                      onClick={() => handleEdit(task._id)} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button 
                      onClick={() => handleArchive(task._id)} 
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-sm transition flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Archive
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
