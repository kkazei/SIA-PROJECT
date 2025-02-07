import React, { useState } from "react";

const MaintenancePage = () => {
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [formData, setFormData] = useState({
    apartment: "",
    startDate: "",
    endDate: "",
    description: "",
    expenses: 0,
    status: "Pending",
  });
  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.apartment || !formData.startDate || !formData.description) {
      alert("Please fill in all required fields.");
      return;
    }

    if (editIndex !== null) {
      const updatedTasks = [...maintenanceTasks];
      updatedTasks[editIndex] = formData;
      setMaintenanceTasks(updatedTasks);
      setEditIndex(null);
    } else {
      setMaintenanceTasks([...maintenanceTasks, formData]);
    }

    setFormData({
      apartment: "",
      startDate: "",
      endDate: "",
      description: "",
      expenses: 0,
      status: "Pending",
    });
  };

  const handleEdit = (index) => {
    setFormData(maintenanceTasks[index]);
    setEditIndex(index);
  };

  const handleArchive = (index) => {
    setArchivedTasks([...archivedTasks, maintenanceTasks[index]]);
    setMaintenanceTasks(maintenanceTasks.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col md:flex-row gap-10 w-full p-6">
      <div className="bg-gray-900 p-10 rounded-lg shadow-md w-full md:w-1/4">
        <h2 className="text-white font-bold mb-4">
          {editIndex !== null ? "Edit Maintenance Task" : "Add Maintenance/Expenses"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-semibold">Apartment:</label>
            <select
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
              required
            >
              <option value="">Select Apartment</option>
              <option value="Apartment 1">Apartment 1</option>
              <option value="Apartment 2">Apartment 2</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-semibold">Start Date:</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-white font-semibold">End Date (optional):</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-white font-semibold">Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-white font-semibold">Expenses:</label>
            <input
              type="number"
              name="expenses"
              value={formData.expenses}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
              min="0"
            />
          </div>

          <div>
            <label className="block text-white font-semibold">Status:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2
               transition-all duration-300 group hover:bg-black hover:bg-none rounded px-4 py-3 rounded-md w-full hover:bg-green-500 transition"
          >
            {editIndex !== null ? "Update Task" : "Add"}
          </button>
        </form>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full md:w-3/4">
        <h2 className="text-xl text-white font-bold mb-4">Maintenance Tasks</h2>
        {maintenanceTasks.length === 0 ? (
          <p className="text-gray-500">No maintenance tasks found.</p>
        ) : (
            <ul className="space-y-4">
            {maintenanceTasks.map((task, index) => (
              <li key={index} className="p-4 border rounded-md shadow-sm text-white">
                <p><strong>Apartment:</strong> {task.apartment}</p>
                <p><strong>Start Date:</strong> {task.startDate}</p>
                {task.endDate && <p><strong>End Date:</strong> {task.endDate}</p>}
                <p><strong>Description:</strong> {task.description}</p>
                <p><strong>Expenses:</strong> ${task.expenses}</p>
                <p><strong>Status:</strong> {task.status}</p>
                <button onClick={() => handleEdit(index)} className="mt-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white
               transition-all duration-300 group hover:bg-black hover:bg-none px-3 py-2 rounded-md transition">Edit</button>
                <button onClick={() => handleArchive(index)} className="mt-2 ml-2 bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-500 transition">Archive</button>
              </li>
            ))}
          </ul>          
        )}
      </div>
    </div>
  );
};

export default MaintenancePage;
