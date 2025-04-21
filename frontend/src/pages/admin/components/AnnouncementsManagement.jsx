import React, { useState, useRef } from 'react';
import { FaEye, FaEdit, FaTrash, FaPlusCircle, FaImage } from 'react-icons/fa';
import { useAdminStore } from '../../../store/adminStore';

const AnnouncementsManagement = ({ announcements = [], announcementFilters, setAnnouncementFilters }) => {
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    image_path: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAnnouncementForm({
        ...announcementForm,
        file: file // Store the file object for upload
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Open announcement form for editing
  const handleEditAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      image_path: announcement.image_path
    });
    setImagePreview(announcement.image_path ? `http://localhost:5000${announcement.image_path}` : null);
    setShowAnnouncementModal(true);
  };

  // Handle adding new announcement
  const handleAddAnnouncement = () => {
    setSelectedAnnouncement(null);
    setAnnouncementForm({
      title: '',
      content: '',
      image_path: null
    });
    setImagePreview(null);
    setShowAnnouncementModal(true);
  };

  // Handle form submission
  const handleSubmitAnnouncementForm = async (e) => {
    e.preventDefault();
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('title', announcementForm.title);
    formData.append('content', announcementForm.content);
    
    // If there's a file to upload, add it to the FormData
    if (announcementForm.file) {
      formData.append('image', announcementForm.file);
    } else if (announcementForm.image_path) {
      // If keeping existing image in edit mode
      formData.append('image_path', announcementForm.image_path);
    }
    
    if (selectedAnnouncement) {
      // Update existing announcement
      await useAdminStore.getState().updateAnnouncement(selectedAnnouncement._id, formData);
    } else {
      // Create new announcement
      await useAdminStore.getState().createAnnouncement(formData);
    }
    
    setShowAnnouncementModal(false);
    useAdminStore.getState().fetchAnnouncements(announcementFilters);
  };

  // Handle announcement deletion
  const handleDeleteAnnouncement = async (id) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      await useAdminStore.getState().deleteAnnouncement(id);
      useAdminStore.getState().fetchAnnouncements(announcementFilters);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-700">Announcement Management</h2>
        <button
          onClick={handleAddAnnouncement}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
        >
          <FaPlusCircle className="mr-2" /> Add Announcement
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
        <div>
          <select
            value={announcementFilters.sort}
            onChange={(e) => setAnnouncementFilters({...announcementFilters, sort: e.target.value})}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="createdAt">Creation Date</option>
            <option value="title">Title</option>
          </select>
        </div>

        <div>
          <select
            value={announcementFilters.order}
            onChange={(e) => setAnnouncementFilters({...announcementFilters, order: e.target.value})}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <button
          onClick={() => setAnnouncementFilters({sort: 'createdAt', order: 'desc'})}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
        >
          Reset
        </button>
      </div>

      {/* Announcements Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {announcements && announcements.length > 0 ? (
              announcements.map((announcement) => (
                <tr key={announcement._id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{announcement.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {announcement.content.substring(0, 50)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {announcement.landlord_id?.name || "System"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {announcement.landlord_id?.role ? announcement.landlord_id.role.charAt(0).toUpperCase() + announcement.landlord_id.role.slice(1) : "Admin"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(announcement.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {announcement.image_path ? (
                      <img 
                        src={`http://localhost:5000${announcement.image_path}`}
                        alt="Announcement image"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      "No image"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => alert(announcement.content)}
                        className="p-1 text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="p-1 text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement._id)}
                        className="p-1 text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No announcements found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmitAnnouncementForm}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {selectedAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            value={announcementForm.title}
                            onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                            required
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                          <textarea
                            name="content"
                            id="content"
                            rows="4"
                            value={announcementForm.content}
                            onChange={(e) => setAnnouncementForm({...announcementForm, content: e.target.value})}
                            required
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                            Image (Optional)
                          </label>
                          <div className="mt-1 flex items-center space-x-4">
                            {imagePreview && (
                              <div className="relative">
                                <img 
                                  src={imagePreview} 
                                  alt="Preview" 
                                  className="h-32 w-32 object-cover rounded-md"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setImagePreview(null);
                                    setAnnouncementForm({
                                      ...announcementForm,
                                      file: null,
                                      image_path: null
                                    });
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                                >
                                  X
                                </button>
                              </div>
                            )}
                            <input
                              type="file"
                              name="image"
                              id="image"
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleImageChange}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current.click()}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
                            >
                              <FaImage className="mr-2" /> {imagePreview ? 'Change Image' : 'Upload Image'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {selectedAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowAnnouncementModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsManagement;