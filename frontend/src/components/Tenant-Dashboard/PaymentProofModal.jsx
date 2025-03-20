import React, { useState } from "react";

const PaymentProofModal = ({
  isOpen,
  closeModal,
  handleFileChange,
  selectedFile,
  referenceNumber,
  setReferenceNumber,
  paymentQR,
  tenantDetails
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would implement the upload functionality
    alert("Payment proof submitted successfully!");
    closeModal();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Submit Payment Proof</h3>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {paymentQR ? (
            <div className="mb-4 p-4 bg-gray-100 rounded-lg">
              <div className="text-center">
                <h4 className="font-bold text-lg mb-2">Payment QR Code</h4>
                <img 
                  src={paymentQR.imageUrl} 
                  alt="Payment QR Code" 
                  className="mx-auto h-48 w-48 object-contain mb-2"
                />
                {paymentQR.details && (
                  <div className="text-sm bg-white p-2 rounded">
                    <p>{paymentQR.details}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-4 p-4 bg-gray-100 rounded-lg text-center">
              <p>No payment QR code available.</p>
              <p className="text-sm text-gray-500">Please contact your landlord for payment instructions.</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Payment Amount
            </label>
            <div className="p-2 bg-gray-100 rounded">
              PHP {tenantDetails?.rent ? tenantDetails.rent.toLocaleString() : "0.00"}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Reference Number
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter reference number"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Upload Payment Screenshot
            </label>
            <div className="flex items-center">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="payment-file"
                required={!selectedFile}
              />
              <label
                htmlFor="payment-file"
                className="px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300"
              >
                {selectedFile ? "Change File" : "Select File"}
              </label>
              {selectedFile && (
                <span className="ml-2 text-sm text-gray-600 truncate max-w-[200px]">
                  {selectedFile.name}
                </span>
              )}
            </div>
            {selectedFile && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Payment proof preview"
                  className="h-32 object-contain"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200"
          >
            Submit Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentProofModal;
