import React, { useState, useRef, useEffect } from "react";
import { useQRImageStore } from "../../store/qrImageStore";
import axios from "axios"; // Import axios for API calls

const PaymentProofModal = ({
  isOpen,
  closeModal,
  selectedFile,
  setSelectedFile,
  referenceNumber,
  setReferenceNumber,
  paymentQR,
  tenantDetails
}) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state
  const [submitError, setSubmitError] = useState(null); // Add error state
  
  const { qrImages, loading, getTenantQRImages } = useQRImageStore();

  useEffect(() => {
    if (isOpen) {
      getTenantQRImages();
      setSubmitError(null);
    }
  }, [isOpen, getTenantQRImages]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should not exceed 10MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload an image file (PNG, JPG, or GIF)');
        return;
      }

      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const renderQRSection = () => {
    if (loading) {
      return (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading payment QR codes...</p>
        </div>
      );
    }

    if (qrImages && qrImages.length > 0) {
      const latestQR = qrImages[0];
      let imagePath = latestQR.image_path;
      const BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '';
      if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith(BASE_URL)) {
        imagePath = `${BASE_URL}${imagePath}`;
      }
      
      return (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="text-center">
            <h4 className="font-semibold text-lg mb-4">Payment QR Code</h4>
            <div className="bg-white p-4 rounded-lg shadow-sm inline-block">
              {imagePath ? (
                <img 
                  src={imagePath} 
                  alt="Payment QR Code" 
                  className="h-48 w-48 object-contain"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' fill='%23999' dominant-baseline='middle'%3EQR Image%3C/text%3E%3C/svg%3E";
                    e.target.onerror = null;
                  }}
                />
              ) : (
                <div className="h-48 w-48 flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">No QR image available</span>
                </div>
              )}
            </div>
            <div className="mt-4 text-sm bg-white p-4 rounded-lg shadow-sm">
              <p className="text-gray-700">
                {latestQR.details || "Scan this QR code to make payment"}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-gray-900 font-medium">No payment QR code available</p>
        <p className="text-sm text-gray-500 mt-1">Please contact your landlord for payment instructions</p>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile || !referenceNumber.trim()) {
      setSubmitError("Please provide both a reference number and payment screenshot");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("reference_number", referenceNumber);
      formData.append("tenant_id", tenantDetails?.userId || "");
      formData.append("apartment_id", tenantDetails?.apartmentId || "");
      formData.append("amount", tenantDetails?.rent || 0);
      formData.append("tenant_fullname", tenantDetails?.fullName || "");
      
      const uploadResponse = await axios.post("/api/uploads/payment-proof", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (uploadResponse.data && uploadResponse.data.filePath) {
        const invoiceResponse = await axios.post("/api/invoices", {
          tenant_id: tenantDetails?.userId,
          apartment_id: tenantDetails?.apartmentId,
          amount: tenantDetails?.rent,
          reference_number: referenceNumber,
          tenant_fullname: tenantDetails?.fullName,
          image_path: uploadResponse.data.filePath
        });
        
        alert("Payment proof submitted successfully!");
        handleRemoveFile();
        setReferenceNumber("");
        closeModal();
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
      setSubmitError(
        error.response?.data?.message || 
        "Failed to submit payment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
        <div className="flex justify-between items-center bg-gray-900 text-white px-6 py-4">
          <h3 className="text-xl font-medium">Submit Payment Proof</h3>
          <button 
            onClick={closeModal} 
            className="text-white hover:text-gray-300"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {submitError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                </svg>
                {submitError}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderQRSection()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-lg font-semibold">
                  ₱{tenantDetails?.rent ? tenantDetails.rent.toLocaleString() : "0.00"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter reference number"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Payment Screenshot
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
                <div className="space-y-1 text-center w-full">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    id="payment-file"
                    required={!selectedFile}
                  />
                  
                  {!selectedFile ? (
                    <div className="flex flex-col items-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <label
                        htmlFor="payment-file"
                        className="mt-2 cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Upload a file
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  ) : (
                    <div className="relative w-full h-48 group">
                      <img
                        src={preview}
                        alt="Payment proof preview"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-gray-50 px-6 py-3 flex justify-end gap-2">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 rounded text-white flex items-center ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSubmitting ? 'Submitting...' : 'Submit Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentProofModal;
