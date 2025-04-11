import React from 'react';
import MapView from './MapView';

const ApartmentDetails = ({ apartment }) => {
    if (!apartment) return null;

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
                <div className="h-64 w-full mb-3">
                    <MapView address={apartment.address} />
                </div>
                <p className="text-gray-300">
                    {[
                        apartment.address?.street,
                        apartment.address?.city,
                        apartment.address?.state,
                        apartment.address?.zipCode,
                        apartment.address?.country,
                    ].filter(Boolean).join(', ')}
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