import React, { useState } from "react";
import { useApartmentStore } from "../../store/apartmentStore";
import { useAuthStore } from "../../store/authStore";
import ApplyApartmentModal from "./ApplyApartmentModal";
import MapView from "../../components/MapView"; // Import the MapView component

const BrowseApartmentsModal = ({ isOpen, closeModal, apartments, hasApartment = false }) => {
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  
  const { user } = useAuthStore();
  const { assignTenant } = useApartmentStore();
  
  if (!isOpen) return null;
  
  const handleViewDetails = (apartment) => {
    // Show apartment details
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
      
      // Show success message
      setIsApplying(false);
      setApplicationSuccess(true);
      
      // In a real app, you might want to refresh tenant data after successful application
      setTimeout(() => {
        closeModal();
        // You might want to redirect to dashboard or refresh page
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error applying for apartment:", error);
      // Handle error
    }
  };
  
  const closeDetails = () => {
    setSelectedApartment(null);
    setIsApplying(false);
    setApplicationSuccess(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex text-white bg-gray-900 justify-between items-center">
          <h2 className="text-xl font-bold">Available Apartments</h2>
          <button onClick={closeModal} className="text-gray-500  hover:text-gray-700">
            ✖
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 flex-grow">
          {/* Show loading state or error */}
          {!apartments && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* Show apartments if available */}
          {apartments && apartments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {apartments.map((apartment) => (
                <div 
                  key={apartment._id} 
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Apartment Image */}
                  <div className="h-48 bg-gray-200 relative">
                    {apartment.images && apartment.images.length > 0 ? (
                      <img
                        src={apartment.images[0]}
                        alt={apartment.room}
                        className="w-full h-full object-cover"
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
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded">
                      Available
                    </div>
                  </div>
                  
                  {/* Apartment Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold">{apartment.room}</h3>
                    <p className="text-green-600 font-semibold">₱{apartment.rent.toLocaleString()}/month</p>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{apartment.description}</p>
                    
                    <div className="flex justify-between mt-2 text-sm text-gray-500">
                      <span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                      <span>{apartment.bathrooms} {apartment.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
                    </div>
                    
                    {/* Add this after the apartment details in the card */}
                    <div className="h-24 w-full mt-2 mb-2 rounded overflow-hidden border border-gray-200">
                      {(apartment.address?.location?.coordinates?.length === 2 || 
                        (apartment.address?.coordinates?.lat && apartment.address?.coordinates?.lng)) ? (
                        <MapView address={apartment.address} height="100%" />
                      ) : (
                        <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                          <p className="text-xs text-gray-400">Map not available</p>
                        </div>
                      )}
                    </div>

                    {/* Add rating display */}
                    <div className="flex items-center mt-2">
                      {apartment.ratings && apartment.ratings.average > 0 ? (
                        <>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= Math.round(apartment.ratings.average)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-1 text-sm text-gray-600">
                            {apartment.ratings.average} ({apartment.ratings.count} {apartment.ratings.count === 1 ? 'review' : 'reviews'})
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">No ratings yet</span>
                      )}
                    </div>

                    {/* Two separate buttons: View Details and Apply */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleViewDetails(apartment)}
                        className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        View Details
                      </button>
                      
                      {!hasApartment && (
                        <button
                          onClick={() => handleApply(apartment)}
                          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md mt-2 w-full"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No available apartments found.
            </div>
          )}
        </div>
        
        {/* Apartment details popup */}
        {selectedApartment && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">{selectedApartment.room}</h2>
                <button onClick={closeDetails} className="text-gray-500 hover:text-gray-700">
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
                  <div className="h-64 bg-gray-200 mb-6">
                    {selectedApartment.images && selectedApartment.images.length > 0 ? (
                      <img
                        src={selectedApartment.images[0]}
                        alt={selectedApartment.room}
                        className="w-full h-full object-contain"
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
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-gray-100 rounded">
                      <p className="text-sm text-gray-500">Bedrooms</p>
                      <p className="font-semibold">{selectedApartment.bedrooms || "N/A"}</p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded">
                      <p className="text-sm text-gray-500">Bathrooms</p>
                      <p className="font-semibold">{selectedApartment.bathrooms || "N/A"}</p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-semibold">
                        {typeof selectedApartment.address === 'object' 
                          ? `${selectedApartment.address.street || ''}, ${selectedApartment.address.city || ''}` 
                          : (selectedApartment.address || "Not provided")}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded">
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-semibold text-green-600">Available</p>
                    </div>
                  </div>
                  
                  {/* Map Section */}
                  <div className="mb-6">
                    <h4 className="font-bold text-lg mb-2">Location</h4>
                    <div className="h-64 w-full rounded overflow-hidden border border-gray-200">
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
                    <p className="mt-2 text-sm text-gray-500">
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
                  
                  <div className="mt-6 flex justify-center gap-4">
                    
                    {!hasApartment && (
                      <button
                        className="bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600 transition-colors"
                        onClick={() => setIsApplying(true)}
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="p-4 border-t">
        </div>
      </div>
      <ApplyApartmentModal
        isOpen={isApplyModalOpen}
        closeModal={closeApplyModal}
        apartment={selectedApartment}
      />
    </div>
  );
};

export default BrowseApartmentsModal;