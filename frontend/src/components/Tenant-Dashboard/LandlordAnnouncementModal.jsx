import React, { useState } from "react";

// Landlord Announcement Modal Component
const LandlordAnnouncementModal = ({ isOpen, closeModal, announcement }) => {
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={closeModal}
    >
      <div
        className={`bg-white p-6 rounded-lg w-[700px] max-h-[80%] overflow-y-auto shadow-xl transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 text-left">
          Landlord Announcement
        </h2>
        {announcement?.image ? (
          <div className="mt-4 text-center">
            <img
              src={announcement.image}
              alt="Announcement"
              className="max-w-full rounded-lg mx-auto shadow-lg"
            />
          </div>
        ) : (
          <p className="text-center mt-4 text-gray-500">
            No announcement available
          </p>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={closeModal}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default LandlordAnnouncementModal;