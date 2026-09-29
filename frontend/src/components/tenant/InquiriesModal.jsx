import { useState, useEffect } from 'react';
import { useInquiryStore } from '../../store/inquiryStore';
import { useApartmentStore } from '../../store/apartmentStore';
import { useAuthStore } from '../../store/authStore';
import { FaTimes, FaCloudUploadAlt, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import InquiriesList from './InquiriesList';

const InquiriesModal = ({ isOpen, closeModal }) => {
  const { 
    createInquiry, 
    inquiries,
    loading: isLoading, 
    error, 
    message, 
    clearMessage 
  } = useInquiryStore();
  
  const { currentApartment, getTenantApartment } = useApartmentStore();
  const { user } = useAuthStore();

  const [showForm, setShowForm] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    images: []
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [formError, setFormError] = useState('');

  // Fetch current apartment if not already loaded
  useEffect(() => {
    if (isOpen && user?.role === 'tenant' && !currentApartment) {
      getTenantApartment();
    }
  }, [isOpen, user, currentApartment, getTenantApartment]);

  // Handle form errors and success messages
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearMessage();
    }
    
    if (message) {
      toast.success(message);
      clearMessage();
      setShowForm(false); // Hide the form on successful submission
      setFormData({
        subject: '',
        description: '',
        category: '',
        images: []
      });
      setPreviewImages([]);
    }
  }, [error, message, clearMessage]);

  const handleClose = () => {
    if (typeof closeModal === 'function') {
      closeModal();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 3 images
    if (files.length > 3) {
      setFormError('You can upload a maximum of 3 images');
      return;
    }
    
    // Check file sizes (limit each to 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      setFormError(`Some files exceed the 5MB size limit. Please compress your images.`);
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      images: files
    }));

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate form
    if (!formData.subject.trim()) {
      setFormError('Subject is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setFormError('Description is required');
      return;
    }
    
    if (!formData.category) {
      setFormError('Please select a category');
      return;
    }
    
    if (!currentApartment?._id) {
      setFormError('You need to have an apartment assigned to create inquiries');
      return;
    }
    
    try {
      // Create FormData object for file upload
      const inquiryFormData = new FormData();
      inquiryFormData.append('subject', formData.subject);
      inquiryFormData.append('description', formData.description);
      inquiryFormData.append('category', formData.category);
      inquiryFormData.append('apartment_id', currentApartment._id);
      
      // Append images if any
      formData.images.forEach(image => {
        inquiryFormData.append('images', image);
      });
      
      await createInquiry(inquiryFormData);
      
      // Form reset is handled by useEffect when success message is received
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      setFormError('Failed to submit inquiry. Please try again.');
    }
  };

  const handleSelectInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowForm(false);
  };

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  // Reset form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowForm(false);
      setSelectedInquiry(null);
      setFormData({
        subject: '',
        description: '',
        category: '',
        images: []
      });
      setPreviewImages([]);
      setFormError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between bg-gray-900 items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-white">
            {showForm ? 'Submit New Inquiry' : (selectedInquiry ? 'Inquiry Details' : 'Your Inquiries')}
          </h2>
          <button onClick={closeModal} className="text-gray-500  hover:text-gray-700">
            ✖
          </button>
        </div>
        
        <div className="p-4">
          {showForm ? (
            <form onSubmit={handleSubmit}>
              {formError && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
                  {formError}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief title for your inquiry"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please describe your issue in detail"
                  required
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="images">
                  Images (Optional, max 3)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                  <input
                    type="file"
                    id="images"
                    name="images"
                    onChange={handleImageChange}
                    className="hidden"
                    multiple
                    accept="image/*"
                  />
                  <label htmlFor="images" className="cursor-pointer">
                    <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Click to upload images</p>
                  </label>
                </div>
                
                {previewImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {previewImages.map((url, index) => (
                      <div key={index} className="relative h-20">
                        <img 
                          src={url} 
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 mr-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          ) : selectedInquiry ? (
            <div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
              >
                <FaTimes className="mr-1" /> Back to list
              </button>
              
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-xl">{selectedInquiry.subject}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedInquiry.status === 'Open' ? 'bg-blue-100 text-blue-800' : 
                    selectedInquiry.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    selectedInquiry.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    selectedInquiry.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedInquiry.status}
                  </span>
                </div>
                
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Created {new Date(selectedInquiry.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    selectedInquiry.category === 'Maintenance' ? 'bg-red-100 text-red-800' :
                    selectedInquiry.category === 'Payment Issue' ? 'bg-purple-100 text-purple-800' :
                    selectedInquiry.category === 'Complaint' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedInquiry.category}
                  </span>
                </div>
                
                <p className="mt-4 text-gray-700">{selectedInquiry.description}</p>
                
                {selectedInquiry.images && selectedInquiry.images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Images</h4>
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
              
              {selectedInquiry.responses && selectedInquiry.responses.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Responses</h4>
                  <div className="space-y-4">
                    {selectedInquiry.responses.map((response, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between">
                          <p className="font-medium">
                            {response.responder_id.name}
                            <span className="ml-1 font-normal text-sm text-gray-500">
                              ({response.responder_id.role})
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
              
              {/* Tenant response form */}
              {selectedInquiry && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-medium mb-3">Add Response</h4>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const responseText = e.target.responseText.value.trim();
                    if (!responseText) return;
                    
                    // Call the addResponse function from inquiryStore
                    useInquiryStore.getState().addResponse(selectedInquiry._id, responseText)
                      .then(() => {
                        // Clear the form
                        e.target.responseText.value = '';
                      })
                      .catch(err => {
                        console.error('Error adding response:', err);
                        toast.error('Failed to add response');
                      });
                  }}>
                    <textarea
                      name="responseText"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type your response here..."
                    ></textarea>
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Send Response
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <button 
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center"
                >
                  <FaPlus className="mr-1" /> New Inquiry
                </button>
              </div>
              
              <InquiriesList 
                inquiries={inquiries || []} 
                onSelectInquiry={handleSelectInquiry} 
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiriesModal;