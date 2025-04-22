import React, { useState, useEffect } from 'react';
import { useApartmentStore } from '../store/apartmentStore';
import MapView from './MapView'; // Import the MapView component
import AddressAutocomplete from './AddressAutocomplete'; // Import the new component

const RoomModal = ({ isOpen, onClose }) => {
    const { createApartment, isLoading, error, message, clearMessages } = useApartmentStore();
    const [formData, setFormData] = useState({
        room: '',
        rent: '',
        description: '',
        bedrooms: 1,
        bathrooms: 1,
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
        },
    });
    const [formError, setFormError] = useState('');
    const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'features', 'images', 'map'
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    // Clear form and errors when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            clearMessages();
            setFormError('');
        }
    }, [isOpen, clearMessages]);

    // Clear form after successful creation
    useEffect(() => {
        if (message && message.includes('success')) {
            setFormData({
                room: '',
                rent: '',
                description: '',
                bedrooms: 1,
                bathrooms: 1,
                address: {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                },
            });
            setImages([]);
            setPreviewUrls([]);
            setFormError('');
            setActiveTab('basic');
            
            // Auto-close after successful creation with a small delay
            const timer = setTimeout(() => {
                onClose();
            }, 1500);
            
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    // Handle file selection for images
    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        
        // Only allow up to 5 images
        const filesToAdd = selectedFiles.slice(0, 5 - images.length);
        if (selectedFiles.length > (5 - images.length)) {
            setFormError('Maximum 5 images allowed');
        }
        
        setImages(prevImages => [...prevImages, ...filesToAdd]);
        
        // Create preview URLs
        const newPreviewUrls = filesToAdd.map(file => URL.createObjectURL(file));
        setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
    };

    // Remove an image
    const removeImage = (index) => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
        
        // Also revoke the object URL to avoid memory leaks
        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('address.')) {
            // Handle address fields
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            // Handle regular fields
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Add a handler for address selection from autocomplete
    const handleAddressSelect = (addressData) => {
        setFormData(prev => ({
            ...prev,
            address: addressData
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        
        // Validate required inputs
        if (!formData.room || !formData.rent || !formData.description) {
            setFormError('Apartment, rent, and description are required.');
            setActiveTab('basic');
            return;
        }
        
        // Validate rent is a positive number
        if (isNaN(formData.rent) || parseFloat(formData.rent) <= 0) {
            setFormError('Rent must be a positive number.');
            setActiveTab('basic');
            return;
        }
        
        try {
            // Create FormData object for file uploads
            const submitData = new FormData();
            
            // Append basic fields
            submitData.append('room', formData.room.trim());
            submitData.append('rent', parseFloat(formData.rent));
            submitData.append('description', formData.description.trim());
            submitData.append('bedrooms', formData.bedrooms);
            submitData.append('bathrooms', formData.bathrooms);
            
            // Append address as JSON string
            submitData.append('address', JSON.stringify(formData.address));
            
            // Append images
            images.forEach(image => {
                submitData.append('images', image);
            });
            
            await createApartment(submitData);
            
        } catch (err) {
            console.error('Error creating apartment:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto p-4">
            <div className="bg-gray-900 w-full max-w-3xl p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <h2 className="text-white text-xl font-semibold">Create a Room</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-200 text-lg font-bold"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-gray-700 mt-4">
                    <button 
                        className={`px-4 py-2 font-medium text-sm ${
                            activeTab === 'basic' 
                                ? 'text-green-500 border-b-2 border-green-500' 
                                : 'text-gray-400 hover:text-white'
                        }`}
                        onClick={() => setActiveTab('basic')}
                    >
                        Basic Info
                    </button>
                    <button 
                        className={`px-4 py-2 font-medium text-sm ${
                            activeTab === 'features' 
                                ? 'text-green-500 border-b-2 border-green-500' 
                                : 'text-gray-400 hover:text-white'
                        }`}
                        onClick={() => setActiveTab('features')}
                    >
                        Features
                    </button>
                    <button 
                        className={`px-4 py-2 font-medium text-sm ${
                            activeTab === 'map' 
                                ? 'text-green-500 border-b-2 border-green-500' 
                                : 'text-gray-400 hover:text-white'
                        }`}
                        onClick={() => setActiveTab('map')}
                    >
                        Map
                    </button>
                    <button 
                        className={`px-4 py-2 font-medium text-sm ${
                            activeTab === 'images' 
                                ? 'text-green-500 border-b-2 border-green-500' 
                                : 'text-gray-400 hover:text-white'
                        }`}
                        onClick={() => setActiveTab('images')}
                    >
                        Images
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4">
                    {/* Basic Info Tab */}
                    {activeTab === 'basic' && (
                        <div>
                            <div className="mb-4">
                                <label className="block text-white mb-1">Apartment*</label>
                                <input 
                                    type="text" 
                                    name="room"
                                    value={formData.room} 
                                    onChange={handleChange} 
                                    className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                                    placeholder="Enter Apartment" 
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-white mb-1">Rent* (₱)</label>
                                <input 
                                    type="number" 
                                    name="rent"
                                    value={formData.rent} 
                                    onChange={handleChange} 
                                    className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                                    placeholder="Enter Rent Amount" 
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-white mb-1">Description*</label>
                                <textarea 
                                    name="description"
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-24" 
                                    placeholder="Enter Description" 
                                />
                            </div>
                        </div>
                    )}

                    {/* Features Tab */}
                    {activeTab === 'features' && (
                        <div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-white mb-1">Bedrooms</label>
                                    <input 
                                        type="number" 
                                        name="bedrooms"
                                        value={formData.bedrooms} 
                                        onChange={handleChange} 
                                        min="0"
                                        className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-white mb-1">Bathrooms</label>
                                    <input 
                                        type="number" 
                                        name="bathrooms"
                                        value={formData.bathrooms} 
                                        onChange={handleChange} 
                                        min="0"
                                        step="0.5"
                                        className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-white mb-2">Address</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <input 
                                        type="text" 
                                        name="address.street"
                                        value={formData.address.street} 
                                        onChange={handleChange} 
                                        className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                                        placeholder="Street Address" 
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input 
                                            type="text" 
                                            name="address.city"
                                            value={formData.address.city} 
                                            onChange={handleChange} 
                                            className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                                            placeholder="City" 
                                        />
                                        <input 
                                            type="text" 
                                            name="address.state"
                                            value={formData.address.state} 
                                            onChange={handleChange} 
                                            className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                                            placeholder="Province/Region" 
                                        />
                                    </div>
                                    <input 
                                        type="text" 
                                        name="address.zipCode"
                                        value={formData.address.zipCode} 
                                        onChange={handleChange} 
                                        className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                                        placeholder="ZIP Code" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Map Tab */}
                    {activeTab === 'map' && (
                        <div className="my-4">
                            <p className="text-white mb-2">Apartment Location</p>
                            <p className="text-gray-400 text-sm mb-4">
                                Search for an address or manually enter the details below.
                            </p>
                            
                            {/* Put address search in a separate div with position relative */}
                            <div className="mb-8 relative" style={{ zIndex: 40 }}>
                                <label className="block text-white mb-1">Search Address</label>
                                <AddressAutocomplete 
                                    onAddressSelect={handleAddressSelect}
                                    initialValue=""
                                />
                            </div>
                            
                            {/* Display map with lower z-index */}
                            <div className="h-64 w-full mb-4 relative" style={{ zIndex: 30 }}>
                                <MapView address={formData.address} height="100%" />
                            </div>
                            
                            {/* Manual address fields */}
                            <p className="text-white mt-4 mb-2">Or Enter Address Manually</p>
                            <div className="grid grid-cols-1 gap-3">
                                <input 
                                    type="text" 
                                    name="address.street"
                                    value={formData.address.street} 
                                    onChange={handleChange} 
                                    className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                                    placeholder="Street Address" 
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input 
                                        type="text" 
                                        name="address.city"
                                        value={formData.address.city} 
                                        onChange={handleChange} 
                                        className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                                        placeholder="City" 
                                    />
                                    <input 
                                        type="text" 
                                        name="address.state"
                                        value={formData.address.state} 
                                        onChange={handleChange} 
                                        className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                                        placeholder="Province/Region" 
                                    />
                                </div>
                                <input 
                                    type="text" 
                                    name="address.zipCode"
                                    value={formData.address.zipCode} 
                                    onChange={handleChange} 
                                    className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                                    placeholder="ZIP Code" 
                                />
                            </div>
                        </div>
                    )}

                    {/* Images Tab */}
                    {activeTab === 'images' && (
                        <div>
                            <div className="mb-4">
                                <label className="block text-white mb-1">Upload Images (Max 5)</label>
                                <input 
                                    type="file" 
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange} 
                                    className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                                    disabled={images.length >= 5}
                                />
                                <p className="text-gray-400 text-xs mt-1">
                                    {5 - images.length} images remaining
                                </p>
                            </div>
                            
                            {/* Image previews */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img 
                                            src={url} 
                                            alt={`Preview ${index + 1}`} 
                                            className="w-full h-24 object-cover rounded border border-gray-700" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {images.length === 0 && (
                                    <p className="text-gray-500 text-sm italic col-span-3">No images added yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {formError && (
                        <div className="bg-red-900 text-white p-2 rounded mb-4">
                            {formError}
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-red-900 text-white p-2 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
                    {message && (
                        <div className="bg-green-900 text-white p-2 rounded mb-4">
                            {message}
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex justify-between mt-4">
                        {activeTab !== 'basic' && (
                            <button 
                                type="button"
                                onClick={() => {
                                    const tabs = ['basic', 'features', 'map', 'images'];
                                    const currentIndex = tabs.indexOf(activeTab);
                                    setActiveTab(tabs[currentIndex - 1]);
                                }}
                                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                            >
                                Previous
                            </button>
                        )}
                        
                        <div className="ml-auto flex gap-2">
                            {activeTab !== 'images' && (
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const tabs = ['basic', 'features', 'map', 'images'];
                                        const currentIndex = tabs.indexOf(activeTab);
                                        setActiveTab(tabs[currentIndex + 1]);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                                >
                                    Next
                                </button>
                            )}
                            
                            {activeTab === 'images' && (
                                <button 
                                    type="submit" 
                                    className={`px-6 py-2 rounded font-medium
                                            ${isLoading 
                                                ? 'bg-gray-600 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Creating...' : 'Create Room'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoomModal;