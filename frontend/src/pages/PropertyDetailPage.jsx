import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePropertyStore } from '../store/propertyStore';
import { useAuthStore } from '../store/authStore';

const PropertyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const { getPropertyById, currentProperty, isLoading, error } = usePropertyStore();
    const { isAuthenticated, user } = useAuthStore();
    
    useEffect(() => {
        const fetchPropertyDetails = async () => {
            try {
                await getPropertyById(id);
            } catch (error) {
                console.error("Error fetching property:", error);
            }
        };
        
        fetchPropertyDetails();
    }, [id, getPropertyById]);
    
    const handleApply = () => {
        if (!isAuthenticated) {
            // Redirect to login if not authenticated
            navigate('/login', { state: { from: `/properties/${id}` } });
            return;
        }
        
        if (user.role === 'tenant') {
            navigate(`/tenant/apply/${id}`);
        } else if (user.role === 'landlord') {
            // Landlords can't apply
            alert("As a landlord, you cannot apply for properties.");
        } else {
            // Other roles or no role
            alert("You need to be a tenant to apply for properties.");
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
                    <p className="text-gray-300">{error}</p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }
    
    if (!currentProperty) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-300 mb-4">Property Not Found</h2>
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-10"
        >
            <div className="max-w-5xl mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                {/* Property Images */}
                <div className="h-72 sm:h-96 bg-gray-800 relative">
                    {currentProperty.images && currentProperty.images.length > 0 ? (
                        <img 
                            src={currentProperty.images[0]} 
                            alt={currentProperty.title} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                    )}
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-lg font-bold">
                        ${currentProperty.rentAmount}/mo
                    </div>
                </div>
                
                {/* Property Details */}
                <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-green-400 mb-2">{currentProperty.title}</h1>
                            <p className="text-gray-300 text-lg">{currentProperty.address}, {currentProperty.city}</p>
                        </div>
                        <div className="bg-gray-800 px-4 py-2 rounded-lg mt-2 sm:mt-0">
                            <p className="text-green-400 font-semibold">{currentProperty.propertyType}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 border-t border-b border-gray-800 py-6">
                        <div className="text-center">
                            <p className="text-gray-400 text-sm">Bedrooms</p>
                            <p className="text-xl font-semibold text-white">{currentProperty.bedrooms}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400 text-sm">Bathrooms</p>
                            <p className="text-xl font-semibold text-white">{currentProperty.bathrooms}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400 text-sm">Square Feet</p>
                            <p className="text-xl font-semibold text-white">{currentProperty.squareFeet || 'N/A'}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400 text-sm">Year Built</p>
                            <p className="text-xl font-semibold text-white">{currentProperty.yearBuilt || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-green-400 mb-4">Description</h2>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                            {currentProperty.description}
                        </p>
                    </div>
                    
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-green-400 mb-4">Features & Amenities</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {currentProperty.amenities && currentProperty.amenities.map((amenity, index) => (
                                <div key={index} className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-300">{amenity}</span>
                                </div>
                            ))}
                            
                            {/* If no amenities are specified */}
                            {(!currentProperty.amenities || currentProperty.amenities.length === 0) && (
                                <span className="text-gray-400 col-span-full">No amenities specified</span>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <div className="mb-4 sm:mb-0">
                            <p className="text-gray-400">Listed by</p>
                            <p className="text-white font-medium">
                                {currentProperty.landlord?.name || 'Property Owner'}
                            </p>
                        </div>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
                            >
                                Go Back
                            </button>
                            
                            {user?.role === 'tenant' && (
                                <button 
                                    onClick={handleApply}
                                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                                >
                                    Apply Now
                                </button>
                            )}
                            
                            {!isAuthenticated && (
                                <button 
                                    onClick={handleApply}
                                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                                >
                                    Login to Apply
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PropertyDetailPage;