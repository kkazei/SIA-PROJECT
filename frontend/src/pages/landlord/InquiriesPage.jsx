import React, { useState, useEffect } from 'react';
import { useInquiryStore } from '../../store/inquiryStore';
import { motion } from 'framer-motion';
import LandlordSideNav from '../../components/layout/LandlordSideNav';
import { FaCircle, FaSpinner, FaCheck, FaTimes, FaReply, FaFilter } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const InquiriesPage = () => {
  const { 
    inquiries,
    getLandlordInquiries,
    getInquiryById,
    updateInquiryStatus,
    addResponse,
    loading,
    error,
    message,
    clearMessage,
    filterInquiriesByStatus,
    getInquiryStats
  } = useInquiryStore();

  const [isSidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [responseText, setResponseText] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [stats, setStats] = useState({});

  // Load inquiries on component mount
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        await getLandlordInquiries();
      } catch (err) {
        console.error('Error fetching inquiries:', err);
      }
    };
    
    fetchInquiries();
  }, [getLandlordInquiries]);

  // Handle notifications
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearMessage();
    }
    
    if (message) {
      toast.success(message);
      clearMessage();
    }
  }, [error, message, clearMessage]);

  // Update stats when inquiries change
  useEffect(() => {
    if (inquiries && inquiries.length > 0) {
      const inquiryStats = getInquiryStats();
      setStats(inquiryStats);
    }
  }, [inquiries, getInquiryStats]);

  // Function to get filtered inquiries
  const filteredInquiries = statusFilter === 'All' 
    ? inquiries 
    : filterInquiriesByStatus(statusFilter);

  // Handle inquiry selection
  const handleSelectInquiry = async (inquiry) => {
    try {
      // Get full inquiry details including all responses
      await getInquiryById(inquiry._id);
      setSelectedInquiry(inquiry);
      setResponseText('');
    } catch (err) {
      console.error('Error fetching inquiry details:', err);
      toast.error('Could not load inquiry details. Please try again.');
    }
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    if (!selectedInquiry) return;
    
    setStatusUpdateLoading(true);
    try {
      await updateInquiryStatus(selectedInquiry._id, { status: newStatus });
      setSelectedInquiry({
        ...selectedInquiry,
        status: newStatus
      });
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Handle sending a response
  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim() || !selectedInquiry) return;
    
    setReplyLoading(true);
    try {
      await addResponse(selectedInquiry._id, responseText);
      setResponseText('');
    } catch (err) {
      console.error('Error sending response:', err);
    } finally {
      setReplyLoading(false);
    }
  };

  // Get status icon
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

  // Get category style
  const getCategoryStyle = (category) => {
    switch(category) {
      case 'Maintenance': return 'bg-red-100 text-red-800';
      case 'Payment Issue': return 'bg-purple-100 text-purple-800';
      case 'Complaint': return 'bg-orange-100 text-orange-800';
      case 'General Inquiry': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <LandlordSideNav onToggle={setSidebarCollapsed} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`p-4 lg:p-6 bg-blue-50 min-h-screen w-full transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        <div className="bg-white shadow-md rounded-lg p-4 lg:p-6">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Tenant Inquiries</h2>
          <p className="text-gray-600">Manage and respond to tenant inquiries</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-4 mt-4">
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <p className="text-lg lg:text-xl font-bold text-gray-800">{stats.total || 0}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
          <div className="bg-blue-500 p-4 rounded-lg shadow-md text-center">
            <p className="text-lg lg:text-xl font-bold text-white">{stats.open || 0}</p>
            <p className="text-sm text-white">Open</p>
          </div>
          <div className="bg-yellow-500 p-4 rounded-lg shadow-md text-center">
            <p className="text-lg lg:text-xl font-bold text-white">{stats.inProgress || 0}</p>
            <p className="text-sm text-white">In Progress</p>
          </div>
          <div className="bg-green-500 p-4 rounded-lg shadow-md text-center">
            <p className="text-lg lg:text-xl font-bold text-white">{stats.resolved || 0}</p>
            <p className="text-sm text-white">Resolved</p>
          </div>
          <div className="bg-gray-500 p-4 rounded-lg shadow-md text-center">
            <p className="text-lg lg:text-xl font-bold text-white">{stats.closed || 0}</p>
            <p className="text-sm text-white">Closed</p>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left panel - Inquiry List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Inquiries</h3>
              <div className="relative">
                <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-md">
                  <FaFilter className="text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent border-none text-sm focus:outline-none"
                  >
                    <option value="All">All</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Approved">Approved</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p>No inquiries found.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredInquiries.map((inquiry) => (
                  <div 
                    key={inquiry._id}
                    onClick={() => handleSelectInquiry(inquiry)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedInquiry?._id === inquiry._id 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-900 line-clamp-1">{inquiry.subject}</h4>
                      <div className="flex items-center space-x-1 whitespace-nowrap px-2 py-1 text-xs rounded-full bg-opacity-20 border" 
                        style={{
                          backgroundColor: inquiry.status === 'Open' ? 'rgba(59, 130, 246, 0.1)' : 
                                          inquiry.status === 'In Progress' ? 'rgba(245, 158, 11, 0.1)' :
                                          inquiry.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' :
                                          inquiry.status === 'Resolved' ? 'rgba(16, 185, 129, 0.1)' :
                                          'rgba(107, 114, 128, 0.1)',
                          borderColor: inquiry.status === 'Open' ? 'rgb(59, 130, 246)' : 
                                      inquiry.status === 'In Progress' ? 'rgb(245, 158, 11)' :
                                      inquiry.status === 'Approved' ? 'rgb(16, 185, 129)' :
                                      inquiry.status === 'Resolved' ? 'rgb(16, 185, 129)' :
                                      'rgb(107, 114, 128)',
                          color: inquiry.status === 'Open' ? 'rgb(30, 64, 175)' : 
                                inquiry.status === 'In Progress' ? 'rgb(146, 64, 14)' :
                                inquiry.status === 'Approved' ? 'rgb(6, 95, 70)' :
                                inquiry.status === 'Resolved' ? 'rgb(6, 95, 70)' :
                                'rgb(55, 65, 81)'
                        }}
                      >
                        {getStatusIcon(inquiry.status)}
                        <span>{inquiry.status}</span>
                      </div>
                    </div>
                    
                    <div className="mt-1 flex items-center flex-wrap gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryStyle(inquiry.category)}`}>
                        {inquiry.category}
                      </span>
                      
                      <span className="text-xs text-gray-500">
                        {inquiry.apartment_id?.room || 'Unknown Room'}
                      </span>
                      
                      {inquiry.tenant_id && (
                        <span className="text-xs text-gray-500">
                          • {inquiry.tenant_id.name}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-1 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {formatDate(inquiry.createdAt)}
                      </span>
                      
                      {inquiry.responses && (
                        <span className="text-xs text-gray-500">
                          {inquiry.responses.length} {inquiry.responses.length === 1 ? 'response' : 'responses'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right panel - Inquiry Details */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            {selectedInquiry ? (
              <div className="flex flex-col h-full">
                {/* Inquiry header */}
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedInquiry.subject}</h3>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryStyle(selectedInquiry.category)}`}>
                          {selectedInquiry.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          Room: {selectedInquiry.apartment_id?.room || 'Unknown'}
                        </span>
                        <span className="text-sm text-gray-500">
                          Created: {new Date(selectedInquiry.createdAt).toLocaleDateString()}
                        </span>
                        {selectedInquiry.tenant_id && (
                          <span className="text-sm text-gray-500">
                            Tenant: {selectedInquiry.tenant_id.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedInquiry.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        disabled={statusUpdateLoading}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Approved">Approved</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                      {statusUpdateLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500"></div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Inquiry content */}
                <div className="p-4 flex-grow overflow-y-auto">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-700">{selectedInquiry.description}</p>
                    
                    {/* Display inquiry images if any */}
                    {selectedInquiry.images && selectedInquiry.images.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Attached Images</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedInquiry.images.map((image, index) => (
                            <a 
                              key={index} 
                              href={image} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="block"
                            >
                              <img 
                                src={image} 
                                alt={`Inquiry image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-md"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Responses section */}
                  {selectedInquiry.responses && selectedInquiry.responses.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Responses</h4>
                      <div className="space-y-4">
                        {selectedInquiry.responses.map((response, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-md">
                            <div className="flex justify-between">
                              <p className="font-medium">
                                {response.responder_id?.name || 'Unknown User'}
                                <span className="ml-1 font-normal text-sm text-gray-500">
                                  ({response.responder_id?.role || 'Unknown'})
                                </span>
                              </p>
                              <span className="text-sm text-gray-500">
                                {new Date(response.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-1 text-gray-700">{response.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Reply form */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendResponse} className="flex flex-col space-y-2">
                    <div className="flex-1">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write your response..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        disabled={replyLoading}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={replyLoading || !responseText.trim()}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {replyLoading ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <FaReply className="mr-2" /> Send Response
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px] text-gray-500">
                <p className="text-lg">Select an inquiry to view details</p>
                <p className="text-sm mt-2">You can respond to inquiries and update their status here</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InquiriesPage;