import React from "react";

const TenantHeader = ({ tenantDetails, onPaymentClick }) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status color based on payment status
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-green-100 p-6 rounded-lg flex flex-col md:flex-row justify-between items-center">
      <div className="mb-4 md:mb-0">
        <h1 className="text-2xl font-bold">{tenantDetails?.tenant_fullname}</h1>
        <p className="text-gray-600">{tenantDetails?.room}</p>
        <p className="text-sm text-gray-500 mt-1">
          As of{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}{" "}
          ,{" "}
          {new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">Outstanding Balance</p>
        <p className="text-2xl font-bold text-gray-800">
          PHP {tenantDetails?.rent ? tenantDetails.rent.toLocaleString() : "0.00"}
        </p>
        <p className={`text-sm ${getStatusColor(tenantDetails?.status)}`}>
          Status: {tenantDetails?.status || "Not set"}
        </p>
        {tenantDetails?.due_date && (
          <p className="text-sm text-gray-600 mt-1">
            Due: {formatDate(tenantDetails.due_date)}
            {tenantDetails.daysRemaining !== null && (
              <span className={tenantDetails.daysRemaining < 5 ? "text-red-500" : "text-gray-600"}>
                {" "}({tenantDetails.daysRemaining > 0 ? `${tenantDetails.daysRemaining} days left` : "Overdue"})
              </span>
            )}
          </p>
        )}
        <button
          onClick={onPaymentClick}
          className="bg-green-500 text-white py-2 px-4 rounded-lg mt-2 hover:bg-green-600 transition duration-200"
        >
          PAY NOW
        </button>
      </div>
    </div>
  );
};

export default TenantHeader;