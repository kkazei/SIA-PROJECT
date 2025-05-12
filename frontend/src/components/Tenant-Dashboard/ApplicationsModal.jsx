import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import RatingForm from "../RatingForm";

const ApplicationsModal = ({ isOpen, closeModal }) => {
  const [ratingApplication, setRatingApplication] = useState(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  
  const { 
    tenantApplications, 
    fetchTenantApplications, 
    loading, 
    error,
    getStatusColor,
    formatDate,
    submitRating
  } = useApplicationStore();

  useEffect(() => {
    if (isOpen) {
      fetchTenantApplications();
    }
  }, [isOpen, fetchTenantApplications]);

  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "pending":
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      case "approved":
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Approved</span>;
      case "rejected":
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>;
      case "ended":
        return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>Ended</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };
  
  const handleRateClick = (application) => {
    setRatingApplication(application);
  };
  
  const handleSubmitRating = async (score, comment) => {
    if (!ratingApplication) return;
    
    setIsSubmittingRating(true);
    try {
      await submitRating(ratingApplication._id, score, comment);
      // Refresh the applications to show updated rating
      await fetchTenantApplications();
      setRatingApplication(null);
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
        <div className="flex justify-between items-center bg-gray-900 text-white px-6 py-4">
          <h3 className="text-xl font-medium">Your Applications</h3>
          <button onClick={closeModal} className="text-gray-500  hover:text-gray-700">
            ✖
          </button>
        </div>

        {/* Rating form modal */}
        {ratingApplication && (
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium">
                Rate your stay at {ratingApplication.apartment_id.room}
              </h4>
              <button 
                onClick={() => setRatingApplication(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
            </div>
            
            <RatingForm 
              onSubmit={handleSubmitRating}
              disabled={isSubmittingRating}
              initialRating={ratingApplication.rating}
            />
          </div>
        )}

        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading your applications...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          ) : tenantApplications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">You haven't submitted any applications yet.</p>
            </div>
          ) : (
            <div>
              {tenantApplications.map((app) => (
                <div key={app._id} className="mb-6 border rounded-lg overflow-hidden shadow-sm">
                  <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-lg">{app.apartment_id.room}</h4>
                      <p className="text-sm text-gray-600">Applied on {formatDate(app.createdAt)}</p>
                    </div>
                    <div>{getStatusBadge(app.status)}</div>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Rent</p>
                        <p>₱{app.apartment_id.rent?.toLocaleString()}/month</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Move-in Date</p>
                        <p>{formatDate(app.moveInDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Duration</p>
                        <p>{app.duration} {app.duration === 1 ? 'month' : 'months'}</p>
                      </div>
                      {app.processedDate && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {app.status === "ended" ? "Tenancy Ended On" : "Processed On"}
                          </p>
                          <p>{formatDate(app.processedDate)}</p>
                        </div>
                      )}
                    </div>
                    
                    {app.additionalComments && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-500">Your Comments</p>
                        <p className="text-gray-700">{app.additionalComments}</p>
                      </div>
                    )}
                    
                    {app.processedReason && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-500">Landlord's Response</p>
                        <p className="text-gray-700">{app.processedReason}</p>
                      </div>
                    )}
                    
                    {/* Show rating section for ended applications */}
                    {app.status === "ended" && (
                      <div className="mt-4 pt-4 border-t">
                        {app.rating ? (
                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">Your Rating</h5>
                            <div className="flex items-center mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= app.rating.score ? "text-yellow-400" : "text-gray-300"
                                  }`}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="ml-2 text-gray-700">{app.rating.score}/5</span>
                            </div>
                            {app.rating.comment && (
                              <p className="text-gray-600 italic">"{app.rating.comment}"</p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <button
                              onClick={() => handleRateClick(app)}
                              className="bg-blue-600 text-white py-1.5 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
                            >
                              Rate Your Experience
                            </button>
                            <p className="text-xs text-gray-500 mt-1">
                              Share your experience to help future tenants
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-6 py-3 flex justify-end">
        </div>
      </div>
    </div>
  );
};

export default ApplicationsModal;