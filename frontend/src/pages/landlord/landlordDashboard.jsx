import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../../store/propertyStore';
import { useAuthStore } from '../../store/authStore';
import { useApplicationStore } from '../../store/applicationStore';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { 
    myProperties, 
    isLoading: propertiesLoading, 
    error: propertyError, 
    message: propertyMessage, 
    getMyProperties, 
    createProperty, 
    updateProperty, 
    deleteProperty,
    clearError: clearPropertyError,
    clearMessage: clearPropertyMessage
  } = usePropertyStore();

  const {
    applications,
    propertyApplications,
    isLoading: applicationsLoading,
    error: applicationError,
    message: applicationMessage,
    getLandlordApplications,
    getPropertyApplications,
    updateApplicationStatus,
    updateLeaseTerm, // Add this missing import
    clearError: clearApplicationError,
    clearMessage: clearApplicationMessage
  } = useApplicationStore();

  // UI state
  const [activeTab, setActiveTab] = useState("properties");
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  
  // Property form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    propertyType: 'apartment',
    rentAmount: 0,
    bedrooms: 1,
    bathrooms: 1,
    images: []
  });

  // Fetch landlord's properties on component mount
  useEffect(() => {
    getMyProperties();
  }, [getMyProperties]);

  // Load data based on active tab
  useEffect(() => {
    const loadTabData = async () => {
      if (activeTab === "applications") {
        await getLandlordApplications();
      } else if (activeTab === "propertyApplications" && selectedPropertyId) {
        await getPropertyApplications(selectedPropertyId);
      }
    };
    
    loadTabData();
  }, [activeTab, getLandlordApplications, getPropertyApplications, selectedPropertyId]);

  // Handle property errors and messages
  useEffect(() => {
    if (propertyError) {
      toast.error(propertyError);
      clearPropertyError();
    }
    if (propertyMessage) {
      toast.success(propertyMessage);
      clearPropertyMessage();
    }
  }, [propertyError, propertyMessage, clearPropertyError, clearPropertyMessage]);

  // Handle application errors and messages
  useEffect(() => {
    if (applicationError) {
      toast.error(applicationError);
      clearApplicationError();
    }
    if (applicationMessage) {
      toast.success(applicationMessage);
      clearApplicationMessage();
    }
  }, [applicationError, applicationMessage, clearApplicationError, clearApplicationMessage]);

  // Check if user is a landlord
  useEffect(() => {
    if (user && user.role !== 'landlord') {
      navigate('/dashboard');
      toast.error('Access denied. Landlord access only.');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rentAmount' || name === 'bedrooms' || name === 'bathrooms' 
        ? Number(value) 
        : value
    });
  };

  const handleImageInputChange = (e) => {
    // In a real app, you might want to use file uploads
    // For this example, we'll just store the image URL
    const imageUrl = e.target.value;
    if (imageUrl) {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl]
      });
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      images: updatedImages
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode) {
        await updateProperty(currentProperty._id, formData);
      } else {
        await createProperty(formData);
      }
      
      // Reset form and state
      resetForm();
    } catch (error) {
      console.error("Error submitting property:", error);
    }
  };

  const handleEdit = (property) => {
    setCurrentProperty(property);
    setFormData({
      title: property.title,
      description: property.description,
      address: property.address,
      city: property.city,
      propertyType: property.propertyType,
      rentAmount: property.rentAmount,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      images: property.images || []
    });
    setEditMode(true);
    setShowPropertyForm(true);
    setActiveTab("properties");
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await deleteProperty(id);
      } catch (error) {
        console.error("Error deleting property:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      address: '',
      city: '',
      propertyType: 'apartment',
      rentAmount: 0,
      bedrooms: 1,
      bathrooms: 1,
      images: []
    });
    setEditMode(false);
    setCurrentProperty(null);
    setShowPropertyForm(false);
  };

  // Application management functions
  const handleViewApplications = (propertyId) => {
    setSelectedPropertyId(propertyId);
    setActiveTab("propertyApplications");
  };

  const handleUpdateApplicationStatus = async (applicationId, status, leaseData = null) => {
    try {
      // Prepare the data to send
      const updateData = { 
        status, 
        notes: status === 'approved' ? 'Your application has been approved!' : 
               status === 'rejected' ? 'Thank you for your interest, but we have selected another applicant.' : ''
      };

      // Include lease terms if provided
      if (status === 'approved' && leaseData) {
        updateData.leaseStart = leaseData.leaseStart;
        updateData.leaseEnd = leaseData.leaseEnd;
      }
      
      await updateApplicationStatus(applicationId, updateData);
      
      // If we're viewing property-specific applications, refresh them
      if (activeTab === "propertyApplications" && selectedPropertyId) {
        await getPropertyApplications(selectedPropertyId);
      }
      
      // Also refresh the properties list to see updated tenant info
      await getMyProperties();
      
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const handleUpdateLeaseTerm = async (propertyId, leaseData) => {
    try {
      // Call the API to update lease terms
      await updateLeaseTerm(propertyId, leaseData);
      
      // Refresh properties to show updated lease info
      await getMyProperties();
      
      toast.success("Lease terms updated successfully");
    } catch (error) {
      console.error("Error updating lease terms:", error);
      toast.error("Failed to update lease terms");
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header with User Info and Logout Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-600">Landlord Dashboard</h1>
          <p className="text-gray-600">
            Welcome, <span className="font-medium">{user?.name || 'Landlord'}</span>!
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="mt-4 md:mt-0 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 4a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd" />
            <path d="M13 7a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1z" />
          </svg>
          Logout
        </button>
      </div>
      
      {/* Dashboard Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-6"
      >
        <TabsList className="w-full border-b border-gray-200">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="applications">All Applications</TabsTrigger>
          {selectedPropertyId && (
            <TabsTrigger value="propertyApplications">
              Property Applications
            </TabsTrigger>
          )}
        </TabsList>
        
        {/* Properties Tab Content */}
        <TabsContent value="properties">
          <div className="mb-6 mt-4">
            <button 
              onClick={() => setShowPropertyForm(!showPropertyForm)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {showPropertyForm ? 'Hide Form' : 'Add New Property'}
            </button>
          </div>

          {/* Property Form */}
          {showPropertyForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-6 rounded-lg shadow-md mb-8"
            >
              <h2 className="text-2xl font-semibold mb-4">
                {editMode ? 'Edit Property' : 'Add New Property'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Property Type</label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="condo">Condo</option>
                      <option value="room">Room</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    rows="4"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Rent Amount (₱)</label>
                    <input
                      type="number"
                      name="rentAmount"
                      value={formData.rentAmount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Bedrooms</label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Bathrooms</label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Images</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="Enter image URL"
                      onChange={handleImageInputChange}
                      className="w-full px-3 py-2 border rounded mr-2"
                    />
                  </div>
                  
                  {formData.images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Property ${index + 1}`}
                            className="h-20 w-20 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    disabled={propertiesLoading}
                  >
                    {propertiesLoading ? 'Loading...' : editMode ? 'Update Property' : 'Create Property'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

        {/* Properties List */}
<div>
  <h2 className="text-2xl font-semibold mb-4">My Properties</h2>
  
  {propertiesLoading && <p className="text-gray-600">Loading properties...</p>}
  
  {!propertiesLoading && myProperties.length === 0 && (
    <p className="text-gray-600">You haven't listed any properties yet.</p>
  )}

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {myProperties.map(property => (
      <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Property Image */}
        <div className="h-48 overflow-hidden relative">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
              }}
            />
          ) : (
            <div className="bg-gray-200 h-full flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          
          {/* Status badge */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white ${property.isOccupied ? 'bg-blue-500' : 'bg-green-500'}`}>
            {property.isOccupied ? 'Occupied' : 'Available'}
          </div>
        </div>
        
        {/* Property Details */}
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
          <p className="text-gray-700 mb-2 line-clamp-2">{property.description}</p>
          <p className="text-gray-600 mb-1">
            <span className="font-medium">Location:</span> {property.city}
          </p>
          <p className="text-gray-600 mb-1">
            <span className="font-medium">Type:</span> {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
          </p>
          <div className="flex justify-between mb-2">
            <p className="text-gray-600">
              <span className="font-medium">Bedrooms:</span> {property.bedrooms}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Bathrooms:</span> {property.bathrooms}
            </p>
          </div>
          <p className="text-green-600 font-bold text-lg mb-3">
            ₱{property.rentAmount.toLocaleString()}/month
          </p>
          
          {/* Add Lease Information if property is occupied */}
          {property.isOccupied && property.tenant && (
            <PropertyLeaseInfo 
              property={property} 
              onUpdateLease={handleUpdateLeaseTerm} 
            />
          )}
          
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => handleEdit(property)}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 flex-1"
            >
              Edit
            </button>
            <button 
              onClick={() => handleDelete(property._id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex-1"
              disabled={property.isOccupied}
              title={property.isOccupied ? "Cannot delete an occupied property" : ""}
            >
              Delete
            </button>
            <button 
              onClick={() => handleViewApplications(property._id)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex-1"
            >
              Applications
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
        </TabsContent>

        {/* All Applications Tab Content */}
        <TabsContent value="applications">
          <div className="mt-4">
            <h2 className="text-2xl font-semibold mb-6 text-green-600">All Property Applications</h2>
            
            {applicationsLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : applications.length > 0 ? (
              <div className="space-y-6">
                {applications.map((application) => (
                  <ApplicationCard 
                    key={application._id}
                    application={application}
                    onUpdateStatus={handleUpdateApplicationStatus}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Applications Yet</h3>
                <p className="text-gray-600">
                  You haven't received any applications for your properties yet.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Property-Specific Applications Tab Content */}
        <TabsContent value="propertyApplications">
          {selectedPropertyId && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-green-600">
                  Applications for{" "}
                  {myProperties.find(p => p._id === selectedPropertyId)?.title || "Property"}
                </h2>
                <button
                  onClick={() => setActiveTab("properties")}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Back to Properties
                </button>
              </div>
              
              {applicationsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : propertyApplications.length > 0 ? (
                <div className="space-y-6">
                  {propertyApplications.map((application) => (
                    <ApplicationCard 
                      key={application._id}
                      application={application}
                      onUpdateStatus={handleUpdateApplicationStatus}
                      detailed={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600">
                    You haven't received any applications for this property yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Application Card component for landlords
const ApplicationCard = ({ application, onUpdateStatus, detailed = false }) => {
  const [showDetails, setShowDetails] = useState(detailed);
  const [showLeaseForm, setShowLeaseForm] = useState(false);
  const [leaseData, setLeaseData] = useState({
    leaseStart: application.moveInDate ? new Date(application.moveInDate).toISOString().split('T')[0] : '',
    leaseEnd: application.moveInDate ? 
      new Date(new Date(application.moveInDate).setFullYear(
        new Date(application.moveInDate).getFullYear() + 1
      )).toISOString().split('T')[0] : ''
  });
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'canceled': return 'bg-gray-500';
      default: return 'bg-yellow-500'; // pending
    }
  };

  const handleLeaseInputChange = (e) => {
    const { name, value } = e.target;
    setLeaseData({
      ...leaseData,
      [name]: value
    });
  };
  
  const propertyTitle = application.property?.title || 'Unknown Property';
  const tenantName = application.tenant?.name || 'Unknown Tenant';
  
  const handleApprove = () => {
    if (showLeaseForm) {
      // Validate lease dates
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
      
      onUpdateStatus(application._id, 'approved', leaseData);
    } else {
      setShowLeaseForm(true); // First show the lease form
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {propertyTitle}
            </h3>
            <p className="text-sm text-gray-600">
              From: <span className="font-medium">{tenantName}</span> • Applied on {formatDate(application.createdAt)}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(application.status)}`}>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </div>
        </div>
        
        <div className="mt-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 ml-1 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Contact Email</p>
                <p className="text-sm">{application.tenant?.email || 'Not available'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Desired Move-in Date</p>
                <p className="text-sm">{formatDate(application.moveInDate)}</p>
              </div>
            </div>
            
            {application.message && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Applicant Message</p>
                <p className="text-sm bg-gray-50 p-3 rounded">{application.message}</p>
              </div>
            )}
            
            {application.documents && application.documents.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Submitted Documents</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {application.documents.map((doc, index) => (
                    <a 
                      key={index}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {doc.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {application.landlordNotes && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Your Notes</p>
                <p className="text-sm bg-blue-50 p-3 rounded">{application.landlordNotes}</p>
              </div>
            )}
            
            {application.status === 'pending' && (
              <>
                {showLeaseForm && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Set Lease Terms</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Lease Start Date</label>
                        <input 
                          type="date"
                          name="leaseStart"
                          value={leaseData.leaseStart}
                          onChange={handleLeaseInputChange}
                          className="w-full px-3 py-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Lease End Date</label>
                        <input 
                          type="date"
                          name="leaseEnd"
                          value={leaseData.leaseEnd}
                          onChange={handleLeaseInputChange}
                          className="w-full px-3 py-2 border rounded"
                          required
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <p>* Setting lease terms is required for tenant approval.</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleApprove}
                    className="flex-1 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    {showLeaseForm ? 'Confirm Approval' : 'Approve'}
                  </button>
                  <button
                    onClick={() => onUpdateStatus(application._id, 'rejected')}
                    className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Component for showing and updating property lease details
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

export default LandlordDashboard;