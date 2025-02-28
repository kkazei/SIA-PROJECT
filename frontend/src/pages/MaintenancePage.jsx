import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = "http://localhost:5000/api/maintenance";

const MaintenancePage = () => {
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
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
    fetchMaintenanceTasks();
  }, []);

  const fetchMaintenanceTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE_URL, { withCredentials: true });
      setMaintenanceTasks(response.data);
    } catch (error) {
      console.error("Error fetching maintenance tasks", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await axios.put(`${API_BASE_URL}/${editId}`, formData, { withCredentials: true });
        setEditId(null);
      } else {
        await axios.post(API_BASE_URL, formData, { withCredentials: true });
      }
      setFormData({
        start_date: "",
        end_date: "",
        description: "",
        expenses: 0,
        status: "pending",
      });
      await fetchMaintenanceTasks();
    } catch (error) {
      console.error("Error saving maintenance task", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (id) => {
    const task = maintenanceTasks.find((task) => task._id === id);
    setFormData({
      ...task,
      start_date: task.start_date.split("T")[0],
      end_date: task.end_date?.split("T")[0] || "",
    });
    setEditId(id);
  };

  const handleArchive = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/archive/${id}`, {}, { withCredentials: true });
      fetchMaintenanceTasks();
    } catch (error) {
      console.error("Error archiving maintenance task", error);
    }
  };

  if (loading) {
    return <p className="text-center text-white">Loading maintenance data...</p>;
  }

  return (
    <div className="p-6 flex flex-col md:flex-row gap-10">
      {/* Form Section */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full md:w-1/3">
        <h2 className="text-white font-bold mb-4">{editId ? "Edit Maintenance Task" : "Add Maintenance Task"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-semibold">Description:</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-3 border rounded-md" required />
          </div>
          <div>
            <label className="block text-white font-semibold">Start Date:</label>
            <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full p-3 border rounded-md" required />
          </div>
          <div>
            <label className="block text-white font-semibold">End Date (optional):</label>
            <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full p-3 border rounded-md" />
          </div>
          <div>
            <label className="block text-white font-semibold">Expenses:</label>
            <input type="number" name="expenses" value={formData.expenses} onChange={handleChange} className="w-full p-3 border rounded-md" min="0" />
          </div>
          <div>
            <label className="block text-white font-semibold">Status:</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 border rounded-md">
              <option value="pending">Pending</option>
              <option value="ongoing">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button type="submit" className="bg-green-500 text-white py-3 rounded-md w-full hover:bg-green-600 transition" disabled={submitting}>
            {submitting ? "Processing..." : editId ? "Update Task" : "Add Task"}
          </button>
        </form>
      </div>

      {/* Maintenance List Section */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full md:w-2/3">
        <h2 className="text-xl text-white font-bold mb-4">Maintenance Tasks</h2>
        {maintenanceTasks.length === 0 ? (
          <p className="text-gray-500">No maintenance tasks found.</p>
        ) : (
          <ul className="space-y-4">
            {maintenanceTasks.map((task) => (
              <li key={task._id} className="p-4 border rounded-md shadow-sm text-white bg-gray-800">
                <p><strong>Description:</strong> {task.description}</p>
                <p><strong>Start Date:</strong> {task.start_date.split("T")[0]}</p>
                {task.end_date && <p><strong>End Date:</strong> {task.end_date.split("T")[0]}</p>}
                <p><strong>Expenses:</strong> ${task.expenses}</p>
                <p><strong>Status:</strong> 
                  <span className={`px-2 py-1 rounded ${task.status === "pending" ? "bg-yellow-500" : task.status === "ongoing" ? "bg-blue-500" : "bg-green-500"}`}>
                    {task.status}
                  </span>
                </p>
                <div className="mt-3">
                  <button onClick={() => handleEdit(task._id)} className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition">Edit</button>
                  <button onClick={() => handleArchive(task._id)} className="ml-2 bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-500 transition">Archive</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MaintenancePage;
