import { useState } from 'react';
import { toast } from 'react-hot-toast';

const PropertyLeaseInfo = ({ property, onUpdateLease }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [leaseData, setLeaseData] = useState({
    leaseStart: property.leaseStart ? new Date(property.leaseStart).toISOString().split('T')[0] : '',
    leaseEnd: property.leaseEnd ? new Date(property.leaseEnd).toISOString().split('T')[0] : ''
  });
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeaseData({
      ...leaseData,
      [name]: value
    });
  };
  
  const handleSave = () => {
    // Validate dates
    if (!leaseData.leaseStart || !leaseData.leaseEnd) {
      toast.error("Please provide both lease start and end dates");
      return;
    }
    
    const startDate = new Date(leaseData.leaseStart);
    const endDate = new Date(leaseData.leaseEnd);
    
    if (endDate <= startDate) {
      toast.error("Lease end date must be after the start date");
      return;
    }
    
    onUpdateLease(property._id, leaseData);
    setIsEditing(false);
  };
  
  if (!property.isOccupied || !property.tenant) {
    return <p className="text-gray-600 text-sm">No active lease</p>;
  }
  
  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <h4 className="font-medium text-gray-900 mb-2">Lease Information</h4>
      
      {!isEditing ? (
        <>
          <div className="text-sm">
            <p className="mb-1">
              <span className="text-gray-600">Tenant:</span>{' '}
              <span className="font-medium">
                {typeof property.tenant === 'object' ? 
                  (property.tenant?.name || 'Unknown Tenant') : 
                  'Tenant ID: ' + property.tenant}
              </span>
            </p>
            <p className="mb-1">
              <span className="text-gray-600">Start Date:</span>{' '}
              {formatDate(property.leaseStart)}
            </p>
            <p className="mb-1">
              <span className="text-gray-600">End Date:</span>{' '}
              {formatDate(property.leaseEnd)}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Update Lease Terms
          </button>
        </>
      ) : (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Lease Start Date</label>
              <input 
                type="date"
                name="leaseStart"
                value={leaseData.leaseStart}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border rounded text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Lease End Date</label>
              <input 
                type="date"
                name="leaseEnd"
                value={leaseData.leaseEnd}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border rounded text-sm"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyLeaseInfo;