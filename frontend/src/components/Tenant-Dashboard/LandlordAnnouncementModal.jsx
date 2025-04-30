import React, { useEffect, useState } from "react";
import { useAnnouncementStore } from "../../store/announcementStore";

const LandlordAnnouncementModal = ({ isOpen, closeModal }) => {
  const { 
    getTenantAnnouncements, 
    announcements,
    loading,
    error,
    clearMessage
  } = useAnnouncementStore();
  
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    // If modal is open, fetch announcements
    if (isOpen) {
      const fetchAnnouncements = async () => {
        try {
          await getTenantAnnouncements();
          setLoadingInitial(false);
        } catch (error) {
          console.error('Error fetching announcements:', error);
          setLoadingInitial(false);
        }
      };
      
      fetchAnnouncements();
    }
    
    // Clear messages when modal closes
    return () => {
      if (!isOpen) {
        clearMessage();
      }
    };
  }, [isOpen, getTenantAnnouncements, clearMessage]);

  if (!isOpen) return null;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Landlord Announcements</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            ✖
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 flex-grow">
          {/* Show loading state */}
          {(loading || loadingInitial) && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* Show error message if any */}
          {error && !loading && !loadingInitial && (
            <div className="bg-red-50 text-red-800 p-4 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {/* Show announcements if available */}
          {!loading && !loadingInitial && !error && announcements && announcements.length > 0 ? (
            <div className="space-y-6">
              {announcements.map((announcement) => (
                <div key={announcement._id} className="border rounded-lg overflow-hidden shadow-sm">
                  {announcement.image_path && (
                    <img
                      src={announcement.image_path}
                      alt="Announcement"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold">{announcement.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDate(announcement.createdAt)}
                    </p>
                    <p className="text-gray-700 whitespace-pre-line">{announcement.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Show no announcements message only when not loading and no error
            !loading && !loadingInitial && !error && (
              <div className="text-center py-8">
                <p className="text-gray-500">No announcements available.</p>
              </div>
            )
          )}
        </div>
        
        <div className="p-4 border-t">
          <button
            onClick={closeModal}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandlordAnnouncementModal;