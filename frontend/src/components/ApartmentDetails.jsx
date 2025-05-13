import React from 'react';
import ApartmentAnalytics from './ApartmentAnalytics';

const ApartmentDetails = ({ apartment }) => {
    return (
        <div className="text-white">
            <h2 className="text-2xl font-bold mb-4">{apartment.room}</h2>
            
            {/* Images */}
            <div className="mb-6">
                {apartment.images && apartment.images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {apartment.images.map((image, index) => (
                            <div key={index} className="rounded-lg overflow-hidden bg-gray-800 h-48">
                                <img 
                                    src={image} 
                                    alt={`${apartment.room} view ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/image/apartment-placeholder.jpg";
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center h-48">
                        <img 
                            src="/image/apartment-placeholder.jpg" 
                            alt="No images available" 
                            className="w-16 h-16 opacity-30"
                        />
                    </div>
                )}
            </div>
            
            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-bold mb-3">Property Details</h3>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Rent:</span>
                            <span className="font-medium text-green-400">₱{apartment.rent?.toLocaleString()}/month</span>
                        </div>
                        
                        <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span className={`font-medium ${
                                apartment.status === 'occupied' ? 'text-yellow-400' : 
                                apartment.status === 'maintenance' ? 'text-red-400' :
                                'text-green-400'
                            }`}>
                                {apartment.status.charAt(0).toUpperCase() + apartment.status.slice(1)}
                            </span>
                        </div>
                        
                        <div className="flex justify-between">
                            <span className="text-gray-400">Bedrooms:</span>
                            <span>{apartment.bedrooms}</span>
                        </div>
                        
                        <div className="flex justify-between">
                            <span className="text-gray-400">Bathrooms:</span>
                            <span>{apartment.bathrooms}</span>
                        </div>
                        
                        {apartment.address && (
                            <div>
                                <span className="text-gray-400">Address:</span>
                                <p className="mt-1">
                                    {apartment.address.street && `${apartment.address.street}, `}
                                    {apartment.address.city && `${apartment.address.city}, `}
                                    {apartment.address.state && `${apartment.address.state}, `}
                                    {apartment.address.zipCode && `${apartment.address.zipCode}, `}
                                    {apartment.address.country && apartment.address.country}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Tenant Information (if occupied) */}
                <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-bold mb-3">
                        {apartment.status === 'occupied' ? 'Current Tenant' : 'Tenant Information'}
                    </h3>
                    
                    {apartment.status === 'occupied' && apartment.tenant_id ? (
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden mr-3">
                                    {apartment.tenant_id.avatar ? (
                                        <img 
                                            src={apartment.tenant_id.avatar}
                                            alt={apartment.tenant_id.name || "Tenant"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xl font-bold">
                                            {apartment.tenant_id.name?.charAt(0).toUpperCase() || "T"}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold">{apartment.tenant_id.name}</p>
                                    <p className="text-gray-400 text-sm">{apartment.tenant_id.email}</p>
                                </div>
                            </div>
                            
                            {apartment.paymentInfo && (
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Next Payment Due:</span>
                                        <span>{apartment.paymentInfo.nextDueDate ? 
                                            new Date(apartment.paymentInfo.nextDueDate).toLocaleDateString() : 
                                            'Not set'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Payment Status:</span>
                                        <span className={`${
                                            apartment.paymentInfo.paymentStatus === 'paid' ? 'text-green-400' :
                                            apartment.paymentInfo.paymentStatus === 'overdue' ? 'text-red-400' :
                                            'text-yellow-400'
                                        }`}>
                                            {apartment.paymentInfo.paymentStatus.charAt(0).toUpperCase() + 
                                              apartment.paymentInfo.paymentStatus.slice(1)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Move-in Date:</span>
                                        <span>{apartment.paymentInfo.moveInDate ? 
                                            new Date(apartment.paymentInfo.moveInDate).toLocaleDateString() : 
                                            'Not recorded'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-400">No tenant currently assigned to this apartment.</p>
                    )}
                </div>
            </div>
            
            {/* Description */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold mb-2">Description</h3>
                <p>{apartment.description || 'No description available.'}</p>
            </div>
            
            {/* Analytics Section */}
            <ApartmentAnalytics apartment={apartment} />
        </div>
    );
};

export default ApartmentDetails;