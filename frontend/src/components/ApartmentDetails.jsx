import React from 'react';
import MapView from './MapView';

const ApartmentDetails = ({ apartment }) => {
    if (!apartment) return null;

    // Check if location data is available
    const hasLocationData = 
        (apartment.address?.location?.coordinates?.length === 2) || 
        (apartment.address?.coordinates?.lat && apartment.address?.coordinates?.lng);

    return (
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">{apartment.room}</h2>
            
            {/* Basic details */}
            <div className="mb-6">
                <p className="text-xl text-green-500 font-semibold">₱{apartment.rent.toLocaleString()} / month</p>
                <p className="text-gray-300">{apartment.description}</p>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                        <span className="text-gray-400 mr-2">Bedrooms:</span>
                        <span className="text-white">{apartment.bedrooms}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="text-gray-400 mr-2">Bathrooms:</span>
                        <span className="text-white">{apartment.bathrooms}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="text-gray-400 mr-2">Status:</span>
                        <span className={`capitalize ${
                            apartment.status === 'available' 
                                ? 'text-green-500' 
                                : apartment.status === 'occupied' 
                                    ? 'text-blue-500' 
                                    : 'text-yellow-500'
                        }`}>
                            {apartment.status}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Map section */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Location</h3>
                <div className="h-64 w-full mb-3 rounded overflow-hidden border border-gray-700">
                    {hasLocationData ? (
                        <MapView address={apartment.address} />
                    ) : (
                        <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                            <div className="text-center p-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p className="mt-2 text-gray-500">Map location not available</p>
                            </div>
                        </div>
                    )}
                </div>
                <p className="text-gray-300">
                    {apartment.address && typeof apartment.address === 'object' ? (
                        [
                            apartment.address.street,
                            apartment.address.city,
                            apartment.address.state,
                            apartment.address.zipCode,
                            apartment.address.country || 'Philippines'
                        ].filter(Boolean).join(', ')
                    ) : (
                        "Address information not available"
                    )}
                </p>
            </div>
            
            {/* Images */}
            {apartment.images && apartment.images.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Photos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {apartment.images.map((image, index) => (
                            <img 
                                key={index}
                                src={image} 
                                alt={`${apartment.room} - Photo ${index + 1}`} 
                                className="rounded-lg w-full h-32 object-cover"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApartmentDetails;