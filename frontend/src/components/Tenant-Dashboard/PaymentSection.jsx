import React, { useState, useEffect } from 'react';
import { useQRImageStore } from '../../store/qrImageStore';

const PaymentSection = ({ openPaymentProofModal, tenantDetails }) => {
  const { qrImages, loading, getTenantQRImages } = useQRImageStore();
  
  // Fetch QR images when component mounts
  useEffect(() => {
    getTenantQRImages();
  }, [getTenantQRImages]);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
      
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1">
          <div className="mb-4">
            <p className="text-gray-600 mb-1">Monthly Rent</p>
            <p className="text-2xl font-bold">₱{tenantDetails?.rent ? tenantDetails.rent.toLocaleString() : '0'}</p>
          </div>
          
          <div>
            <p className="text-gray-600 mb-1">Payment Status</p>
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                tenantDetails?.is_paid ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span className={`font-medium ${
                tenantDetails?.is_paid ? 'text-green-600' : 'text-red-600'
              }`}>
                {tenantDetails?.is_paid ? 'Paid' : 'Unpaid'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="mb-4">
            <p className="text-gray-600 mb-1">Payment Method</p>
            <div className="flex items-center">
              {loading ? (
                <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
              ) : qrImages && qrImages.length > 0 ? (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">QR Payment Available</span>
                  <span className="text-green-500">✓</span>
                </div>
              ) : (
                <span className="text-gray-700">Contact your landlord for payment options</span>
              )}
            </div>
          </div>
          
          <button
            onClick={openPaymentProofModal}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
            disabled={tenantDetails?.is_paid}
          >
            {tenantDetails?.is_paid ? 'Already Paid' : 'Submit Payment Proof'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
