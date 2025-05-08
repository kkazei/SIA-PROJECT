import React, { useState, useEffect } from "react";
import { useApartmentStore } from "../store/apartmentStore";
import { useAuthStore } from "../store/authStore";
import ApplyApartmentModal from "../components/Tenant-Dashboard/ApplyApartmentModal";
import MapView from "../components/MapView";
import TenantSideNav from "../components/layout/TenantSideNav";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaBed, FaBath, FaMoneyBillWave, FaFilter, FaSearch, FaInfoCircle } from "react-icons/fa";

const BrowseApartmentsPage = () => {
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apartments, setApartments] = useState([]);
  const [hasApartment, setHasApartment] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  
  const { user } = useAuthStore();
  const { getAvailableApartments, assignTenant, checkTenantHasApartment } = useApartmentStore();
  
  // Handle sidebar toggle
  const handleSidebarToggle = (isCollapsed) => {
    setSidebarCollapsed(isCollapsed);
  };

  // Handle modal open
  const handleModalOpen = (modalId) => {
    setActiveModal(modalId);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const availableApartments = await getAvailableApartments();
        setApartments(availableApartments);
        
        // Set initial price range based on available apartments
        if (availableApartments.length > 0) {
          const minRent = Math.min(...availableApartments.map(apt => apt.rent));
          const maxRent = Math.max(...availableApartments.map(apt => apt.rent));
          setPriceRange([minRent, maxRent]);
        }
        
        const hasTenantApartment = await checkTenantHasApartment();
        setHasApartment(hasTenantApartment);
      } catch (error) {
        console.error("Error fetching apartments:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [getAvailableApartments, checkTenantHasApartment]);
  
  const handleViewDetails = (apartment) => {
    setSelectedApartment(apartment);
    setIsApplying(false);
    setApplicationSuccess(false);
  };
  
  const handleApply = (apartment) => {
    setSelectedApartment(apartment);
    setIsApplyModalOpen(true);
  };

  const closeApplyModal = () => {
    setIsApplyModalOpen(false);
    setSelectedApartment(null);
  };
  
  const handleSubmitApplication = async () => {
    try {
      // In a real implementation, you would call an API to apply for the apartment
      // For now, simulate a successful application
      // await assignTenant(selectedApartment._id, user.id);
      
      setIsApplying(false);
      setApplicationSuccess(true);
      
      setTimeout(() => {
        setSelectedApartment(null);
        // You might want to redirect to dashboard or refresh page
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error applying for apartment:", error);
    }
  };
  
  const closeDetails = () => {
    setSelectedApartment(null);
    setIsApplying(false);
    setApplicationSuccess(false);
  };

  // Filter apartments based on search and price range
  const filteredApartments = apartments.filter(apartment => {
    const matchesSearch = apartment.room.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (apartment.description && apartment.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPrice = apartment.rent >= priceRange[0] && apartment.rent <= priceRange[1];
    return matchesSearch && matchesPrice;
  });
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Tenant Side Navigation */}
      <TenantSideNav onToggle={handleSidebarToggle} onModalOpen={handleModalOpen} />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-0 lg:ml-64'}`}>
        <div className="px-4 py-6 lg:px-8 overflow-x-hidden">
          <div className="max-w-full">
            {/* Page Header Section */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Browse Apartments</h1>
              <p className="text-gray-600 mt-1">Find your perfect apartment from our available listings</p>
            </motion.div>
            
            {/* Search and Filter Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white shadow-md rounded-xl p-4 mb-6"
            >
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search apartments by name or description..."
                    className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                >
                  <FaFilter /> {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
              </div>
              
              {showFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price Range: ₱{priceRange[0].toLocaleString()} - ₱{priceRange[1].toLocaleString()}
                      </label>
                      <div className="px-2">
                        <input
                          type="range"
                          min={apartments.length > 0 ? Math.min(...apartments.map(apt => apt.rent)) : 0}
                          max={apartments.length > 0 ? Math.max(...apartments.map(apt => apt.rent)) : 100000}
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
            
            {/* Apartments Grid */}
            <div className="bg-white shadow-md rounded-xl p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Loading available apartments...</p>
                </div>
              ) : (
                <>
                  {filteredApartments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredApartments.map((apartment, index) => (
                        <motion.div 
                          key={apartment._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                        >
                          {/* Apartment Image */}
                          <div className="h-52 bg-gray-200 relative overflow-hidden group">
                            {apartment.images && apartment.images.length > 0 ? (
                              <img
                                src={apartment.images[0]}
                                alt={apartment.room}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/image/apartment-placeholder.jpg";
                                  e.target.className = "w-full h-full object-contain p-8 opacity-50";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <img
                                  src="/image/apartment-placeholder.jpg"
                                  alt="Apartment Placeholder"
                                  className="w-16 h-16 opacity-30"
                                />
                              </div>
                            )}
                            <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-full shadow-md">
                              Available
                            </div>
                          </div>
                          
                          {/* Apartment Details */}
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-800">{apartment.room}</h3>
                            <div className="flex items-center mt-1 text-green-600">
                              <FaMoneyBillWave className="mr-1" />
                              <span className="font-semibold">₱{apartment.rent.toLocaleString()}/month</span>
                            </div>
                            
                            <p className="text-gray-600 text-sm mt-2 line-clamp-2 h-10">
                              {apartment.description || "No description available"}
                            </p>
                            
                            <div className="flex gap-4 mt-3 text-gray-600">
                              <div className="flex items-center text-sm">
                                <FaBed className="mr-1" />
                                <span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <FaBath className="mr-1" />
                                <span>{apartment.bathrooms} {apartment.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                              </div>
                            </div>
                            
                            {/* Location */}
                            <div className="mt-3 flex items-start text-sm text-gray-500">
                              <FaMapMarkerAlt className="mt-1 mr-1 flex-shrink-0" />
                              <span className="line-clamp-1">
                                {typeof apartment.address === 'object' 
                                  ? `${apartment.address.street || ''}, ${apartment.address.city || ''}` 
                                  : (apartment.address || "Address not available")}
                              </span>
                            </div>
                            
                            {/* Map view */}
                            <div className="h-32 w-full mt-3 mb-3 rounded-lg overflow-hidden border border-gray-200">
                              {(apartment.address?.location?.coordinates?.length === 2 || 
                                (apartment.address?.coordinates?.lat && apartment.address?.coordinates?.lng)) ? (
                                <MapView address={apartment.address} height="100%" />
                              ) : (
                                <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                  <p className="text-xs text-gray-400">Map not available</p>
                                </div>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => handleViewDetails(apartment)}
                                className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <FaInfoCircle /> View Details
                              </button>
                              
                              {!hasApartment && (
                                <button
                                  onClick={() => handleApply(apartment)}
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg transition-colors"
                                >
                                  Apply Now
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FaSearch className="text-gray-400 text-3xl" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">No apartments found</h3>
                      <p className="text-gray-600 mt-2">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Apartment details modal */}
      {selectedApartment && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto"
          >
            {/* Modal content remains the same */}
            {/* ... */}
            <div className="sticky top-0 z-10 bg-white p-4 border-b border-gray-200 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">{selectedApartment.room}</h2>
              <button 
                onClick={closeDetails} 
                className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
            </div>
            
            {/* Application success message */}
            {applicationSuccess && (
              <div className="p-6 bg-green-50 border-b border-green-100">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-green-800 font-medium">Application submitted successfully!</h3>
                    <p className="text-green-700 text-sm mt-1">
                      The landlord will review your application and get back to you shortly.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Application form */}
            {isApplying && !applicationSuccess && (
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Apply for {selectedApartment.room}</h3>
                <p className="text-gray-600 mb-6">
                  Complete the form below to apply for this apartment. The landlord will be notified of your interest.
                </p>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user?.name || ""}
                    readOnly
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Move-in Date
                  </label>
                  <input
                    type="date"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Additional Comments
                  </label>
                  <textarea
                    placeholder="Any additional information you'd like to share"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-24"
                  ></textarea>
                </div>
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={closeDetails}
                    className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitApplication}
                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                  >
                    Submit Application
                  </button>
                </div>
              </div>
            )}
            
            {/* Apartment details view */}
            {!isApplying && !applicationSuccess && (
              <div className="p-6">
                {/* Image Gallery */}
                <div className="h-64 lg:h-80 bg-gray-200 mb-6 rounded-lg overflow-hidden">
                  {selectedApartment.images && selectedApartment.images.length > 0 ? (
                    <img
                      src={selectedApartment.images[0]}
                      alt={selectedApartment.room}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src="/image/apartment-placeholder.jpg"
                        alt="Apartment Placeholder"
                        className="w-24 h-24 opacity-30"
                      />
                    </div>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{selectedApartment.room}</h3>
                <p className="text-green-600 text-xl font-semibold mb-4">₱{selectedApartment.rent.toLocaleString()}/month</p>
                
                <div className="mb-6">
                  <h4 className="font-bold text-lg mb-2">Description</h4>
                  <p className="text-gray-700">{selectedApartment.description || "No description provided."}</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-500">Bedrooms</p>
                    <p className="font-semibold">{selectedApartment.bedrooms || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-500">Bathrooms</p>
                    <p className="font-semibold">{selectedApartment.bathrooms || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold text-green-600">Available</p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-500">Move-in Ready</p>
                    <p className="font-semibold">Immediately</p>
                  </div>
                </div>
                
                {/* Address & Location */}
                <div className="mb-6">
                  <h4 className="font-bold text-lg mb-2">Address</h4>
                  <p className="text-gray-700">
                    {selectedApartment.address && typeof selectedApartment.address === 'object' ? (
                      <>
                        {[
                          selectedApartment.address.street,
                          selectedApartment.address.city,
                          selectedApartment.address.state,
                          selectedApartment.address.zipCode,
                          selectedApartment.address.country || 'Philippines'
                        ].filter(Boolean).join(', ')}
                      </>
                    ) : (
                      "Address information not available"
                    )}
                  </p>
                </div>
                
                {/* Map Section */}
                <div className="mb-6">
                  <h4 className="font-bold text-lg mb-2">Location</h4>
                  <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200">
                    {selectedApartment.address && (
                      (selectedApartment.address.location?.coordinates?.length === 2 || 
                       (selectedApartment.address.coordinates?.lat && selectedApartment.address.coordinates?.lng)) ? (
                        <MapView address={selectedApartment.address} height="100%" />
                      ) : (
                        <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                          <div className="text-center p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="mt-2 text-gray-500">Map location not available</p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
                
                <div className="mt-8 flex justify-center gap-4">
                  {!hasApartment && (
                    <button
                      className="bg-green-500 text-white py-3 px-8 rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
                      onClick={() => setIsApplying(true)}
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
      
      <ApplyApartmentModal
        isOpen={isApplyModalOpen}
        closeModal={closeApplyModal}
        apartment={selectedApartment}
      />
    </div>
  );
};

export default BrowseApartmentsPage;