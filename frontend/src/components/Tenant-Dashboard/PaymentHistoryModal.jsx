import React, { useState } from "react";

// Payment History Modal Component
const PaymentHistoryModal = ({ isOpen, closeModal }) => {
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
        <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>

        <div className="mt-4">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Amount</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4">January 5, 2025</td>
                <td className="py-2 px-4">PHP 5,000.00</td>
                <td className="py-2 px-4 text-green-500">Paid</td>
              </tr>
              <tr>
                <td className="py-2 px-4">December 15, 2024</td>
                <td className="py-2 px-4">PHP 10,000.00</td>
                <td className="py-2 px-4 text-red-500">Pending</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            onClick={closeModal}
            className="px-6 py-3 mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default PaymentHistoryModal;