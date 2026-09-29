import React from 'react';
import { FaCircle, FaClock, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const InquiriesList = ({ inquiries, onSelectInquiry }) => {
  // Function to determine status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Open':
        return <FaCircle className="text-blue-500" />;
      case 'In Progress':
        return <FaSpinner className="text-yellow-500" />;
      case 'Approved':
        return <FaCheck className="text-green-500" />;
      case 'Resolved':
        return <FaCheck className="text-green-600" />;
      case 'Closed':
        return <FaTimes className="text-gray-500" />;
      default:
        return <FaCircle className="text-gray-400" />;
    }
  };

  // Function to get status color class
  const getStatusColorClass = (status) => {
    switch(status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get category badge style
  const getCategoryStyle = (category) => {
    switch(category) {
      case 'Maintenance': return 'bg-red-100 text-red-800';
      case 'Payment Issue': return 'bg-purple-100 text-purple-800';
      case 'Complaint': return 'bg-orange-100 text-orange-800';
      case 'General Inquiry': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!inquiries || inquiries.length === 0) {
    return (
      <div className="p-4 text-center bg-gray-50 rounded-md">
        <p className="text-gray-500">You don't have any inquiries yet.</p>
        <p className="text-gray-500 text-sm mt-2">
          Create a new inquiry to communicate with your landlord.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Your Inquiries</h3>
      
      {inquiries.map((inquiry) => (
        <div 
          key={inquiry._id}
          className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => onSelectInquiry && onSelectInquiry(inquiry)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900">{inquiry.subject}</h4>
              <div className="mt-1 flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryStyle(inquiry.category)}`}>
                  {inquiry.category}
                </span>
                <span className="text-gray-500 text-xs">
                  {formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColorClass(inquiry.status)} flex items-center gap-1`}>
                {getStatusIcon(inquiry.status)}
                <span>{inquiry.status}</span>
              </span>
            </div>
          </div>
          
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{inquiry.description}</p>
          
          {inquiry.responses && inquiry.responses.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              {inquiry.responses.length} {inquiry.responses.length === 1 ? 'response' : 'responses'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InquiriesList;