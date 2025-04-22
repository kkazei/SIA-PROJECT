import React, { useState, useEffect } from "react";
import { usePaymentStore } from "../../store/paymentStore";
import { format } from "date-fns";

const PaymentHistoryModal = ({ isOpen, closeModal, tenantDetails }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { payments, getTenantPayments } = usePaymentStore();

  // Fetch payments when modal opens and when tenant changes
  useEffect(() => {
    const fetchPayments = async () => {
      if (isOpen && tenantDetails?.userId) {
        setLoading(true);
        setError(null);
        try {
          await getTenantPayments(tenantDetails.userId);
        } catch (err) {
          console.error("Error fetching payments:", err);
          setError("Failed to load payment history");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPayments();
  }, [isOpen, tenantDetails?.userId, getTenantPayments]);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (err) {
      return dateString || "Unknown date";
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status?.toLowerCase()) {
      case "approved":
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Approved</span>;
      case "pending":
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      case "rejected":
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status || "Unknown"}</span>;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center bg-gray-900 text-white px-6 py-4">
            <h3 className="text-xl font-medium">Payment History</h3>
            <button onClick={closeModal} className="text-white hover:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Loading state */}
          <div className="px-6 py-16 flex justify-center items-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your payment history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-900 text-white px-6 py-4">
          <h3 className="text-xl font-medium">Payment History</h3>
          <button onClick={closeModal} className="text-white hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              <p>{error}</p>
            </div>
          )}

          {!error && payments.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="mt-4 text-gray-600">You don't have any payment records yet</p>
            </div>
          )}

          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment._id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Reference #{payment.reference_number}</h4>
                    <p className="text-sm text-gray-600">{formatDate(payment.createdAt)}</p>
                  </div>
                  <div>{getStatusBadge(payment.status)}</div>
                </div>
                
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="text-lg font-semibold">₱{payment.amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Proof</p>
                    <div className="mt-1">
                      {payment.image_path && (
                        <a 
                          href={`${import.meta.env.MODE === 'development' ? 'http://localhost:5000' : ''}${payment.image_path}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          View Receipt
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {payment.admin_remarks && (
                    <div className="col-span-1 md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Admin Remarks</p>
                      <p className="text-sm">{payment.admin_remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryModal;