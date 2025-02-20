import React, { useState } from "react";

// Inquiries Modal Component
const InquiriesModal = ({
  isOpen,
  closeModal,
  handleFileChange,
  selectedFile,
  removeFile,
}) => {
  const renderFilePreview = () => {
    if (selectedFile) {
      if (selectedFile.type.startsWith("image/")) {
        const fileUrl = URL.createObjectURL(selectedFile);
        return (
          <div className="relative mt-4">
            <img
              src={fileUrl}
              alt="Preview"
              className="max-w-[500px] h-auto rounded-lg mx-auto shadow-lg"
            />
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 bg-red-500 text-white font-bold text-xl p-2 w-8 h-8 rounded-md hover:bg-red-700 transition-all duration-200 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        );
      } else {
        return (
          <div className="mt-4 text-gray-700 flex justify-between items-center">
            <p>File: {selectedFile.name}</p>
            <button
              onClick={removeFile}
              className="text-red-500 text-sm hover:underline"
            >
              Remove
            </button>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={closeModal}
    >
      <div
        className={`bg-white p-6 rounded-lg w-[600px] max-h-[80%] overflow-y-auto shadow-xl transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900">Inquiries</h2>

        <div className="flex justify-between items-center space-x-4 mt-4">
          <select className="w-full p-2 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Select Category</option>
            <option value="general">General Inquiry</option>
            <option value="maintenance">Maintenance</option>
            <option value="payment">Payment Issue</option>
          </select>
          <span className="text-lg font-semibold text-white bg-green-500 py-2 px-4 rounded-lg">
            Category
          </span>
        </div>

        <textarea
          className="w-full p-4 mt-4 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Describe your inquiry..."
          rows="5"
        />

        <label className="flex items-center space-x-2 cursor-pointer text-green-500 mt-4">
          <span>Upload Photo</span>
          <input
            type="file"
            accept=".png, .jpeg, .jpg"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {renderFilePreview()}

        <button className="w-full py-3 px-4 mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-200">
          Send Inquiry
        </button>

        <div className="flex justify-end">
          <button
            onClick={closeModal}
            className="text-sm text-red-500 mt-4 hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default InquiriesModal;