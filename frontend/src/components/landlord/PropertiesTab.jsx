import { useState } from 'react';
import PropertyForm from './PropertyForm';
import PropertyCard from './PropertyCard';

const PropertiesTab = ({ 
  properties, 
  isLoading, 
  onCreateProperty, 
  onUpdateProperty, 
  onDeleteProperty,
  onViewApplications,
  onUpdateLease
}) => {
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProperty, setCurrentProperty] = useState(null);
  
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
        await onUpdateProperty(currentProperty._id, formData);
      } else {
        await onCreateProperty(formData);
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
    <div>
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
        <PropertyForm 
          formData={formData}
          handleInputChange={handleInputChange}
          handleImageInputChange={handleImageInputChange}
          removeImage={removeImage}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          editMode={editMode}
          isLoading={isLoading}
        />
      )}

      {/* Properties List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">My Properties</h2>
        
        {isLoading && <p className="text-gray-600">Loading properties...</p>}
        
        {!isLoading && properties.length === 0 && (
          <p className="text-gray-600">You haven't listed any properties yet.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <PropertyCard 
              key={property._id}
              property={property}
              onEdit={handleEdit}
              onDelete={onDeleteProperty}
              onViewApplications={onViewApplications}
              onUpdateLease={onUpdateLease}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertiesTab;