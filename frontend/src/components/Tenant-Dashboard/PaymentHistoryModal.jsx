import React, { useState, useEffect } from "react";

const PaymentHistoryModal = ({ isOpen, closeModal }) => {
  const [payments] = useState([
    {
      date: "January 5, 2025",
      amount: 5000,
      status: "Paid",
      referenceNo: "PAY-123456",
      method: "GCash"
    },
    {
      date: "December 15, 2024",
      amount: 10000,
      status: "Pending",
      referenceNo: "PAY-123457",
      method: "Bank Transfer"
    }
  ]);

  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case "paid":
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Paid</span>;
      case "pending":
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

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
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Reference #{payment.referenceNo}</h4>
                    <p className="text-sm text-gray-600">{payment.date}</p>
                  </div>
                  <div>{getStatusBadge(payment.status)}</div>
                </div>
                
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="text-lg font-semibold">₱{payment.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                    <p>{payment.method}</p>
                  </div>
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