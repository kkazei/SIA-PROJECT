import React from "react";

const LandlordInfo = ({ landlord }) => {
  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold text-lg border-b pb-2 mb-2">Landlord Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600">Name</p>
          <p className="font-medium">{landlord.name}</p>
        </div>
        <div>
          <p className="text-gray-600">Contact</p>
          <p className="font-medium">{landlord.email}</p>
          <p className="font-medium">{landlord.phone || "No phone provided"}</p>
        </div>
      </div>
    </div>
  );
};

export default LandlordInfo;