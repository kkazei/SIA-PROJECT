import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../../store/propertyStore';
import { useAuthStore } from '../../store/authStore';
import { useApplicationStore } from '../../store/applicationStore';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

// Import the modular components
import PropertiesTab from '../../components/landlord/PropertiesTab';
import ApplicationsTab from '../../components/landlord/ApplicationsTab';
import PropertyApplicationsTab from '../../components/landlord/PropertyApplicationsTab';

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
    updateLeaseTerm,
    clearError: clearApplicationError,
    clearMessage: clearApplicationMessage
  } = useApplicationStore();

  // UI state
  const [activeTab, setActiveTab] = useState("properties");
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  
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
          <PropertiesTab 
            properties={myProperties}
            isLoading={propertiesLoading}
            onCreateProperty={createProperty}
            onUpdateProperty={updateProperty}
            onDeleteProperty={deleteProperty}
            onViewApplications={handleViewApplications}
            onUpdateLease={handleUpdateLeaseTerm}
          />
        </TabsContent>

        {/* All Applications Tab Content */}
        <TabsContent value="applications">
          <ApplicationsTab 
            applications={applications}
            isLoading={applicationsLoading}
            onUpdateStatus={handleUpdateApplicationStatus}
          />
        </TabsContent>

        {/* Property-Specific Applications Tab Content */}
        <TabsContent value="propertyApplications">
          {selectedPropertyId && (
            <PropertyApplicationsTab
              propertyTitle={myProperties.find(p => p._id === selectedPropertyId)?.title}
              applications={propertyApplications}
              isLoading={applicationsLoading}
              onUpdateStatus={handleUpdateApplicationStatus}
              onBack={() => setActiveTab("properties")}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LandlordDashboard;