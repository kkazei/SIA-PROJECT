import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../../store/propertyStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { 
    myProperties, 
    isLoading, 
    error, 
    message, 
    getMyProperties, 
    createProperty, 
    updateProperty, 
    deleteProperty,
    clearError,
    clearMessage
  } = usePropertyStore();

  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProperty, setCurrentProperty] = useState(null);
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

  // Handle error and success messages
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
    if (message) {
      toast.success(message);
      clearMessage();
    }
  }, [error, message, clearError, clearMessage]);

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

  return (
    <div className="container mx-auto p-4">
      {/* Header with Logout Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Landlord Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 4a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd" />
            <path d="M13 7a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1z" />
          </svg>
          Logout
        </button>
      </div>
      
      {/* User Welcome Message */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <p className="text-lg">
          Welcome, <span className="font-medium">{user?.name || 'Landlord'}</span>!
        </p>
        <p className="text-gray-600">
          Manage your property listings below.
        </p>
      </div>
      
      <div className="mb-6">
        <button 
          onClick={() => setShowPropertyForm(!showPropertyForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showPropertyForm ? 'Hide Form' : 'Add New Property'}
        </button>
      </div>

      {/* Property Form */}
      {showPropertyForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
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
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : editMode ? 'Update Property' : 'Create Property'}
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
        </div>
      )}

      {/* Properties List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">My Properties</h2>
        
        {isLoading && <p className="text-gray-600">Loading properties...</p>}
        
        {!isLoading && myProperties.length === 0 && (
          <p className="text-gray-600">You haven't listed any properties yet.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProperties.map(property => (
            <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Property Image */}
              <div className="h-48 overflow-hidden">
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
                
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => handleEdit(property)}
                    className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 flex-1"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(property._id)}
                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 flex-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;