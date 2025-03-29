import React, { useState, useEffect } from "react";
import { useInquiryStore } from "../../store/inquiryStore.js";

const InquiriesModal = ({ isOpen, closeModal, userId }) => {
  console.log("Rendering InquiriesModal, isOpen:", isOpen);
  
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState("");
  
  // Access the store with error handling
  let loading, error, message, createInquiry, clearMessage;
  try {
    const inquiryStore = useInquiryStore();
    loading = inquiryStore.loading;
    error = inquiryStore.error;
    message = inquiryStore.message;
    createInquiry = inquiryStore.createInquiry;
    clearMessage = inquiryStore.clearMessage;
    console.log("Successfully connected to inquiry store");
  } catch (err) {
    console.error("Error using inquiry store:", err);
  }
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  
  // Remove selected file
  const removeFile = () => {
    setFile(null);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description || !category) {
      setLocalError("Please fill all required fields");
      return;
    }
    
    if (!userId) {
      setLocalError("User ID is required. Please ensure you're logged in.");
      return;
    }
    
    const formData = new FormData();
    formData.append("description", description);
    formData.append("category", category);
    formData.append("tenant_id", userId);
    
    if (file) {
      formData.append("image", file);
    }
    
    if (createInquiry) {
      try {
        await createInquiry(formData);
        console.log("Inquiry submitted successfully");
        
        // Clear form after submission
        setDescription("");
        setCategory("");
        setFile(null);
      } catch (err) {
        console.error("Error submitting inquiry:", err);
        setLocalError("Failed to submit inquiry. Please try again.");
      }
    } else {
      setLocalError("Submission is currently unavailable.");
      console.error("createInquiry function not available");
    }
  };

  // Simple rendering without store dependencies
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={closeModal}
    >
      <div 
        className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl" 
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900">Submit an Inquiry</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select Category</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Payment Issue">Payment Issue</option>
            </select>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
              rows="4"
              placeholder="Describe your inquiry..."
            ></textarea>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Attach Image (Optional)</label>
            <input 
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500"
            />
            {file && (
              <div className="mt-2 flex items-center">
                <span className="text-sm text-gray-500">{file.name}</span>
                <button 
                  type="button"
                  onClick={removeFile}
                  className="ml-2 text-sm text-red-500"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          
          {(error || localError) && (
            <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error || localError}
            </div>
          )}
          
          {message && (
            <div className="mt-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}
          
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Inquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InquiriesModal;